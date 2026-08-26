import { Component, OnInit, HostListener } from '@angular/core';
import {
  NavigationService,
  IMenuItem
} from '../../../../services/navigation.service';
import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';
import { Utils } from '../../../../utils';
import { BoutiqueService } from '../../../../services/boutique.service';

// Sidebar fixe (style edumanager) : liste à plat groupée par titres de
// section, plus de fly-out à deux niveaux. L'état actif de chaque lien est
// délégué à routerLinkActive (Router) au lieu d'un recalcul manuel — d'où
// la disparition de setActiveFlag/selectedItem/closeChildNav présents avant.
@Component({
    selector: 'app-sidebar-large',
    templateUrl: './sidebar-large.component.html',
    styleUrls: ['./sidebar-large.component.scss'],
    standalone: false
})
export class SidebarLargeComponent implements OnInit {
  nav: IMenuItem[] = [];
  logoPath: string = 'assets/images/logo.png';
  boutiqueName: string = 'Ges Lafia';

  constructor(public router: Router, public navService: NavigationService, private boutiqueService: BoutiqueService) {

  }

  ngOnInit() {
    this.logoPath = this.boutiqueService.getLogoPath();
    this.boutiqueService.info$.subscribe(info => {
      this.logoPath = info.logo || info.logoPath || 'assets/images/logo.png';
      this.boutiqueName = info.nom || 'Ges Lafia';
    });
    this.updateSidebar();
    // Ferme la sidebar sur mobile après chaque navigation (comportement
    // identique à avant, juste sans la gestion du sous-menu fly-out).
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (Utils.isMobile()) {
          this.navService.sidebarState.sidenavOpen = false;
        }
      });

    this.navService.menuItems$.subscribe(items => {
      this.nav = items;
    });
  }

  onNavigate() {
    if (Utils.isMobile()) {
      this.navService.sidebarState.sidenavOpen = false;
    }
  }

  closeMobile() {
    this.navService.sidebarState.sidenavOpen = false;
  }

  updateSidebar() {
    if (Utils.isMobile()) {
      this.navService.sidebarState.sidenavOpen = false;
    } else {
      this.navService.sidebarState.sidenavOpen = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateSidebar();
  }
}
