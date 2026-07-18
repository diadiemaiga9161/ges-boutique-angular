import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ChartsService {
  constructor(private http: HttpClient) {}

  getCA30Jours(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/rapports/ca-30-jours`).pipe(catchError(() => of([])));
  }

  getTopProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/rapports/top-produits`).pipe(catchError(() => of([])));
  }

  getVentesParHeure(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/rapports/ventes-par-heure`).pipe(catchError(() => of([])));
  }

  getPrevisions(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ia/previsions`).pipe(catchError(() => of([])));
  }
}
