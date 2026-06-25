import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfilComponent } from './profil/profil.component';
import { ProduitComponent } from './produit/produit.component';
import { InventaireComponent } from './inventaire/inventaire.component';
import { RapportsComponent } from './rapports/rapports.component';
import { VentesComponent } from './ventes/ventes.component';
import { VendeurComponent } from './vendeur/vendeur.component';
import { CaisseGesComponent } from './caisse-ges/caisse-ges.component';

import { BoutiqueSettingsComponent } from './boutiques/boutique-settings.component';
import { ClientsComponent } from './clients/clients.component';
import { FacturesComponent } from './factures/factures.component';
import { DettesAnciennesComponent } from './dettes-anciennes/dettes-anciennes.component';
import { ComptesComponent } from './comptes/comptes.component';
import { EmployesComponent } from './employes/employes.component';
import { PaiementEmployeComponent } from './paiement-employe/paiement-employe.component';
import { DepensesComponent } from './depenses/depenses.component';
import { DepotGardeComponent } from './depot-garde/depot-garde.component';
import { ObjectifFournisseurComponent } from './objectif-fournisseur/objectif-fournisseur.component';
import { FournisseursComponent } from './fournisseurs/fournisseurs.component';
import { BeneficesComponent } from './benefices/benefices.component';
import { TransfertsComponent } from './transferts/transferts.component';
import { BonusFournisseursComponent } from './bonus-fournisseurs/bonus-fournisseurs.component';
import { ResultatNetComponent } from './resultat-net/resultat-net.component';
import { MobileMoneyComponent } from './mobile-money/mobile-money.component';
import { FactureDesignComponent } from './facture-design/facture-design.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { ReglementCreditsComponent } from './reglement-credits/reglement-credits.component';

const routes: Routes = [
    {
        path: 'profile',
        component: ProfilComponent
    },
     {
        path: 'produit',
        component: ProduitComponent
    },
    {
        path: 'vendeur',
        component: VendeurComponent
    },

     {
        path: 'inventaire',
        component: InventaireComponent
    }, 
    {
        path: 'rapport',
        component: RapportsComponent
    },
     {
        path: 'vente',
        component: VentesComponent
    },
    {
        path: 'caisse',
        component: CaisseGesComponent
    },
    {
        path: 'boutique',
        component: BoutiqueSettingsComponent
    },
    {
        path: 'client',
        component: ClientsComponent
    },
    {
        path: 'facture',
        component: FacturesComponent
    },

    {
        path: 'dettes',
        component: DettesAnciennesComponent
    },
    {
        path: 'comptes',
        component: ComptesComponent
    },
    {
        path: 'employes',
        component: EmployesComponent
    },
    {
        path: 'paiement-employe',
        component: PaiementEmployeComponent
    },
    {
        path: 'depenses',
        component: DepensesComponent
    },
    {
        path: 'depot-garde',
        component: DepotGardeComponent
    },
    {
        path: 'objectif-fournisseur',
        component: ObjectifFournisseurComponent
    },
    {
        path: 'fournisseurs',
        component: FournisseursComponent
    },
    {
        path: 'benefices',
        component: BeneficesComponent
    },
    {
        path: 'transferts',
        component: TransfertsComponent
    },
    {
        path: 'bonus-fournisseurs',
        component: BonusFournisseursComponent
    },
    {
        path: 'resultat-net',
        component: ResultatNetComponent
    },
    {
        path: 'mobile-money',
        component: MobileMoneyComponent
    },
    {
        path: 'facture-design',
        component: FactureDesignComponent
    },
    // { path: 'promotions', component: PromotionsComponent }, // PROMOTIONS désactivées sur web — gérer depuis l'app mobile
    {
        path: 'reglement-credits',
        component: ReglementCreditsComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
