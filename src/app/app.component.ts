import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BoutiqueService } from './shared/services/boutique.service';
import { WebSocketService } from './shared/services/websocket.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'bootDash';

  constructor(
    private boutiqueService: BoutiqueService,
    private titleService: Title,
    private ws: WebSocketService,
    // Injecté ici pour forcer l'initialisation du thème (clair/sombre/auto)
    // dès le démarrage de l'application, avant tout affichage de page.
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.boutiqueService.info$.subscribe(info => {
      if (info.nom) {
        this.titleService.setTitle(info.nom);
      }
      const logoUrl = this.boutiqueService.getLogoPath();
      this.updateFavicon(logoUrl);
    });
    // Connexion WebSocket globale dès le démarrage de l'app
    this.ws.connect();
  }

  private updateFavicon(logoUrl: string): void {
    if (!logoUrl) return;
    const link: HTMLLinkElement =
      (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
      document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = logoUrl;
    document.head.appendChild(link);
  }
}
