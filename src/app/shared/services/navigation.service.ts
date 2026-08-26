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

    // Regroupement purement visuel/navigationnel : mêmes routes (state),
    // mêmes items, mêmes conditions de rôle qu'avant — seule la présentation
    // en sous-menus change, pour que l'utilisateur retrouve plus vite ce
    // qu'il cherche au lieu d'une liste plate de ~20-28 liens.
    // "name" utilise une clé i18n "NAV.XXX" quand elle existe dans les 8
    // fichiers de langue (src/assets/i18n/*.json) ; sinon on garde le texte
    // français en dur (le pipe |translate ne fait alors rien — c'est son
    // comportement standard face à une chaîne qui n'est pas une clé — donc
    // aucun risque d'affichage cassé, juste pas encore traduit dans les 7
    // autres langues). Les noms de catégories (dropDown) n'ont pas de clé
    // dédiée aujourd'hui, donc restent en français pour l'instant.
    private vendeurMenu: IMenuItem[] = [
        {
            name: 'Opérations', type: 'dropDown', icon: 'i-Cash-register-2', sub: [
                { name: 'NAV.PRODUCTS',        type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
                { name: 'NAV.SALES',           type: 'link', icon: 'i-Money-2',                     state: '/vente' },
                { name: 'NAV.CREDIT_PAYMENT',  type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
                { name: 'NAV.ORDERS',          type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
            ]
        },
        {
            name: 'Clients', type: 'dropDown', icon: 'i-Business-ManWoman', sub: [
                { name: 'NAV.CLIENTS',         type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
                { name: 'NAV.PARTNERS',        type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
            ]
        },
        {
            name: 'Suivi', type: 'dropDown', icon: 'i-Bar-Chart', sub: [
                { name: 'NAV.INVENTORY',       type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
                { name: 'NAV.REPORT',          type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
            ]
        },
        {
            name: 'Compte', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'NAV.PROFILE',         type: 'link', icon: 'i-Administrator',               state: '/profile' },
                { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
            ]
        },
    ];

    private adminMenu: IMenuItem[] = [
        {
            name: 'Opérations', type: 'dropDown', icon: 'i-Cash-register-2', sub: [
                { name: 'NAV.PRODUCTS',        type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
                { name: 'NAV.SALES',           type: 'link', icon: 'i-Money-2',                     state: '/vente' },
                { name: 'NAV.CAISSE',          type: 'link', icon: 'i-Cash-register-2',             state: '/caisse' },
                { name: 'NAV.INVOICES',        type: 'link', icon: 'i-Receipt-3',                   state: '/facture' },
                { name: 'NAV.CREDIT_PAYMENT',  type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
                { name: 'NAV.ORDERS',          type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
            ]
        },
        {
            name: 'Clients', type: 'dropDown', icon: 'i-Business-ManWoman', sub: [
                { name: 'NAV.CLIENTS',         type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
                { name: 'NAV.PARTNERS',        type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
                { name: 'NAV.DEBTS',           type: 'link', icon: 'i-Money-2',                     state: '/dettes' },
            ]
        },
        {
            name: 'Stock', type: 'dropDown', icon: 'i-Bar-Chart', sub: [
                { name: 'NAV.INVENTORY',       type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
                { name: 'NAV.TRANSFERS',       type: 'link', icon: 'i-Arrow-Right',                 state: '/transferts' },
            ]
        },
        {
            name: 'Finances', type: 'dropDown', icon: 'i-Line-Chart', sub: [
                { name: 'NAV.REPORT',          type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
                { name: 'NAV.BENEFITS',        type: 'link', icon: 'i-Money-2',                     state: '/benefices' },
                { name: 'NAV.EXPENSES',        type: 'link', icon: 'i-Billing',                     state: '/depenses' },
                { name: 'NAV.NET_RESULT',      type: 'link', icon: 'i-Line-Chart',                  state: '/resultat-net' },
                { name: 'Comptes',             type: 'link', icon: 'i-University',                  state: '/comptes' },
                { name: 'NAV.MOBILE_MONEY',    type: 'link', icon: 'i-Money-Bag',                   state: '/mobile-money' },
                { name: 'NAV.SAFE',            type: 'link', icon: 'i-Safe-Box',                    state: '/depot-garde' },
            ]
        },
        {
            name: 'Fournisseurs', type: 'dropDown', icon: 'i-Business-Man', sub: [
                { name: 'NAV.SUPPLIERS',       type: 'link', icon: 'i-Business-Man',                state: '/fournisseurs' },
                { name: 'NAV.SUPPLIER_OBJ',    type: 'link', icon: 'i-Target',                      state: '/objectif-fournisseur' },
                { name: 'NAV.SUPPLIER_BONUS',  type: 'link', icon: 'i-Gift-Box',                    state: '/bonus-fournisseurs' },
            ]
        },
        {
            name: 'Ressources humaines', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'NAV.EMPLOYEES',       type: 'link', icon: 'i-Business-Man',                state: '/employes' },
                { name: 'NAV.EMPLOYEE_PAY',    type: 'link', icon: 'i-Money-Bag',                   state: '/paiement-employe' },
                { name: 'NAV.SELLERS',         type: 'link', icon: 'i-Administrator',               state: '/vendeur' },
                { name: 'NAV.SELLER_BONUS',    type: 'link', icon: 'i-Gift-Box',                    state: '/objectifs-vendeur' },
            ]
        },
        {
            name: 'Administration', type: 'dropDown', icon: 'i-Gear', sub: [
                { name: 'NAV.SHOP',            type: 'link', icon: 'i-Shop-2',                      state: '/boutique' },
                { name: 'NAV.INVOICE_DESIGN',  type: 'link', icon: 'i-Pen-2',                       state: '/facture-design' },
                { name: 'Annulation paiements',type: 'link', icon: 'i-Remove',                      state: '/annulation-paiements' },
                { name: 'Paramètres',          type: 'link', icon: 'i-Gear',                        state: '/parametres' },
                // { name: 'Promotions',          type: 'link', icon: 'i-Tag-2',                       state: '/promotions' }, // gérer depuis l'app mobile
            ]
        },
        // Intelligence Artificielle (dashboard + assistant IA, onglet "Assistant IA" dans la page)
        { name: 'Intelligence IA',     type: 'link', icon: 'i-Assistant',                   state: '/ia' },
        {
            name: 'Compte', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'NAV.PROFILE',         type: 'link', icon: 'i-Administrator',               state: '/profile' },
                { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
            ]
        },
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
