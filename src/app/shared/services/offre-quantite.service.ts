import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OffreEnCours } from '../utils/offres-quantite.util';

export interface OffreQuantite {
  id: number;
  produitId: number;
  produitNom: string;
  prixNormal: number;
  prixAchat: number;
  quantite: number;
  prix: number;
  economie: number;
  dateDebut: string | null;
  dateFin: string | null;
  active: boolean;
  enCours: boolean;
  creePar: string | null;
}

/** Offres par quantité (fonctionnalité OFFRES_QUANTITE) : réglées par le gérant. */
@Injectable({ providedIn: 'root' })
export class OffreQuantiteService {
  private readonly api = `${environment.apiUrl}/offres-quantite`;
  private enCoursSubject = new BehaviorSubject<OffreEnCours[]>([]);
  /** Offres valables aujourd'hui, utilisées par la caisse pour afficher le bon total. */
  enCours$ = this.enCoursSubject.asObservable();

  constructor(private http: HttpClient) {}

  get enCours(): OffreEnCours[] {
    return this.enCoursSubject.value;
  }

  /** Recharge les offres en cours (liste vide si la fonctionnalité est coupée). */
  chargerEnCours(): Observable<OffreEnCours[]> {
    return this.http.get<OffreEnCours[]>(`${this.api}/en-cours`).pipe(
      catchError(() => of([] as OffreEnCours[])),
      tap(liste => this.enCoursSubject.next(liste || []))
    );
  }

  lister(): Observable<OffreQuantite[]> {
    return this.http.get<OffreQuantite[]>(this.api);
  }

  enregistrer(offre: Partial<OffreQuantite>): Observable<OffreQuantite> {
    const corps = {
      produitId: offre.produitId, quantite: offre.quantite, prix: offre.prix,
      dateDebut: offre.dateDebut || null, dateFin: offre.dateFin || null, active: offre.active !== false
    };
    const appel = offre.id
      ? this.http.put<OffreQuantite>(`${this.api}/${offre.id}`, corps)
      : this.http.post<OffreQuantite>(this.api, corps);
    return appel.pipe(tap(() => this.chargerEnCours().subscribe()));
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.chargerEnCours().subscribe()),
      map(() => undefined)
    );
  }
}
