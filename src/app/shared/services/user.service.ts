import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  username: string;
  nomComplet: string;
  email: string;
  telephone: string;
  role: 'ADMIN' | 'VENDEUR';
  actif: boolean;
  dateCreation?: string;
  dateModification?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  nomComplet: string;
  email: string;
  telephone: string;
  role: 'ADMIN' | 'VENDEUR';
}

export interface UserUpdate {
  nomComplet?: string;
  email?: string;
  telephone?: string;
  password?: string;
  role?: 'ADMIN' | 'VENDEUR';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Correction : utiliser /api/utilisateurs et non /api/auth
  private apiUrl = `${environment.apiUrl}/utilisateurs`;
  
  constructor(private http: HttpClient) { }

  private getAuthHeaders(token?: string) {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  getAllUsers(token: string): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        
        let errorMessage = 'Impossible de récupérer les utilisateurs';
        if (error.status === 403) {
          errorMessage = 'Accès refusé: Seuls les administrateurs peuvent accéder à cette fonctionnalité';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getUserById(id: number, token: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
        
        let errorMessage = `Impossible de récupérer l'utilisateur ${id}`;
        if (error.status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  createUser(userData: UserCreate, token: string): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        
        let errorMessage = 'Erreur lors de la création de l\'utilisateur';
        if (error.status === 400) {
          if (error.error?.includes('nom d\'utilisateur')) {
            errorMessage = 'Ce nom d\'utilisateur est déjà utilisé';
          } else if (error.error?.includes('email')) {
            errorMessage = 'Cet email est déjà utilisé';
          }
        } else if (error.status === 403) {
          errorMessage = 'Seuls les administrateurs peuvent créer des utilisateurs';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateUser(id: number, userData: UserUpdate, token: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
        
        let errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
        if (error.status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.status === 409 && error.error?.includes('email')) {
          errorMessage = 'Cet email est déjà utilisé par un autre utilisateur';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé: Seuls les administrateurs peuvent modifier les utilisateurs';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteUser(id: number, token: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
        
        let errorMessage = `Impossible de supprimer l'utilisateur ${id}`;
        if (error.status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé: Seuls les administrateurs peuvent supprimer des utilisateurs';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  countUsers(token: string): Observable<number> {
    return this.getAllUsers(token).pipe(
      map(users => users.length)
    );
  }

  getUsersByRole(role: 'ADMIN' | 'VENDEUR', token: string): Observable<User[]> {
    return this.getAllUsers(token).pipe(
      map(users => users.filter(user => user.role === role))
    );
  }

  searchUsers(searchTerm: string, token: string): Observable<User[]> {
    return this.getAllUsers(token).pipe(
      map(users => users.filter(user => 
        user.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
}