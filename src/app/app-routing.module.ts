import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from '../../src/app/shared/services/auth.guard';
import { BlankLayoutComponent } from './shared/components/layouts/blank-layout/blank-layout.component';
import { AdminLayoutSidebarLargeComponent } from './shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component';

const adminRoutes: Routes = [

    {
      path: 'pages',
      loadChildren: () => import('./views/pages/pages.module').then(m => m.PagesModule)
    },
  ];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sessions/connexion',
    pathMatch: 'full'
  },
   {
    path: 'inscription',
    redirectTo: 'sessions/inscription',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
      }
    ]
  },

  {
    path: '',
    component: AdminLayoutSidebarLargeComponent,
    canActivate: [AuthGuard],
    children: adminRoutes
  },
  {
    path: '**',
    redirectTo: 'others/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
