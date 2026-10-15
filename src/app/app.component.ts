import { ModeEntrainementService } from './shared/services/mode-entrainement.service';
import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BoutiqueService } from './shared/services/boutique.service';
import { WebSocketService } from './shared/services/websocket.service';
import { ThemeService } from './shared/services/theme.service';
import { AppUpdateService } from './shared/services/app-update.service';
import { AuthService } from './shared/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  entrainement = inject(ModeEntrainementService);
  title = 'bootDash';

  constructor(
    private boutiqueService: BoutiqueService,
    private titleService: Title,
    private ws: WebSocketService,
    // Injecté ici pour forcer l'initialisation du thème (clair/sombre/auto)
    // dès le démarrage de l'application, avant tout affichage de page.
    private themeService: ThemeService,
    private appUpdateService: AppUpdateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.boutiqueService.info$.subscribe(info => {
      if (info.nom) {
        this.titleService.setTitle(info.nom);
      }
      // Le favicon (icône d'onglet) reste volontairement le logo GesLafia défini dans
      // index.html — il identifie le logiciel, pas la boutique. Ne jamais le remplacer
      // par le logo uploadé par une boutique ici (voir sidebar/header/footer pour ça).
    });
    // Connexion WebSocket globale dès le démarrage de l'app
    this.ws.connect();
    // Détecte les nouvelles versions déployées et propose de recharger
    this.appUpdateService.init();
    // Rafraîchit le profil utilisateur stocké localement depuis le serveur au
    // démarrage — une session ouverte AVANT l'ajout d'un champ (ex: superAdmin)
    // gardait sinon un objet utilisateur incomplet en cache indéfiniment, sans
    // qu'aucune reconnexion manuelle ne soit jamais demandée à l'utilisateur.
    if (this.authService.isAuthenticated()) {
      this.authService.getCurrentProfile().subscribe({ error: () => {} });
    }
  }
}
