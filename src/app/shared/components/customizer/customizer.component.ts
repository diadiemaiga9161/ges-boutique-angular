import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { NavigationService } from "../../services/navigation.service";
import { CustomizerService } from "../../services/customizer.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
    selector: "app-customizer",
    templateUrl: "./customizer.component.html",
    styleUrls: ["./customizer.component.scss"],
    standalone: false
})
export class CustomizerComponent implements OnInit, OnDestroy {
  isOpen: boolean = false;
  nav;
  layouts: any[];
  routeInterceptorSub: Subscription;
  colors = [];
  isRTL: boolean;
  constructor(
    public navService: NavigationService,
    public customizer: CustomizerService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.nav = [...this.navService.getDefaultMenu()];
    this.layouts = this.customizer.layouts;
    this.colors = this.customizer.colors;
    // console.log(this.customizer.selectedLayout)
    // console.log(this.router.url)
    if (!this.customizer.selectedLayout) {
      this.layouts.forEach(layout => {
        if (this.router.url?.includes(layout.name)) {
          this.selectLayout(layout);
        }
      });
    }
    if (!this.customizer.selectedSidebarColor) {
      this.colors.forEach(color => {
        if (color.active) {
          this.selectSidebarColor(color);
        }
      });
    }
    
  }
  ngOnDestroy() {}

  selectLayout(selectedLayout) {
    this.customizer.selectedLayout = selectedLayout;
    this.customizer.modifySidebarUrls(this.nav, selectedLayout.name);
    // this.navService.menuItems.next(this.nav);
    this.changeLayoutRoute(selectedLayout.name);
    // reset color on layout change
    if (this.customizer.selectedSidebarColor) {
        this.selectSidebarColor(this.customizer.selectedSidebarColor);
    }
  }

  selectSidebarColor(color) {
    setTimeout(() => {
      // Try to scope query to this component first to avoid global collisions
      let adminWrap: any = null;
      try {
        if (this.elementRef && this.elementRef.nativeElement) {
          adminWrap = this.elementRef.nativeElement.querySelector('.app-admin-wrap') || document.querySelector('.app-admin-wrap');
        } else {
          adminWrap = document.querySelector('.app-admin-wrap');
        }
      } catch (e) {
        adminWrap = document.querySelector('.app-admin-wrap');
      }
      let selectedColor = { ...this.customizer.selectedSidebarColor };
      this.customizer.removeClass(adminWrap, selectedColor.sidebarClass);
      this.customizer.addClass(adminWrap, color.sidebarClass);
      this.customizer.selectedSidebarColor = color;
    }, 40);
  }

  changeLayoutRoute(route) {
    let currentRoute = this.router.url;
    let changedRoute = this.customizer.replaceUrlString(route, currentRoute);
    this.router.navigateByUrl(changedRoute);
  }

  toggleDir() {
      this.customizer.toggleDir(this.isRTL);
  }
}
