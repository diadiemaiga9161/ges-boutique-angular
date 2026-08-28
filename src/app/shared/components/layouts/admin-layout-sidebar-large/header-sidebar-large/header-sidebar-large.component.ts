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
import Swal from 'sweetalert2';

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

  // ==================== COMMANDES VITRINE EN ATTENTE ====================
  commandeVitrineCount = 0;
  private wsSubCommandes?: Subscription;
  private commandesVitrineVues = new Set<number>();

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
    this.wsSubCommandes?.unsubscribe();
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
    // Commandes vitrine en attente (popup, cf. commentaire de la méthode)
    this.connecterWebSocketCommandes();
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

  // ==================== COMMANDES VITRINE EN ATTENTE ====================
  // Double filet : le topic WebSocket donne un popup quasi instantané si l'appli est
  // déjà ouverte ; le contrôle au chargement (verifierCommandesVitrineEnAttente, appelé
  // ici puis toutes les 60s) rattrape celles arrivées pendant que personne n'était
  // connecté — c'est ce contrôle qui répond à "même si la personne n'est pas connectée,
  // quand elle revient on lui dit qu'il y a des commandes en attente".

  private connecterWebSocketCommandes(): void {
    this.wsService.connect();
    const boutiqueId = this.boutiqueService.getInfo().id || 0;
    if (boutiqueId > 0) {
      const topic = `/topic/commandes/${boutiqueId}`;
      this.wsSubCommandes = this.wsService.subscribeTopic(topic).subscribe(() => {
        this.verifierCommandesVitrineEnAttente();
      });
    }
    this.verifierCommandesVitrineEnAttente();
  }

  private verifierCommandesVitrineEnAttente(): void {
    this.http.get<any[]>(`${this.apiUrl}/commandes/vitrine-en-attente`).subscribe({
      next: (commandes) => {
        const liste = commandes || [];
        this.commandeVitrineCount = liste.length;
        const nouvelles = liste.filter(c => !this.commandesVitrineVues.has(c.id));
        if (nouvelles.length > 0) {
          nouvelles.forEach(c => this.commandesVitrineVues.add(c.id));
          this.afficherPopupCommandesVitrine(nouvelles, liste.length);
        }
      },
      error: () => {
        // silencieux — pas de popup si l'API est indisponible (ex: pas encore connecté)
      }
    });
  }

  private afficherPopupCommandesVitrine(nouvelles: any[], totalEnAttente: number): void {
    const liste = nouvelles.map(c =>
      `<div style="text-align:left;padding:6px 0;border-bottom:1px solid #e8eef8">
        <strong>${c.numeroCommande || ''}</strong> — ${c.clientNom || ''} ${c.clientPrenom || ''}
        <div style="font-size:.8rem;color:#64748b">${(c.lignes || []).length} produit(s)</div>
      </div>`
    ).join('');

    Swal.fire({
      icon: 'info',
      title: nouvelles.length > 1 ? `${nouvelles.length} nouvelles commandes en ligne !` : 'Nouvelle commande en ligne !',
      html: `${liste}<div style="margin-top:10px;font-size:.85rem;color:#64748b">
              ${totalEnAttente} commande(s) au total en attente de traitement.
             </div>`,
      confirmButtonText: 'Voir les commandes',
      showCancelButton: true,
      cancelButtonText: 'Plus tard'
    }).then(r => {
      if (r.isConfirmed) {
        this.router.navigate(['/commandes']);
      }
    });
  }

}
