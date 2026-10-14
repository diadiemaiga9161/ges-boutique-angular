import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit, ProductService } from '../../../shared/services/product.service';
import { OffreQuantite, OffreQuantiteService } from '../../../shared/services/offre-quantite.service';

interface Saisie {
  id?: number;
  produitId: number | null;
  quantite: number | null;
  prix: number | null;
  dateDebut: string;
  dateFin: string;
  active: boolean;
}

/**
 * Offres par quantité (« 2 pour 75 F ») : le gérant les règle ici, la caisse les applique
 * toute seule. Le vendeur ne peut ni les créer, ni les retirer d'une vente.
 */
@Component({
  selector: 'app-offres-quantite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offres-quantite.component.html',
  styleUrls: ['./offres-quantite.component.scss']
})
export class OffresQuantiteComponent implements OnInit {
  offres: OffreQuantite[] = [];
  produits: Produit[] = [];
  rechercheProduit = '';
  chargement = false;
  enregistrement = false;
  message = '';
  erreur = '';
  saisie: Saisie | null = null;

  constructor(private service: OffreQuantiteService, private productService: ProductService) {}

  ngOnInit(): void {
    this.charger();
    this.productService.getProducts().subscribe({
      next: p => (this.produits = p.filter(x => !x.modeMesure).sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))),
      error: () => {}
    });
  }

  charger(): void {
    this.chargement = true;
    this.service.lister().subscribe({
      next: o => { this.offres = o; this.chargement = false; },
      error: e => { this.erreur = e?.error?.message || 'Impossible de charger les offres.'; this.chargement = false; }
    });
  }

  get produitsFiltres(): Produit[] {
    const r = this.rechercheProduit.trim().toLowerCase();
    const liste = r ? this.produits.filter(p => (p.nom || '').toLowerCase().includes(r) || (p.codeBarre || '').includes(r)) : this.produits;
    return liste.slice(0, 50);
  }

  get produitChoisi(): Produit | undefined {
    return this.produits.find(p => p.id === this.saisie?.produitId);
  }

  nouvelle(): void {
    this.message = '';
    this.erreur = '';
    this.rechercheProduit = '';
    this.saisie = { produitId: null, quantite: 2, prix: null, dateDebut: '', dateFin: '', active: true };
  }

  modifier(o: OffreQuantite): void {
    this.message = '';
    this.erreur = '';
    this.rechercheProduit = '';
    this.saisie = {
      id: o.id, produitId: o.produitId, quantite: o.quantite, prix: o.prix,
      dateDebut: o.dateDebut || '', dateFin: o.dateFin || '', active: o.active
    };
  }

  choisirProduit(p: Produit): void {
    if (this.saisie) this.saisie.produitId = p.id;
    this.rechercheProduit = '';
  }

  /** Aperçu : prix normal du lot, économie pour le client, et vente à perte éventuelle. */
  get apercu(): { normal: number; economie: number; perte: boolean } | null {
    const p = this.produitChoisi;
    const s = this.saisie;
    if (!p || !s?.quantite || !s.prix) return null;
    const normal = s.quantite * (p.prixVente || 0);
    return { normal, economie: normal - s.prix, perte: s.prix < s.quantite * (p.prixAchat || 0) };
  }

  enregistrer(): void {
    if (!this.saisie) return;
    this.enregistrement = true;
    this.erreur = '';
    this.service.enregistrer({
      id: this.saisie.id,
      produitId: this.saisie.produitId ?? undefined,
      quantite: this.saisie.quantite ?? undefined,
      prix: this.saisie.prix ?? undefined,
      dateDebut: this.saisie.dateDebut || null,
      dateFin: this.saisie.dateFin || null,
      active: this.saisie.active
    }).subscribe({
      next: o => {
        this.message = `Offre enregistrée : ${o.produitNom}, ${o.quantite} pour ${this.prix(o.prix)}.`;
        this.saisie = null;
        this.enregistrement = false;
        this.charger();
      },
      error: e => { this.erreur = e?.error?.message || 'Enregistrement impossible.'; this.enregistrement = false; }
    });
  }

  basculer(o: OffreQuantite): void {
    this.erreur = '';
    this.service.enregistrer({ ...o, active: !o.active }).subscribe({
      next: () => { this.message = o.active ? 'Offre arrêtée.' : 'Offre remise en marche.'; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Modification impossible.')
    });
  }

  supprimer(o: OffreQuantite): void {
    if (!confirm(`Supprimer l'offre « ${o.quantite} pour ${this.prix(o.prix)} » sur ${o.produitNom} ?`)) return;
    this.service.supprimer(o.id).subscribe({
      next: () => { this.message = 'Offre supprimée.'; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Suppression impossible.')
    });
  }

  etat(o: OffreQuantite): { texte: string; classe: string } {
    if (!o.active) return { texte: 'Arrêtée', classe: 'oq-badge--arret' };
    if (o.enCours) return { texte: 'En cours', classe: 'oq-badge--actif' };
    return { texte: 'Programmée / finie', classe: 'oq-badge--attente' };
  }

  periode(o: OffreQuantite): string {
    const f = (d: string) => d.split('-').reverse().join('/');
    if (!o.dateDebut && !o.dateFin) return 'Sans fin';
    if (o.dateDebut && o.dateFin) return `Du ${f(o.dateDebut)} au ${f(o.dateFin)}`;
    return o.dateDebut ? `À partir du ${f(o.dateDebut)}` : `Jusqu'au ${f(o.dateFin!)}`;
  }

  prix(v: number): string {
    return Math.round(v || 0).toLocaleString('fr-FR') + ' F';
  }
}
