import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  CalculPrimes,
  CommissionService,
  PaiementCommission,
  PrimeVendeur,
  RegleCommission,
  RegleCommissionRequest,
  TypeCommission,
  TypeParametre
} from '../../../shared/services/commission.service';
import { ProductService } from '../../../shared/services/product.service';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

type Onglet = 'vendeurs' | 'regles' | 'paiements';
type Periode = 'mois' | 'mois-dernier' | 'annee' | 'perso';

interface FormRegle {
  id: number | null;
  type: TypeCommission;
  cible: 'produit' | 'categorie';
  produitId: number | null;
  categorieId: number | null;
  valeur: number | null;
  quantiteObjectif: number | null;
  dateDebut: string;
  dateFin: string;
  vendeurId: number | null;
  nom: string;
}

@Component({
  selector: 'app-primes-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, MontantInputDirective],
  templateUrl: './primes-produits.component.html',
  styleUrls: ['./primes-produits.component.scss']
})
export class PrimesProduitsComponent implements OnInit {
  onglet: Onglet = 'vendeurs';
  periode: Periode = 'mois';
  debut = '';
  fin = '';

  calcul: CalculPrimes | null = null;
  regles: RegleCommission[] = [];
  paiements: PaiementCommission[] = [];
  types: TypeParametre[] = [];
  produits: { id: number; nom: string; uniteBase?: string }[] = [];
  categories: { id: number; nom: string }[] = [];
  vendeurs: { id: number; nomComplet: string }[] = [];

  chargementCalcul = true;
  chargementRegles = true;
  erreur = '';
  ouvert: number | null = null;

  // Modales
  formRegle: FormRegle | null = null;
  rechercheProduit = '';
  enregistrement = false;
  paiement: { vendeur: PrimeVendeur; montant: number | null; note: string } | null = null;
  reglagesOuverts = false;
  typesBrouillon: Record<string, boolean> = {};

  readonly libellesTypes: Record<TypeCommission, { titre: string; exemple: string; icone: string }> = {
    MONTANT_FIXE: { titre: 'Montant par unité', exemple: '100 FCFA pour chaque carton vendu', icone: 'fa-coins' },
    POURCENTAGE: { titre: 'Pourcentage', exemple: '5 % du montant vendu', icone: 'fa-percent' },
    OBJECTIF: { titre: 'Objectif à atteindre', exemple: '10 000 FCFA s\'il vend 50 sacs dans le mois', icone: 'fa-bullseye' }
  };

  constructor(public cs: CommissionService, private productService: ProductService) {}

  ngOnInit(): void {
    this.choisirPeriode('mois');
    this.chargerReferentiels();
  }

  // ---------------------------------------------------------------- chargements

  private chargerReferentiels(): void {
    this.cs.parametres().subscribe({ next: p => this.types = p.types, error: () => {} });
    this.cs.vendeurs().subscribe({ next: v => this.vendeurs = v, error: () => {} });
    this.productService.getProducts().subscribe({
      next: p => this.produits = (p || []).map((x: any) => ({ id: x.id, nom: x.nom, uniteBase: x.uniteBase }))
        .sort((a, b) => a.nom.localeCompare(b.nom)),
      error: () => {}
    });
    this.productService.getAllCategories().subscribe({
      next: c => this.categories = (c || []).map((x: any) => ({ id: x.id, nom: x.nom })),
      error: () => {}
    });
    this.chargerRegles();
    this.chargerPaiements();
  }

  chargerRegles(): void {
    this.chargementRegles = true;
    this.cs.regles().subscribe({
      next: r => { this.regles = r; this.chargementRegles = false; },
      error: () => { this.chargementRegles = false; }
    });
  }

  chargerPaiements(): void {
    this.cs.paiements().subscribe({ next: p => this.paiements = p, error: () => {} });
  }

  chargerCalcul(): void {
    if (!this.debut || !this.fin) return;
    this.chargementCalcul = true;
    this.erreur = '';
    this.cs.primes(this.debut, this.fin).subscribe({
      next: c => { this.calcul = c; this.chargementCalcul = false; },
      error: err => {
        this.chargementCalcul = false;
        this.erreur = err?.error?.message || 'Impossible de calculer les primes.';
      }
    });
  }

  choisirPeriode(p: Periode): void {
    this.periode = p;
    const auj = new Date();
    if (p === 'mois') {
      this.debut = CommissionService.iso(new Date(auj.getFullYear(), auj.getMonth(), 1));
      this.fin = CommissionService.iso(new Date(auj.getFullYear(), auj.getMonth() + 1, 0));
    } else if (p === 'mois-dernier') {
      this.debut = CommissionService.iso(new Date(auj.getFullYear(), auj.getMonth() - 1, 1));
      this.fin = CommissionService.iso(new Date(auj.getFullYear(), auj.getMonth(), 0));
    } else if (p === 'annee') {
      this.debut = CommissionService.iso(new Date(auj.getFullYear(), 0, 1));
      this.fin = CommissionService.iso(new Date(auj.getFullYear(), 11, 31));
    }
    if (p !== 'perso') this.chargerCalcul();
  }

  changerDates(): void {
    this.periode = 'perso';
    if (this.debut && this.fin && this.fin >= this.debut) this.chargerCalcul();
  }

  get reglesEnCours(): number {
    return this.regles.filter(r => r.statut === 'EN_COURS').length;
  }

  get typesActifs(): TypeParametre[] {
    return this.types.filter(t => t.actif);
  }

  basculerDetail(v: PrimeVendeur): void {
    this.ouvert = this.ouvert === v.vendeurId ? null : v.vendeurId;
  }

  // ---------------------------------------------------------------- règles

  nouvelleRegle(): void {
    const type = this.typesActifs[0]?.type || 'MONTANT_FIXE';
    const auj = new Date();
    this.rechercheProduit = '';
    this.formRegle = {
      id: null, type, cible: 'produit', produitId: null, categorieId: null,
      valeur: null, quantiteObjectif: null,
      dateDebut: CommissionService.iso(auj),
      dateFin: type === 'OBJECTIF' ? CommissionService.iso(new Date(auj.getFullYear(), auj.getMonth() + 1, 0)) : '',
      vendeurId: null, nom: ''
    };
  }

  modifierRegle(r: RegleCommission): void {
    this.rechercheProduit = '';
    this.formRegle = {
      id: r.id, type: r.type, cible: r.produitId ? 'produit' : 'categorie',
      produitId: r.produitId ?? null, categorieId: r.categorieId ?? null,
      valeur: r.valeur, quantiteObjectif: r.quantiteObjectif ?? null,
      dateDebut: r.dateDebut, dateFin: r.dateFin || '', vendeurId: r.vendeurId ?? null, nom: r.nom
    };
  }

  choisirType(t: TypeCommission): void {
    if (!this.formRegle) return;
    this.formRegle.type = t;
    if (t === 'OBJECTIF' && !this.formRegle.dateFin) {
      const d = new Date();
      this.formRegle.dateFin = CommissionService.iso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    }
  }

  get produitsFiltres() {
    const q = this.rechercheProduit.trim().toLowerCase();
    const liste = q ? this.produits.filter(p => p.nom.toLowerCase().includes(q)) : this.produits;
    const choisi = this.produits.find(p => p.id === this.formRegle?.produitId);
    // Le produit déjà choisi reste toujours dans la liste, même s'il ne correspond pas à la recherche.
    return choisi && !liste.includes(choisi) ? [choisi, ...liste.slice(0, 199)] : liste.slice(0, 200);
  }

  get uniteChoisie(): string {
    const p = this.produits.find(x => x.id === this.formRegle?.produitId);
    return (p?.uniteBase || 'unité').toLowerCase();
  }

  enregistrerRegle(): void {
    const f = this.formRegle;
    if (!f) return;
    const erreur =
      f.cible === 'produit' && !f.produitId ? 'Choisissez le produit.' :
      f.cible === 'categorie' && !f.categorieId ? 'Choisissez la catégorie.' :
      !f.valeur || f.valeur <= 0 ? 'Indiquez le montant de la prime.' :
      f.type === 'POURCENTAGE' && f.valeur > 100 ? 'Le pourcentage ne peut pas dépasser 100.' :
      f.type === 'OBJECTIF' && (!f.quantiteObjectif || f.quantiteObjectif <= 0) ? 'Indiquez la quantité à vendre.' :
      f.type === 'OBJECTIF' && !f.dateFin ? 'Une prime sur objectif a besoin d\'une date de fin.' :
      f.dateFin && f.dateFin < f.dateDebut ? 'La date de fin doit être après la date de début.' : '';
    if (erreur) {
      Swal.fire({ icon: 'warning', title: 'Il manque une information', text: erreur, confirmButtonColor: '#2563eb' });
      return;
    }
    const req: RegleCommissionRequest = {
      nom: f.nom.trim() || undefined,
      type: f.type,
      produitId: f.cible === 'produit' ? f.produitId : null,
      categorieId: f.cible === 'categorie' ? f.categorieId : null,
      valeur: f.valeur,
      quantiteObjectif: f.type === 'OBJECTIF' ? f.quantiteObjectif : null,
      dateDebut: f.dateDebut,
      dateFin: f.dateFin || null,
      vendeurId: f.vendeurId
    };
    this.enregistrement = true;
    const obs = f.id ? this.cs.modifierRegle(f.id, req) : this.cs.creerRegle(req);
    obs.subscribe({
      next: () => {
        this.enregistrement = false;
        this.formRegle = null;
        Swal.fire({ icon: 'success', title: 'Condition enregistrée', timer: 1400, showConfirmButton: false });
        this.chargerRegles();
        this.chargerCalcul();
      },
      error: err => {
        this.enregistrement = false;
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible', text: err?.error?.message || 'Réessayez.', confirmButtonColor: '#2563eb' });
      }
    });
  }

  arreterRegle(r: RegleCommission): void {
    Swal.fire({
      icon: 'question',
      title: `Arrêter « ${r.nom} » ?`,
      text: 'La condition s\'arrête aujourd\'hui. Les primes déjà gagnées restent dues.',
      showCancelButton: true, confirmButtonText: 'Arrêter', cancelButtonText: 'Annuler', confirmButtonColor: '#2563eb'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.cs.arreterRegle(r.id).subscribe({
        next: () => { this.chargerRegles(); this.chargerCalcul(); },
        error: err => Swal.fire({ icon: 'error', title: 'Impossible', text: err?.error?.message || 'Réessayez.' })
      });
    });
  }

  supprimerRegle(r: RegleCommission): void {
    Swal.fire({
      icon: 'warning',
      title: `Supprimer « ${r.nom} » ?`,
      html: 'Les primes calculées avec cette condition <b>disparaîtront aussi des totaux</b>, même celles déjà gagnées.<br>Pour garder l\'historique, utilisez plutôt « Arrêter ».',
      showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', confirmButtonColor: '#dc2626'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.cs.supprimerRegle(r.id).subscribe({
        next: () => { this.chargerRegles(); this.chargerCalcul(); },
        error: err => Swal.fire({ icon: 'error', title: 'Impossible', text: err?.error?.message || 'Réessayez.' })
      });
    });
  }

  cible(r: RegleCommission): string {
    return r.produitNom || (r.categorieNom ? `Catégorie ${r.categorieNom}` : '—');
  }

  // ---------------------------------------------------------------- paiements

  ouvrirPaiement(v: PrimeVendeur): void {
    this.paiement = { vendeur: v, montant: v.resteAPayer > 0 ? Math.round(v.resteAPayer) : null, note: '' };
  }

  enregistrerPaiement(): void {
    const p = this.paiement;
    if (!p) return;
    if (!p.montant || p.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant manquant', text: 'Indiquez le montant versé.', confirmButtonColor: '#2563eb' });
      return;
    }
    this.enregistrement = true;
    this.cs.payer(p.vendeur.vendeurId, p.montant, p.note.trim() || undefined).subscribe({
      next: () => {
        this.enregistrement = false;
        this.paiement = null;
        Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 1400, showConfirmButton: false });
        this.chargerCalcul();
        this.chargerPaiements();
      },
      error: err => {
        this.enregistrement = false;
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible', text: err?.error?.message || 'Réessayez.' });
      }
    });
  }

  supprimerPaiement(p: PaiementCommission): void {
    Swal.fire({
      icon: 'warning',
      title: 'Supprimer ce paiement ?',
      html: `${this.cs.fmt(p.montant)} versé à <b>${p.vendeurNom}</b>. Le montant redeviendra « à payer ».`,
      showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', confirmButtonColor: '#dc2626'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.cs.supprimerPaiement(p.id).subscribe({
        next: () => { this.chargerPaiements(); this.chargerCalcul(); },
        error: err => Swal.fire({ icon: 'error', title: 'Impossible', text: err?.error?.message || 'Réessayez.' })
      });
    });
  }

  // ---------------------------------------------------------------- réglages

  ouvrirReglages(): void {
    this.typesBrouillon = {};
    this.types.forEach(t => this.typesBrouillon[t.type] = t.actif);
    this.reglagesOuverts = true;
  }

  enregistrerReglages(): void {
    const choisis = Object.keys(this.typesBrouillon).filter(k => this.typesBrouillon[k]) as TypeCommission[];
    if (!choisis.length) {
      Swal.fire({ icon: 'warning', title: 'Gardez au moins un type de prime', confirmButtonColor: '#2563eb' });
      return;
    }
    this.cs.definirTypes(choisis).subscribe({
      next: p => {
        this.types = p.types;
        this.reglagesOuverts = false;
        this.chargerRegles();
        this.chargerCalcul();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Impossible', text: err?.error?.message || 'Réessayez.' })
    });
  }

  @HostListener('document:keydown.escape')
  fermerModales(): void {
    this.formRegle = null;
    this.paiement = null;
    this.reglagesOuverts = false;
  }
}
