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
        {
            name: 'Produit',
            description: 'Parcourir les produits de votre boutique',
            type: 'link',
            icon: 'i-Clothing-Store',
            state: '/pages/produit'
        },
        {
            name: 'Vente',
            description: 'Accéder au point de vente',
            type: 'link',
            icon: 'i-Money-2',
            state: '/pages/vente'
        },
        {
            name: 'Profil',
            description: 'Gérer votre profil vendeur',
            type: 'link',
            icon: 'i-Administrator',
            state: '/pages/profile'
        },
           {
            name: 'Clients',
            description: 'Gérer les comptes vendeurs',
            type: 'link',
            icon: 'i-Business-ManWoman',
            state: '/pages/client'
        },
    ];

    private adminMenu: IMenuItem[] = [
        {
            name: 'Produit',
            description: 'Parcourir les produits de la boutique',
            type: 'link',
            icon: 'i-Clothing-Store',
            state: '/pages/produit'
        },
        {
            name: 'Rapport',
            description: 'Voir les rapports détaillés',
            type: 'link',
            icon: 'i-Receipt-4',
            state: '/pages/rapport'
        },
        {
            name: 'Bénéfices',
            description: 'Voir les bénéfices par période',
            type: 'link',
            icon: 'i-Money-2',
            state: '/pages/benefices'
        },
        {
            name: 'Transferts',
            description: 'Transférer des produits entre boutiques',
            type: 'link',
            icon: 'i-Arrow-Right',
            state: '/pages/transferts'
        },
        {
            name: 'Vente',
            description: 'Accéder au point de vente',
            type: 'link',
            icon: 'i-Money-2',
            state: '/pages/vente'
        },
         {
            name: 'Factures',
            description: 'Consulter et gérer le stock',
            type: 'link',
            icon: 'i-Receipt-3',
            state: '/pages/facture'
        },
        {
            name: 'Caisse',
            description: 'Gérer la caisse et les paiements',
            type: 'link',
            icon: 'i-Cash-register-2',
            state: '/pages/caisse'
        },
        {
            name: 'Inventaire',
            description: 'Consulter et gérer le stock',
            type: 'link',
            icon: 'i-Bar-Chart',
            state: '/pages/inventaire'
        },
        {
            name: 'Vendeurs',
            description: 'Gérer les comptes vendeurs',
            type: 'link',
            icon: 'i-Administrator',
            state: '/pages/vendeur'
        },

        {
            name: 'Clients',
            description: 'Gérer les comptes vendeurs',
            type: 'link',
            icon: 'i-Business-ManWoman',
            state: '/pages/client'
        },
        {
            name: 'Dettes',
            description: 'Gérer les dettes des clients',
            type: 'link',
            icon: 'i-Money-2',
            state: '/pages/dettes'
        },

        {
            name: 'Banque',
            description: 'Gérer les comptes bancaires',
            type: 'link',
            icon: 'i-University',
            state: '/pages/comptes'
        },
        {
            name: 'Boutique',
            description: 'Paramètres de la boutique',
            type: 'link',
            icon: 'i-Shop-2',
            state: '/pages/boutique'
        },

       
        {
            name: 'Employés',
            description: 'Gérer les employés',
            type: 'link',
            icon: 'i-Business-Man',
            state: '/pages/employes'
        },
        {
            name: 'Paiement Employés',
            description: 'Payer les salaires des employés',
            type: 'link',
            icon: 'i-Money-Bag',
            state: '/pages/paiement-employe'
        },
        {
            name: 'Dépôts Garde',
            description: 'Argent confié par des tiers pour garde',
            type: 'link',
            icon: 'i-Safe-Box',
            state: '/pages/depot-garde'
        },
        {
            name: 'Objectifs Fournisseurs',
            description: 'Suivi quantités et bonus par objectif mensuel',
            type: 'link',
            icon: 'i-Target',
            state: '/pages/objectif-fournisseur'
        },
        {
            name: 'Bonus Fournisseurs',
            description: 'Ristournes, bonus volume, primes objectif',
            type: 'link',
            icon: 'i-Gift-Box',
            state: '/pages/bonus-fournisseurs'
        },
        {
            name: 'Dépenses',
            description: 'Enregistrer les dépenses de la boutique',
            type: 'link',
            icon: 'i-Billing',
            state: '/pages/depenses'
        },
        {
            name: 'Résultat Net',
            description: 'Bénéfices + Bonus − Dépenses = Gain ou Perte',
            type: 'link',
            icon: 'i-Line-Chart',
            state: '/pages/resultat-net'
        },
        {
            name: 'Fournisseurs',
            description: 'Gestion des fournisseurs, achats et situation',
            type: 'link',
            icon: 'i-Business-Man',
            state: '/pages/fournisseurs'
        },
         {
            name: 'Profil',
            description: 'Mon profil et paramètres',
            type: 'link',
            icon: 'i-Administrator',
            state: '/pages/profile'
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
