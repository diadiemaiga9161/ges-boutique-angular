// src/app/shared/services/caisse.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BoutiqueService } from './boutique.service';
import { environment } from '../../../environments/environment';

// src/app/shared/services/caisse.service.ts

// 1. AJOUTER LE TYPE MANQUANT DANS L'ENUM
export enum TypeOperationCaisse {
  OUVERTURE = 'OUVERTURE',
  FERMETURE = 'FERMETURE',
  VENTE_COMPTANT = 'VENTE_COMPTANT',
  VENTE_CREDIT = 'VENTE_CREDIT',
  REGLEMENT_CREDIT = 'REGLEMENT_CREDIT',
  SORTIE = 'SORTIE',
  ENTREE = 'ENTREE',
  AJUSTEMENT = 'AJUSTEMENT',
  VERIFICATION = 'VERIFICATION',
  DEPOT = 'DEPOT',
  RETRAIT = 'RETRAIT',
  ANNULATION_VENTE = 'ANNULATION_VENTE',
  ANNULATION_CREDIT = 'ANNULATION_CREDIT',
  PAIEMENT_FOURNISSEUR = 'PAIEMENT_FOURNISSEUR',
  AVANCE_FOURNISSEUR = 'AVANCE_FOURNISSEUR',
  PAIEMENT_EMPLOYE = 'PAIEMENT_EMPLOYE',
  ANNULATION_PAIEMENT_EMPLOYE = 'ANNULATION_PAIEMENT_EMPLOYE',
  VIREMENT_BANQUE = 'VIREMENT_BANQUE',
  REMBOURSEMENT_RETOUR = 'REMBOURSEMENT_RETOUR'   // ← AJOUTER CETTE LIGNE
}

export enum ModePaiementCaisse {
  ESPECES = 'ESPECES',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
  WAVE_MONEY = 'WAVE_MONEY',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  VIREMENT = 'VIREMENT',
  CHEQUE = 'CHEQUE',
  CREDIT_CLIENT = 'CREDIT_CLIENT'
}

export interface Caisse {
  id: number;
  numeroCaisse: string;
  soldeActuel: number;
  soldeInitial: number;
  soldeSysteme: number;
  soldeReel: number;
  ecart: number;
  totalEntrees: number;
  totalSorties: number;
  derniereOperation: string;
  dateOuverture: string;
  dateFermeture?: string;
  estOuverte: boolean;
  verifiee: boolean;
  dateVerification?: string;
  utilisateurVerification?: string;
  nombreOperations: number;
}

export interface OperationCaisse {
  id: number;
  type: TypeOperationCaisse;
  montant: number;
  soldeAvant: number;
  soldeApres: number;
  motif: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  venteId?: number;
  numeroVente?: string;
  modePaiement?: ModePaiementCaisse;
  referencePaiement?: string;
  clientNom?: string;
  clientTelephone?: string;
  dateOperation: string;
  estReglee: boolean;
  dateEcheance?: string;
  montantVerse?: number;
  montantRestant?: number;
  venteCreditId?: number;
  numeroCredit?: string;
  venteAnnulee?: boolean;
}

export interface CreditInfo {
  id: number;
  clientNom: string;
  clientTelephone: string;
  montantTotal: number;
  montantVerse: number;
  montantRestant: number;
  dateOperation: string;
  dateEcheance: string;
  venteId: number;
  numeroVente: string;
  estReglee: boolean;
  enRetard: boolean;
  joursRetard: number;
  progression: number;
  venteAnnulee?: boolean;
}

export interface SituationCredits {
  nombreCreditsNonRegles: number;
  montantTotalCredits: number;
  montantRestantTotal: number;
  nombreCreditsEnRetard: number;
  montantTotalRetard: number;
}

export interface StatistiquesCaisse {
  periode: {
    debut: string;
    fin: string;
    nbJours: number;
  };
  totalVentesComptant: number;
  totalNouveauxCredits: number;
  totalReglementsCredit: number;
  totalAutresEntrees: number;
  totalSorties: number;
  totalEntrees: number;
  soldeNetPeriode: number;
  nombreOperations: number;
  moyenneJournaliere: number;
  chiffreParJour: { [key: string]: number };
  operationsParJour: { [key: string]: number };
  detailsParModePaiement: { [key: string]: number };
}

export interface RevenusPertes {
  periode: {
    dateDebut: string;
    dateFin: string;
  };
  totalRevenus: number;
  totalPertes: number;
  soldeNet: number;
  detailsRevenus: {
    ventesComptant: number;
    reglementsCredit: number;
    autresEntrees: number;
  };
  detailsPertes: {
    sorties: number;
    annulations: number;
  };
}

export interface CaisseRequest {
  montant: number;
  motif: string;
  utilisateurId?: number;
  modePaiement?: string;
  referencePaiement?: string;
}

export interface ReglementCreditRequest {
  venteCreditId: number;
  montantRegle: number;
  utilisateurId?: number;
  modePaiement: string;
  referencePaiement?: string;
}

export interface VerificationCaisseRequest {
  soldeReelSaisi: number;
  utilisateurId?: number;
  observations?: string;
}

export interface Facture {
  id?: number;
  numeroFacture?: string;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  notes?: string;
  montantTotal: number;
  montantRemiseTotal?: number;
  statut: string;
  dateCreation?: string;
  dateModification?: string;
  lignes?: LigneFacture[];
}

export interface LigneFacture {
  id?: number;
  produitId?: number;
  produitNom?: string;
  designation?: string;
  quantite: number;
  prixUnitaire: number;
  prixAchat?: number;
  remisePourcentage?: number;
  remiseMontant?: number;
  prixApresRemise?: number;
  sousTotal?: number;
}

export interface FactureRequest {
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  notes?: string;
  lignes: LigneFactureRequest[];
}

export interface LigneFactureRequest {
  produitId?: number;
  designation?: string;
  quantite: number;
  prixUnitaire: number;
  remisePourcentage?: number;
  remiseMontant?: number;
}

export interface VentesComptantDuJour {
  date: string;
  nombreVentes: number;
  totalVentesComptant: number;
}

export interface VentesCreditDuJour {
  date: string;
  nombreVentes: number;
  totalVentesCredit: number;
}

export interface TransfertCaisseBanqueRequest {
  compteId: number;
  montant: number;
  motif: string;
  utilisateurId?: number;
  reference?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaisseService {
  private apiUrl = `${environment.apiUrl}/caisse`;

  private readonly BOUTIQUE_NOM = 'Boutique Alimentation Ndjim Et Frères';
  private readonly BOUTIQUE_TELEPHONE = '76 96 21 20/66 43 66 03';
  private readonly BOUTIQUE_EMAIL = 'ndjim@yahoo.fr';
  private readonly BOUTIQUE_ADRESSE = 'Misa bougou';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private boutiqueService: BoutiqueService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let errorMessage = `Impossible de ${context}`;
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || error.error?.message || 'Données invalides';
    } else if (error.status === 401) {
      errorMessage = 'Session expirée';
      setTimeout(() => this.authService.signout(), 2000);
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
    } else if (error.status === 409) {
      errorMessage = error.error?.message || 'Conflit de données';
    } else if (error.status === 500) {
      errorMessage = error.error?.error || error.error?.message || 'Erreur serveur interne';
    }
    return throwError(() => new Error(errorMessage));
  }

  private extractData<T>(response: any, property?: string): T {
    if (!response) return {} as T;
    if (response.success === false) {
      throw new Error(response.message || 'Erreur inconnue');
    }
    if (property && response[property] !== undefined) {
      return response[property] as T;
    }
    return response as T;
  }

  // ==================== GESTION DE LA CAISSE ====================

  ouvrirCaisse(): Observable<Caisse> {
    return this.http.post<any>(`${this.apiUrl}/ouvrir`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Caisse>(response, 'caisse')),
      catchError(error => this.handleError(error, 'ouvrir la caisse'))
    );
  }

  fermerCaisse(utilisateurId?: number): Observable<Caisse> {
    let params = new HttpParams();
    if (utilisateurId) {
      params = params.set('utilisateurId', utilisateurId.toString());
    }
    return this.http.post<any>(`${this.apiUrl}/fermer`, {}, {
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(
      map(response => this.extractData<Caisse>(response, 'caisse')),
      catchError(error => this.handleError(error, 'fermer la caisse'))
    );
  }

  verifierCaisse(request: VerificationCaisseRequest): Observable<Caisse> {
    if (!request.utilisateurId) {
      const user = this.authService.getUser();
      if (user) {
        request.utilisateurId = user.id;
      }
    }
    return this.http.post<any>(`${this.apiUrl}/verifier`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Caisse>(response, 'caisse')),
      catchError(error => this.handleError(error, 'vérifier la caisse'))
    );
  }

  getEtatCaisse(): Observable<Caisse> {
    return this.http.get<any>(`${this.apiUrl}/etat`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Caisse>(response, 'caisse')),
      catchError(error => this.handleError(error, 'récupérer l\'état de la caisse'))
    );
  }

  getSolde(): Observable<{ solde: number; soldeSysteme: number }> {
    return this.http.get<any>(`${this.apiUrl}/solde`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        solde: response.solde || 0,
        soldeSysteme: response.soldeSysteme || 0
      })),
      catchError(error => this.handleError(error, 'récupérer le solde'))
    );
  }

  getEcart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ecart`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.ecart || response),
      catchError(error => this.handleError(error, 'récupérer l\'écart de caisse'))
    );
  }

  entreeCaisse(request: CaisseRequest): Observable<OperationCaisse> {
    if (!request.utilisateurId) {
      const user = this.authService.getUser();
      if (user) {
        request.utilisateurId = user.id;
      }
    }
    return this.http.post<any>(`${this.apiUrl}/entree`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<OperationCaisse>(response, 'operation')),
      catchError(error => this.handleError(error, 'enregistrer l\'entrée en caisse'))
    );
  }

  sortieCaisse(request: CaisseRequest): Observable<OperationCaisse> {
    if (!request.utilisateurId) {
      const user = this.authService.getUser();
      if (user) {
        request.utilisateurId = user.id;
      }
    }
    return this.http.post<any>(`${this.apiUrl}/sortie`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<OperationCaisse>(response, 'operation')),
      catchError(error => this.handleError(error, 'enregistrer la sortie de caisse'))
    );
  }

  // ==================== GESTION DES CREDITS ====================

  getCreditsNonRegles(): Observable<CreditInfo[]> {
    return this.http.get<any>(`${this.apiUrl}/credits`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const credits = response.credits || [];
        const creditsFiltres = credits.filter((credit: any) => !credit.venteAnnulee && !credit.annulee);
        return creditsFiltres.map((credit: any) => this.enrichirCredit(credit));
      }),
      catchError(error => this.handleError(error, 'récupérer les crédits non réglés'))
    );
  }

  getCreditsEnRetard(): Observable<CreditInfo[]> {
    return this.http.get<any>(`${this.apiUrl}/credits/retard`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const credits = response.creditsEnRetard || [];
        const creditsFiltres = credits.filter((credit: any) => !credit.venteAnnulee && !credit.annulee);
        return creditsFiltres.map((credit: any) => this.enrichirCredit(credit));
      }),
      catchError(error => this.handleError(error, 'récupérer les crédits en retard'))
    );
  }

  getSituationCredits(): Observable<SituationCredits> {
    return this.http.get<any>(`${this.apiUrl}/credits/situation`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.situation || response),
      catchError(error => this.handleError(error, 'récupérer la situation des crédits'))
    );
  }

  reglementCredit(request: ReglementCreditRequest): Observable<OperationCaisse> {
    if (!request.venteCreditId) {
      return throwError(() => new Error('ID de vente crédit requis'));
    }
    if (!request.montantRegle || request.montantRegle <= 0) {
      return throwError(() => new Error('Le montant doit être supérieur à 0'));
    }
    if (!request.modePaiement) {
      return throwError(() => new Error('Mode de paiement requis'));
    }
    if (request.modePaiement !== 'ESPECES' && !request.referencePaiement) {
      return throwError(() => new Error(`La référence est requise pour ${this.getModePaiementLabel(request.modePaiement)}`));
    }

    if (!request.utilisateurId) {
      const user = this.authService.getUser();
      if (user) {
        request.utilisateurId = user.id;
      }
    }
    return this.http.post<any>(`${this.apiUrl}/credits/reglement`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<OperationCaisse>(response, 'reglement')),
      catchError(error => this.handleError(error, 'enregistrer le règlement de crédit'))
    );
  }

  getHistoriqueReglementsCredit(venteCreditId: number): Observable<OperationCaisse[]> {
    return this.http.get<any>(`${this.apiUrl}/credits/${venteCreditId}/reglements`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.reglements || []),
      catchError(error => this.handleError(error, 'récupérer l\'historique des règlements'))
    );
  }

  // ==================== OPÉRATIONS PAR PÉRIODE ====================

  getOperationsDuJour(): Observable<OperationCaisse[]> {
    return this.http.get<any>(`${this.apiUrl}/operations/aujourdhui`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const operations = response.operations || [];
        return operations.filter((op: OperationCaisse) => !op.venteAnnulee);
      }),
      catchError(error => this.handleError(error, 'récupérer les opérations du jour'))
    );
  }

  getOperationsDeLaSemaine(): Observable<OperationCaisse[]> {
    return this.http.get<any>(`${this.apiUrl}/operations/semaine`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const operations = response.operations || [];
        return operations.filter((op: OperationCaisse) => !op.venteAnnulee);
      }),
      catchError(error => this.handleError(error, 'récupérer les opérations de la semaine'))
    );
  }

  getOperationsDuMois(): Observable<OperationCaisse[]> {
    return this.http.get<any>(`${this.apiUrl}/operations/mois`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const operations = response.operations || [];
        return operations.filter((op: OperationCaisse) => !op.venteAnnulee);
      }),
      catchError(error => this.handleError(error, 'récupérer les opérations du mois'))
    );
  }

  getOperationsDeLAnnee(): Observable<OperationCaisse[]> {
    return this.http.get<any>(`${this.apiUrl}/operations/annee`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const operations = response.operations || [];
        return operations.filter((op: OperationCaisse) => !op.venteAnnulee);
      }),
      catchError(error => this.handleError(error, 'récupérer les opérations de l\'année'))
    );
  }

  getOperationsParPeriode(dateDebut: string, dateFin: string): Observable<OperationCaisse[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<any>(`${this.apiUrl}/operations/periode`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        const operations = response.operations || [];
        return operations.filter((op: OperationCaisse) => !op.venteAnnulee);
      }),
      catchError(error => this.handleError(error, 'récupérer les opérations par période'))
    );
  }

  // ==================== STATISTIQUES ====================

  getStatistiquesDuJour(): Observable<StatistiquesCaisse> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/aujourdhui`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques du jour'))
    );
  }

  getStatistiquesDeLaSemaine(): Observable<StatistiquesCaisse> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/semaine`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques de la semaine'))
    );
  }

  getStatistiquesDuMois(): Observable<StatistiquesCaisse> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/mois`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques du mois'))
    );
  }

  getStatistiquesDeLAnnee(): Observable<StatistiquesCaisse> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/annee`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques de l\'année'))
    );
  }

  getStatistiquesParPeriode(dateDebut: string, dateFin: string): Observable<StatistiquesCaisse> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<any>(`${this.apiUrl}/statistiques/periode`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques par période'))
    );
  }

  // ==================== REVENUS ET PERTES ====================

  getRevenusEtPertesParPeriode(dateDebut: string, dateFin: string): Observable<RevenusPertes> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    
    return this.http.get<any>(`${this.apiUrl}/revenus-pertes`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.resultats || response),
      catchError(error => this.handleError(error, 'récupérer les revenus et pertes'))
    );
  }

  // ==================== RAPPORTS PDF ====================

  telechargerRapportJournalier(date?: string): Observable<Blob> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get(`${this.apiUrl}/rapports/journalier`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-caisse-${date || this.getAujourdhui()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger le rapport journalier'))
    );
  }

  telechargerRapportHebdomadaire(debut?: string, fin?: string): Observable<Blob> {
    let params = new HttpParams();
    if (debut) {
      params = params.set('debutSemaine', debut);
    }
    if (fin) {
      params = params.set('finSemaine', fin);
    }
    return this.http.get(`${this.apiUrl}/rapports/hebdomadaire`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-caisse-semaine-${debut || this.getDateDebutSemaine()}-${fin || this.getDateFinSemaine()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger le rapport hebdomadaire'))
    );
  }

  telechargerRapportMensuel(annee?: number, mois?: number): Observable<Blob> {
    let params = new HttpParams();
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    if (mois) {
      params = params.set('mois', mois.toString());
    }
    return this.http.get(`${this.apiUrl}/rapports/mensuel`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-caisse-${annee || new Date().getFullYear()}-${mois || (new Date().getMonth() + 1)}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger le rapport mensuel'))
    );
  }

  telechargerRapportAnnuel(annee?: number): Observable<Blob> {
    let params = new HttpParams();
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    return this.http.get(`${this.apiUrl}/rapports/annuel`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-caisse-${annee || new Date().getFullYear()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger le rapport annuel'))
    );
  }

  telechargerRapportPersonnalise(dateDebut: string, dateFin: string): Observable<Blob> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get(`${this.apiUrl}/rapports/personnalise`, {
      headers: this.getAuthHeaders(),
      params: params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-caisse-${dateDebut}-${dateFin}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger le rapport personnalisé'))
    );
  }

  // ==================== VENTES COMPTANT/CRÉDIT ====================

  getVentesComptantDuJour(): Observable<VentesComptantDuJour> {
    return this.http.get<any>(`${this.apiUrl}/ventes/comptant/aujourdhui`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.ventes || response),
      catchError(error => this.handleError(error, 'récupérer les ventes comptant du jour'))
    );
  }

  getVentesCreditDuJour(): Observable<VentesCreditDuJour> {
    return this.http.get<any>(`${this.apiUrl}/ventes/credit/aujourdhui`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.ventes || response),
      catchError(error => this.handleError(error, 'récupérer les ventes crédit du jour'))
    );
  }

  getStatistiquesVentesComptantCredit(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventes/statistiques`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques des ventes'))
    );
  }

  // ==================== FACTURES ====================

  getFactures(): Observable<Facture[]> {
    return this.http.get<any>(`${this.apiUrl}/factures`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.factures || []),
      catchError(error => this.handleError(error, 'récupérer les factures'))
    );
  }

  creerFacture(request: FactureRequest): Observable<Facture> {
    return this.http.post<any>(`${this.apiUrl}/factures`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.facture || response),
      catchError(error => this.handleError(error, 'créer la facture'))
    );
  }

  modifierFacture(factureId: number, request: FactureRequest): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/factures/${factureId}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.facture || response),
      catchError(error => this.handleError(error, 'modifier la facture'))
    );
  }

  obtenirFactureParId(factureId: number): Observable<Facture> {
    return this.http.get<any>(`${this.apiUrl}/factures/${factureId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.facture || response),
      catchError(error => this.handleError(error, 'récupérer la facture'))
    );
  }

  supprimerFacture(factureId: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/factures/${factureId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'supprimer la facture'))
    );
  }

  validerFacture(factureId: number): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/factures/${factureId}/valider`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.facture || response),
      catchError(error => this.handleError(error, 'valider la facture'))
    );
  }

  annulerFacture(factureId: number): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/factures/${factureId}/annuler`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.facture || response),
      catchError(error => this.handleError(error, 'annuler la facture'))
    );
  }

  getStatistiquesFactures(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/factures/statistiques`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques des factures'))
    );
  }

  getFacturesParStatut(statut: string): Observable<Facture[]> {
    return this.http.get<any>(`${this.apiUrl}/factures/statut/${statut}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.factures || []),
      catchError(error => this.handleError(error, 'récupérer les factures par statut'))
    );
  }

  getFacturesParClient(clientNom: string): Observable<Facture[]> {
    const params = new HttpParams().set('clientNom', clientNom);
    return this.http.get<any>(`${this.apiUrl}/factures/client`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.factures || []),
      catchError(error => this.handleError(error, 'récupérer les factures par client'))
    );
  }

  getFacturesParPeriode(dateDebut: string, dateFin: string): Observable<Facture[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<any>(`${this.apiUrl}/factures/periode`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.factures || []),
      catchError(error => this.handleError(error, 'récupérer les factures par période'))
    );
  }

  imprimerFacture(facture: Facture): void {
    console.log('🖨️ Impression de la facture:', facture.numeroFacture);
    
    try {
      const factureHTML = this.genererHTMLFacture(facture);
      const fenetreImpression = window.open('', '_blank');
      
      if (!fenetreImpression) {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les popups.');
      }
      
      fenetreImpression.document.write(factureHTML);
      fenetreImpression.document.close();
      
      fenetreImpression.onload = () => {
        setTimeout(() => {
          fenetreImpression.focus();
          fenetreImpression.print();
          fenetreImpression.addEventListener('afterprint', () => fenetreImpression.close());
        }, 500);
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'impression:', error);
      throw new Error('Impossible de générer la facture. Veuillez réessayer.');
    }
  }

  private genererHTMLFacture(facture: Facture): string {
    const date = this.formatDateLong(facture.dateCreation || new Date().toISOString());
    const boutique = this.boutiqueService.getInfo();
    
    const styles = `
      <style>
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body { font-family: 'Arial', sans-serif; line-height: 1.2; color: #000; margin: 0; padding: 0; font-size: 9pt; }
          .invoice-container { width: 100%; max-width: 100%; margin: 0 auto; padding: 5px; }
          .invoice-header { text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #000; }
          .invoice-title { font-size: 18pt; font-weight: bold; margin: 2px 0; color: #2c3e50; }
          .shop-name { font-size: 14pt; font-weight: bold; margin: 2px 0; color: #27ae60; }
          .shop-info { font-size: 9pt; margin: 2px 0; color: #7f8c8d; }
          .products-table { width: 100%; border-collapse: collapse; font-size: 7pt; margin-bottom: 10px; }
          .products-table th { background: #ecf0f1; padding: 4px 3px; text-align: left; border: 1px solid #bdc3c7; }
          .products-table td { padding: 3px 3px; border: 1px solid #bdc3c7; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-section { margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 3px; }
          .grand-total { font-size: 11pt; font-weight: bold; border-top: 2px solid #2c3e50; margin-top: 5px; padding-top: 5px; color: #27ae60; }
          .footer { margin-top: 10px; padding-top: 5px; border-top: 1px solid #bdc3c7; text-align: center; font-size: 7pt; }
          .no-print { display: none; }
        }
        @media screen {
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 15px; max-width: 800px; margin: 0 auto; }
          .invoice-container { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .print-button { display: block; margin: 15px auto; padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; }
        }
      </style>
    `;
    
    const statutClass = this.getStatutClass(facture.statut);
    const statutText = this.getStatutText(facture.statut);
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Facture ${facture.numeroFacture || 'N°' + facture.id}</title>
        ${styles}
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="shop-name">${boutique.nom || this.BOUTIQUE_NOM}</div>
            <div class="shop-info">📍 ${boutique.adresse || this.BOUTIQUE_ADRESSE}</div>
            <div class="shop-info">📞 ${boutique.telephone || this.BOUTIQUE_TELEPHONE}</div>
            <div class="shop-info">✉️ ${boutique.email || this.BOUTIQUE_EMAIL}</div>
            <div class="shop-info">Facture N° ${facture.numeroFacture || 'N°' + facture.id}</div>
            <div class="shop-info">Date: ${date}</div>
          </div>
          
          <div class="shop-info">
            <strong>Client:</strong> ${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}<br>
            ${facture.clientTelephone ? `<strong>Téléphone:</strong> ${facture.clientTelephone}<br>` : ''}
            ${facture.clientAdresse ? `<strong>Adresse:</strong> ${facture.clientAdresse}<br>` : ''}
            <strong>Statut:</strong> <span class="badge" style="background:#${statutClass === 'bg-success' ? '27ae60' : statutClass === 'bg-danger' ? 'e74c3c' : statutClass === 'bg-warning' ? 'f39c12' : '7f8c8d'}; color:white; padding:2px 6px; border-radius:4px;">${statutText}</span>
          </div>
          
          <table class="products-table">
            <thead>
              <tr><th>Désignation</th><th class="text-center">Qté</th><th class="text-right">Prix U.</th><th class="text-right">Remise</th><th class="text-right">Total</th></tr>
            </thead>
            <tbody>
              ${facture.lignes && facture.lignes.length > 0 ? 
                facture.lignes.map(ligne => {
                  const remise = ligne.remisePourcentage || ligne.remiseMontant || 0;
                  const totalLigne = ligne.quantite * ligne.prixUnitaire * (1 - (ligne.remisePourcentage || 0)/100);
                  return `
                    <tr>
                      <td>${ligne.designation || ligne.produitNom || 'Produit'}</td>
                      <td class="text-center">${ligne.quantite}</td>
                      <td class="text-right">${this.formatPrice(ligne.prixUnitaire)}</td>
                      <td class="text-right">${remise > 0 ? (ligne.remisePourcentage ? remise + '%' : this.formatPrice(remise)) : '-'}</td>
                      <td class="text-right">${this.formatPrice(totalLigne)}</td>
                    </tr>
                  `;
                }).join('') : 
                '<tr><td colspan="5" class="text-center">Aucun produit</td></tr>'
              }
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="grand-total" style="display:flex; justify-content:space-between;">
              <span>TOTAL À PAYER:</span>
              <span style="font-weight:bold;">${this.formatPrice(facture.montantTotal)}</span>
            </div>
          </div>
          
          ${facture.notes ? `<div class="shop-info"><strong>Notes:</strong> ${facture.notes}</div>` : ''}
          
          <div class="footer">
            Merci de votre confiance ! À bientôt chez ${boutique.nom || this.BOUTIQUE_NOM}
          </div>
          
          <button class="print-button no-print" onclick="window.print()">🖨️ Imprimer / Télécharger PDF</button>
          <button class="no-print" style="margin-left:10px;padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer" onclick="window.close()">✕ Fermer</button>
          <script>window.addEventListener('afterprint',function(){window.close();});<\/script>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private getStatutClass(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'bg-warning';
      case 'VALIDE': return 'bg-info';
      case 'PAYEE': return 'bg-success';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  private getStatutText(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'VALIDE': return 'Validée';
      case 'PAYEE': return 'Payée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  private enrichirCredit(credit: any): CreditInfo {
    const maintenant = new Date();
    const echeance = credit.dateEcheance ? new Date(credit.dateEcheance) : null;
    const enRetard = echeance ? echeance < maintenant : false;
    const joursRetard = enRetard && echeance ? 
      Math.ceil(Math.abs(maintenant.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const montantVerse = credit.montantVerse || 0;
    const montantTotal = credit.montantTotal || credit.montant || 0;
    const montantRestant = credit.montantRestant || (montantTotal - montantVerse);
    const progression = montantTotal > 0 ? (montantVerse / montantTotal) * 100 : 0;
    const venteId = credit.venteId || (credit.vente ? credit.vente.id : null) || 0;
    
    return {
      id: credit.id,
      clientNom: credit.clientNom || 'N/A',
      clientTelephone: credit.clientTelephone || '',
      montantTotal: montantTotal,
      montantVerse: montantVerse,
      montantRestant: montantRestant,
      dateOperation: credit.dateOperation || '',
      dateEcheance: credit.dateEcheance || '',
      venteId: venteId,
      numeroVente: credit.numeroVente || '',
      estReglee: credit.estReglee || montantRestant <= 0,
      enRetard: enRetard,
      joursRetard: joursRetard,
      progression: progression,
      venteAnnulee: credit.venteAnnulee || credit.annulee || false
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatDateLong(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  }

  getAujourdhui(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDateDebutSemaine(): string {
    const date = new Date();
    const jour = date.getDay();
    const diff = date.getDate() - jour + (jour === 0 ? -6 : 1);
    date.setDate(diff);
    return date.toISOString().split('T')[0];
  }

  getDateFinSemaine(): string {
    const date = new Date(this.getDateDebutSemaine());
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  }

  getDateDebutMois(): string {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  }

  getDateFinMois(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split('T')[0];
  }

  getDateDebutAnnee(): string {
    const date = new Date();
    date.setMonth(0, 1);
    return date.toISOString().split('T')[0];
  }

  getDateFinAnnee(): string {
    const date = new Date();
    date.setMonth(11, 31);
    return date.toISOString().split('T')[0];
  }

  getTypeOperationLabel(type: TypeOperationCaisse): string {
  const labels: Record<TypeOperationCaisse, string> = {
    [TypeOperationCaisse.OUVERTURE]: 'Ouverture',
    [TypeOperationCaisse.FERMETURE]: 'Fermeture',
    [TypeOperationCaisse.VENTE_COMPTANT]: 'Vente comptant',
    [TypeOperationCaisse.VENTE_CREDIT]: 'Vente crédit',
    [TypeOperationCaisse.REGLEMENT_CREDIT]: 'Règlement crédit',
    [TypeOperationCaisse.SORTIE]: 'Sortie',
    [TypeOperationCaisse.ENTREE]: 'Entrée',
    [TypeOperationCaisse.AJUSTEMENT]: 'Ajustement',
    [TypeOperationCaisse.VERIFICATION]: 'Vérification',
    [TypeOperationCaisse.DEPOT]: 'Dépôt',
    [TypeOperationCaisse.RETRAIT]: 'Retrait',
    [TypeOperationCaisse.ANNULATION_VENTE]: 'Annulation vente',
    [TypeOperationCaisse.ANNULATION_CREDIT]: 'Annulation crédit',
    [TypeOperationCaisse.PAIEMENT_FOURNISSEUR]: 'Paiement fournisseur',
    [TypeOperationCaisse.AVANCE_FOURNISSEUR]: 'Avance fournisseur',
    [TypeOperationCaisse.PAIEMENT_EMPLOYE]: 'Paiement employé',
    [TypeOperationCaisse.ANNULATION_PAIEMENT_EMPLOYE]: 'Annulation paiement employé',
    [TypeOperationCaisse.VIREMENT_BANQUE]: 'Virement banque',
    [TypeOperationCaisse.REMBOURSEMENT_RETOUR]: 'Remboursement retour'   // ← AJOUTER CETTE LIGNE
  };
  return labels[type] || type;
}

 getTypeOperationClass(type: TypeOperationCaisse): string {
  switch (type) {
    case TypeOperationCaisse.OUVERTURE:
    case TypeOperationCaisse.VENTE_COMPTANT:
    case TypeOperationCaisse.ENTREE:
    case TypeOperationCaisse.REGLEMENT_CREDIT:
    case TypeOperationCaisse.ANNULATION_PAIEMENT_EMPLOYE:
      return 'badge bg-success';
    case TypeOperationCaisse.FERMETURE:
    case TypeOperationCaisse.SORTIE:
    case TypeOperationCaisse.ANNULATION_VENTE:
    case TypeOperationCaisse.ANNULATION_CREDIT:
    case TypeOperationCaisse.PAIEMENT_EMPLOYE:
    case TypeOperationCaisse.VIREMENT_BANQUE:
    case TypeOperationCaisse.REMBOURSEMENT_RETOUR:   // ← AJOUTER CETTE LIGNE
      return 'badge bg-danger';
    case TypeOperationCaisse.VENTE_CREDIT:
      return 'badge bg-warning text-dark';
    case TypeOperationCaisse.PAIEMENT_FOURNISSEUR:
    case TypeOperationCaisse.AVANCE_FOURNISSEUR:
      return 'badge bg-secondary';
    default:
      return 'badge bg-secondary';
  }
}
  getModePaiementLabel(mode: string): string {
    const labels: Record<string, string> = {
      'ESPECES': 'Espèces',
      'ORANGE_MONEY': 'Orange Money',
      'MOOV_MONEY': 'Moov Money',
      'WAVE_MONEY': 'Wave',
      'CARTE_BANCAIRE': 'Carte',
      'VIREMENT': 'Virement',
      'CHEQUE': 'Chèque',
      'CREDIT_CLIENT': 'Crédit'
    };
    return labels[mode] || mode;
  }

  getModePaiementClass(mode: string): string {
    switch (mode) {
      case 'ESPECES': return 'badge bg-success';
      case 'ORANGE_MONEY': return 'badge bg-warning text-dark';
      case 'MOOV_MONEY': return 'badge bg-info';
      case 'WAVE_MONEY': return 'badge bg-purple text-white';
      case 'CARTE_BANCAIRE': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getCreditStatusClass(credit: CreditInfo): string {
    if (credit.venteAnnulee) return 'badge bg-secondary';
    if (credit.estReglee) return 'badge bg-success';
    if (credit.enRetard) return 'badge bg-danger';
    if (credit.progression > 0) return 'badge bg-info';
    return 'badge bg-warning text-dark';
  }

  getCreditStatusText(credit: CreditInfo): string {
    if (credit.venteAnnulee) return 'Annulé';
    if (credit.estReglee) return 'Soldé';
    if (credit.enRetard) return `En retard (${credit.joursRetard}j)`;
    if (credit.progression > 0) return `Payé ${credit.progression.toFixed(0)}%`;
    return 'En cours';
  }

  getEcartClass(ecart: number): string {
    if (ecart === 0) return 'text-success';
    if (ecart > 0) return 'text-success';
    return 'text-danger';
  }

  getEcartSign(ecart: number): string {
    if (ecart > 0) return '+';
    if (ecart < 0) return '-';
    return '';
  }

  // ==================== TRANSFERT CAISSE → BANQUE ====================

  transfererVersBanque(request: TransfertCaisseBanqueRequest): Observable<any> {
    if (!request.compteId) {
      return throwError(() => new Error('Compte bancaire requis'));
    }
    if (!request.montant || request.montant <= 0) {
      return throwError(() => new Error('Le montant doit être supérieur à 0'));
    }
    if (!request.motif?.trim()) {
      return throwError(() => new Error('Un motif est requis'));
    }
    
    if (!request.utilisateurId) {
      const user = this.authService.getUser();
      if (user) {
        request.utilisateurId = user.id;
      }
    }
    
    return this.http.post<any>(`${this.apiUrl}/transferer-vers-banque`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.resultat || response),
      catchError(error => this.handleError(error, 'effectuer le transfert caisse → banque'))
    );
  }
}