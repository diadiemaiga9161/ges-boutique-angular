import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnulationPaiementsService } from '../../../shared/services/annulation-paiements.service';
import { AuthService } from '../../../shared/services/auth.service';

type PeriodeType = 'today' | 'week' | 'month' | 'year' | 'all';

@Component({
  selector: 'app-annulation-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annulation-paiements.component.html',
  styleUrls: ['./annulation-paiements.component.scss']
})
export class AnnulationPaiementsComponent implements OnInit {
  onglet: 'fournisseur' | 'credit' = 'fournisseur';

  paiementsFournisseur: any[] = [];
  paiementsFiltres: any[] = [];
  reglements: any[] = [];
  reglementsFiltres: any[] = [];

  loading = false;
  selectedPeriod: PeriodeType = 'all';
  dateDebut = '';
  dateFin = '';
  searchTerm = '';

  successMsg = '';
  errorMsg = '';

  constructor(
    private annulationService: AnnulationPaiementsService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.charger();
  }

  changerOnglet(onglet: 'fournisseur' | 'credit') {
    this.onglet = onglet;
    this.searchTerm = '';
    this.charger();
  }

  charger() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    if (this.onglet === 'fournisseur') {
      this.annulationService
        .getPaiementsFournisseur(this.dateDebut || undefined, this.dateFin || undefined)
        .subscribe({
          next: data => {
            this.paiementsFournisseur = data;
            this.appliquerFiltres();
            this.loading = false;
          },
          error: (e: any) => {
            this.errorMsg = e?.error?.message || 'Erreur lors du chargement des paiements fournisseur.';
            this.loading = false;
          }
        });
    } else {
      this.annulationService
        .getReglements(this.dateDebut || undefined, this.dateFin || undefined)
        .subscribe({
          next: data => {
            this.reglements = data;
            this.appliquerFiltres();
            this.loading = false;
          },
          error: (e: any) => {
            this.errorMsg = e?.error?.message || 'Erreur lors du chargement des règlements de crédit.';
            this.loading = false;
          }
        });
    }
  }

  appliquerFiltres() {
    const term = this.searchTerm.toLowerCase().trim();
    if (this.onglet === 'fournisseur') {
      this.paiementsFiltres = this.paiementsFournisseur.filter(p =>
        !term ||
        (p.fournisseur?.nom || '').toLowerCase().includes(term) ||
        (p.reference || '').toLowerCase().includes(term) ||
        (p.modePaiement || '').toLowerCase().includes(term) ||
        (this.getPayerLabel(p) || '').toLowerCase().includes(term)
      );
    } else {
      this.reglementsFiltres = this.reglements.filter(r =>
        !term ||
        (r.clientNom || '').toLowerCase().includes(term) ||
        (r.clientTelephone || '').toLowerCase().includes(term) ||
        (r.motif || '').toLowerCase().includes(term)
      );
    }
  }

  filterByPeriod(period: PeriodeType) {
    this.selectedPeriod = period;
    if (period === 'all') {
      this.dateDebut = '';
      this.dateFin = '';
    } else {
      const today = new Date();
      this.dateFin = today.toISOString().split('T')[0];
      if (period === 'today') {
        this.dateDebut = this.dateFin;
      } else if (period === 'week') {
        const d = new Date(today);
        const day = d.getDay();
        d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
        this.dateDebut = d.toISOString().split('T')[0];
      } else if (period === 'month') {
        this.dateDebut = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString().split('T')[0];
      } else {
        this.dateDebut = new Date(today.getFullYear(), 0, 1)
          .toISOString().split('T')[0];
      }
    }
    this.charger();
  }

  confirmerAnnulation(item: any, type: 'fournisseur' | 'credit') {
    if (item.annule) return;

    const label =
      type === 'fournisseur'
        ? `Annuler le paiement de ${this.formatMontant(item.montant)} à ${item.fournisseur?.nom} ?`
        : `Annuler le règlement de ${this.formatMontant(item.montant)} pour ${item.clientNom} ?`;

    if (!confirm(label + "\n\nL'argent sera remis à sa source (caisse ou banque).")) return;

    const userId = this.auth.getUserId();

    if (type === 'fournisseur') {
      this.annulationService.annulerPaiementFournisseur(item.id, userId).subscribe({
        next: () => {
          this.successMsg = 'Paiement fournisseur annulé avec succès.';
          this.charger();
          setTimeout(() => (this.successMsg = ''), 4000);
        },
        error: (e: any) => {
          this.errorMsg = e?.error?.message || "Erreur lors de l'annulation du paiement.";
          setTimeout(() => (this.errorMsg = ''), 5000);
        }
      });
    } else {
      this.annulationService.annulerReglementCredit(item.id, userId).subscribe({
        next: () => {
          this.successMsg = 'Règlement de crédit annulé avec succès.';
          this.charger();
          setTimeout(() => (this.successMsg = ''), 4000);
        },
        error: (e: any) => {
          this.errorMsg = e?.error?.message || "Erreur lors de l'annulation du règlement.";
          setTimeout(() => (this.errorMsg = ''), 5000);
        }
      });
    }
  }

  get listeActive(): any[] {
    return this.onglet === 'fournisseur' ? this.paiementsFiltres : this.reglementsFiltres;
  }

  get totalMontant(): number {
    return this.listeActive
      .filter(x => !x.annule)
      .reduce((sum, x) => sum + (x.montant || 0), 0);
  }

  get countAnnules(): number {
    return this.listeActive.filter(x => x.annule).length;
  }

  get countActifs(): number {
    return this.listeActive.filter(x => !x.annule).length;
  }

  getPayerLabel(p: any): string {
    return p?.utilisateurNom
      || p?.utilisateur?.nomComplet
      || p?.utilisateur?.username
      || p?.nomUtilisateur
      || p?.utilisateurName
      || p?.effectuePar
      || p?.utilisateurId
      || this.auth.getDisplayName()
      || 'Utilisateur';
  }

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v || 0) + ' F';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatModePaiement(mode: string): string {
    const modes: Record<string, string> = {
      ESPECES: 'Espèces',
      ESPECE: 'Espèces',
      CASH: 'Espèces',
      ORANGE_MONEY: 'Orange Money',
      MOOV_MONEY: 'Moov Money',
      WAVE_MONEY: 'Wave Money',
      CARTE_BANCAIRE: 'Carte bancaire',
      MOBILE_MONEY: 'Mobile Money',
      VIREMENT: 'Virement',
      BANQUE: 'Banque'
    };
    return modes[mode] || mode || '—';
  }
}
