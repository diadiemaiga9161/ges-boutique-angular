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
                { name: 'PARTENAIRES.TITLE',   type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
                { name: 'DEBTS_MENU.TITLE',    type: 'link', icon: 'i-Money-2',                     state: '/dettes' },
            ]
        },
        {
            name: 'Stock', type: 'dropDown', icon: 'i-Bar-Chart', sub: [
                { name: 'INVENTORY.TITLE',     type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
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
                { name: 'EMPLOYEE_PAY.TITLE',  type: 'link', icon: 'i-Money-Bag',                   state: '/paiement-employe' },
                { name: 'SELLERS_MENU.TITLE',  type: 'link', icon: 'i-Administrator',               state: '/vendeur' },
                { name: 'SELLER_BONUS.TITLE',  type: 'link', icon: 'i-Gift-Box',                    state: '/objectifs-vendeur' },
            ]
        },
        {
            name: 'Administration', type: 'dropDown', icon: 'i-Gear', sub: [
                { name: 'SHOP.TITLE',          type: 'link', icon: 'i-Shop-2',                      state: '/boutique' },
                { name: 'INVOICE_DESIGN.TITLE',type: 'link', icon: 'i-Pen-2',                       state: '/facture-design' },
                { name: 'Annulation paiements',type: 'link', icon: 'i-Remove',                      state: '/annulation-paiements' },
                { name: 'Paramètres',          type: 'link', icon: 'i-Gear',                        state: '/parametres' },
                { name: 'JOURNAL_AUDIT.TITLE', type: 'link', icon: 'i-Data-Shield',                 state: '/journal-audit' },
                { name: 'EXPORT.TITLE',        type: 'link', icon: 'i-File-Download',               state: '/export-donnees' },
                { name: 'BACKUP.TITLE',        type: 'link', icon: 'i-Data-Backup',                 state: '/sauvegardes' },
                // { name: 'Promotions',          type: 'link', icon: 'i-Tag-2',                       state: '/promotions' }, // gérer depuis l'app mobile
            ]
        },
        // Intelligence Artificielle (dashboard + assistant IA, onglet "Assistant IA" dans la page)
        { name: 'Intelligence IA',     type: 'link', icon: 'i-Assistant',                   state: '/ia' },
        {
            name: 'Compte', type: 'dropDown', icon: 'i-Administrator', sub: [
                { name: 'PROFILE_MENU.TITLE',  type: 'link', icon: 'i-Administrator',               state: '/profile' },
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
