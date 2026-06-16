import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InscriptionComponent } from './inscription/inscription.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: 'inscription',
    component: InscriptionComponent
  },
  {
    path: 'connexion',
    component: ConnexionComponent
  },
  {
    path: 'boutique-settings',
    loadComponent: () => import('../pages/boutiques/boutique-settings.component').then(m => m.BoutiqueSettingsComponent)
  },
  {
    path: 'forgot',
    component: ForgotComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule { }
