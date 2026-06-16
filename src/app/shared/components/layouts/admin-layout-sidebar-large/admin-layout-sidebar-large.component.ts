import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { Router, RouteConfigLoadStart, ResolveStart, RouteConfigLoadEnd, ResolveEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
      public authService: AuthService
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
    }

}
