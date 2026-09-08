import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import {
  VitrineInfoDto,
  VitrineProduitDto,
  VitrineService
} from '../../../shared/services/vitrine.service';
import { COUNTRY_CODES, construireNumeroComplet, validatePhoneForCountry } from '../../../shared/utils/telephone.util';

interface LignePanier {
  produit: VitrineProduitDto;
  quantite: number;
}

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vitrine.component.html',
  styleUrls: ['./vitrine.component.scss']
})
export class VitrineComponent implements OnInit, OnDestroy {

  infos: VitrineInfoDto | null = null;
  produits: VitrineProduitDto[] = [];

  loadingInfos = true;
  loadingProduits = true;
  erreurInfos = false;
  erreurProduits = false;

  // ── Panier ──────────────────────────────────────────────────────────────
  panier: LignePanier[] = [];
  panierOuvert = false;

  // ── Formulaire de commande ─────────────────────────────────────────────
  formulaireOuvert = false;
  envoiEnCours = false;
  erreurEnvoi = '';
  form = { nom: '', prenom: '', telephone: '', notes: '', adresseLivraison: '' };

  // ── Téléphone client (indicatif pays + numéro local) ────────────────────
  countryCodes = COUNTRY_CODES;
  selectedCountryCode = '+223';
  telephoneLocal = '';

  // ── Confirmation ────────────────────────────────────────────────────────
  commandeConfirmee: string | null = null;

  // ── Installation sur l'écran d'accueil ─────────────────────────────────
  peutInstaller = false;
  estInstalle = false;
  estIOS = false;
  afficherInstructionsIOS = false;
  private evenementInstallation: any = null;
  private manifestUrlPrecedente: string | null = null;
  private readonly gererBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    this.evenementInstallation = e;
    this.peutInstaller = true;
  };

  constructor(private vitrineService: VitrineService, private swUpdate: SwUpdate) {}

  ngOnInit(): void {
    this.chargerInfos();
    this.chargerProduits();
    this.rechargerSiNouvelleVersion();
    this.initialiserInstallation();
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.gererBeforeInstallPrompt);
    // Remet le manifeste de l'appli de gestion en place si un membre du
    // personnel navigue vers /vitrine puis repart sans recharger la page.
    if (this.manifestUrlPrecedente !== null) {
      const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (link) link.setAttribute('href', this.manifestUrlPrecedente);
    }
  }

  private initialiserInstallation(): void {
    this.estInstalle = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    this.estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !this.estInstalle;
    if (!this.estInstalle) {
      window.addEventListener('beforeinstallprompt', this.gererBeforeInstallPrompt);
    }
  }

  /**
   * La vitrine partage l'origine (même site) que l'appli de gestion du personnel, qui a
   * déjà son propre manifeste PWA (nom "Ges Lafia", icône du logiciel, s'ouvre sur la
   * connexion personnel). Sans ceci, un client qui "installerait" la vitrine obtiendrait
   * une icône au nom de l'appli de gestion, qui rouvrirait la page de connexion — pas le
   * catalogue. On pointe donc le lien manifeste vers une vraie ressource HTTP générée
   * côté serveur au nom/logo de LA BOUTIQUE (GET /api/vitrine/manifest.webmanifest),
   * et on restaure le manifeste d'origine si le personnel quitte cette page (ngOnDestroy).
   *
   * IMPORTANT : un manifeste remplacé par un blob: généré en JS n'est pas traité de façon
   * fiable par le moteur d'installation "Ajouter à l'écran d'accueil" de tous les
   * navigateurs — certains gardent le manifeste d'origine (start_url="/"), ce qui fait
   * que l'app installée rouvre sur la connexion au lieu du catalogue. Une vraie URL
   * fetchable règle ce problème. Voir aussi index.html (bascule identique, mais AVANT le
   * démarrage d'Angular, pour le cas d'un chargement direct sur /vitrine).
   */
  private appliquerManifestBoutique(info: VitrineInfoDto): void {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!link) return;
    if (this.manifestUrlPrecedente === null) {
      this.manifestUrlPrecedente = link.getAttribute('href');
    }
    link.setAttribute('href', '/api/vitrine/manifest.webmanifest');

    // Icône "écran d'accueil" iOS — mécanisme séparé du manifeste JSON, Safari ne lit pas
    // l'un via l'autre.
    if (info.logoPath) {
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.setAttribute('href', info.logoPath);
    }
  }

  async installerApplication(): Promise<void> {
    if (!this.evenementInstallation) return;
    this.evenementInstallation.prompt();
    await this.evenementInstallation.userChoice;
    this.evenementInstallation = null;
    this.peutInstaller = false;
  }

  basculerInstructionsIOS(): void {
    this.afficherInstructionsIOS = !this.afficherInstructionsIOS;
  }

  // ── Contact rapide / partage ────────────────────────────────────────────

  get lienWhatsApp(): string | null {
    const tel = this.infos?.telephone?.replace(/\D/g, '');
    if (!tel) return null;
    return `https://wa.me/${tel}?text=${encodeURIComponent('Bonjour, je viens de votre boutique en ligne et j\'ai une question.')}`;
  }

  async partagerVitrine(): Promise<void> {
    const url = window.location.href;
    const titre = this.infos?.nom ? `${this.infos.nom} — Boutique en ligne` : 'Boutique en ligne';
    if ((navigator as any).share) {
      try { await (navigator as any).share({ title: titre, url }); } catch { /* annulé par l'utilisateur */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      this.lienCopie = true;
      setTimeout(() => { this.lienCopie = false; }, 2500);
    } catch { /* presse-papier indisponible, rien à faire */ }
  }

  lienCopie = false;

  /**
   * Page publique visitée par des clients (souvent via un QR code, une seule fois) —
   * contrairement au staff, ils n'ont ni raison ni moyen de cliquer sur un popup "mettre
   * à jour disponible". Sans ce recharge silencieux, un client dont le navigateur a déjà
   * en cache une version antérieure du site (visite précédente, même sans rapport avec la
   * vitrine) continue de voir l'ancien code — par exemple un catalogue qui ignore encore
   * le statut "vitrine désactivée" décidé depuis par le super admin — même si le serveur,
   * lui, renvoie déjà la bonne info à jour. On ne recharge que si le panier est encore
   * vide, pour ne jamais effacer une commande en cours de saisie.
   */
  private rechargerSiNouvelleVersion(): void {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
    ).subscribe(() => {
      if (this.panier.length === 0) {
        document.location.reload();
      }
    });
    this.swUpdate.checkForUpdate().catch(() => {});
  }

  chargerInfos(): void {
    this.loadingInfos = true;
    this.erreurInfos = false;
    this.vitrineService.getInfos().subscribe({
      next: data => {
        this.infos = data;
        this.loadingInfos = false;
        this.appliquerManifestBoutique(data);
      },
      error: () => { this.loadingInfos = false; this.erreurInfos = true; }
    });
  }

  chargerProduits(): void {
    this.loadingProduits = true;
    this.erreurProduits = false;
    this.vitrineService.getProduits().subscribe({
      next: data => { this.produits = data || []; this.loadingProduits = false; },
      error: () => { this.loadingProduits = false; this.erreurProduits = true; }
    });
  }

  get chargement(): boolean {
    return this.loadingInfos || this.loadingProduits;
  }

  // ── Recherche & filtre catégorie ───────────────────────────────────────

  recherche = '';
  categorieSelectionnee: string | null = null;

  /** Catégories réellement présentes dans le catalogue, triées, pour les puces de filtre. */
  get categoriesDisponibles(): string[] {
    const noms = new Set<string>();
    for (const p of this.produits) {
      if (p.categorieNom) noms.add(p.categorieNom);
    }
    return Array.from(noms).sort((a, b) => a.localeCompare(b, 'fr'));
  }

  get produitsFiltres(): VitrineProduitDto[] {
    const terme = this.recherche.trim().toLowerCase();
    return this.produits.filter(p => {
      const matchCategorie = !this.categorieSelectionnee || p.categorieNom === this.categorieSelectionnee;
      const matchRecherche = !terme || p.nom.toLowerCase().includes(terme);
      return matchCategorie && matchRecherche;
    });
  }

  choisirCategorie(nom: string | null): void {
    this.categorieSelectionnee = nom;
    this.pageActuelle = 1;
  }

  onRechercheChange(valeur: string): void {
    this.recherche = valeur;
    this.pageActuelle = 1;
  }

  viderRecherche(): void {
    this.recherche = '';
    this.pageActuelle = 1;
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  // Catalogue potentiellement volumineux (plusieurs dizaines/centaines de produits) :
  // on n'affiche que produitsParPage à la fois pour ne pas alourdir la page sur mobile.
  readonly produitsParPage = 12;
  pageActuelle = 1;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.produitsFiltres.length / this.produitsParPage));
  }

  /** Page réellement affichée : se recale automatiquement si le filtre courant réduit le nombre de pages. */
  get pageEffective(): number {
    return Math.min(this.pageActuelle, this.totalPages);
  }

  get produitsPagines(): VitrineProduitDto[] {
    const debut = (this.pageEffective - 1) * this.produitsParPage;
    return this.produitsFiltres.slice(debut, debut + this.produitsParPage);
  }

  pagePrecedente(): void {
    if (this.pageEffective > 1) {
      this.pageActuelle = this.pageEffective - 1;
      this.scrollHautCatalogue();
    }
  }

  pageSuivante(): void {
    if (this.pageEffective < this.totalPages) {
      this.pageActuelle = this.pageEffective + 1;
      this.scrollHautCatalogue();
    }
  }

  private scrollHautCatalogue(): void {
    document.querySelector('.vitrine-recherche, .vitrine-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formatPrix(v: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' FCFA';
  }

  stockLabel(p: VitrineProduitDto): string {
    if (p.statutStock === 'RUPTURE') return 'Rupture';
    if (p.statutStock === 'STOCK_FAIBLE') return 'Stock faible';
    return 'Disponible';
  }

  /**
   * Pas de photo produit pour l'instant (prévu plus tard) — en attendant, une icône +
   * une couleur d'ambiance choisies selon des mots-clés dans le nom de catégorie, pour
   * que le catalogue soit visuellement varié et reconnaissable plutôt qu'une même case
   * grise répétée pour chaque article (même principe que getIconeType côté mobile).
   */
  getCategorieVisuel(categorieNom: string | undefined | null): { icone: string; couleur: string } {
    const n = (categorieNom || '').toLowerCase();
    if (/boisson|jus|eau|soda|bière|biere|vin|lait/.test(n)) return { icone: 'fa-wine-bottle', couleur: 'bleu' };
    if (/fruit|légume|legume|maraich/.test(n)) return { icone: 'fa-apple-alt', couleur: 'vert' };
    if (/viande|poisson|boucherie|volaille/.test(n)) return { icone: 'fa-drumstick-bite', couleur: 'rouge' };
    if (/pain|boulangerie|pâtisserie|patisserie|gâteau|gateau/.test(n)) return { icone: 'fa-bread-slice', couleur: 'orange' };
    if (/hygiène|hygiene|savon|beauté|beaute|cosmétique|cosmetique/.test(n)) return { icone: 'fa-pump-soap', couleur: 'rose' };
    if (/nettoyage|ménage|menage|entretien/.test(n)) return { icone: 'fa-spray-can-sparkles', couleur: 'turquoise' };
    if (/céréale|cereale|riz|pâte|pate|farine|épicerie|epicerie/.test(n)) return { icone: 'fa-wheat-awn', couleur: 'jaune' };
    if (/électro|electro|téléphone|telephone|informatique/.test(n)) return { icone: 'fa-mobile-screen', couleur: 'violet' };
    if (/vêtement|vetement|habillement|textile/.test(n)) return { icone: 'fa-shirt', couleur: 'rose' };
    return { icone: 'fa-box-open', couleur: 'gris' };
  }

  // ── Panier ──────────────────────────────────────────────────────────────

  quantiteDansPanier(p: VitrineProduitDto): number {
    return this.panier.find(l => l.produit.id === p.id)?.quantite || 0;
  }

  ajouterAuPanier(p: VitrineProduitDto): void {
    if (p.statutStock === 'RUPTURE') return;
    const ligne = this.panier.find(l => l.produit.id === p.id);
    if (ligne) { ligne.quantite++; }
    else { this.panier.push({ produit: p, quantite: 1 }); }
  }

  retirerDuPanier(p: VitrineProduitDto): void {
    const ligne = this.panier.find(l => l.produit.id === p.id);
    if (!ligne) return;
    ligne.quantite--;
    if (ligne.quantite <= 0) {
      this.panier = this.panier.filter(l => l.produit.id !== p.id);
    }
  }

  supprimerLigne(p: VitrineProduitDto): void {
    this.panier = this.panier.filter(l => l.produit.id !== p.id);
  }

  get nombreArticles(): number {
    return this.panier.reduce((s, l) => s + l.quantite, 0);
  }

  get totalPanier(): number {
    return this.panier.reduce((s, l) => s + l.quantite * (l.produit.prixVente || 0), 0);
  }

  ouvrirPanier(): void { this.panierOuvert = true; }
  fermerPanier(): void { this.panierOuvert = false; }

  // ── Commande ────────────────────────────────────────────────────────────

  ouvrirFormulaire(): void {
    if (this.panier.length === 0) return;
    this.panierOuvert = false;
    this.formulaireOuvert = true;
    this.erreurEnvoi = '';
  }

  fermerFormulaire(): void { this.formulaireOuvert = false; }

  get formulaireValide(): boolean {
    return this.form.nom.trim().length > 0 && validatePhoneForCountry(this.telephoneLocal, this.selectedCountryCode);
  }

  validatePhone(phoneLocal: string): boolean {
    return validatePhoneForCountry(phoneLocal, this.selectedCountryCode);
  }

  envoyerCommande(): void {
    if (!this.formulaireValide || this.envoiEnCours) return;
    this.envoiEnCours = true;
    this.erreurEnvoi = '';
    this.vitrineService.passerCommande({
      clientNom: this.form.nom.trim(),
      clientPrenom: this.form.prenom.trim() || undefined,
      clientTelephone: construireNumeroComplet(this.selectedCountryCode, this.telephoneLocal),
      notes: this.form.notes.trim() || undefined,
      adresseLivraison: this.form.adresseLivraison.trim() || undefined,
      lignes: this.panier.map(l => ({ produitId: l.produit.id, quantite: l.quantite }))
    }).subscribe({
      next: (rep) => {
        this.envoiEnCours = false;
        this.formulaireOuvert = false;
        this.commandeConfirmee = rep.numeroCommande || 'envoyée';
        this.panier = [];
        this.form = { nom: '', prenom: '', telephone: '', notes: '', adresseLivraison: '' };
        this.telephoneLocal = '';
      },
      error: (e) => {
        this.envoiEnCours = false;
        this.erreurEnvoi = e?.message || 'Impossible d\'envoyer la commande, réessayez.';
      }
    });
  }

  fermerConfirmation(): void { this.commandeConfirmee = null; }
}
