// src/app/views/pages/parametres/parametres.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class ParametresComponent implements OnInit {

  // ==================== ÉTATS ====================
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // ==================== SÉLECTIONS ====================
  selectionSoldeCaisse: boolean = false;
  selectionHistoriqueCaisse: boolean = false;
  selectionCreditsRegles: boolean = false;
  selectionVentesAnnulees: boolean = false;

  // ==================== CONFIRMATION SUPPRESSION ====================
  texteConfirmation: string = '';
  showConfirmDelete: boolean = false;

  // ==================== ENDPOINTS (vérifiés) ====================
  // Ces endpoints ne sont pas encore disponibles côté backend
  private readonly endpointReinitialiser = `${environment.apiUrl}/caisse/reinitialiser`;
  private readonly endpointSupprimerHistorique = `${environment.apiUrl}/caisse/historique`;

  // Indicateur disponibilité backend (false = fonctionnalité en cours de déploiement)
  endpointsDisponibles: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Vérifier disponibilité des endpoints (optionnel : on désactive par défaut)
    this.endpointsDisponibles = false;
  }

  // ==================== ACCESSEURS RÔLE ====================

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ==================== SÉLECTION ====================

  toutSelectionner(): void {
    const etat = !(this.selectionSoldeCaisse && this.selectionHistoriqueCaisse &&
                   this.selectionCreditsRegles && this.selectionVentesAnnulees);
    this.selectionSoldeCaisse = etat;
    this.selectionHistoriqueCaisse = etat;
    this.selectionCreditsRegles = etat;
    this.selectionVentesAnnulees = etat;
  }

  get toutEstSelectionne(): boolean {
    return this.selectionSoldeCaisse && this.selectionHistoriqueCaisse &&
           this.selectionCreditsRegles && this.selectionVentesAnnulees;
  }

  get aucuneSelection(): boolean {
    return !this.selectionSoldeCaisse && !this.selectionHistoriqueCaisse &&
           !this.selectionCreditsRegles && !this.selectionVentesAnnulees;
  }

  get selectionResume(): string {
    const elements: string[] = [];
    if (this.selectionSoldeCaisse) elements.push('Solde caisse');
    if (this.selectionHistoriqueCaisse) elements.push('Historique caisse');
    if (this.selectionCreditsRegles) elements.push('Crédits réglés');
    if (this.selectionVentesAnnulees) elements.push('Ventes annulées');
    return elements.join(', ');
  }

  // ==================== RÉINITIALISATION ====================

  reinitialiser(): void {
    if (this.aucuneSelection) {
      this.errorMessage = 'Veuillez sélectionner au moins un élément à réinitialiser.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    if (!this.endpointsDisponibles) {
      this.errorMessage = 'Fonctionnalité en cours de déploiement. Disponible prochainement.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    const ok = confirm(
      `Êtes-vous sûr de vouloir réinitialiser les éléments sélectionnés ?\n\n${this.selectionResume}`
    );
    if (!ok) return;

    this.isLoading = true;
    this.errorMessage = '';
    const payload = {
      soldeCaisse: this.selectionSoldeCaisse,
      historiqueCaisse: this.selectionHistoriqueCaisse,
      creditsRegles: this.selectionCreditsRegles,
      ventesAnnulees: this.selectionVentesAnnulees
    };

    this.http.post(this.endpointReinitialiser, payload, {
      headers: this.authService.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.successMessage = 'Réinitialisation effectuée avec succès.';
        this.isLoading = false;
        this.reinitialiserSelections();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation.';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== SUPPRESSION ====================

  ouvrirConfirmationSuppression(): void {
    if (this.aucuneSelection) {
      this.errorMessage = 'Veuillez sélectionner au moins un élément à supprimer.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    if (!this.endpointsDisponibles) {
      this.errorMessage = 'Fonctionnalité en cours de déploiement. Disponible prochainement.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    const ok = confirm(
      `ATTENTION : Cette action est irréversible !\n\nVous allez supprimer définitivement :\n${this.selectionResume}\n\nContinuer ?`
    );
    if (!ok) return;

    this.texteConfirmation = '';
    this.showConfirmDelete = true;
  }

  confirmerSuppression(): void {
    if (this.texteConfirmation.trim() !== 'CONFIRMER') {
      this.errorMessage = 'Vous devez taper exactement "CONFIRMER" pour valider.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    this.showConfirmDelete = false;
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      soldeCaisse: this.selectionSoldeCaisse,
      historiqueCaisse: this.selectionHistoriqueCaisse,
      creditsRegles: this.selectionCreditsRegles,
      ventesAnnulees: this.selectionVentesAnnulees
    };

    this.http.delete(this.endpointSupprimerHistorique, {
      headers: this.authService.getAuthHeaders(),
      body: payload
    }).subscribe({
      next: () => {
        this.successMessage = 'Suppression définitive effectuée avec succès.';
        this.isLoading = false;
        this.reinitialiserSelections();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression.';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  annulerSuppression(): void {
    this.showConfirmDelete = false;
    this.texteConfirmation = '';
  }

  // ==================== UTILITAIRES ====================

  private reinitialiserSelections(): void {
    this.selectionSoldeCaisse = false;
    this.selectionHistoriqueCaisse = false;
    this.selectionCreditsRegles = false;
    this.selectionVentesAnnulees = false;
  }
}
