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
        { name: 'NAV.PRODUCTS',        type: 'link', icon: 'i-Clothing-Store',   state: '/pages/produit' },
        { name: 'NAV.SALES',           type: 'link', icon: 'i-Money-2',           state: '/pages/vente' },
        { name: 'NAV.CREDIT_PAYMENT',  type: 'link', icon: 'i-Credit-Card',       state: '/pages/reglement-credits' },
        { name: 'NAV.ORDERS',          type: 'link', icon: 'i-File-Clipboard-File--Text', state: '/pages/commandes' },
        { name: 'NAV.PROFILE',         type: 'link', icon: 'i-Administrator',     state: '/pages/profile' },
        { name: 'NAV.CLIENTS',         type: 'link', icon: 'i-Business-ManWoman', state: '/pages/client' },
    ];

    private adminMenu: IMenuItem[] = [
        { name: 'NAV.PRODUCTS',      type: 'link', icon: 'i-Clothing-Store',   state: '/pages/produit' },
        { name: 'NAV.REPORT',        type: 'link', icon: 'i-Receipt-4',         state: '/pages/rapport' },
        { name: 'NAV.BENEFITS',      type: 'link', icon: 'i-Money-2',           state: '/pages/benefices' },
        { name: 'NAV.TRANSFERS',     type: 'link', icon: 'i-Arrow-Right',       state: '/pages/transferts' },
        { name: 'NAV.SALES',         type: 'link', icon: 'i-Money-2',           state: '/pages/vente' },
        { name: 'NAV.INVOICES',      type: 'link', icon: 'i-Receipt-3',         state: '/pages/facture' },
        { name: 'NAV.CAISSE',        type: 'link', icon: 'i-Cash-register-2',   state: '/pages/caisse' },
        { name: 'NAV.CREDIT_PAYMENT',type: 'link', icon: 'i-Credit-Card',       state: '/pages/reglement-credits' },
        { name: 'NAV.ORDERS',        type: 'link', icon: 'i-File-Clipboard-File--Text', state: '/pages/commandes' },
        { name: 'NAV.INVENTORY',     type: 'link', icon: 'i-Bar-Chart',         state: '/pages/inventaire' },
        { name: 'NAV.SELLERS',       type: 'link', icon: 'i-Administrator',     state: '/pages/vendeur' },
        { name: 'NAV.CLIENTS',       type: 'link', icon: 'i-Business-ManWoman', state: '/pages/client' },
        { name: 'NAV.DEBTS',         type: 'link', icon: 'i-Money-2',           state: '/pages/dettes' },
        { name: 'NAV.BANK',          type: 'link', icon: 'i-University',        state: '/pages/comptes' },
        { name: 'NAV.SHOP',          type: 'link', icon: 'i-Shop-2',            state: '/pages/boutique' },
        { name: 'NAV.EMPLOYEES',     type: 'link', icon: 'i-Business-Man',      state: '/pages/employes' },
        { name: 'NAV.EMPLOYEE_PAY',  type: 'link', icon: 'i-Money-Bag',         state: '/pages/paiement-employe' },
        { name: 'NAV.SAFE',          type: 'link', icon: 'i-Safe-Box',          state: '/pages/depot-garde' },
        { name: 'NAV.SUPPLIER_OBJ',  type: 'link', icon: 'i-Target',            state: '/pages/objectif-fournisseur' },
        { name: 'NAV.SUPPLIER_BONUS',type: 'link', icon: 'i-Gift-Box',          state: '/pages/bonus-fournisseurs' },
        { name: 'NAV.EXPENSES',      type: 'link', icon: 'i-Billing',           state: '/pages/depenses' },
        { name: 'NAV.NET_RESULT',    type: 'link', icon: 'i-Line-Chart',        state: '/pages/resultat-net' },
        { name: 'NAV.SUPPLIERS',     type: 'link', icon: 'i-Business-Man',      state: '/pages/fournisseurs' },
        { name: 'NAV.MOBILE_MONEY',  type: 'link', icon: 'i-Money-Bag',         state: '/pages/mobile-money' },
        { name: 'NAV.INVOICE_DESIGN',type: 'link', icon: 'i-Pen-2',             state: '/pages/facture-design' },
        // { name: 'NAV.PROMO',         type: 'link', icon: 'i-Tag-2',             state: '/pages/promotions' }, // PROMOTIONS désactivées sur web — gérer depuis l'app mobile
        { name: 'NAV.PROFILE',       type: 'link', icon: 'i-Administrator',     state: '/pages/profile' },
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
