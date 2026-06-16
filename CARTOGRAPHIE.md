# CARTOGRAPHIE — Alimentation-ges01-payement (Angular Front)

## Infos générales
- **Framework** : Angular 19.2.14
- **App name** : Boutique Maiga
- **API URL** : `/api` (proxy vers `http://localhost:8080`)
- **Devise** : FCFA — Fuseau : Africa/Abidjan
- **Format date** : dd/MM/yyyy
- **Auth** : JWT stocké dans `localStorage` (`boutique_auth_token`)
- **User data** : localStorage (`boutique_user_data`)
- **Route par défaut** : `/sessions/connexion`
- **Hash routing** : activé (`useHash: true`)

---

## Structure des dossiers

```
Alimentation-ges01-payement/
├── src/
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts         ← Routes racines
│   │   ├── app.component.ts
│   │   ├── sharedModule.ts
│   │   │
│   │   ├── shared/                        ← Éléments partagés
│   │   │   ├── shared.module.ts
│   │   │   ├── animations/
│   │   │   ├── components/               ← Composants UI réutilisables
│   │   │   │   ├── btn-loading/
│   │   │   │   ├── chatbot-assistant/
│   │   │   │   ├── customizer/
│   │   │   │   ├── feather-icon/
│   │   │   │   ├── footer/
│   │   │   │   ├── form-wizard/
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── admin-layout-sidebar-large/   ← Layout principal (pages protégées)
│   │   │   │   │   ├── auth-layout/                  ← Layout login/inscription
│   │   │   │   │   └── blank-layout/
│   │   │   │   └── search/
│   │   │   ├── directives/               ← sortable.directive.ts
│   │   │   ├── inmemory-db/
│   │   │   ├── models/                   ← calendar-event.model.ts, country.model.ts
│   │   │   ├── pipes/
│   │   │   ├── data/
│   │   │   └── services/                 ← Tous les services Angular
│   │   │
│   │   └── views/
│   │       ├── pages/                    ← Pages métier (protégées par AuthGuard)
│   │       ├── sessions/                 ← Pages auth (publiques)
│   │       └── ui-kits/                  ← Composants UI de démonstration
│   │
│   ├── assets/
│   │   ├── fonts/nunito/
│   │   ├── images/faces|layouts|products|screenshots/
│   │   └── styles/app|iconsmind|vendor/bootstrap
│   │
│   └── environments/
│       └── environment.ts
│
├── angular.json
├── package.json
└── CARTOGRAPHIE.md                       ← Ce fichier
```

---

## Pages métier (`views/pages/`)

| Dossier | Composant | Service utilisé | Route |
|---|---|---|---|
| `boutiques/` | `BoutiqueSettingsComponent` | `boutique.service.ts` | `pages/boutiques` |
| `caisse-ges/` | `CaisseGesComponent` | `caisse.service.ts` | `pages/caisse-ges` |
| `clients/` | `ClientsComponent` | `client.service.ts` | `pages/clients` |
| `comptes/` | `ComptesComponent` | `compte.service.ts` | `pages/comptes` |
| `dettes-anciennes/` | `DettesAnciennesComponent` | `dette-ancienne.service.ts` | `pages/dettes-anciennes` |
| `factures/` | `FacturesComponent` | `facture.service.ts` | `pages/factures` |
| `inventaire/` | `InventaireComponent` | `inventaire.service.ts` | `pages/inventaire` |
| `produit/` | `ProduitComponent` | `product.service.ts` | `pages/produit` |
| `profil/` | `ProfilComponent` | `user.service.ts` | `pages/profil` |
| `rapports/` | `RapportsComponent` | `rapport.service.ts` | `pages/rapports` |
| `vendeur/` | `VendeurComponent` | `user.service.ts` | `pages/vendeur` |
| `ventes/` | `VentesComponent` | `vente.service.ts` | `pages/ventes` |
| `employes/` | `EmployesComponent` | `employe.service.ts` | `pages/employes` |
| `paiement-employe/` | `PaiementEmployeComponent` | `paiement-employe.service.ts` | `pages/paiement-employe` |

---

## Pages authentification (`views/sessions/`)

| Dossier | Route | Service |
|---|---|---|
| `connexion/` | `sessions/connexion` | `auth.service.ts` |
| `inscription/` | `sessions/inscription` | `auth.service.ts` |
| `forgot/` | `sessions/forgot` | `auth.service.ts` |

---

## Services (`shared/services/`)

| Fichier | Rôle |
|---|---|
| `auth.service.ts` | Login / logout / gestion token JWT |
| `auth.guard.ts` | Guard de routes protégées |
| `auth.interceptor.ts` | Injection du token JWT dans les requêtes HTTP |
| `boutique.service.ts` | API paramètres boutique |
| `caisse.service.ts` | API caisse & opérations |
| `client.service.ts` | API clients |
| `compte.service.ts` | API comptes bancaires |
| `dette-ancienne.service.ts` | API dettes anciennes |
| `facture.service.ts` | API factures |
| `inventaire.service.ts` | API inventaire & stock |
| `paiement.service.ts` | API paiements |
| `product.service.ts` | API produits & catégories |
| `rapport.service.ts` | API rapports (journalier/hebdo/mensuel) |
| `vente.service.ts` | API ventes & retours |
| `user.service.ts` | API utilisateurs & vendeurs |
| `ImportExcelService.ts` | Import fichiers Excel |
| `notification.service.ts` | Notifications toast |
| `navigation.service.ts` | Navigation & menu sidebar |
| `local-store.service.ts` | Wrapper localStorage |
| `customizer.service.ts` | Thème / apparence |
| `search.service.ts` | Recherche globale |
| `sidebar-helper.service.ts` | Contrôle sidebar |
| `data-layer.service.ts` | Couche données partagée |
| `country.service.ts` | Liste des pays |

---

## Routing (résumé)

```
/  →  redirect  →  sessions/connexion
/sessions/**      →  AuthLayoutComponent  (public)
/pages/**         →  AdminLayoutSidebarLargeComponent  (AuthGuard requis)
/**               →  redirect  →  others/404
```

---

## Modules Angular principaux

| Module | Fichier | Rôle |
|---|---|---|
| `AppModule` | `app.module.ts` | Module racine |
| `AppRoutingModule` | `app-routing.module.ts` | Routing principal |
| `PagesModule` | `views/pages/pages.module.ts` | Module lazy-loaded des pages métier |
| `SessionsModule` | `views/sessions/sessions.module.ts` | Module lazy-loaded des sessions |
| `SharedModule` | `shared/shared.module.ts` | Composants/directives partagés |
| `SharedComponentsModule` | `shared/components/shared-components.module.ts` | Composants UI réutilisables |

---

## UI Kits disponibles (`views/ui-kits/`)

`accordions`, `alerts`, `badges`, `buttons`, `buttons-loading`, `card-metrics`, `card-widgets`, `cards`, `cards-ecommerce`, `loaders`, `modals`, `popover`, `rating`

---

## Dépendances clés (package.json)

- `@angular/*` 19.x
- `@ng-bootstrap/ng-bootstrap` — modals, pagination, highlights
- `ngx-pagination` — pagination tables
- `feather-icons` — icônes
- `bootstrap` — CSS framework

---

## Points clés à retenir

- Toutes les requêtes HTTP passent par `auth.interceptor.ts` qui ajoute le header `Authorization: Bearer <token>`.
- Le proxy Angular (`proxy.config.json`) redirige `/api/*` vers `http://localhost:8080/*`.
- `AuthGuard` bloque les routes `/pages/**` si aucun token valide en localStorage.
- L'application utilise le **lazy loading** : `PagesModule` et `SessionsModule` chargés à la demande.
- Pas de state management global (NgRx) — les composants communiquent via services.
