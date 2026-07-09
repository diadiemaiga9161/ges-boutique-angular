import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

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

    private vendeurMenu: IMenuItem[] = [
        // --- Opérations ---
        { name: 'NAV.PRODUCTS',        type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
        { name: 'NAV.SALES',           type: 'link', icon: 'i-Money-2',                     state: '/vente' },
        { name: 'NAV.CREDIT_PAYMENT',  type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
        { name: 'NAV.ORDERS',          type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
        // --- Clients ---
        { name: 'NAV.CLIENTS',         type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
        { name: 'NAV.PARTNERS',        type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
        // --- Suivi ---
        { name: 'NAV.INVENTORY',       type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
        { name: 'NAV.REPORT',          type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
        // --- Compte ---
        { name: 'NAV.PROFILE',         type: 'link', icon: 'i-Administrator',               state: '/profile' },
    ];

    private adminMenu: IMenuItem[] = [
        // --- Opérations quotidiennes ---
        { name: 'NAV.PRODUCTS',      type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
        { name: 'NAV.SALES',         type: 'link', icon: 'i-Money-2',                     state: '/vente' },
        { name: 'NAV.CAISSE',        type: 'link', icon: 'i-Cash-register-2',             state: '/caisse' },
        { name: 'NAV.INVOICES',      type: 'link', icon: 'i-Receipt-3',                   state: '/facture' },
        { name: 'NAV.CREDIT_PAYMENT',type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
        { name: 'NAV.ORDERS',        type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
        // --- Clients ---
        { name: 'NAV.CLIENTS',       type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
        { name: 'NAV.PARTNERS',      type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
        { name: 'NAV.DEBTS',         type: 'link', icon: 'i-Money-2',                     state: '/dettes' },
        // --- Stock ---
        { name: 'NAV.INVENTORY',     type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
        { name: 'NAV.TRANSFERS',     type: 'link', icon: 'i-Arrow-Right',                 state: '/transferts' },
        // --- Finances ---
        { name: 'NAV.REPORT',        type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
        { name: 'NAV.BENEFITS',      type: 'link', icon: 'i-Money-2',                     state: '/benefices' },
        { name: 'NAV.EXPENSES',      type: 'link', icon: 'i-Billing',                     state: '/depenses' },
        { name: 'NAV.NET_RESULT',    type: 'link', icon: 'i-Line-Chart',                  state: '/resultat-net' },
        { name: 'NAV.BANK',          type: 'link', icon: 'i-University',                  state: '/comptes' },
        { name: 'NAV.MOBILE_MONEY',  type: 'link', icon: 'i-Money-Bag',                   state: '/mobile-money' },
        { name: 'NAV.SAFE',          type: 'link', icon: 'i-Safe-Box',                    state: '/depot-garde' },
        // --- Fournisseurs ---
        { name: 'NAV.SUPPLIERS',     type: 'link', icon: 'i-Business-Man',                state: '/fournisseurs' },
        { name: 'NAV.SUPPLIER_OBJ',  type: 'link', icon: 'i-Target',                      state: '/objectif-fournisseur' },
        { name: 'NAV.SUPPLIER_BONUS',type: 'link', icon: 'i-Gift-Box',                    state: '/bonus-fournisseurs' },
        // --- Ressources humaines ---
        { name: 'NAV.EMPLOYEES',     type: 'link', icon: 'i-Business-Man',                state: '/employes' },
        { name: 'NAV.EMPLOYEE_PAY',  type: 'link', icon: 'i-Money-Bag',                   state: '/paiement-employe' },
        { name: 'NAV.SELLERS',       type: 'link', icon: 'i-Administrator',               state: '/vendeur' },
        // --- Administration ---
        { name: 'NAV.SHOP',          type: 'link', icon: 'i-Shop-2',                      state: '/boutique' },
        { name: 'NAV.INVOICE_DESIGN',type: 'link', icon: 'i-Pen-2',                       state: '/facture-design' },
        // { name: 'NAV.PROMO',         type: 'link', icon: 'i-Tag-2',                       state: '/promotions' }, // gérer depuis l'app mobile
        { name: 'NAV.PROFILE',       type: 'link', icon: 'i-Administrator',               state: '/profile' },
    ];

    menuItems = new BehaviorSubject<IMenuItem[]>([]);
    menuItems$ = this.menuItems.asObservable();

    constructor(private authService: AuthService) {
        this.authService.currentUser$.subscribe(() => {
            this.publishNavigationForCurrentUser();
        });
        this.publishNavigationForCurrentUser();
    }

    publishNavigationForCurrentUser() {
        const user = this.authService.getUser();

        if (!user || !user.role || !this.authService.isAuthenticated()) {
            this.menuItems.next([]);
            return;
        }

        if (this.authService.isAdmin()) {
            this.menuItems.next(this.adminMenu);
            return;
        }

        if (this.authService.isVendeur()) {
            this.menuItems.next(this.vendeurMenu);
            return;
        }

        this.menuItems.next(this.vendeurMenu);
    }

    // Méthode publique pour accéder au menu par défaut (pour compatibilité)
    getDefaultMenu(): IMenuItem[] {
        return [...this.adminMenu];
    }
}
