import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { BoutiqueService } from './boutique.service';
import { RoleService } from './role.service';

export interface IMenuItem {
    id?: string;
    title?: string;
    description?: string;
    type: string;       // Possible values: link/dropDown/extLink
    name?: string;      // Used as display text for item and title for separator type
    state?: string;     // Router state
    icon?: string;      // Material icon name
    tooltip?: string;   // Tooltip text
    disabled?: boolean; // If true, item will not be appeared in sidenav.
    sub?: IChildItem[]; // Dropdown items
    badges?: IBadge[];
    active?: boolean;
}
export interface IChildItem {
    id?: string;
    parentId?: string;
    type?: string;
    name: string;       // Display text
    state?: string;     // Router state
    icon?: string;
    sub?: IChildItem[];
    active?: boolean;
}

interface IBadge {
    color: string;      // primary/accent/warn/hex color codes(#fff000)
    value: string;      // Display text
}

interface ISidebarState {
    sidenavOpen?: boolean;
    childnavOpen?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    public sidebarState: ISidebarState = {
        sidenavOpen: true,
        childnavOpen: false
    };
    selectedItem: IMenuItem;

    // Regroupement purement visuel/navigationnel : mêmes routes (state),
    // mêmes items, mêmes conditions de rôle qu'avant — seule la présentation
    // en sous-menus change, pour que l'utilisateur retrouve plus vite ce
    // qu'il cherche au lieu d'une liste plate de ~20-28 liens.
    // "name" utilise la clé i18n "XXX.TITLE" de la page ciblée (celle que la
    // page elle-même utilise pour son titre), définie dans les 8 fichiers de
    // langue (src/assets/i18n/*.json). Pas de namespace "NAV.*" dédié : quand
    // aucune page ne porte déjà le même libellé (ex. "Rapport" au singulier
    // dans le menu vs "Rapports" au pluriel en titre de page), une clé courte
    // séparée existe (SHOP, REPORT, ORDERS, CREDIT_PAYMENT, PROFILE_MENU,
    // DEBTS_MENU, SELLERS_MENU) pour ne pas changer le texte affiché. Les
    // noms de catégories (dropDown) n'ont pas de clé dédiée aujourd'hui, donc
    // restent en français pour l'instant.
    private vendeurMenu: IMenuItem[] = [
        {
            name: 'Opérations', type: 'dropDown', icon: 'i-Cash-register-2', sub: [
                { name: 'PRODUCTS.TITLE',      type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
                { name: 'SALES.TITLE',         type: 'link', icon: 'i-Money-2',                     state: '/vente' },
                { name: 'CREDIT_PAYMENT.TITLE',type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
                { name: 'ORDERS.TITLE',        type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
            ]
        },
        {
            name: 'Clients', type: 'dropDown', icon: 'i-Business-ManWoman', sub: [
                { name: 'CLIENTS.TITLE',       type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
                { name: 'PARTENAIRES.TITLE',   type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
            ]
        },
        {
            name: 'Suivi', type: 'dropDown', icon: 'i-Bar-Chart', sub: [
                { name: 'INVENTORY.TITLE',     type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
                { name: 'REPORT.TITLE',        type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
            ]
        },
        {
            name: 'Compte', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'PROFILE_MENU.TITLE',  type: 'link', icon: 'i-Administrator',               state: '/profile' },
                { name: 'Mes primes',          type: 'link', icon: 'i-Gift-Box',                    state: '/mes-primes' },
                { name: 'Mode entraînement',   type: 'link', icon: 'i-Student-Hat-2',                 state: '/entrainement' },
                { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
            ]
        },
    ];

    private adminMenu: IMenuItem[] = [
        {
            name: 'Opérations', type: 'dropDown', icon: 'i-Cash-register-2', sub: [
                { name: 'PRODUCTS.TITLE',      type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
                { name: 'SALES.TITLE',         type: 'link', icon: 'i-Money-2',                     state: '/vente' },
                { name: 'CAISSE.TITLE',        type: 'link', icon: 'i-Cash-register-2',             state: '/caisse' },
                { name: 'INVOICES.TITLE',      type: 'link', icon: 'i-Receipt-3',                   state: '/facture' },
                { name: 'CREDIT_PAYMENT.TITLE',type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
                { name: 'ORDERS.TITLE',        type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
            ]
        },
        {
            name: 'Clients', type: 'dropDown', icon: 'i-Business-ManWoman', sub: [
                { name: 'CLIENTS.TITLE',       type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
                { name: 'Clients à rappeler',  type: 'link', icon: 'i-Telephone',                   state: '/clients-absents' },
                { name: 'PARTENAIRES.TITLE',   type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
                { name: 'DEBTS_MENU.TITLE',    type: 'link', icon: 'i-Money-2',                     state: '/dettes' },
            ]
        },
        {
            name: 'Stock', type: 'dropDown', icon: 'i-Bar-Chart', sub: [
                { name: 'INVENTORY.TITLE',     type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
                { name: 'Étiquettes de prix',  type: 'link', icon: 'i-Tag-3',                       state: '/etiquettes' },
                { name: 'Offres par quantité', type: 'link', icon: 'i-Gift-Box',                    state: '/offres-quantite' },
                { name: 'TRANSFERS.TITLE',     type: 'link', icon: 'i-Arrow-Right',                 state: '/transferts' },
            ]
        },
        {
            name: 'Finances', type: 'dropDown', icon: 'i-Line-Chart', sub: [
                { name: 'REPORT.TITLE',        type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
                { name: 'BENEFITS.TITLE',      type: 'link', icon: 'i-Money-2',                     state: '/benefices' },
                { name: 'EXPENSES.TITLE',      type: 'link', icon: 'i-Billing',                     state: '/depenses' },
                { name: 'NET_RESULT.TITLE',    type: 'link', icon: 'i-Line-Chart',                  state: '/resultat-net' },
                { name: 'Comptes',             type: 'link', icon: 'i-University',                  state: '/comptes' },
                { name: 'MOBILE_MONEY.TITLE',  type: 'link', icon: 'i-Money-Bag',                   state: '/mobile-money' },
                { name: 'SAFE.TITLE',          type: 'link', icon: 'i-Safe-Box',                    state: '/depot-garde' },
            ]
        },
        {
            name: 'Fournisseurs', type: 'dropDown', icon: 'i-Business-Man', sub: [
                { name: 'SUPPLIERS.TITLE',     type: 'link', icon: 'i-Business-Man',                state: '/fournisseurs' },
                { name: 'SUPPLIER_OBJ.TITLE',  type: 'link', icon: 'i-Target',                      state: '/objectif-fournisseur' },
                { name: 'SUPPLIER_BONUS.TITLE',type: 'link', icon: 'i-Gift-Box',                    state: '/bonus-fournisseurs' },
            ]
        },
        {
            name: 'Ressources humaines', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'EMPLOYEES.TITLE',     type: 'link', icon: 'i-Business-Man',                state: '/employes' },
                { name: 'Pointage',            type: 'link', icon: 'i-Clock',                       state: '/pointage' },
                { name: 'Planning',            type: 'link', icon: 'i-Calendar-4',                  state: '/planning' },
                { name: 'EMPLOYEE_PAY.TITLE',  type: 'link', icon: 'i-Money-Bag',                   state: '/paiement-employe' },
                { name: 'SELLERS_MENU.TITLE',  type: 'link', icon: 'i-Administrator',               state: '/vendeur' },
                { name: 'Classement des vendeurs', type: 'link', icon: 'i-Medal-2',                 state: '/classement-vendeurs' },
                { name: 'SELLER_BONUS.TITLE',  type: 'link', icon: 'i-Gift-Box',                    state: '/objectifs-vendeur' },
                { name: 'Primes sur produits', type: 'link', icon: 'i-Medal-2',                     state: '/primes-produits' },
            ]
        },
        {
            name: 'Administration', type: 'dropDown', icon: 'i-Gear', sub: [
                { name: 'SHOP.TITLE',          type: 'link', icon: 'i-Shop-2',                      state: '/boutique' },
                { name: 'INVOICE_DESIGN.TITLE',type: 'link', icon: 'i-Pen-2',                       state: '/facture-design' },
                { name: 'Annulation paiements',type: 'link', icon: 'i-Remove',                      state: '/annulation-paiements' },
                { name: 'Paramètres',          type: 'link', icon: 'i-Gear',                        state: '/parametres' },
                { name: 'Rôles et permissions', type: 'link', icon: 'i-Lock-2',                     state: '/roles' },
                { name: 'JOURNAL_AUDIT.TITLE', type: 'link', icon: 'i-Data-Shield',                 state: '/journal-audit' },
                { name: 'EXPORT.TITLE',        type: 'link', icon: 'i-File-Download',               state: '/export-donnees' },
                { name: 'BACKUP.TITLE',        type: 'link', icon: 'i-Data-Backup',                 state: '/sauvegardes' },
                { name: 'Fonctionnalités (super admin)', type: 'link', icon: 'i-Shield-2',           state: '/super-admin/fonctionnalites' },
                // { name: 'Promotions',          type: 'link', icon: 'i-Tag-2',                       state: '/promotions' }, // gérer depuis l'app mobile
            ]
        },
        // Intelligence Artificielle (dashboard + assistant IA, onglet "Assistant IA" dans la page)
        { name: 'Intelligence IA',     type: 'link', icon: 'i-Assistant',                   state: '/ia' },
        {
            name: 'Compte', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'PROFILE_MENU.TITLE',  type: 'link', icon: 'i-Administrator',               state: '/profile' },
                { name: 'Mes primes',          type: 'link', icon: 'i-Gift-Box',                    state: '/mes-primes' },
                { name: 'Mode entraînement',   type: 'link', icon: 'i-Student-Hat-2',                 state: '/entrainement' },
                { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
            ]
        },
    ];

    menuItems = new BehaviorSubject<IMenuItem[]>([]);
    menuItems$ = this.menuItems.asObservable();

    // Fonctionnalités désactivables par le super admin (Boutique > Paramètres) —
    // masque l'entrée de menu correspondante ; le vrai blocage (si quelqu'un
    // tape l'URL directement, ou via l'API) est fait côté serveur.
    private featureTransfertsActif = true;

    // Fonctionnalités avancées (système séparé, voir FonctionnaliteAvancee côté
    // backend) — associe chaque clé à l'état de menu correspondant.
    private readonly etatParCleAvancee: Record<string, string | string[]> = {
        DEPOT_GARDE: '/depot-garde',
        DETTES_ANCIENNES: '/dettes',
        COMPTES_BANCAIRES: '/comptes',
        PROMOTIONS: '/promotions',
        MOBILE_MONEY: '/mobile-money',
        BONUS_FOURNISSEURS: '/bonus-fournisseurs',
        OBJECTIFS_FOURNISSEUR: '/objectif-fournisseur',
        OBJECTIFS_VENDEUR: '/objectifs-vendeur',
        RAPPORTS: '/rapport',
        IA: '/ia',
        RESULTAT_NET: '/resultat-net',
        ROLES_PERSONNALISES: '/roles',
        PRIMES_PRODUITS: ['/primes-produits', '/mes-primes'],
        POINTAGE: '/pointage',
        OFFRES_QUANTITE: '/offres-quantite',
        CLIENTS_ABSENTS: '/clients-absents',
        PLANNING: '/planning',
        MODE_ENTRAINEMENT: '/entrainement'
    };
    private etatsAvancesDesactives = new Set<string>();

    // Permissions vendeur (système générique séparé des fonctionnalités avancées ci-dessus) —
    // accordées par n'importe quel ADMIN (voir Boutique > Paramètres). Aujourd'hui une seule
    // clé existe : INVENTAIRE_LECTURE (accès lecture seule du VENDEUR à /inventaire).
    private permissionInventaireLectureActive = false;

    constructor(private authService: AuthService, private boutiqueService: BoutiqueService,
                private roleService: RoleService) {
        // Rôles personnalisés (Caissier...) : masque les pages que le rôle ne peut pas voir.
        this.roleService.mesPermissions$.subscribe(() => this.publishNavigationForCurrentUser());
        this.authService.currentUser$.subscribe(() => {
            this.publishNavigationForCurrentUser();
        });
        this.boutiqueService.info$.subscribe(info => {
            this.featureTransfertsActif = info.featureTransfertsActif !== false;
            this.publishNavigationForCurrentUser();
        });
        this.boutiqueService.fonctionnalitesAvancees$.subscribe(liste => {
            this.etatsAvancesDesactives = new Set(
                liste.filter(f => !f.actif).flatMap(f => ([] as string[]).concat(this.etatParCleAvancee[f.cle] || []))
            );
            this.publishNavigationForCurrentUser();
        });
        this.boutiqueService.permissionsVendeur$.subscribe(liste => {
            this.permissionInventaireLectureActive = liste.find(p => p.cle === 'INVENTAIRE_LECTURE')?.actif === true;
            this.publishNavigationForCurrentUser();
        });
        this.publishNavigationForCurrentUser();
    }

    /** Retire les entrées liées à une fonctionnalité désactivée (state ciblé), sans
     *  toucher au reste de l'arborescence (dropDown, sous-menus, items simples). */
    private filtrerFonctionnalites(menu: IMenuItem[]): IMenuItem[] {
        const etatsMasques = new Set<string>(this.etatsAvancesDesactives);
        if (!this.featureTransfertsActif) etatsMasques.add('/transferts');
        // Page super admin — visible uniquement pour le compte promu (flag super_admin
        // en base, voir AuthService.isSuperAdmin) ; masqué pour ADMIN/VENDEUR classiques.
        if (!this.authService.isSuperAdmin()) etatsMasques.add('/super-admin/fonctionnalites');
        if (etatsMasques.size === 0) return menu;

        return menu
            .map(item => item.sub
                ? { ...item, sub: item.sub.filter(s => !etatsMasques.has(s.state || '')) }
                : item)
            .filter(item => !(item.state && etatsMasques.has(item.state)));
    }

    /** Retire l'entrée /inventaire du menu VENDEUR tant que l'ADMIN n'a pas accordé la
     *  permission INVENTAIRE_LECTURE (système séparé de filtrerFonctionnalites ci-dessus). */
    private appliquerPermissionInventaire(menu: IMenuItem[]): IMenuItem[] {
        if (this.permissionInventaireLectureActive) return menu;
        // Vendeur dont le rôle fait les entrées/sorties de stock : il voit aussi l'inventaire.
        if (this.roleService?.rolesActifs && this.roleService.peut('STOCK', 'GERER')) return menu;
        return menu
            .map(item => item.sub
                ? { ...item, sub: item.sub.filter(s => s.state !== '/inventaire') }
                : item)
            .filter(item => item.state !== '/inventaire');
    }

    /** Retire les pages que le rôle personnalisé de la personne ne permet pas de voir. */
    private appliquerRole(menu: IMenuItem[]): IMenuItem[] {
        if (!this.roleService) return menu;
        return menu
            .map(item => item.sub
                ? { ...item, sub: item.sub.filter(s => this.roleService.peutVoirPage(s.state || '')) }
                : item)
            .filter(item => !(item.state && !this.roleService.peutVoirPage(item.state)))
            .filter(item => !item.sub || item.sub.length > 0);
    }

    publishNavigationForCurrentUser() {
        const user = this.authService.getUser();

        if (!user || !user.role || !this.authService.isAuthenticated()) {
            this.menuItems.next([]);
            return;
        }

        if (this.authService.isAdmin()) {
            this.menuItems.next(this.appliquerRole(this.filtrerFonctionnalites(this.adminMenu)));
            return;
        }

        if (this.authService.isVendeur()) {
            let menu = this.filtrerFonctionnalites(this.vendeurMenu);
            menu = this.appliquerPermissionInventaire(menu);
            this.menuItems.next(this.appliquerRole(menu));
            return;
        }

        this.menuItems.next(this.appliquerPermissionInventaire(this.filtrerFonctionnalites(this.vendeurMenu)));
    }

    // Méthode publique pour accéder au menu par défaut (pour compatibilité)
    getDefaultMenu(): IMenuItem[] {
        return [...this.adminMenu];
    }
}
