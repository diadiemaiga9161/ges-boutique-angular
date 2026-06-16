// src/app/modules/caisse/caisse-ges/caisse-ges.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, from } from 'rxjs';
import { WebSocketService } from '../../../shared/services/websocket.service';
import { concatMap, toArray } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  CaisseService,
  Caisse,
  OperationCaisse,
  TypeOperationCaisse,
  ModePaiementCaisse,
  CreditInfo,
  SituationCredits,
  StatistiquesCaisse,
  CaisseRequest,
  ReglementCreditRequest,
  VerificationCaisseRequest,
  RevenusPertes,
  VentesComptantDuJour,
  VentesCreditDuJour,
  TransfertCaisseBanqueRequest
} from '../../../shared/services/caisse.service';
import { AuthService, User } from '../../../shared/services/auth.service';
import { CompteService, Compte } from '../../../shared/services/compte.service';

interface CaisseSession {
  dateOuverture: string;
  dateFermeture: string;
  soldeInitial: number;
  soldeFinal: number;
  totalEntrees: number;
  totalSorties: number;
  nombreOperations: number;
  operations: OperationCaisse[];
}

@Component({
  selector: 'app-caisse-ges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caisse-ges.component.html'
})
export class CaisseGesComponent implements OnInit, OnDestroy {
  caisse: Caisse | null = null;
  operations: OperationCaisse[] = [];
  operationsFiltrees: OperationCaisse[] = [];
  creditsEnCours: CreditInfo[] = [];
  creditsEnRetard: CreditInfo[] = [];
  situationCredits: SituationCredits | null = null;
  statistiquesJour: StatistiquesCaisse | null = null;
  statistiquesPeriode: StatistiquesCaisse | null = null;
  revenusPertes: RevenusPertes | null = null;
  isLoading: boolean = false;
  isLoadingOperations: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  currentUser: User | null = null;
  dateActuelle: string = new Date().toISOString().split('T')[0];
  currentPage: number = 1;
  itemsPerPage: number = 15;
  dateDebut: string = this.getDateDebutMois();
  dateFin: string = this.getAujourdhui();
  typeOperationFilter: string = '';
  searchTerm: string = '';
  heureDebut: string = '';
  heureFin: string = '';
  periodeActive: 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise' = 'jour';
  
  // Modals
  showOuvertureModal: boolean = false;
  showFermetureModal: boolean = false;
  showVerificationModal: boolean = false;
  showEntreeModal: boolean = false;
  showSortieModal: boolean = false;
  showReglementCreditModal: boolean = false;
  showDetailsOperationModal: boolean = false;
  showDetailsCreditModal: boolean = false;
  showStatistiquesModal: boolean = false;
  showHistoriqueReglementsModal: boolean = false;
  showRapportPeriodeModal: boolean = false;
  showRevenusPertesModal: boolean = false;
  showVentesComptantModal: boolean = false;
  showVentesCreditModal: boolean = false;
  
  selectedOperation: OperationCaisse | null = null;
  selectedCredit: CreditInfo | null = null;
  selectedCreditReglements: OperationCaisse[] = [];

  // Credits par client
  showCreditsClientModal: boolean = false;
  selectedClientCreditsNom: string = '';
  selectedClientCreditsList: CreditInfo[] = [];
  ventesComptant: VentesComptantDuJour | null = null;

  // Caisses cloturees
  caissesSessions: CaisseSession[] = [];
  showSessionDetailModal: boolean = false;
  selectedSession: CaisseSession | null = null;

  // Pagination credits
  creditsCurrentPage: number = 1;
  creditsItemsPerPage: number = 8;

  // Paiement groupe
  showPaiementGroupeModal: boolean = false;
  montantPaiementGroupe: number = 0;
  modePaiementGroupe: ModePaiementCaisse = ModePaiementCaisse.ESPECES;
  referenceGroupePaiement: string = '';
  isLoadingPaiementGroupe: boolean = false;
  repartitionGroupe: { credit: CreditInfo; montantAPayer: number }[] = [];
  ventesCredit: VentesCreditDuJour | null = null;
  
  // Transfert vers banque
  showTransfertBanqueModal: boolean = false;
  isLoadingTransfert: boolean = false;
  comptesDisponibles: Compte[] = [];
  transfertForm: {
    compteId: number | null;
    montant: number;
    motif: string;
    reference: string;
  } = {
    compteId: null,
    montant: 0,
    motif: '',
    reference: ''
  };
  
  // Forms
  entreeForm: {
    montant: number;
    motif: string;
    modePaiement: ModePaiementCaisse;
    referencePaiement: string;
  } = {
    montant: 0,
    motif: '',
    modePaiement: ModePaiementCaisse.ESPECES,
    referencePaiement: ''
  };
  
  sortieForm: {
    montant: number;
    motif: string;
  } = {
    montant: 0,
    motif: ''
  };
  
  verificationForm: {
    soldeReelSaisi: number;
    observations: string;
  } = {
    soldeReelSaisi: 0,
    observations: ''
  };
  
  reglementForm: {
    montantRegle: number;
    modePaiement: ModePaiementCaisse;
    referencePaiement: string;
  } = {
    montantRegle: 0,
    modePaiement: ModePaiementCaisse.ESPECES,
    referencePaiement: ''
  };
  
  periodeRevenusPertes: 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise' = 'mois';
  TypeOperationCaisseEnum = TypeOperationCaisse;
  ModePaiementCaisseEnum = ModePaiementCaisse;
  private subscriptions: Subscription[] = [];
  Math = Math;

  constructor(
    public caisseService: CaisseService,
    private authService: AuthService,
    private compteService: CompteService,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.subscribeToUser();
    this.loadCaissesSessions();

    // Temps réel : rafraîchir la caisse à chaque opération / règlement
    const wsSub = this.ws.subscribeTopic('/topic/caisse').subscribe(() => {
      this.loadAllData();
    });
    this.subscriptions.push(wsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  subscribeToUser(): void {
    const userSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
    this.subscriptions.push(userSub);
  }

  loadAllData(): void {
    this.loadCaisse();
    this.loadOperations();
    this.loadCredits();
    this.loadStatistiquesJour();
  }

  loadCaisse(): void {
    this.caisseService.getEtatCaisse().subscribe({
      next: (caisse) => {
        this.caisse = caisse;
        this.verificationForm.soldeReelSaisi = caisse.soldeActuel;
      },
      error: (error) => {
        if (!error.message.includes('Aucune caisse')) {
          this.errorMessage = error.message;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      }
    });
  }

  loadOperations(): void {
    this.isLoadingOperations = true;
    let operations$;
    switch (this.periodeActive) {
      case 'jour':
        operations$ = this.caisseService.getOperationsDuJour();
        break;
      case 'semaine':
        operations$ = this.caisseService.getOperationsDeLaSemaine();
        break;
      case 'mois':
        operations$ = this.caisseService.getOperationsDuMois();
        break;
      case 'annee':
        operations$ = this.caisseService.getOperationsDeLAnnee();
        break;
      default:
        operations$ = this.caisseService.getOperationsParPeriode(this.dateDebut, this.dateFin);
        break;
    }
    operations$.subscribe({
      next: (operations) => {
        this.operations = operations || [];
        this.applyFilters();
        this.isLoadingOperations = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.operations = [];
        this.operationsFiltrees = [];
        this.isLoadingOperations = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadCredits(): void {
    console.log('🔄 Chargement des crédits...');
    
    this.caisseService.getCreditsNonRegles().subscribe({
      next: (credits) => {
        this.creditsEnCours = credits.filter(credit => !credit.venteAnnulee);
        console.log(`📊 ${this.creditsEnCours.length} crédits en cours chargés`);
      },
      error: (error) => {
        console.error('Erreur chargement crédits:', error);
      }
    });
    
    this.caisseService.getCreditsEnRetard().subscribe({
      next: (credits) => {
        this.creditsEnRetard = credits.filter(credit => !credit.venteAnnulee);
        console.log(`⚠️ ${this.creditsEnRetard.length} crédits en retard`);
      },
      error: (error) => {
        console.error('Erreur chargement crédits en retard:', error);
      }
    });
    
    this.caisseService.getSituationCredits().subscribe({
      next: (situation) => {
        this.situationCredits = situation;
      },
      error: (error) => {
        console.error('Erreur chargement situation crédits:', error);
      }
    });
  }

  loadStatistiquesJour(): void {
    this.caisseService.getStatistiquesDuJour().subscribe({
      next: (stats) => {
        this.statistiquesJour = stats;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  loadStatistiquesPeriode(): void {
    this.caisseService.getStatistiquesParPeriode(this.dateDebut, this.dateFin).subscribe({
      next: (stats) => {
        this.statistiquesPeriode = stats;
        this.showStatistiquesModal = true;
      },
      error: (error) => {
        this.errorMessage = error.message;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadRevenusPertesJour(): void {
    this.isLoading = true;
    this.caisseService.getRevenusEtPertesParPeriode(
      this.getAujourdhui(),
      this.getAujourdhui()
    ).subscribe({
      next: (data) => {
        this.revenusPertes = data;
        this.periodeRevenusPertes = 'jour';
        this.showRevenusPertesModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadRevenusPertesSemaine(): void {
    this.isLoading = true;
    this.caisseService.getRevenusEtPertesParPeriode(
      this.getDateDebutSemaine(),
      this.getDateFinSemaine()
    ).subscribe({
      next: (data) => {
        this.revenusPertes = data;
        this.periodeRevenusPertes = 'semaine';
        this.showRevenusPertesModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadRevenusPertesMois(): void {
    this.isLoading = true;
    this.caisseService.getRevenusEtPertesParPeriode(
      this.getDateDebutMois(),
      this.getDateFinMois()
    ).subscribe({
      next: (data) => {
        this.revenusPertes = data;
        this.periodeRevenusPertes = 'mois';
        this.showRevenusPertesModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadRevenusPertesAnnee(): void {
    this.isLoading = true;
    this.caisseService.getRevenusEtPertesParPeriode(
      this.getDateDebutAnnee(),
      this.getDateFinAnnee()
    ).subscribe({
      next: (data) => {
        this.revenusPertes = data;
        this.periodeRevenusPertes = 'annee';
        this.showRevenusPertesModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadRevenusPertesPersonnalise(): void {
    if (!this.dateDebut || !this.dateFin) {
      this.errorMessage = 'Veuillez sélectionner une période';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.isLoading = true;
    this.caisseService.getRevenusEtPertesParPeriode(this.dateDebut, this.dateFin).subscribe({
      next: (data) => {
        this.revenusPertes = data;
        this.periodeRevenusPertes = 'personnalise';
        this.showRevenusPertesModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadHistoriqueReglementsCredit(credit: CreditInfo): void {
    if (!credit.venteId || credit.venteId === 0) {
      this.errorMessage = 'ID de vente manquant pour ce crédit';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }
    
    this.isLoading = true;
    this.caisseService.getHistoriqueReglementsCredit(credit.venteId).subscribe({
      next: (reglements) => {
        this.selectedCreditReglements = reglements;
        this.showHistoriqueReglementsModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openVentesComptantModal(): void {
    this.isLoading = true;
    this.caisseService.getVentesComptantDuJour().subscribe({
      next: (ventes) => {
        this.ventesComptant = ventes;
        this.showVentesComptantModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openVentesCreditModal(): void {
    this.isLoading = true;
    this.caisseService.getVentesCreditDuJour().subscribe({
      next: (ventes) => {
        this.ventesCredit = ventes;
        this.showVentesCreditModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== ACTIONS AVEC CONFIRMATION ====================

  ouvrirCaisse(): void {
    if (!this.currentUser) {
      this.alertError('Utilisateur non identifié');
      return;
    }
    
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment ouvrir la caisse ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, ouvrir',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.ouvrirCaisse().subscribe({
          next: (caisse) => {
            this.caisse = caisse;
            this.showOuvertureModal = false;
            this.resetForms();
            this.loadAllData();
            this.isLoading = false;
            this.alertSuccess('Caisse ouverte avec succès');
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message);
          }
        });
      }
    });
  }

  fermerCaisse(): void {
    if (!this.currentUser) {
      this.alertError('Utilisateur non identifié');
      return;
    }
    if (!this.caisse?.estOuverte) {
      this.alertError('La caisse est déjà fermée');
      return;
    }
    
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment fermer la caisse ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, fermer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.fermerCaisse(this.currentUser!.id).subscribe({
          next: (caisse) => {
            this.caisse = caisse;
            this.showFermetureModal = false;
            this.saveCaisseSession({
              dateOuverture: caisse.dateOuverture || new Date().toISOString(),
              dateFermeture: caisse.dateFermeture || new Date().toISOString(),
              soldeInitial: caisse.soldeInitial || 0,
              soldeFinal: caisse.soldeActuel || 0,
              totalEntrees: caisse.totalEntrees || 0,
              totalSorties: caisse.totalSorties || 0,
              nombreOperations: this.operations.length,
              operations: [...this.operations]
            });
            this.loadCaissesSessions();
            this.loadAllData();
            this.isLoading = false;
            this.alertSuccess('Caisse fermée avec succès');
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message);
          }
        });
      }
    });
  }

  verifierCaisse(): void {
    if (!this.currentUser) {
      this.alertError('Utilisateur non identifié');
      return;
    }
    if (!this.caisse?.estOuverte) {
      this.alertError('La caisse doit être ouverte');
      return;
    }
    if (this.verificationForm.soldeReelSaisi < 0) {
      this.alertError('Solde réel invalide');
      return;
    }
    
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous procéder à la vérification de la caisse ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, vérifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const request: VerificationCaisseRequest = {
          soldeReelSaisi: this.verificationForm.soldeReelSaisi,
          utilisateurId: this.currentUser!.id,
          observations: this.verificationForm.observations
        };
        this.caisseService.verifierCaisse(request).subscribe({
          next: (caisse) => {
            this.caisse = caisse;
            this.showVerificationModal = false;
            this.resetForms();
            this.loadAllData();
            this.isLoading = false;
            this.alertSuccess(caisse.ecart === 0 ?
              'Caisse vérifiée - Aucun écart' :
              `Caisse vérifiée - Écart: ${caisse.ecart > 0 ? '+' : ''}${this.formatPrice(caisse.ecart)}`);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message);
          }
        });
      }
    });
  }

  enregistrerEntree(): void {
    if (!this.validateEntreeForm()) return;
    
    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous enregistrer cette entrée ?<br><br>
             <strong>Montant :</strong> ${this.formatPrice(this.entreeForm.montant)}<br>
             <strong>Motif :</strong> ${this.entreeForm.motif}<br>
             <strong>Mode :</strong> ${this.getModePaiementLabel(this.entreeForm.modePaiement)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const request: CaisseRequest = {
          montant: this.entreeForm.montant,
          motif: this.entreeForm.motif,
          utilisateurId: this.currentUser?.id,
          modePaiement: this.entreeForm.modePaiement,
          referencePaiement: this.entreeForm.referencePaiement
        };
        this.caisseService.entreeCaisse(request).subscribe({
          next: (operation) => {
            this.showEntreeModal = false;
            this.resetForms();
            this.loadAllData();
            this.isLoading = false;
            this.alertSuccess(`Entrée de ${this.formatPrice(operation.montant)} enregistrée`);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message);
          }
        });
      }
    });
  }

  enregistrerSortie(): void {
    if (!this.validateSortieForm()) return;
    
    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous enregistrer cette sortie ?<br><br>
             <strong>Montant :</strong> ${this.formatPrice(this.sortieForm.montant)}<br>
             <strong>Motif :</strong> ${this.sortieForm.motif}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const request: CaisseRequest = {
          montant: this.sortieForm.montant,
          motif: this.sortieForm.motif,
          utilisateurId: this.currentUser?.id
        };
        this.caisseService.sortieCaisse(request).subscribe({
          next: (operation) => {
            this.showSortieModal = false;
            this.resetForms();
            this.loadAllData();
            this.isLoading = false;
            this.alertSuccess(`Sortie de ${this.formatPrice(operation.montant)} enregistrée`);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message);
          }
        });
      }
    });
  }

  openReglementCreditModal(credit: CreditInfo): void {
    if (credit.venteAnnulee) {
      this.errorMessage = 'Ce crédit a été annulé et ne peut plus être réglé';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (!credit.venteId || credit.venteId === 0) {
      this.errorMessage = 'ID de vente manquant pour ce crédit';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (credit.estReglee) {
      this.errorMessage = 'Ce crédit est déjà totalement réglé';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (credit.montantRestant <= 0) {
      this.errorMessage = 'Ce crédit n\'a plus de montant à régler';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.selectedCredit = credit;
    this.reglementForm = {
      montantRegle: credit.montantRestant,
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
    this.showReglementCreditModal = true;
  }

  enregistrerReglementCredit(): void {
    if (!this.selectedCredit) {
      this.errorMessage = 'Aucun crédit sélectionné';
      return;
    }

    if (this.selectedCredit.venteAnnulee) {
      this.errorMessage = 'Ce crédit a été annulé et ne peut plus être réglé';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (!this.selectedCredit.venteId || this.selectedCredit.venteId === 0) {
      this.errorMessage = 'ID de vente manquant pour ce crédit';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (this.reglementForm.montantRegle <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.reglementForm.montantRegle > this.selectedCredit.montantRestant) {
      this.errorMessage = `Le montant ne peut pas dépasser ${this.formatPrice(this.selectedCredit.montantRestant)}`;
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.reglementForm.modePaiement !== ModePaiementCaisse.ESPECES && !this.reglementForm.referencePaiement) {
      this.errorMessage = `Une référence est requise pour ${this.getModePaiementLabel(this.reglementForm.modePaiement)}`;
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!this.caisse?.estOuverte) {
      this.errorMessage = 'La caisse doit être ouverte pour effectuer un règlement';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'Utilisateur non identifié';
      return;
    }

    const nouveauRestant = this.selectedCredit.montantRestant - this.reglementForm.montantRegle;
    const nouveauVerse = this.selectedCredit.montantVerse + this.reglementForm.montantRegle;
    const nouvelleProgression = (nouveauVerse / this.selectedCredit.montantTotal) * 100;
    const estTotal = nouveauRestant <= 0;

    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous enregistrer ce règlement ?<br><br>
             <strong>Client :</strong> ${this.selectedCredit.clientNom}<br>
             <strong>Montant :</strong> ${this.formatPrice(this.reglementForm.montantRegle)}<br>
             <strong>Mode :</strong> ${this.getModePaiementLabel(this.reglementForm.modePaiement)}<br>
             <strong>Reste à payer :</strong> ${this.formatPrice(nouveauRestant)}<br>
             ${estTotal ? '<strong class="text-success">Ce règlement soldera complètement le crédit !</strong>' : ''}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const request: ReglementCreditRequest = {
          venteCreditId: this.selectedCredit!.venteId,
          montantRegle: this.reglementForm.montantRegle,
          utilisateurId: this.currentUser!.id,
          modePaiement: this.reglementForm.modePaiement,
          referencePaiement: this.reglementForm.referencePaiement || ''
        };

        this.caisseService.reglementCredit(request).subscribe({
          next: (operation) => {
            this.selectedCredit!.montantVerse = nouveauVerse;
            this.selectedCredit!.montantRestant = nouveauRestant;
            this.selectedCredit!.progression = nouvelleProgression;
            this.selectedCredit!.estReglee = nouveauRestant <= 0;
            
            const index = this.creditsEnCours.findIndex(c => c.venteId === this.selectedCredit!.venteId);
            let msg = '';
            if (index !== -1) {
              if (nouveauRestant <= 0) {
                this.creditsEnCours.splice(index, 1);
                msg = `Paiement total de ${this.formatPrice(this.reglementForm.montantRegle)} - Crédit soldé !`;
              } else {
                this.creditsEnCours[index] = { ...this.selectedCredit! };
                msg = `Paiement de ${this.formatPrice(this.reglementForm.montantRegle)} - Reste: ${this.formatPrice(nouveauRestant)} (${nouvelleProgression.toFixed(0)}% payé)`;
              }
            }

            this.loadCaisse();
            this.loadStatistiquesJour();

            this.showReglementCreditModal = false;
            this.selectedCredit = null;
            this.resetForms();
            this.isLoading = false;

            if (msg) this.alertSuccess(msg);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertError(error.message || 'Erreur lors du règlement du crédit');
          }
        });
      }
    });
  }

  getTotalReglements(reglements: OperationCaisse[]): number {
    if (!reglements || reglements.length === 0) return 0;
    return reglements.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  setPeriode(periode: 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise'): void {
    this.periodeActive = periode;
    switch (periode) {
      case 'jour':
        this.dateDebut = this.getAujourdhui();
        this.dateFin = this.getAujourdhui();
        break;
      case 'semaine':
        this.dateDebut = this.getDateDebutSemaine();
        this.dateFin = this.getDateFinSemaine();
        break;
      case 'mois':
        this.dateDebut = this.getDateDebutMois();
        this.dateFin = this.getDateFinMois();
        break;
      case 'annee':
        this.dateDebut = this.getDateDebutAnnee();
        this.dateFin = this.getDateFinAnnee();
        break;
    }
    this.currentPage = 1;
    this.loadOperations();
  }

  appliquerFiltres(): void {
    if (this.periodeActive === 'personnalise' && (!this.dateDebut || !this.dateFin)) {
      this.errorMessage = 'Sélectionnez une période valide';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.currentPage = 1;
    this.loadOperations();
  }

  resetFiltres(): void {
    this.setPeriode('jour');
    this.typeOperationFilter = '';
    this.searchTerm = '';
    this.heureDebut = '';
    this.heureFin = '';
    this.currentPage = 1;
  }

  applyFilters(): void {
    let filtered = [...this.operations];

    if (this.typeOperationFilter) {
      filtered = filtered.filter(op => op.type === this.typeOperationFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(op =>
        (op.motif?.toLowerCase().includes(term)) ||
        (op.clientNom?.toLowerCase().includes(term)) ||
        (op.numeroVente?.toLowerCase().includes(term)) ||
        (op.referencePaiement?.toLowerCase().includes(term)) ||
        (op.utilisateurNom?.toLowerCase().includes(term))
      );
    }
    if (this.heureDebut || this.heureFin) {
      filtered = filtered.filter(op => {
        const dt = new Date(op.dateOperation);
        const hh = dt.getHours().toString().padStart(2, '0');
        const mm = dt.getMinutes().toString().padStart(2, '0');
        const time = `${hh}:${mm}`;
        if (this.heureDebut && this.heureFin) return time >= this.heureDebut && time <= this.heureFin;
        if (this.heureDebut) return time >= this.heureDebut;
        return time <= this.heureFin;
      });
    }
    this.operationsFiltrees = filtered;
  }

  get paginatedOperations(): OperationCaisse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.operationsFiltrees.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.operationsFiltrees.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  private validateEntreeForm(): boolean {
    if (this.entreeForm.montant <= 0) {
      this.errorMessage = 'Montant > 0 requis';
      return false;
    }
    if (!this.entreeForm.motif?.trim()) {
      this.errorMessage = 'Motif requis';
      return false;
    }
    if (this.entreeForm.modePaiement !== ModePaiementCaisse.ESPECES && !this.entreeForm.referencePaiement) {
      this.errorMessage = `Référence requise pour ${this.getModePaiementLabel(this.entreeForm.modePaiement)}`;
      return false;
    }
    return true;
  }

  private validateSortieForm(): boolean {
    if (this.sortieForm.montant <= 0) {
      this.errorMessage = 'Montant > 0 requis';
      return false;
    }
    if (!this.sortieForm.motif?.trim()) {
      this.errorMessage = 'Motif requis';
      return false;
    }
    if (this.caisse && this.sortieForm.montant > this.caisse.soldeActuel) {
      this.errorMessage = `Solde insuffisant: ${this.formatPrice(this.caisse.soldeActuel)}`;
      return false;
    }
    return true;
  }

  openOuvertureModal(): void {
    this.showOuvertureModal = true;
  }

  openFermetureModal(): void {
    this.showFermetureModal = true;
  }

  openVerificationModal(): void {
    if (this.caisse) {
      this.verificationForm.soldeReelSaisi = this.caisse.soldeActuel;
    }
    this.showVerificationModal = true;
  }

  openEntreeModal(): void {
    this.entreeForm = {
      montant: 0,
      motif: '',
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
    this.showEntreeModal = true;
  }

  openSortieModal(): void {
    this.sortieForm = {
      montant: 0,
      motif: ''
    };
    this.showSortieModal = true;
  }

  openDetailsOperationModal(operation: OperationCaisse): void {
    this.selectedOperation = operation;
    this.showDetailsOperationModal = true;
  }

  openDetailsCreditModal(credit: CreditInfo): void {
    this.selectedCredit = credit;
    this.showDetailsCreditModal = true;
  }

  openStatistiquesModal(): void {
    this.loadStatistiquesPeriode();
  }

  openRapportPeriodeModal(): void {
    this.showRapportPeriodeModal = true;
  }

  openRevenusPertesModal(): void {
    this.loadRevenusPertesMois();
  }

  closeAllModals(): void {
    this.showOuvertureModal = false;
    this.showFermetureModal = false;
    this.showVerificationModal = false;
    this.showEntreeModal = false;
    this.showSortieModal = false;
    this.showReglementCreditModal = false;
    this.showDetailsOperationModal = false;
    this.showDetailsCreditModal = false;
    this.showStatistiquesModal = false;
    this.showHistoriqueReglementsModal = false;
    this.showRapportPeriodeModal = false;
    this.showRevenusPertesModal = false;
    this.showVentesComptantModal = false;
    this.showVentesCreditModal = false;
    this.showCreditsClientModal = false;
    this.showSessionDetailModal = false;
    this.showPaiementGroupeModal = false;
    this.showTransfertBanqueModal = false;
    this.selectedSession = null;
    this.selectedOperation = null;
    this.selectedCredit = null;
    this.selectedCreditReglements = [];
    this.repartitionGroupe = [];
    this.resetForms();
  }

  resetForms(): void {
    this.entreeForm = {
      montant: 0,
      motif: '',
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
    this.sortieForm = {
      montant: 0,
      motif: ''
    };
    this.verificationForm = {
      soldeReelSaisi: this.caisse?.soldeActuel || 0,
      observations: ''
    };
    this.reglementForm = {
      montantRegle: 0,
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
  }

  // ==================== TELECHARGEMENTS AVEC CONFIRMATION ====================

  telechargerRapportJournalier(): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous télécharger le rapport journalier ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, télécharger',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.telechargerRapportJournalier().subscribe({
          next: () => {
            this.successMessage = 'Rapport journalier téléchargé';
            this.isLoading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  telechargerRapportHebdomadaire(): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous télécharger le rapport hebdomadaire ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, télécharger',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.telechargerRapportHebdomadaire().subscribe({
          next: () => {
            this.successMessage = 'Rapport hebdomadaire téléchargé';
            this.isLoading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  telechargerRapportMensuel(): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous télécharger le rapport mensuel ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, télécharger',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.telechargerRapportMensuel().subscribe({
          next: () => {
            this.successMessage = 'Rapport mensuel téléchargé';
            this.isLoading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  telechargerRapportAnnuel(): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous télécharger le rapport annuel ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, télécharger',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.telechargerRapportAnnuel().subscribe({
          next: () => {
            this.successMessage = 'Rapport annuel téléchargé';
            this.isLoading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  telechargerRapportPersonnalise(): void {
    if (!this.dateDebut || !this.dateFin) {
      this.errorMessage = 'Sélectionnez une période';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous télécharger le rapport pour la période ?<br><br>
             <strong>Du :</strong> ${this.formatDateShort(this.dateDebut)}<br>
             <strong>Au :</strong> ${this.formatDateShort(this.dateFin)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, télécharger',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.caisseService.telechargerRapportPersonnalise(this.dateDebut, this.dateFin).subscribe({
          next: () => {
            this.successMessage = `Rapport du ${this.formatDateShort(this.dateDebut)} au ${this.formatDateShort(this.dateFin)} téléchargé`;
            this.showRapportPeriodeModal = false;
            this.isLoading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  // ==================== GETTERS ====================

  getDateDebutSemaine(): string {
    return this.caisseService.getDateDebutSemaine();
  }

  getDateFinSemaine(): string {
    return this.caisseService.getDateFinSemaine();
  }

  getDateDebutMois(): string {
    return this.caisseService.getDateDebutMois();
  }

  getDateFinMois(): string {
    return this.caisseService.getDateFinMois();
  }

  getDateDebutAnnee(): string {
    return this.caisseService.getDateDebutAnnee();
  }

  getDateFinAnnee(): string {
    return this.caisseService.getDateFinAnnee();
  }

  getAujourdhui(): string {
    return this.caisseService.getAujourdhui();
  }

  formatPrice(price: number): string {
    return this.caisseService.formatPrice(price);
  }

  formatDateShort(dateString: string): string {
    return this.caisseService.formatDateShort(dateString);
  }

  formatDateLong(dateString: string): string {
    return this.caisseService.formatDateLong(dateString);
  }

  formatTime(dateString: string): string {
    return this.caisseService.formatTime(dateString);
  }

  getTypeOperationLabel(type: TypeOperationCaisse): string {
    return this.caisseService.getTypeOperationLabel(type);
  }

  getTypeOperationClass(type: TypeOperationCaisse): string {
    return this.caisseService.getTypeOperationClass(type);
  }

  getModePaiementLabel(mode: string | ModePaiementCaisse): string {
    return this.caisseService.getModePaiementLabel(mode.toString());
  }

  getModePaiementClass(mode: string | ModePaiementCaisse): string {
    return this.caisseService.getModePaiementClass(mode.toString());
  }

  getCreditStatusClass(credit: CreditInfo): string {
    return this.caisseService.getCreditStatusClass(credit);
  }

  getCreditStatusText(credit: CreditInfo): string {
    return this.caisseService.getCreditStatusText(credit);
  }

  getEcartClass(ecart: number): string {
    return this.caisseService.getEcartClass(ecart);
  }

  getEcartSign(ecart: number): string {
    return this.caisseService.getEcartSign(ecart);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isVendeur(): boolean {
    return this.authService.isVendeur();
  }

  // ==================== GETTERS MODIFIÉS POUR LES SORTIES ====================
  // Les paiements fournisseurs et avances fournisseurs ne sont PAS inclus dans ces totaux

  get totalEntreesAujourdhui(): number {
    if (!this.statistiquesJour) return 0;
    return this.statistiquesJour.totalEntrees || 0;
  }

  get totalSortiesAujourdhui(): number {
    if (!this.statistiquesJour) return 0;
    // Le backend exclut déjà PAIEMENT_FOURNISSEUR et AVANCE_FOURNISSEUR du calcul
    return this.statistiquesJour.totalSorties || 0;
  }

  get soldeActuel(): number {
    return this.caisse?.soldeActuel || 0;
  }

  get soldeSysteme(): number {
    return this.caisse?.soldeSysteme || 0;
  }

  get ecart(): number {
    return this.caisse?.ecart || 0;
  }

  get estOuverte(): boolean {
    return this.caisse?.estOuverte || false;
  }

  get estVerifiee(): boolean {
    return this.caisse?.verifiee || false;
  }

  get nombreCreditsEnCours(): number {
    return this.creditsEnCours.length;
  }

  get montantTotalCredits(): number {
    return this.creditsEnCours.reduce((sum, c) => sum + c.montantRestant, 0);
  }

  get montantTotalCreditsOrigine(): number {
    return this.creditsEnCours.reduce((sum, c) => sum + c.montantTotal, 0);
  }

  get tauxRecouvrement(): number {
    const total = this.montantTotalCreditsOrigine;
    if (total === 0) return 0;
    const verse = this.creditsEnCours.reduce((sum, c) => sum + c.montantVerse, 0);
    return (verse / total) * 100;
  }

  get revenusJour(): number {
    return this.statistiquesJour?.totalVentesComptant || 0;
  }

  get revenusSemaine(): number {
    let total = 0;
    if (this.statistiquesPeriode && this.periodeActive === 'semaine') {
      total = this.statistiquesPeriode.totalVentesComptant;
    }
    return total;
  }

  get revenusMois(): number {
    let total = 0;
    if (this.statistiquesPeriode && this.periodeActive === 'mois') {
      total = this.statistiquesPeriode.totalVentesComptant;
    }
    return total;
  }

  refreshCredits(): void {
    console.log('🔄 Rafraîchissement des crédits après annulation...');
    
    this.caisseService.getCreditsNonRegles().subscribe({
      next: (credits) => {
        this.creditsEnCours = credits.filter(credit => !credit.venteAnnulee);
        console.log(`📊 ${this.creditsEnCours.length} crédits en cours après rafraîchissement`);
      },
      error: (error) => {
        console.error('Erreur rafraîchissement crédits:', error);
      }
    });
    
    this.caisseService.getCreditsEnRetard().subscribe({
      next: (credits) => {
        this.creditsEnRetard = credits.filter(credit => !credit.venteAnnulee);
      },
      error: (error) => {
        console.error('Erreur rafraîchissement crédits retard:', error);
      }
    });
    
    this.caisseService.getSituationCredits().subscribe({
      next: (situation) => {
        this.situationCredits = situation;
      },
      error: (error) => {
        console.error('Erreur rafraîchissement situation crédits:', error);
      }
    });
  }

  // ==================== CREDITS PAR CLIENT ====================

  get paginatedCredits(): any[] {
    const start = (this.creditsCurrentPage - 1) * this.creditsItemsPerPage;
    return this.creditsEnCours.slice(start, start + this.creditsItemsPerPage);
  }

  get creditsTotalPages(): number {
    return Math.ceil(this.creditsEnCours.length / this.creditsItemsPerPage);
  }

  get creditsPageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.creditsCurrentPage - Math.floor(max / 2));
    let end = Math.min(this.creditsTotalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  changeCreditsPage(page: number): void {
    if (page >= 1 && page <= this.creditsTotalPages) {
      this.creditsCurrentPage = page;
    }
  }

  get creditsGroupesParClient(): { nom: string; count: number; total: number }[] {
    const map = new Map<string, { count: number; total: number }>();
    this.creditsEnCours.forEach(c => {
      const nom = (c.clientNom || '').trim();
      const entry = map.get(nom) || { count: 0, total: 0 };
      entry.count++;
      entry.total += c.montantRestant || 0;
      map.set(nom, entry);
    });
    return Array.from(map.entries())
      .map(([nom, v]) => ({ nom, count: v.count, total: v.total }))
      .sort((a, b) => b.total - a.total);
  }

  openCreditsClientModal(clientNom: string): void {
    this.selectedClientCreditsNom = clientNom;
    this.selectedClientCreditsList = this.creditsEnCours.filter(c =>
      (c.clientNom || '').trim() === clientNom
    );
    this.showCreditsClientModal = true;
  }

  closeCreditsClientModal(): void {
    this.showCreditsClientModal = false;
    this.selectedClientCreditsNom = '';
    this.selectedClientCreditsList = [];
  }

  totalSelectedClientCredits(field: 'montantTotal' | 'montantVerse' | 'montantRestant'): number {
    return this.selectedClientCreditsList.reduce((sum, c) => sum + (c[field] || 0), 0);
  }

  // ==================== PROFIT / PERTE ====================

  get profitNetJour(): number {
    return this.statistiquesJour?.soldeNetPeriode ?? 0;
  }

  get isPerte(): boolean {
    return this.profitNetJour < 0;
  }

  get labelBilanceJour(): string {
    return this.isPerte ? 'Perte nette' : 'Bénéfice net';
  }

  // ==================== PAIEMENT GROUPE ====================

  openPaiementGroupeModal(): void {
    if (this.selectedClientCreditsList.length === 0) return;
    this.montantPaiementGroupe = 0;
    this.modePaiementGroupe = ModePaiementCaisse.ESPECES;
    this.referenceGroupePaiement = '';
    this.repartitionGroupe = [];
    this.showPaiementGroupeModal = true;
  }

  calculerRepartitionGroupe(): void {
    const credits = this.selectedClientCreditsList.filter(c => !c.estReglee && c.montantRestant > 0);
    const totalRestant = credits.reduce((s, c) => s + c.montantRestant, 0);
    const montant = this.montantPaiementGroupe;
    if (montant <= 0 || credits.length === 0) {
      this.repartitionGroupe = [];
      return;
    }
    let reste = montant;
    this.repartitionGroupe = credits.map((credit, index) => {
      const isLast = index === credits.length - 1;
      let part = isLast ? reste : Math.min(Math.round((credit.montantRestant / totalRestant) * montant), credit.montantRestant);
      part = Math.min(part, credit.montantRestant);
      reste -= part;
      return { credit, montantAPayer: part };
    });
  }

  confirmerPaiementGroupe(): void {
    if (!this.caisse?.estOuverte) {
      this.alertError('La caisse doit être ouverte');
      return;
    }
    if (!this.currentUser) {
      this.alertError('Utilisateur non identifié');
      return;
    }
    if (this.montantPaiementGroupe <= 0) {
      this.alertError('Saisissez un montant valide');
      return;
    }
    if (this.modePaiementGroupe !== ModePaiementCaisse.ESPECES && !this.referenceGroupePaiement) {
      this.alertError('Référence requise pour ce mode de paiement');
      return;
    }
    const valides = this.repartitionGroupe.filter(r => r.montantAPayer > 0);
    if (valides.length === 0) {
      this.alertError('Aucun crédit à régler');
      return;
    }

    const totalAPayer = valides.reduce((s, r) => s + r.montantAPayer, 0);

    Swal.fire({
      title: 'Confirmation paiement groupé',
      html: `Voulez-vous effectuer ce paiement groupé ?<br><br>
             <strong>Client :</strong> ${this.selectedClientCreditsNom}<br>
             <strong>Montant total :</strong> ${this.formatPrice(totalAPayer)}<br>
             <strong>Mode :</strong> ${this.getModePaiementLabel(this.modePaiementGroupe)}<br>
             <strong>Crédits concernés :</strong> ${valides.length}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoadingPaiementGroupe = true;
        from(valides).pipe(
          concatMap(r => this.caisseService.reglementCredit({
            venteCreditId: r.credit.venteId,
            montantRegle: r.montantAPayer,
            utilisateurId: this.currentUser!.id,
            modePaiement: this.modePaiementGroupe,
            referencePaiement: this.referenceGroupePaiement || ''
          })),
          toArray()
        ).subscribe({
          next: () => {
            this.isLoadingPaiementGroupe = false;
            this.showPaiementGroupeModal = false;
            this.repartitionGroupe = [];
            this.loadCredits();
            this.loadCaisse();
            this.loadStatistiquesJour();
            this.openCreditsClientModal(this.selectedClientCreditsNom);
            this.alertSuccess(`Paiement groupé de ${this.formatPrice(this.montantPaiementGroupe)} réparti sur ${valides.length} crédit(s)`);
          },
          error: (error) => {
            this.isLoadingPaiementGroupe = false;
            this.alertError(error.message || 'Erreur lors du paiement groupé');
          }
        });
      }
    });
  }

  // ==================== CAISSES CLOTUREES ====================

  loadCaissesSessions(): void {
    try {
      const raw = localStorage.getItem('boutique_caisse_sessions');
      this.caissesSessions = raw ? JSON.parse(raw) : [];
    } catch {
      this.caissesSessions = [];
    }
  }

  saveCaisseSession(session: CaisseSession): void {
    try {
      const raw = localStorage.getItem('boutique_caisse_sessions');
      const sessions: CaisseSession[] = raw ? JSON.parse(raw) : [];
      sessions.unshift(session);
      localStorage.setItem('boutique_caisse_sessions', JSON.stringify(sessions));
    } catch {
      console.error('Erreur sauvegarde session caisse');
    }
  }

  openSessionDetail(session: CaisseSession): void {
    this.selectedSession = session;
    this.showSessionDetailModal = true;
  }

  closeSessionDetailModal(): void {
    this.showSessionDetailModal = false;
    this.selectedSession = null;
  }

  exportSessionPDF(session: CaisseSession): void {
    const bilan = session.totalEntrees - session.totalSorties;
    const bilanLabel = bilan >= 0 ? 'BÉNÉFICE' : 'PERTE';
    const bilanColor = bilan >= 0 ? '#28a745' : '#dc3545';
    const dateImpression = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const lignesOps = session.operations.map((op, idx) => {
      const annulee = op.venteAnnulee;
      const style = annulee ? 'text-decoration:line-through; opacity:0.6;' : '';
      const statut = annulee
        ? '<span style="color:#dc3545;font-weight:bold;">ANNULÉE</span>'
        : '<span style="color:#28a745;">✓</span>';
      return `
        <tr style="${style}">
          <td style="text-align:center;">${idx + 1}</td>
          <td>${this.formatTime(op.dateOperation)}</td>
          <td><span style="background:${this.getTypeColor(op.type)};color:#fff;padding:2px 7px;border-radius:10px;font-size:11px;">${this.getTypeOperationLabel(op.type)}</span></td>
          <td>${op.clientNom || op.motif || op.numeroVente || '—'}</td>
          <td style="text-align:right;font-weight:bold;">${this.formatPrice(op.montant)}</td>
          <td>${this.getModePaiementLabel(op.modePaiement || '')}</td>
          <td style="text-align:center;">${statut}</td>
        </tr>`;
    }).join('');

    const contenu = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Rapport Caisse — ${this.formatDateLong(session.dateOuverture)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 24px; }
    .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { color: #1a56db; font-size: 20px; margin-bottom: 4px; }
    .header p { color: #666; font-size: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
    .info-box { border: 1px solid #dee2e6; border-radius: 6px; padding: 10px 14px; }
    .info-box .label { font-size: 11px; color: #888; text-transform: uppercase; }
    .info-box .value { font-size: 15px; font-weight: bold; margin-top: 2px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
    .stat-card { border-radius: 8px; padding: 10px; text-align: center; }
    .stat-card .slabel { font-size: 11px; opacity: 0.85; }
    .stat-card .svalue { font-size: 16px; font-weight: bold; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    thead th { background: #1a56db; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 24px; border-top: 1px solid #eee; padding-top: 10px; }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Rapport de Caisse Clôturée</h1>
    <p>Imprimé le ${dateImpression} — Boutique Maiga</p>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="label">📅 Date d'ouverture</div>
      <div class="value">${this.formatDateLong(session.dateOuverture)}</div>
    </div>
    <div class="info-box">
      <div class="label">🔒 Date de fermeture</div>
      <div class="value">${this.formatDateLong(session.dateFermeture)}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="background:#e8f4fd; color:#1a56db;">
      <div class="slabel">Solde initial</div>
      <div class="svalue">${this.formatPrice(session.soldeInitial)}</div>
    </div>
    <div class="stat-card" style="background:#e8f4fd; color:#1a56db;">
      <div class="slabel">Solde final</div>
      <div class="svalue">${this.formatPrice(session.soldeFinal)}</div>
    </div>
    <div class="stat-card" style="background:#d4edda; color:#155724;">
      <div class="slabel">Total Entrées</div>
      <div class="svalue">+${this.formatPrice(session.totalEntrees)}</div>
    </div>
    <div class="stat-card" style="background:#f8d7da; color:#721c24;">
      <div class="slabel">Total Sorties</div>
      <div class="svalue">-${this.formatPrice(session.totalSorties)}</div>
    </div>
  </div>

  <div style="text-align:center; padding:14px; border-radius:8px; margin-bottom:20px;
              background:${bilan >= 0 ? '#d4edda' : '#f8d7da'}; color:${bilanColor}; border:2px solid ${bilanColor};">
    <span style="font-size:18px; font-weight:bold;">
      ${bilanLabel} : ${bilan >= 0 ? '+' : ''}${this.formatPrice(bilan)}
    </span>
    &nbsp;|&nbsp; <span style="font-size:13px;">${session.nombreOperations} opération(s)</span>
  </div>

  <h3 style="margin-bottom:8px; color:#1a56db; font-size:14px;">
    📊 Détail des opérations (${session.operations.length})
  </h3>
  <table>
    <thead>
      <tr>
        <th style="width:35px;">#</th>
        <th>Date / Heure</th>
        <th>Type</th>
        <th>Client / Motif</th>
        <th style="text-align:right;">Montant</th>
        <th>Mode</th>
        <th style="text-align:center;">Statut</th>
      </tr>
    </thead>
    <tbody>
      ${lignesOps || '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:20px;">Aucune opération</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Rapport généré automatiquement — Boutique Maiga — ${dateImpression}
  </div>

  <script>window.onload = function() { window.print(); window.addEventListener('afterprint', function(){ window.close(); }); }<\/script>
  <div style="text-align:center;padding:16px">
    <button onclick="window.close()" style="padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">✕ Fermer</button>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      win.focus();
      win.addEventListener('afterprint', () => win.close());
    }
  }

  private getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'VENTE_COMPTANT': '#28a745',
    'VENTE_CREDIT': '#17a2b8',
    'REGLEMENT_CREDIT': '#20c997',
    'ENTREE': '#007bff',
    'SORTIE': '#dc3545',
    'PAIEMENT_FOURNISSEUR': '#fd7e14',
    'AVANCE_FOURNISSEUR': '#e83e8c',
    'PAIEMENT_EMPLOYE': '#6f42c1',
    'ANNULATION_VENTE': '#6c757d',
    'ANNULATION_CREDIT': '#6c757d',
    'REMBOURSEMENT_RETOUR': '#dc3545'   // ← AJOUTER CETTE LIGNE (même couleur que SORTIE)
  };
  return colors[type] || '#6c757d';
}
  getSessionBilan(session: CaisseSession): number {
    return session.totalEntrees - session.totalSorties;
  }

  getTotalEntreesSessions(): number {
    return this.caissesSessions.reduce((sum, s) => sum + s.totalEntrees, 0);
  }

  getTotalSortiesSessions(): number {
    return this.caissesSessions.reduce((sum, s) => sum + s.totalSorties, 0);
  }

  getTotalBilanSessions(): number {
    return this.getTotalEntreesSessions() - this.getTotalSortiesSessions();
  }

  // ==================== TRANSFERT VERS BANQUE ====================

  loadComptesActifs(): void {
    this.compteService.getTousLesComptes().subscribe({
      next: (comptes) => {
        this.comptesDisponibles = comptes.filter(c => c.actif !== false);
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
      }
    });
  }

  openTransfertBanqueModal(): void {
    if (!this.caisse?.estOuverte) {
      this.alertError('La caisse doit être ouverte pour effectuer un transfert');
      return;
    }
    
    if (this.caisse.soldeActuel <= 0) {
      this.alertError('La caisse est vide. Aucun fonds disponible pour le transfert.');
      return;
    }
    
    this.loadComptesActifs();
    this.transfertForm = {
      compteId: null,
      montant: 0,
      motif: '',
      reference: ''
    };
    this.showTransfertBanqueModal = true;
  }

  validerTransfertVersBanque(): void {
    if (!this.transfertForm.compteId) {
      this.errorMessage = 'Veuillez sélectionner un compte bancaire';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    if (!this.transfertForm.montant || this.transfertForm.montant <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    if (!this.transfertForm.motif?.trim()) {
      this.errorMessage = 'Veuillez saisir un motif';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    if (this.caisse && this.transfertForm.montant > this.caisse.soldeActuel) {
      Swal.fire({
        icon: 'error',
        title: 'Solde caisse insuffisant !',
        html: `<strong>Vérifiez bien la caisse</strong><br><br>
               📊 Solde actuel : <strong>${this.formatPrice(this.caisse.soldeActuel)}</strong><br>
               💸 Montant demandé : <strong>${this.formatPrice(this.transfertForm.montant)}</strong><br><br>
               <span class="text-danger">Le solde de la caisse est insuffisant pour effectuer ce virement.</span><br>
               Veuillez vérifier les entrées/sorties de caisse avant de réessayer.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
      return;
    }
    
    const compteSelectionne = this.comptesDisponibles.find(c => c.id === this.transfertForm.compteId);
    const nouveauSoldeCaisse = (this.caisse?.soldeActuel || 0) - this.transfertForm.montant;
    
    Swal.fire({
      title: 'Confirmation de transfert',
      html: `<div style="text-align: left;">
               <p>Voulez-vous transférer <strong>${this.formatPrice(this.transfertForm.montant)}</strong> de la caisse vers le compte bancaire ?</p>
               <hr>
               <p><strong>🏦 Compte destination :</strong> ${compteSelectionne?.nomBanque || 'N/A'}</p>
               <p><strong>💰 Montant :</strong> ${this.formatPrice(this.transfertForm.montant)}</p>
               <p><strong>📝 Motif :</strong> ${this.transfertForm.motif}</p>
               <hr>
               <p><strong>💰 Solde caisse après transfert :</strong> ${this.formatPrice(nouveauSoldeCaisse)}</p>
               <p class="text-warning">⚠️ Cette opération est irréversible !</p>
             </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, transférer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoadingTransfert = true;
        
        const request: TransfertCaisseBanqueRequest = {
          compteId: this.transfertForm.compteId!,
          montant: this.transfertForm.montant,
          motif: this.transfertForm.motif,
          utilisateurId: this.currentUser?.id,
          reference: this.transfertForm.reference || `TRF-${new Date().getTime()}`
        };
        
        this.caisseService.transfererVersBanque(request).subscribe({
          next: (resultat) => {
            this.showTransfertBanqueModal = false;
            this.resetTransfertForm();
            this.loadAllData();
            
            Swal.fire({
              icon: 'success',
              title: 'Transfert réussi !',
              html: `<strong>${this.formatPrice(this.transfertForm.montant)}</strong> ont été transférés vers ${compteSelectionne?.nomBanque}<br><br>
                     📊 Nouveau solde caisse : <strong>${this.formatPrice(resultat.caisse?.soldeApres || nouveauSoldeCaisse)}</strong>`,
              timer: 3000,
              showConfirmButton: true
            });
            
            this.isLoadingTransfert = false;
          },
          error: (error) => {
            this.isLoadingTransfert = false;
            
            if (error.message?.toLowerCase().includes('solde') || 
                error.message?.toLowerCase().includes('insuffisant')) {
              Swal.fire({
                icon: 'error',
                title: 'Solde caisse insuffisant !',
                html: `<strong>Vérifiez bien la caisse</strong><br><br>
                       Le solde actuel de la caisse ne permet pas d'effectuer ce virement.<br><br>
                       <strong>Raisons possibles :</strong><br>
                       • Des sorties de caisse non enregistrées<br>
                       • Des erreurs dans les opérations précédentes<br>
                       • Un crédit client non réglé<br><br>
                       Veuillez vérifier l'état de la caisse avant de réessayer.`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
              });
            } else {
              this.alertError(error.message || 'Erreur lors du transfert');
            }
          }
        });
      }
    });
  }

  resetTransfertForm(): void {
    this.transfertForm = {
      compteId: null,
      montant: 0,
      motif: '',
      reference: ''
    };
  }

  private alertError(message: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: message, confirmButtonColor: '#d33' });
  }

  private alertSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Succès', text: message, timer: 2500, timerProgressBar: true, confirmButtonColor: '#198754' });
  }
}