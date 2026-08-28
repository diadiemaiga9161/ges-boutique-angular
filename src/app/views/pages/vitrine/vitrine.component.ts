import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VitrineInfoDto,
  VitrineProduitDto,
  VitrineService
} from '../../../shared/services/vitrine.service';

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
export class VitrineComponent implements OnInit {

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
  form = { nom: '', prenom: '', telephone: '', notes: '' };

  // ── Confirmation ────────────────────────────────────────────────────────
  commandeConfirmee: string | null = null;

  constructor(private vitrineService: VitrineService) {}

  ngOnInit(): void {
    this.chargerInfos();
    this.chargerProduits();
  }

  chargerInfos(): void {
    this.loadingInfos = true;
    this.erreurInfos = false;
    this.vitrineService.getInfos().subscribe({
      next: data => { this.infos = data; this.loadingInfos = false; },
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

  formatPrix(v: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' FCFA';
  }

  stockLabel(p: VitrineProduitDto): string {
    if (p.statutStock === 'RUPTURE') return 'Rupture';
    if (p.statutStock === 'STOCK_FAIBLE') return 'Stock faible';
    return 'Disponible';
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
    return this.form.nom.trim().length > 0 && this.form.telephone.trim().length >= 8;
  }

  envoyerCommande(): void {
    if (!this.formulaireValide || this.envoiEnCours) return;
    this.envoiEnCours = true;
    this.erreurEnvoi = '';
    this.vitrineService.passerCommande({
      clientNom: this.form.nom.trim(),
      clientPrenom: this.form.prenom.trim() || undefined,
      clientTelephone: this.form.telephone.trim(),
      notes: this.form.notes.trim() || undefined,
      lignes: this.panier.map(l => ({ produitId: l.produit.id, quantite: l.quantite }))
    }).subscribe({
      next: (rep) => {
        this.envoiEnCours = false;
        this.formulaireOuvert = false;
        this.commandeConfirmee = rep.numeroCommande || 'envoyée';
        this.panier = [];
        this.form = { nom: '', prenom: '', telephone: '', notes: '' };
      },
      error: (e) => {
        this.envoiEnCours = false;
        this.erreurEnvoi = e?.message || 'Impossible d\'envoyer la commande, réessayez.';
      }
    });
  }

  fermerConfirmation(): void { this.commandeConfirmee = null; }
}
