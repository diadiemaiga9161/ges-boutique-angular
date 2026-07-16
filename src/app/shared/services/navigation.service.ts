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
        { name: 'Produits',            type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
        { name: 'Ventes',              type: 'link', icon: 'i-Money-2',                     state: '/vente' },
        { name: 'Règlement crédits',   type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
        { name: 'Commandes',           type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
        // --- Clients ---
        { name: 'Clients',             type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
        { name: 'Partenaires',         type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
        // --- Suivi ---
        { name: 'Inventaire',          type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
        { name: 'Rapport',             type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
        // --- Compte ---
        { name: 'Profil',              type: 'link', icon: 'i-Administrator',               state: '/profile' },
        { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
    ];

    private adminMenu: IMenuItem[] = [
        // --- Opérations quotidiennes ---
        { name: 'Produits',            type: 'link', icon: 'i-Clothing-Store',              state: '/produit' },
        { name: 'Ventes',              type: 'link', icon: 'i-Money-2',                     state: '/vente' },
        { name: 'Caisse',              type: 'link', icon: 'i-Cash-register-2',             state: '/caisse' },
        { name: 'Factures',            type: 'link', icon: 'i-Receipt-3',                   state: '/facture' },
        { name: 'Règlement crédits',   type: 'link', icon: 'i-Credit-Card',                 state: '/reglement-credits' },
        { name: 'Commandes',           type: 'link', icon: 'i-File-Clipboard-File--Text',   state: '/commandes' },
        // --- Clients ---
        { name: 'Clients',             type: 'link', icon: 'i-Business-ManWoman',           state: '/client' },
        { name: 'Partenaires',         type: 'link', icon: 'i-Business-ManWoman',           state: '/partenaires' },
        { name: 'Dettes',              type: 'link', icon: 'i-Money-2',                     state: '/dettes' },
        // --- Stock ---
        { name: 'Inventaire',          type: 'link', icon: 'i-Bar-Chart',                   state: '/inventaire' },
        { name: 'Transferts',          type: 'link', icon: 'i-Arrow-Right',                 state: '/transferts' },
        // --- Finances ---
        { name: 'Rapport',             type: 'link', icon: 'i-Receipt-4',                   state: '/rapport' },
        { name: 'Bénéfices',           type: 'link', icon: 'i-Money-2',                     state: '/benefices' },
        { name: 'Dépenses',            type: 'link', icon: 'i-Billing',                     state: '/depenses' },
        { name: 'Résultat net',        type: 'link', icon: 'i-Line-Chart',                  state: '/resultat-net' },
        { name: 'Comptes',             type: 'link', icon: 'i-University',                  state: '/comptes' },
        { name: 'Mobile Money',        type: 'link', icon: 'i-Money-Bag',                   state: '/mobile-money' },
        { name: 'Dépôt garde',         type: 'link', icon: 'i-Safe-Box',                    state: '/depot-garde' },
        // --- Fournisseurs ---
        { name: 'Fournisseurs',        type: 'link', icon: 'i-Business-Man',                state: '/fournisseurs' },
        { name: 'Objectif fournisseur',type: 'link', icon: 'i-Target',                      state: '/objectif-fournisseur' },
        { name: 'Bonus fournisseurs',  type: 'link', icon: 'i-Gift-Box',                    state: '/bonus-fournisseurs' },
        // --- Ressources humaines ---
        { name: 'Employés',            type: 'link', icon: 'i-Business-Man',                state: '/employes' },
        { name: 'Paiement employé',    type: 'link', icon: 'i-Money-Bag',                   state: '/paiement-employe' },
        { name: 'Vendeurs',            type: 'link', icon: 'i-Administrator',               state: '/vendeur' },
        // --- Administration ---
        { name: 'Boutique',            type: 'link', icon: 'i-Shop-2',                      state: '/boutique' },
        { name: 'Design facture',      type: 'link', icon: 'i-Pen-2',                       state: '/facture-design' },
        { name: 'Annulation paiements',type: 'link', icon: 'i-Remove',                      state: '/annulation-paiements' },
        // { name: 'Promotions',          type: 'link', icon: 'i-Tag-2',                       state: '/promotions' }, // gérer depuis l'app mobile
        // --- Intelligence Artificielle ---
        { name: 'Intelligence IA',     type: 'link', icon: 'i-Idea-5',                      state: '/ia' },
        { name: 'Profil',              type: 'link', icon: 'i-Administrator',               state: '/profile' },
        { name: 'En savoir plus',      type: 'link', icon: 'i-Information',                 state: '/ressources' },
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
