import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Comptage, InventaireService, LigneComptage } from '../../../shared/services/inventaire.service';
import { ProductService } from '../../../shared/services/product.service';
import { RoleService } from '../../../shared/services/role.service';
import { AuthService } from '../../../shared/services/auth.service';
import { infoMesure, lireNombre, qteAffichee, qteStockee, texteQte } from '../../../shared/utils/mesure.util';

/**
 * Comptage d'inventaire (site) : on compte les produits (douchette ou recherche), l'écran
 * montre les écarts avec le stock enregistré, puis la validation corrige le stock d'un coup.
 * Seul l'écart est appliqué (voir ComptageInventaireService) : on peut compter boutique ouverte.
 * Même logique que l'écran mobile (pages/comptage).
 */
@Component({
  selector: 'app-comptage-inventaire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comptage-inventaire.component.html',
  styleUrls: ['./comptage-inventaire.component.scss']
})
export class ComptageInventaireComponent implements OnInit {
  @ViewChild('champQuantite') champQuantite?: ElementRef<HTMLInputElement>;
  @ViewChild('champRecherche') champRecherche?: ElementRef<HTMLInputElement>;

  /** Écart jugé « gros » (à vérifier avant de valider) : au moins 5 unités et 20 % du stock. */
  private static readonly GROS_ECART_UNITES = 5;
  private static readonly GROS_ECART_PART = 0.2;

  chargement = true;
  envoi = false;
  comptage: Comptage | null = null;
  historique: Comptage[] = [];
  categories: { id: number; nom: string }[] = [];
  categorieChoisie: number | null = null;

  produits: any[] = [];
  recherche = '';
  resultats: any[] = [];
  produitChoisi: any | null = null;
  quantiteSaisie = '';
  filtreLignes: 'tous' | 'ecarts' = 'tous';

  constructor(
    private inventaire: InventaireService,
    private productService: ProductService,
    private roleService: RoleService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  /** Même règle que le serveur : gérant, ou rôle avec « Inventaire » sur Modifier/Tout. */
  get autorise(): boolean {
    const droit = this.roleService.peut('STOCK', 'GERER');
    return this.auth.isAdmin() ? droit : (this.roleService.rolesActifs && droit);
  }

  charger(): void {
    this.chargement = true;
    this.inventaire.comptageEnCours().subscribe({
      next: c => {
        this.comptage = c;
        this.chargement = false;
        if (!c) this.chargerAccueil();
        else this.chargerProduits();
      },
      error: e => { this.chargement = false; this.alerte(e); }
    });
  }

  private chargerAccueil(): void {
    this.productService.getAllCategories().subscribe({ next: (c: any[]) => this.categories = c, error: () => {} });
    this.inventaire.historiqueComptages().subscribe({ next: h => this.historique = h, error: () => {} });
  }

  private chargerProduits(): void {
    this.productService.getProducts().subscribe({
      next: (p: any[]) => {
        const cat = this.comptage?.categorieId;
        this.produits = cat ? p.filter(x => (x.categorie?.id ?? x.categorieId) === cat) : p;
        setTimeout(() => this.champRecherche?.nativeElement.focus(), 100);
      },
      error: () => {}
    });
  }

  // ---------------------------------------------------------------- démarrer / terminer

  demarrer(): void {
    this.envoi = true;
    this.inventaire.demarrerComptage(this.categorieChoisie).subscribe({
      next: c => { this.envoi = false; this.comptage = c; this.chargerProduits(); },
      error: e => { this.envoi = false; this.alerte(e); }
    });
  }

  valider(): void {
    const c = this.comptage;
    if (!c || !c.nbComptes) return;
    const gros = (c.lignes || []).filter(l => this.grosEcart(l)).length;
    Swal.fire({
      icon: 'question',
      title: 'Valider le comptage ?',
      html: `<p>${c.nbEcarts} produit(s) avec un écart seront corrigés dans le stock.</p>
             <p><strong style="color:#dc2626">Manquants : ${this.money(c.valeurManquants || 0)}</strong> ·
                <strong style="color:#059669">En trop : ${this.money(c.valeurSurplus || 0)}</strong></p>
             ${gros ? `<p style="color:#dc2626">Attention : ${gros} gros écart(s), vérifiez-les avant.</p>` : ''}
             <p style="font-size:.9em;color:#64748b">Les produits non comptés ne changent pas.</p>`,
      showCancelButton: true,
      confirmButtonText: 'Valider et corriger le stock',
      cancelButtonText: 'Revenir',
      confirmButtonColor: '#2563eb'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.envoi = true;
      this.inventaire.validerComptage(c.id).subscribe({
        next: () => {
          this.envoi = false;
          Swal.fire({ icon: 'success', title: 'Comptage validé', text: 'Le stock a été corrigé.', timer: 1800, showConfirmButton: false });
          this.raz();
          this.charger();
        },
        error: e => { this.envoi = false; this.alerte(e); }
      });
    });
  }

  abandonner(): void {
    const c = this.comptage;
    if (!c) return;
    Swal.fire({
      icon: 'warning',
      title: 'Abandonner le comptage ?',
      text: 'Rien ne sera modifié dans le stock. Les quantités comptées seront perdues.',
      showCancelButton: true,
      confirmButtonText: 'Abandonner',
      cancelButtonText: 'Revenir',
      confirmButtonColor: '#dc2626'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.inventaire.abandonnerComptage(c.id).subscribe({
        next: () => { this.raz(); this.charger(); },
        error: e => this.alerte(e)
      });
    });
  }

  private raz(): void {
    this.comptage = null;
    this.produitChoisi = null;
    this.recherche = '';
    this.resultats = [];
    this.quantiteSaisie = '';
  }

  // ---------------------------------------------------------------- compter un produit

  chercher(): void {
    const q = this.recherche.trim().toLowerCase();
    this.resultats = q
      ? this.produits.filter(p => p.nom?.toLowerCase().includes(q) || p.codeBarre?.toLowerCase().includes(q)).slice(0, 12)
      : [];
  }

  /** « Entrée » (douchette) : code-barres exact → produit choisi directement. */
  validerRecherche(): void {
    const code = this.recherche.trim();
    if (!code) return;
    const exact = this.produits.find(p => p.codeBarre?.trim() === code);
    const p = exact ?? (this.resultats.length === 1 ? this.resultats[0] : undefined);
    if (p) this.choisir(p);
    else if (/^\d{6,}$/.test(code)) {
      Swal.fire({ icon: 'warning', title: 'Produit introuvable', text: `Aucun produit pour le code ${code}.`, timer: 2200, showConfirmButton: false });
    }
  }

  choisir(p: any): void {
    this.produitChoisi = p;
    this.recherche = '';
    this.resultats = [];
    const deja = this.ligneDe(p.id);
    this.quantiteSaisie = deja ? String(qteAffichee(p, deja.quantiteComptee)) : '';
    setTimeout(() => this.champQuantite?.nativeElement.focus(), 60);
  }

  annulerChoix(): void {
    this.produitChoisi = null;
    setTimeout(() => this.champRecherche?.nativeElement.focus(), 60);
  }

  enregistrerQuantite(): void {
    const p = this.produitChoisi;
    const c = this.comptage;
    if (!p || !c || this.quantiteSaisie.trim() === '') return;
    const affichee = lireNombre(this.quantiteSaisie);
    if (!isFinite(affichee) || affichee < 0) return;
    this.envoi = true;
    this.inventaire.compterProduit(c.id, p.id, qteStockee(p, affichee)).subscribe({
      next: maj => {
        this.envoi = false;
        this.comptage = maj;
        this.produitChoisi = null;
        this.quantiteSaisie = '';
        // Prêt pour le produit suivant (douchette).
        setTimeout(() => this.champRecherche?.nativeElement.focus(), 60);
      },
      error: e => { this.envoi = false; this.alerte(e); }
    });
  }

  retirer(l: LigneComptage): void {
    const c = this.comptage;
    if (!c) return;
    this.inventaire.compterProduit(c.id, l.produitId, null).subscribe({
      next: maj => this.comptage = maj,
      error: e => this.alerte(e)
    });
  }

  recompter(l: LigneComptage): void {
    const p = this.produits.find(x => x.id === l.produitId);
    if (p) this.choisir(p);
  }

  // ---------------------------------------------------------------- affichage

  get lignesAffichees(): LigneComptage[] {
    const l = this.comptage?.lignes || [];
    return this.filtreLignes === 'ecarts' ? l.filter(x => x.ecart !== 0) : l;
  }

  ligneDe(produitId: number): LigneComptage | undefined {
    return this.comptage?.lignes?.find(l => l.produitId === produitId);
  }

  grosEcart(l: LigneComptage): boolean {
    const e = Math.abs(l.ecart);
    return e >= ComptageInventaireComponent.GROS_ECART_UNITES
      && e >= Math.max(1, l.stockAuComptage) * ComptageInventaireComponent.GROS_ECART_PART;
  }

  qte(produitId: number, stockee: number): string {
    return texteQte(this.produits.find(p => p.id === produitId) ?? null, stockee);
  }

  ecartTexte(l: LigneComptage): string {
    const t = this.qte(l.produitId, Math.abs(l.ecart));
    return l.ecart === 0 ? 'Juste' : (l.ecart > 0 ? `+${t}` : `−${t}`);
  }

  unite(p: any): string {
    return infoMesure(p)?.unite ?? 'unités';
  }

  stockTexte(p: any): string {
    return texteQte(p, p?.quantite);
  }

  money(v: number): string {
    return this.inventaire.formatPrice(v || 0);
  }

  private alerte(e: any): void {
    Swal.fire('Erreur', e?.error?.message || e?.error?.error || 'Action impossible pour le moment.', 'error');
  }
}
