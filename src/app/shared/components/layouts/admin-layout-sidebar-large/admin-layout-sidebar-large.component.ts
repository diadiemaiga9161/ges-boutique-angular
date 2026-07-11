import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { Router, RouteConfigLoadStart, ResolveStart, RouteConfigLoadEnd, ResolveEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../services/auth.service';
import { BoutiqueService } from '../../../services/boutique.service';

@Component({
    selector: 'app-admin-layout-sidebar-large',
    templateUrl: './admin-layout-sidebar-large.component.html',
    styleUrls: ['./admin-layout-sidebar-large.component.scss'],
    standalone: false
})
export class AdminLayoutSidebarLargeComponent implements OnInit {

    moduleLoading: boolean;

    constructor(
      public navService: NavigationService,
      public searchService: SearchService,
      private router: Router,
      public authService: AuthService,
      private boutiqueService: BoutiqueService,
      private titleService: Title
    ) { }

    logout(): void {
      this.authService.signout();
    }

    ngOnInit() {
      this.router.events.subscribe(event => {
        if (event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
          this.moduleLoading = true;
        }
        if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
          this.moduleLoading = false;
        }
      });

      this.boutiqueService.info$.subscribe(info => {
        if (info?.nom) {
          const appName = `GesLafia — ${info.nom}`;
          const shortName = info.nom.length > 14 ? info.nom.substring(0, 14) : info.nom;
          this.titleService.setTitle(appName);
          this.updatePwaManifest(appName, shortName);
        }
      });
    }

    private updatePwaManifest(fullName: string, shortName: string): void {
      const manifest = {
        name: fullName,
        short_name: shortName,
        description: 'Application de gestion de boutique',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          { src: 'assets/images/logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/images/logo.png', sizes: '512x512', type: 'image/png' }
        ]
      };
      try {
        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        if (link) link.href = url;
      } catch { /* environnement sans support blob */ }
    }

}
