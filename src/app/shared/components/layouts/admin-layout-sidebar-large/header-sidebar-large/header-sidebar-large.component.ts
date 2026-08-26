import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../../services/navigation.service';
import { SearchService } from '../../../../services/search.service';
import { AuthService } from '../../../../services/auth.service';
import { LanguageService } from '../../../../services/language.service';

import { Router, NavigationEnd } from "@angular/router";
import { filter, Subscription } from 'rxjs';
import { Utils } from 'src/app/shared/utils';
import { BoutiqueService } from 'src/app/shared/services/boutique.service';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from 'src/app/shared/services/websocket.service';
import { environment } from 'src/environments/environment';

// Topbar sticky façon edumanager. Le state-machine sidenav/childnav de
// l'ancien fly-out a disparu avec lui : ouvrir/fermer la sidebar est
// maintenant un simple bascule de navService.sidebarState.sidenavOpen.
@Component({
    selector: 'app-header-sidebar-large',
    templateUrl: './header-sidebar-large.component.html',
    styleUrls: ['./header-sidebar-large.component.scss'],
    standalone: false
})
export class HeaderSidebarLargeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isLoginFailed = true;
  errorMessage = '';
  User: any;
  profileImageUrl: string = '';
  logoPath: string = 'assets/images/logo.png';
  boutiqueName: string = 'Ges Lafia';
  userPhoto: string | null = null;
  private userSub?: Subscription;
  showLangMenu = false;

  // ==================== BADGE TRANSFERTS ====================
  transfertCount = 0;
  private intervalTransferts?: any;
  private wsSub?: Subscription;
  private readonly apiUrl = environment.apiUrl;

    constructor(
      public searchService: SearchService,
      private router: Router,
      public navService: NavigationService,
      private authService: AuthService,
      private boutiqueService: BoutiqueService,
      public langService: LanguageService,
      private elRef: ElementRef,
      private http: HttpClient,
      private wsService: WebSocketService
    ) { }

    toggelSidebar() {
      this.navService.sidebarState.sidenavOpen = !this.navService.sidebarState.sidenavOpen;
    }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.wsSub?.unsubscribe();
    if (this.intervalTransferts) {
      clearInterval(this.intervalTransferts);
    }
  }

  ngOnInit() {
    this.logoPath = this.boutiqueService.getLogoPath();
    this.boutiqueService.info$.subscribe(info => {
      this.logoPath = info.logo || info.logoPath || 'assets/images/logo.png';
      this.boutiqueName = info.nom || 'Ges Lafia';
    });
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.userPhoto = user?.photo || null;
    });
    // Ferme la sidebar sur mobile après chaque navigation.
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (Utils.isMobile()) {
          this.navService.sidebarState.sidenavOpen = false;
        }
      });

    // Badge transferts en attente
    this.connecterWebSocket();
  }

  get currentUserName(): string {
    return this.authService.getDisplayName();
  }

  get currentUserRole(): string {
    return this.authService.getFormattedRole() || '';
  }

  logout(): void {
    this.authService.signout();
  }

  setLang(code: string): void {
    this.langService.setLanguage(code);
    this.showLangMenu = false;
  }

  toggleLangMenu(event: Event): void {
    event.stopPropagation();
    this.showLangMenu = !this.showLangMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showLangMenu = false;
    }
  }

  // ==================== BADGE TRANSFERTS EN ATTENTE ====================

  private connecterWebSocket(): void {
    // Connexion WebSocket pour mises à jour en temps réel
    this.wsService.connect();
    const boutiqueId = this.boutiqueService.getInfo().id || 0;
    if (boutiqueId > 0) {
      const topic = `/topic/transferts/${boutiqueId}`;
      this.wsSub = this.wsService.subscribeTopic(topic).subscribe(() => {
        // Rafraîchir le compteur à chaque événement WS reçu
        this.verifierTransfertsEnAttente();
      });
    }

    // Premier chargement immédiat + polling toutes les 60 secondes
    this.verifierTransfertsEnAttente();
    this.intervalTransferts = setInterval(() => {
      this.verifierTransfertsEnAttente();
    }, 60000);
  }

  private verifierTransfertsEnAttente(): void {
    this.http.get<any[]>(`${this.apiUrl}/transferts/recus`).subscribe({
      next: (recus) => {
        this.transfertCount = (recus || []).filter(t =>
          t.statut === 'EN_ATTENTE_CONFIRMATION' || t.statut === 'CREE'
        ).length;
      },
      error: () => {
        // silencieux — le badge reste à 0 si l'API est indisponible
      }
    });
  }

}
