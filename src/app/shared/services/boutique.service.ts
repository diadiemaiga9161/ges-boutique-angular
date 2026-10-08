// src/app/shared/services/boutique.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface FonctionnaliteAvancee {
  cle: string;
  libelle: string;
  actif: boolean;
}

/** Permissions vendeur (système générique, séparé des fonctionnalités avancées
 *  ci-dessus qui restent réservées au super admin) : un ADMIN normal peut accorder
 *  au VENDEUR un accès en lecture seule à certaines pages, ex. INVENTAIRE_LECTURE. */
export interface PermissionVendeur {
  cle: string;
  libelle: string;
  actif: boolean;
}

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
  couleurPrimaire?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Activables/désactivables par le super admin (Boutique > Paramètres), vérifiés côté serveur. */
  featureTransfertsActif?: boolean;
  featureVitrineActif?: boolean;
  /** Défini uniquement par le super admin — voir feature.ENVOI_SAUVEGARDES_EMAIL. */
  emailSauvegarde?: string;
}

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutique`;
  private info: BoutiqueInfo;
  private infoSubject: BehaviorSubject<BoutiqueInfo>;
  public info$: Observable<BoutiqueInfo>;

  // Fonctionnalités avancées (Dépôt garde, Dettes anciennes, Comptes bancaires...) —
  // lues par TOUT le personnel connecté pour masquer les menus désactivés (voir
  // NavigationService), modifiables uniquement par le super admin. Système séparé de
  // featureTransfertsActif/featureVitrineActif ci-dessus (déjà en place, non touché).
  private fonctionnalitesAvanceesSubject = new BehaviorSubject<FonctionnaliteAvancee[]>([]);
  public fonctionnalitesAvancees$ = this.fonctionnalitesAvanceesSubject.asObservable();

  // Permissions vendeur (système générique, séparé de fonctionnalitesAvancees ci-dessus) —
  // lues par TOUT le personnel connecté (ADMIN/VENDEUR), modifiables par n'importe quel ADMIN
  // (pas besoin d'être super admin). Voir GET/PUT /api/boutique/permissions-vendeur.
  private permissionsVendeurSubject = new BehaviorSubject<PermissionVendeur[]>([]);
  public permissionsVendeur$ = this.permissionsVendeurSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.info = this.defaultInfo();
    this.infoSubject = new BehaviorSubject<BoutiqueInfo>({ ...this.info });
    this.info$ = this.infoSubject.asObservable();
    this.authService.authenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadBoutiqueInfo();
        this.chargerFonctionnalitesAvancees();
        this.chargerPermissionsVendeur();
      } else {
        this.setCurrentInfo(this.defaultInfo());
        this.fonctionnalitesAvanceesSubject.next([]);
        this.permissionsVendeurSubject.next([]);
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
      nom: 'Ma Boutique',
      adresse: '',
      numeroRc: 'RC-XXXX',
      numeroIfu: 'IFU-XXXX',
      telephone: '',
      email: '',
      ville: 'Bamako',
      pays: 'Mali',
      logoPath: 'assets/images/logo.png',
      couleurPrimaire: '#2a63ff',
      featureTransfertsActif: true,
      featureVitrineActif: true
    };
  }

  /** Éclaircit une couleur hex d'un certain pourcentage (pour --primary-soft). */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt((color || '#2a63ff').replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  /** Applique la couleur principale de la boutique à toute l'application (variables CSS globales),
   *  quelle que soit la page affichée — pas seulement Paramètres Boutique. */
  private appliquerCouleurGlobale(couleur?: string): void {
    if (typeof document === 'undefined') return;
    const c = couleur || '#2a63ff';
    const root = document.documentElement;
    root.style.setProperty('--primary', c);
    root.style.setProperty('--primary-soft', this.lightenColor(c, 0.85));
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
      couleurPrimaire: data.couleurPrimaire ?? fallback.couleurPrimaire,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      featureTransfertsActif: data.featureTransfertsActif ?? fallback.featureTransfertsActif,
      featureVitrineActif: data.featureVitrineActif ?? fallback.featureVitrineActif,
      emailSauvegarde: data.emailSauvegarde ?? undefined
    };
  }

  private setCurrentInfo(info: BoutiqueInfo): void {
    this.info = { ...info, id: info.id || 1 };
    this.infoSubject.next({ ...this.info });
    this.appliquerCouleurGlobale(this.info.couleurPrimaire);
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return from(this.reduireLogo(file)).pipe(
      switchMap(blob => {
        const formData = new FormData();
        formData.append('logo', blob, file.name);
        return this.http.post<any>(`${this.apiUrl}/upload-logo`, formData, { headers });
      }),
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

  /** Réduit le logo (côté le plus long : 512 px) avant l'envoi : une photo de téléphone
   *  (3-5 Mo) dépasse la limite du serveur (2 Mo), et le logo est rechargé partout.
   *  PNG/WebP restent en PNG (transparence gardée) ; le SVG part tel quel. */
  private reduireLogo(fichier: File): Promise<Blob> {
    if (fichier.type === 'image/svg+xml') return Promise.resolve(fichier);
    return new Promise(resolve => {
      const img = new Image();
      const lien = URL.createObjectURL(fichier);
      img.onload = () => {
        URL.revokeObjectURL(lien);
        const ratio = Math.min(1, 512 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(fichier); return; }
        const png = fichier.type === 'image/png' || fichier.type === 'image/webp';
        if (!png) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(b => resolve(b || fichier), png ? 'image/png' : 'image/jpeg', 0.88);
      };
      img.onerror = () => { URL.revokeObjectURL(lien); resolve(fichier); };
      img.src = lien;
    });
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

  /** Réservé au super admin — voir AuthService.isSuperAdmin(). Le serveur revérifie
   *  systématiquement le privilège (403 sinon), cette méthode ne fait aucun contrôle
   *  d'accès côté client. */
  modifierFonctionnalites(featureTransfertsActif: boolean, featureVitrineActif: boolean): Observable<BoutiqueInfo> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('Token non disponible'));
    }
    return this.http.put<any>(`${this.apiUrl}/fonctionnalites`, { featureTransfertsActif, featureVitrineActif }, { headers }).pipe(
      map(response => {
        const updated = this.normalizeBoutique(response);
        this.setCurrentInfo(updated);
        return updated;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour des fonctionnalités:', error);
        return throwError(() => new Error(error?.error?.error || 'Impossible de mettre à jour les fonctionnalités'));
      })
    );
  }

  /** Réservé au super admin — voir AuthService.isSuperAdmin(). Le serveur revérifie
   *  systématiquement le privilège (403 sinon), cette méthode ne fait aucun contrôle
   *  d'accès côté client. */
  definirEmailSauvegarde(emailSauvegarde: string): Observable<BoutiqueInfo> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('Token non disponible'));
    }
    return this.http.put<any>(`${this.apiUrl}/email-sauvegarde`, { emailSauvegarde }, { headers }).pipe(
      map(response => {
        const updated = this.normalizeBoutique(response);
        this.setCurrentInfo(updated);
        return updated;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de l\'email de sauvegarde:', error);
        return throwError(() => new Error(error?.error?.message || error?.error?.error || 'Impossible de mettre à jour l\'adresse email'));
      })
    );
  }

  private chargerFonctionnalitesAvancees(): void {
    this.getFonctionnalitesAvancees().subscribe({ error: () => {} });
  }

  /** Lecture ouverte à tout le personnel (ADMIN/VENDEUR) — voir GET /api/boutique/fonctionnalites-avancees. */
  getFonctionnalitesAvancees(): Observable<FonctionnaliteAvancee[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.get<any>(`${this.apiUrl}/fonctionnalites-avancees`, { headers }).pipe(
      map(response => (response?.fonctionnalites || []) as FonctionnaliteAvancee[]),
      tap(liste => this.fonctionnalitesAvanceesSubject.next(liste)),
      catchError(error => {
        console.error('Erreur lors du chargement des fonctionnalités avancées:', error);
        return throwError(() => new Error('Impossible de charger les fonctionnalités avancées'));
      })
    );
  }

  /** Réservé au super admin — le serveur revérifie systématiquement le privilège (403 sinon). */
  definirFonctionnaliteAvancee(cle: string, actif: boolean): Observable<FonctionnaliteAvancee[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.put<any>(`${this.apiUrl}/fonctionnalites-avancees/${cle}`, { actif }, { headers }).pipe(
      map(response => (response?.fonctionnalites || []) as FonctionnaliteAvancee[]),
      tap(liste => this.fonctionnalitesAvanceesSubject.next(liste)),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la fonctionnalité:', error);
        return throwError(() => new Error(error?.error?.error || 'Impossible de mettre à jour cette fonctionnalité'));
      })
    );
  }

  private chargerPermissionsVendeur(): void {
    this.getPermissionsVendeur().subscribe({ error: () => {} });
  }

  /** Lecture ouverte à tout le personnel (ADMIN/VENDEUR) — voir GET /api/boutique/permissions-vendeur. */
  getPermissionsVendeur(): Observable<PermissionVendeur[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.get<any>(`${this.apiUrl}/permissions-vendeur`, { headers }).pipe(
      map(response => (response?.permissions || []) as PermissionVendeur[]),
      tap(liste => this.permissionsVendeurSubject.next(liste)),
      catchError(error => {
        console.error('Erreur lors du chargement des permissions vendeur:', error);
        return throwError(() => new Error('Impossible de charger les permissions vendeur'));
      })
    );
  }

  /** Réservé à ADMIN (n'importe quel admin de la boutique, pas besoin d'être super admin) —
   *  le serveur revérifie systématiquement le privilège (403 sinon). */
  definirPermissionVendeur(cle: string, actif: boolean): Observable<PermissionVendeur[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.put<any>(`${this.apiUrl}/permissions-vendeur/${cle}`, { actif }, { headers }).pipe(
      map(response => (response?.permissions || []) as PermissionVendeur[]),
      tap(liste => this.permissionsVendeurSubject.next(liste)),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la permission vendeur:', error);
        return throwError(() => new Error(error?.error?.error || 'Impossible de mettre à jour cette permission'));
      })
    );
  }
}