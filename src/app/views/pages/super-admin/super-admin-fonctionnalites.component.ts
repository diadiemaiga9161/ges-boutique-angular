import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BoutiqueService, FonctionnaliteAvancee } from '../../../shared/services/boutique.service';
import { AuthService } from '../../../shared/services/auth.service';

// Page réservée au super admin (voir AuthService.isSuperAdmin — pas un rôle séparé,
// un flag "super_admin" activé manuellement en base sur un compte ADMIN existant).
// Invisible dans le menu et bloquée ici pour tout autre compte ; le serveur revérifie
// systématiquement le privilège sur PUT /api/boutique/fonctionnalites (403 sinon),
// cette page ne fait qu'un contrôle d'affichage.
@Component({
  selector: 'app-super-admin-fonctionnalites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-fonctionnalites.component.html',
  styleUrls: ['./super-admin-fonctionnalites.component.scss']
})
export class SuperAdminFonctionnalitesComponent implements OnInit {
  featureTransfertsActif = true;
  featureVitrineActif = true;
  isLoading = false;
  isSaving = false;

  // Fonctionnalités avancées (Dépôt garde, Dettes anciennes, Comptes bancaires...) —
  // système séparé de Transferts/Vitrine ci-dessus, chaque ligne se sauvegarde
  // individuellement dès qu'on la bascule (pas de bouton "Enregistrer" groupé, pour
  // éviter qu'un oubli de clic laisse une fonctionnalité dans un état non voulu).
  fonctionnalitesAvancees: FonctionnaliteAvancee[] = [];
  isLoadingAvancees = false;
  clesEnCours = new Set<string>();

  constructor(
    public authService: AuthService,
    private boutiqueService: BoutiqueService
  ) {}

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    if (!this.isSuperAdmin) return;
    this.isLoading = true;
    this.boutiqueService.refreshBoutique().subscribe({
      next: (info) => {
        this.featureTransfertsActif = info.featureTransfertsActif !== false;
        this.featureVitrineActif = info.featureVitrineActif !== false;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.isLoadingAvancees = true;
    this.boutiqueService.getFonctionnalitesAvancees().subscribe({
      next: (liste) => { this.fonctionnalitesAvancees = liste; this.isLoadingAvancees = false; },
      error: () => { this.isLoadingAvancees = false; }
    });
  }

  enregistrer(): void {
    this.isSaving = true;
    this.boutiqueService.modifierFonctionnalites(this.featureTransfertsActif, this.featureVitrineActif).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({ icon: 'success', title: 'Fonctionnalités mises à jour', timer: 1800, showConfirmButton: false });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message || 'Impossible de mettre à jour les fonctionnalités' });
      }
    });
  }

  private readonly icones: Record<string, string> = {
    DEPOT_GARDE: 'fa-vault',
    DETTES_ANCIENNES: 'fa-file-invoice-dollar',
    COMPTES_BANCAIRES: 'fa-building-columns',
    PROMOTIONS: 'fa-tags',
    MOBILE_MONEY: 'fa-mobile-screen',
    BONUS_FOURNISSEURS: 'fa-gift',
    OBJECTIFS_FOURNISSEUR: 'fa-bullseye',
    OBJECTIFS_VENDEUR: 'fa-award',
    RAPPORTS: 'fa-chart-line',
    IA: 'fa-robot',
    RESULTAT_NET: 'fa-calculator',
    VENTE_GROS_DETAIL: 'fa-boxes-stacked'
  };

  private readonly descriptions: Record<string, string> = {
    DEPOT_GARDE: "Bloque uniquement les nouveaux dépôts — les clients gardent l'accès à leur historique et peuvent toujours récupérer leur argent.",
    DETTES_ANCIENNES: "Bloque uniquement la création de nouvelles dettes — les clients peuvent toujours consulter et régler leurs dettes existantes.",
    COMPTES_BANCAIRES: 'Gestion des comptes bancaires de la boutique.',
    PROMOTIONS: 'Création et envoi de promotions aux clients.',
    MOBILE_MONEY: 'Statistiques Orange Money / Moov Money.',
    BONUS_FOURNISSEURS: 'Suivi des bonus accordés par les fournisseurs.',
    OBJECTIFS_FOURNISSEUR: 'Objectifs et bonus liés aux fournisseurs.',
    OBJECTIFS_VENDEUR: 'Primes des vendeurs selon leurs objectifs.',
    RAPPORTS: 'Page de rapports et statistiques analytiques.',
    IA: 'Assistant et recommandations intelligentes.',
    RESULTAT_NET: 'Calcul du résultat net (bénéfice/perte).',
    VENTE_GROS_DETAIL: "Vente en gros et au détail : unités de vente alternatives (carton, cartouche...) avec conversion automatique vers l'unité de base, sur le stock unique du produit."
  };

  getIcone(cle: string): string {
    return this.icones[cle] || 'fa-toggle-on';
  }

  getDescription(cle: string): string {
    return this.descriptions[cle] || '';
  }

  basculerFonctionnaliteAvancee(f: FonctionnaliteAvancee): void {
    const nouvelEtat = !f.actif;
    this.clesEnCours.add(f.cle);
    this.boutiqueService.definirFonctionnaliteAvancee(f.cle, nouvelEtat).subscribe({
      next: (liste) => {
        this.fonctionnalitesAvancees = liste;
        this.clesEnCours.delete(f.cle);
      },
      error: (err) => {
        this.clesEnCours.delete(f.cle);
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message || 'Impossible de mettre à jour cette fonctionnalité' });
      }
    });
  }
}
