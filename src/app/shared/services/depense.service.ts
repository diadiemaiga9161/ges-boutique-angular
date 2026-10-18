import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { nouvelIdentifiantDemande } from '../utils/identifiant-demande.util';

export interface TypeDepense {
  id: number;
  nom: string;
}

export interface Depense {
  id?: number;
  nom: string;
  motif?: string;
  date: string;
  montant: number;
  typeDepense?: string;
  operationCaisseId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Traçabilité comptable
  validee?: boolean;
  valideParId?: number;
  valideLe?: string;
  annulee?: boolean;
  motifAnnulation?: string;
  annuleParId?: number;
  dateAnnulation?: string;
  // Caisse par sessions : dépense notée par un non-gérant, l'argent ne sort de la caisse qu'à la
  // validation du gérant. Vide pour les anciennes dépenses (argent déjà sorti).
  sortieEnAttente?: boolean | null;
  clientRequestId?: string | null;
}

/** Liste des dépenses avec les totaux calculés par le serveur. */
export interface ListeDepenses {
  depenses: Depense[];
  /** Dépenses dont l'argent est sorti (hors annulées et hors en attente). */
  total: number;
  /** Dépenses notées, en attente de validation par le gérant (0 si l'ancien serveur ne l'envoie pas). */
  totalEnAttente: number;
  nombreEnAttente: number;
}

/** Réponse à la création d'une dépense. */
export interface ResultatCreationDepense {
  depense: Depense;
  /** true : la dépense attend la validation du gérant, rien n'est encore sorti de la caisse. */
  validationRequise: boolean;
  message: string;
}

export interface DepenseRequest {
  nom: string;
  motif?: string;
  date: string;
  montant: number;
  typeDepense?: string;
}

@Injectable({ providedIn: 'root' })
export class DepenseService {

  private apiUrl = `${environment.apiUrl}/depenses`;
  private typesUrl = `${environment.apiUrl}/types-depense`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<ListeDepenses> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(r => this.versListe(r)),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement dépenses')))
    );
  }

  getById(id: number): Observable<Depense> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Dépense introuvable')))
    );
  }

  getParPeriode(debut: string, fin: string): Observable<ListeDepenses> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<any>(`${this.apiUrl}/periode`, { headers: this.getHeaders(), params }).pipe(
      map(r => this.versListe(r)),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur filtre période')))
    );
  }

  /**
   * Crée une dépense. identifiantDemande : le même pour chaque nouvel essai de la MÊME création
   * (le serveur rend alors la dépense déjà enregistrée au lieu d'en créer une deuxième).
   */
  creer(request: DepenseRequest, identifiantDemande: string = nouvelIdentifiantDemande()): Observable<ResultatCreationDepense> {
    const headers = this.getHeaders().set('X-Client-Request-ID', identifiantDemande);
    return this.http.post<any>(this.apiUrl, request, { headers }).pipe(
      map(r => DepenseService.versResultatCreation(r)),
      // Le code HTTP est gardé (0 = aucune réponse) : la page sait si la dépense a pu être
      // enregistrée malgré l'erreur (réponse perdue, erreur serveur) ou sûrement pas (refus 4xx).
      catchError(e => throwError(() => Object.assign(
        new Error(e?.error?.message || 'Erreur création dépense'), { status: e?.status as number | undefined })))
    );
  }

  /**
   * validationRequise vient du serveur ; une demande renvoyée (« Dépense déjà enregistrée ») ne
   * le contient pas : on se fie alors au statut de la dépense elle-même.
   */
  static versResultatCreation(r: any): ResultatCreationDepense {
    const depense: Depense = (r && r.depense) || r;
    const validationRequise = typeof r?.validationRequise === 'boolean'
      ? r.validationRequise
      : depense?.sortieEnAttente === true;
    return { depense, validationRequise, message: r?.message || '' };
  }

  private versListe(r: any): ListeDepenses {
    return {
      depenses: r?.depenses || [],
      total: r?.total || 0,
      totalEnAttente: r?.totalEnAttente || 0,
      nombreEnAttente: r?.nombreEnAttente || 0
    };
  }

  modifier(id: number, request: DepenseRequest): Observable<Depense> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification dépense')))
    );
  }

  supprimer(id: number, motif?: string): Observable<void> {
    let params = new HttpParams();
    if (motif) params = params.set('motif', motif);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders(), params }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression dépense')))
    );
  }

  valider(id: number): Observable<Depense> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/valider`, {}, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur validation dépense')))
    );
  }

  getTypes(): Observable<TypeDepense[]> {
    return this.http.get<any>(this.typesUrl, { headers: this.getHeaders() }).pipe(
      map(r => Array.isArray(r) ? r : (r.types || [])),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement types')))
    );
  }

  creerType(nom: string): Observable<TypeDepense> {
    return this.http.post<any>(this.typesUrl, { nom }, { headers: this.getHeaders() }).pipe(
      map(r => r.type || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur création type')))
    );
  }

  modifierType(id: number, nom: string): Observable<TypeDepense> {
    return this.http.put<any>(`${this.typesUrl}/${id}`, { nom }, { headers: this.getHeaders() }).pipe(
      map(r => r.type || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification type')))
    );
  }

  supprimerType(id: number): Observable<void> {
    return this.http.delete<any>(`${this.typesUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression type')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
  }
}
