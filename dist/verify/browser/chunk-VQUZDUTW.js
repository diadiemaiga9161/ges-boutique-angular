import {
  HttpClient,
  Injectable,
  catchError,
  environment,
  map,
  setClassMetadata,
  throwError,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-RK5GU4B7.js";

// src/app/shared/services/user.service.ts
var UserService = class _UserService {
  constructor(http) {
    this.http = http;
    this.apiUrl = `${environment.apiUrl}/utilisateurs`;
  }
  getAuthHeaders(token) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }
  getAllUsers(token) {
    return this.http.get(this.apiUrl, {
      headers: this.getAuthHeaders(token)
    }).pipe(catchError((error) => {
      console.error("Erreur lors de la r\xE9cup\xE9ration des utilisateurs:", error);
      let errorMessage = "Impossible de r\xE9cup\xE9rer les utilisateurs";
      if (error.status === 403) {
        errorMessage = "Acc\xE8s refus\xE9: Seuls les administrateurs peuvent acc\xE9der \xE0 cette fonctionnalit\xE9";
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      return throwError(() => new Error(errorMessage));
    }));
  }
  getUserById(id, token) {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    }).pipe(catchError((error) => {
      console.error(`Erreur lors de la r\xE9cup\xE9ration de l'utilisateur ${id}:`, error);
      let errorMessage = `Impossible de r\xE9cup\xE9rer l'utilisateur ${id}`;
      if (error.status === 404) {
        errorMessage = "Utilisateur non trouv\xE9";
      } else if (error.status === 403) {
        errorMessage = "Acc\xE8s refus\xE9";
      }
      return throwError(() => new Error(errorMessage));
    }));
  }
  createUser(userData, token) {
    return this.http.post(this.apiUrl, userData, {
      headers: this.getAuthHeaders(token)
    }).pipe(catchError((error) => {
      console.error("Erreur lors de la cr\xE9ation de l'utilisateur:", error);
      let errorMessage = "Erreur lors de la cr\xE9ation de l'utilisateur";
      if (error.status === 400) {
        if (error.error?.includes("nom d'utilisateur")) {
          errorMessage = "Ce nom d'utilisateur est d\xE9j\xE0 utilis\xE9";
        } else if (error.error?.includes("email")) {
          errorMessage = "Cet email est d\xE9j\xE0 utilis\xE9";
        }
      } else if (error.status === 403) {
        errorMessage = "Seuls les administrateurs peuvent cr\xE9er des utilisateurs";
      }
      return throwError(() => new Error(errorMessage));
    }));
  }
  updateUser(id, userData, token) {
    return this.http.put(`${this.apiUrl}/${id}`, userData, {
      headers: this.getAuthHeaders(token)
    }).pipe(catchError((error) => {
      console.error(`Erreur lors de la mise \xE0 jour de l'utilisateur ${id}:`, error);
      let errorMessage = "Erreur lors de la mise \xE0 jour de l'utilisateur";
      if (error.status === 404) {
        errorMessage = "Utilisateur non trouv\xE9";
      } else if (error.status === 409 && error.error?.includes("email")) {
        errorMessage = "Cet email est d\xE9j\xE0 utilis\xE9 par un autre utilisateur";
      } else if (error.status === 403) {
        errorMessage = "Acc\xE8s refus\xE9: Seuls les administrateurs peuvent modifier les utilisateurs";
      }
      return throwError(() => new Error(errorMessage));
    }));
  }
  deleteUser(id, token) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    }).pipe(catchError((error) => {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      let errorMessage = `Impossible de supprimer l'utilisateur ${id}`;
      if (error.status === 404) {
        errorMessage = "Utilisateur non trouv\xE9";
      } else if (error.status === 403) {
        errorMessage = "Acc\xE8s refus\xE9: Seuls les administrateurs peuvent supprimer des utilisateurs";
      }
      return throwError(() => new Error(errorMessage));
    }));
  }
  countUsers(token) {
    return this.getAllUsers(token).pipe(map((users) => users.length));
  }
  getUsersByRole(role, token) {
    return this.getAllUsers(token).pipe(map((users) => users.filter((user) => user.role === role)));
  }
  searchUsers(searchTerm, token) {
    return this.getAllUsers(token).pipe(map((users) => users.filter((user) => user.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))));
  }
  static {
    this.\u0275fac = function UserService_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _UserService)(\u0275\u0275inject(HttpClient));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _UserService, factory: _UserService.\u0275fac, providedIn: "root" });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UserService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: HttpClient }], null);
})();

export {
  UserService
};
//# sourceMappingURL=chunk-VQUZDUTW.js.map
