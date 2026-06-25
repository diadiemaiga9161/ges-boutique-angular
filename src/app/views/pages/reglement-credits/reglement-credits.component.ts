import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CaisseService, CreditInfo, ReglementCreditRequest, ModePaiementCaisse
} from '../../../shared/services/caisse.service';
import { VenteService, LigneVenteDto } from '../../../shared/services/vente.service';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reglement-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reglement-credits.component.html',
  styleUrl: './reglement-credits.component.scss'
})
export class ReglementCreditsComponent implements OnInit {
  credits: CreditInfo[] = [];
  creditsFiltres: CreditInfo[] = [];
  isLoading = false;
  searchTerm = '';

  // Expansion des produits par crédit
  expandedCreditId: number | null = null;
  lignesCredit: { [venteId: number]: LigneVenteDto[] } = {};
  loadingLignes: { [venteId: number]: boolean } = {};

  // Modal règlement
  showModal = false;
  selectedCredit: CreditInfo | null = null;
  reglementForm = {
    montantRegle: 0,
    modePaiement: ModePaiementCaisse.ESPECES,
    referencePaiement: ''
  };
  isLoadingReglement = false;

  ModePaiementCaisseEnum = ModePaiementCaisse;

  constructor(
    private caisseService: CaisseService,
    private venteService: VenteService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCredits();
  }

  loadCredits() {
    this.isLoading = true;
    this.caisseService.getCreditsNonRegles().subscribe({
      next: credits => {
        this.credits = credits.filter(c => !c.estReglee && !c.venteAnnulee);
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter() {
    const t = this.searchTerm.toLowerCase().trim();
    this.creditsFiltres = !t ? [...this.credits] :
      this.credits.filter(c =>
        c.clientNom.toLowerCase().includes(t) ||
        c.clientTelephone.includes(t) ||
        c.numeroVente.toLowerCase().includes(t)
      );
  }

  toggleProduits(credit: CreditInfo) {
    if (this.expandedCreditId === credit.id) {
      this.expandedCreditId = null;
      return;
    }
    this.expandedCreditId = credit.id;
    if (!this.lignesCredit[credit.venteId]) {
      this.loadingLignes[credit.venteId] = true;
      this.venteService.getVenteById(credit.venteId).subscribe({
        next: vente => {
          this.lignesCredit[credit.venteId] = vente.lignes || vente.produits || [];
          this.loadingLignes[credit.venteId] = false;
        },
        error: () => { this.loadingLignes[credit.venteId] = false; }
      });
    }
  }

  ouvrirModal(credit: CreditInfo) {
    this.selectedCredit = credit;
    this.reglementForm = {
      montantRegle: credit.montantRestant,
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
    this.selectedCredit = null;
    this.isLoadingReglement = false;
  }

  enregistrerReglement() {
    if (!this.selectedCredit) return;
    if (!this.reglementForm.montantRegle || this.reglementForm.montantRegle <= 0) {
      Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'error');
      return;
    }
    if (this.reglementForm.modePaiement !== ModePaiementCaisse.ESPECES && !this.reglementForm.referencePaiement.trim()) {
      Swal.fire('Erreur', 'La référence de paiement est requise', 'error');
      return;
    }

    this.isLoadingReglement = true;
    const user = this.authService.getUser();
    const request: ReglementCreditRequest = {
      venteCreditId: this.selectedCredit.id,
      montantRegle: this.reglementForm.montantRegle,
      utilisateurId: user?.id,
      modePaiement: this.reglementForm.modePaiement,
      referencePaiement: this.reglementForm.referencePaiement.trim() || undefined
    };

    this.caisseService.reglementCredit(request).subscribe({
      next: () => {
        this.isLoadingReglement = false;
        this.fermerModal();
        Swal.fire({ icon: 'success', title: 'Règlement enregistré !', timer: 2000, showConfirmButton: false });
        this.loadCredits();
      },
      error: err => {
        this.isLoadingReglement = false;
        Swal.fire('Erreur', err.message || 'Impossible d\'enregistrer le règlement', 'error');
      }
    });
  }

  get totalMontantRestant(): number {
    return this.credits.reduce((s, c) => s + (c.montantRestant || 0), 0);
  }

  get nbEnRetard(): number {
    return this.credits.filter(c => c.enRetard).length;
  }

  formatPrice(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  statutClass(c: CreditInfo): string {
    if (c.enRetard) return 'badge bg-danger';
    if (c.progression > 0) return 'badge bg-warning text-dark';
    return 'badge bg-primary';
  }

  statutLabel(c: CreditInfo): string {
    if (c.enRetard) return `Retard ${c.joursRetard}j`;
    if (c.progression > 0) return `Payé ${c.progression.toFixed(0)}%`;
    return 'En cours';
  }
}
