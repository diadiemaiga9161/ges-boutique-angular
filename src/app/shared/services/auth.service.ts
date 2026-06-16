import { Injectable } from "@angular/core";
import { LocalStoreService } from "./local-store.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  nomComplet: string;
  email: string;
  telephone: string;
  id: number;
}

export interface User {
  id: number;
  username: string;
  role: string;
  nomComplet: string;
  email: string;
  telephone: string;
  photo?: string;
  actif?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  
  private authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  authenticated$ = this.authenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUser());
  currentUser$ = this.currentUserSubject.asObservable();

  authenticated = false;

  constructor(
    private store: LocalStoreService, 
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuth();
    this.authenticated = this.isAuthenticated();
  }

  checkAuth() {
    const isAuthenticated = this.isAuthenticated();
    this.authenticatedSubject.next(isAuthenticated);
    this.authenticated = isAuthenticated;
    
    if (isAuthenticated) {
      const user = this.getUser();
      this.currentUserSubject.next(user);
    }
  }

  getuser() {
    return this.currentUserSubject.asObservable();
  }

  signin(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('🔑 Tentative de connexion avec:', credentials.username);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Réponse de connexion:', response);
          
          // Sauvegarder le token
          this.store.setItem(this.tokenKey, response.token);
          
          // Créer l'objet utilisateur
          const userData: User = {
            id: response.id,
            username: response.username,
            role: response.role,
            nomComplet: response.nomComplet,
            email: response.email,
            telephone: response.telephone,
            photo: (response as any).photo || undefined
          };
          
          // Sauvegarder l'utilisateur
          this.store.setItem(this.userKey, userData);
          
          // Mettre à jour les sujets
          this.authenticatedSubject.next(true);
          this.currentUserSubject.next(userData);
          this.authenticated = true;
          
          console.log('💾 Utilisateur sauvegardé:', userData);
        }),
        catchError(error => {
          console.error('❌ Erreur de connexion:', error);
          
          let errorMessage = 'Erreur de connexion';
          if (error.status === 401) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  signout() {
    console.log('🚪 Déconnexion de l\'utilisateur');
    
    this.store.removeItem(this.tokenKey);
    this.store.removeItem(this.userKey);
    
    this.authenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.authenticated = false;
    
    this.router.navigateByUrl("/sessions/connexion");
  }

  getToken(): string | null {
    const token = this.store.getItem(this.tokenKey);
    return token;
  }

  getUser(): User | null {
    const user = this.store.getItem(this.userKey);
    return user;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Vérifier si le token n'est pas expiré
    try {
      const decodedToken = this.decodeJwtToken(token);
      if (decodedToken && decodedToken.exp) {
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        return currentTime < expirationTime;
      }
    } catch (e) {
      console.error('Erreur décodage token:', e);
    }
    
    return !!token;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user || !user.role) return false;
    
    const userRole = user.role.toUpperCase();
    const searchRole = role.toUpperCase();
    
    return userRole === searchRole || 
           userRole === `ROLE_${searchRole}` ||
           `ROLE_${userRole}` === searchRole;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVendeur(): boolean {
    return this.hasRole('VENDEUR');
  }

  getDisplayName(): string {
    const user = this.getUser();
    return user?.nomComplet || user?.username || 'Utilisateur';
  }

  getFormattedRole(): string {
    const user = this.getUser();
    if (!user?.role) return '';
    return user.role.replace('ROLE_', '');
  }

  getUserId(): number {
    const user = this.getUser();
    return user?.id || 0;
  }

  motDePasseOublie(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/mot-de-passe-oublie`, { email });
  }

  verifierTokenReset(token: string): Observable<{ valide: boolean }> {
    return this.http.get<{ valide: boolean }>(`${this.apiUrl}/verifier-token-reset`, { params: { token } });
  }

  reinitialiserPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reinitialiser-password`, { token, password });
  }

  // MÉTHODES POUR L'AUTHENTIFICATION (gardées pour compatibilité)
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.error('❌ Aucun token disponible pour l\'authentification');
      throw new Error('Token non disponible. Veuillez vous reconnecter.');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAuthOptions(): { headers: HttpHeaders } {
    return {
      headers: this.getAuthHeaders()
    };
  }

  private decodeJwtToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token JWT:', error);
      return null;
    }
  }

  getCurrentProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        const userData: User = {
          id: user.id,
          username: user.username,
          role: user.role,
          nomComplet: user.nomComplet,
          email: user.email,
          telephone: user.telephone,
          photo: user.photo
        };
        this.store.setItem(this.userKey, userData);
        this.currentUserSubject.next(userData);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération du profil:', error);
        return throwError(() => new Error('Impossible de récupérer le profil'));
      })
    );
  }

  updatePhoto(photoBase64: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/utilisateurs/me/photo`, { photo: photoBase64 }).pipe(
      tap(() => {
        const user = this.getUser();
        if (user) {
          user.photo = photoBase64;
          this.store.setItem(this.userKey, user);
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la photo:', error);
        return throwError(() => new Error('Impossible de mettre à jour la photo'));
      })
    );
  }

  removePhoto(): Observable<any> {
    return this.updatePhoto('');
  }

  updateProfile(userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profil`, userData).pipe(
      tap(updatedUser => {
        const existing = this.getUser();
        const updatedUserData: User = {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          nomComplet: updatedUser.nomComplet,
          email: updatedUser.email,
          telephone: updatedUser.telephone,
          photo: existing?.photo
        };
        this.store.setItem(this.userKey, updatedUserData);
        this.currentUserSubject.next(updatedUserData);
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        
        let errorMessage = 'Erreur lors de la mise à jour du profil';
        if (error.status === 409) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  debugAuthState(): void {
    console.group('🔍 État d\'authentification - DEBUG');
    console.log('🔐 Token présent:', !!this.getToken());
    
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeJwtToken(token);
      console.log('🎫 Token JWT décodé:', decoded);
    }
    
    console.log('👤 Utilisateur:', this.getUser());
    console.log('🆔 User ID:', this.getUserId());
    console.log('✅ Authentifié:', this.isAuthenticated());
    console.log('🏷️ Role:', this.getUser()?.role);
    console.log('👑 Admin:', this.isAdmin());
    console.log('💰 Vendeur:', this.isVendeur());
    console.groupEnd();
  }
}
