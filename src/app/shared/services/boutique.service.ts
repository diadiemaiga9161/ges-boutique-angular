// src/app/shared/services/boutique.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, map, tap } from 'rxjs/operators';

export interface BoutiqueInfo {
  id?: number;
  nom: string;
  adresse: string;
  numeroRc?: string;
  numeroIfu?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  pays?: string;
  logoPath?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutique`;
  private info: BoutiqueInfo;
  private infoSubject: BehaviorSubject<BoutiqueInfo>;
  public info$: Observable<BoutiqueInfo>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.info = this.defaultInfo();
    this.infoSubject = new BehaviorSubject<BoutiqueInfo>({ ...this.info });
    this.info$ = this.infoSubject.asObservable();
    this.authService.authenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadBoutiqueInfo();
      } else {
        this.setCurrentInfo(this.defaultInfo());
      }
    });
  }

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) return null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private defaultInfo(): BoutiqueInfo {
    return {
      nom: 'Boutique Alimentaire Ndjim Et Frères',
      adresse: 'Misa bougou',
      numeroRc: 'RC-XXXX',
      numeroIfu: 'IFU-XXXX',
      telephone: '76 96 21 20/66 43 66 03',
      email: 'ndjim@yahoo.fr',
      ville: 'Bamako',
      pays: 'Mali',
      logoPath: 'assets/images/logo.png'
    };
  }

  private unwrapBoutiqueResponse(response: any): any {
    let data = response;
    for (let i = 0; i < 5; i++) {
      if (!data || Array.isArray(data)) return data;
      const next = data.boutique ?? data.data?.boutique ?? data.data ?? data.result ?? data.payload;
      if (!next || next === data) return data;
      data = next;
    }
    return data;
  }

  private normalizeBoutique(response: any): BoutiqueInfo {
    const data = this.unwrapBoutiqueResponse(response);
    const fallback = this.defaultInfo();

    if (!data || data.success === false) {
      return fallback;
    }

    return {
      id: data.id ?? 1,
      nom: data.nom ?? data.name ?? fallback.nom,
      adresse: data.adresse ?? data.address ?? fallback.adresse,
      numeroRc: data.numeroRc ?? data.rc ?? fallback.numeroRc,
      numeroIfu: data.numeroIfu ?? data.ifu ?? fallback.numeroIfu,
      telephone: data.telephone ?? data.phone ?? fallback.telephone,
      email: data.email ?? fallback.email,
      ville: data.ville ?? data.city ?? fallback.ville,
      pays: data.pays ?? data.country ?? fallback.pays,
      logoPath: data.logoPath ?? fallback.logoPath,
      logo: data.logo ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private setCurrentInfo(info: BoutiqueInfo): void {
    this.info = { ...info, id: info.id || 1 };
    this.infoSubject.next({ ...this.info });
    try {
      if (typeof localStorage !== 'undefined') {
        const logoToStore = this.info.logo || this.info.logoPath || '';
        localStorage.setItem('BOUTIQUE_LOGO', logoToStore);
      }
    } catch (e) {}
  }

  private loadBoutiqueInfo(): void {
    if (!this.authService.isAuthenticated()) {
      this.setCurrentInfo(this.defaultInfo());
      return;
    }
    this.refreshBoutique().subscribe({
      error: (error) => {
        console.warn('Failed to load boutique info from API, using defaults', error);
        this.setCurrentInfo(this.defaultInfo());
      }
    });
  }

  refreshBoutique(): Observable<BoutiqueInfo> {
    return this.getBoutique().pipe(
      tap(boutique => this.setCurrentInfo(boutique))
    );
  }

  getBoutique(): Observable<BoutiqueInfo> {
    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};
    // Appel sans ID (l'ID 1 n'est pas nécessaire)
    return this.http.get<any>(this.apiUrl, options).pipe(
      map(response => this.normalizeBoutique(response)),
      catchError(error => {
        console.error('Erreur lors de la récupération des informations de la boutique:', error);
        return throwError(() => new Error('Impossible de récupérer les informations de la boutique'));
      })
    );
  }

  updateBoutique(boutique: BoutiqueInfo): Observable<BoutiqueInfo> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('Token non disponible'));
    }
    const { logo, logoPath, ...payload } = boutique as any;
    return this.http.put<any>(this.apiUrl, payload, { headers }).pipe(
      map(response => {
        const updated = this.normalizeBoutique(response || boutique);
        this.setCurrentInfo(updated);
        return updated;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour des informations de la boutique:', error);
        return throwError(() => new Error('Impossible de mettre à jour les informations de la boutique'));
      })
    );
  }

  getInfo(): BoutiqueInfo {
    return { ...this.info };
  }

  getLogoPath(): string {
    return this.info.logo || this.info.logoPath || 'assets/images/logo.png';
  }

  uploadLogo(file: File): Observable<string> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('Token non disponible'));
    const formData = new FormData();
    formData.append('logo', file, file.name);
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<any>(`${this.apiUrl}/upload-logo`, formData, { headers }).pipe(
      map(response => {
        const logo = response.logo as string;
        this.info = { ...this.info, logo };
        this.infoSubject.next({ ...this.info });
        try { localStorage.setItem('BOUTIQUE_LOGO', logo); } catch (e) {}
        return logo;
      }),
      catchError(error => {
        console.error('Erreur upload logo:', error);
        return throwError(() => new Error(error?.error?.message || 'Impossible d\'uploader le logo'));
      })
    );
  }

  setInfo(partial: Partial<BoutiqueInfo>): void {
    const updated = { ...this.info, ...partial, id: this.info.id || 1 };
    this.updateBoutique(updated).subscribe({
      next: () => {},
      error: (error) => console.warn('Failed to update boutique info via API', error)
    });
  }

  resetToDefaults(): Observable<BoutiqueInfo> {
    return this.updateBoutique(this.defaultInfo());
  }
}