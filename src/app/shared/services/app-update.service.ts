import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

/** Vérifie périodiquement si une nouvelle version de l'appli a été déployée sur le
 *  serveur, et propose à l'utilisateur de recharger — sans quoi le service worker
 *  continue de servir l'ancienne version en cache indéfiniment après un déploiement. */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly INTERVALLE_VERIFICATION_MS = 6 * 60 * 60 * 1000; // 6h

  constructor(private swUpdate: SwUpdate) {}

  init(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
    ).subscribe(() => this.proposerMiseAJour());

    setInterval(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
    }, this.INTERVALLE_VERIFICATION_MS);
  }

  private proposerMiseAJour(): void {
    Swal.fire({
      icon: 'info',
      title: 'Nouvelle version disponible',
      text: 'Une mise à jour de l\'application est prête. Recharger maintenant ?',
      showCancelButton: true,
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Plus tard',
      confirmButtonColor: '#1a56db'
    }).then(async result => {
      if (result.isConfirmed) {
        // Vide aussi le cache de données du service worker (dataGroups de
        // ngsw-config.json : /api/produits, /api/clients... jusqu'à 2h) — sinon
        // la nouvelle version de l'appli peut réafficher une réponse API mise
        // en cache par l'ANCIENNE version, potentiellement dans un format qui a
        // changé entre les deux (nouveaux champs, etc.).
        await this.viderCacheDonnees();
        document.location.reload();
      }
    });
  }

  private async viderCacheDonnees(): Promise<void> {
    try {
      const noms = await caches.keys();
      await Promise.all(noms.filter(n => n.includes('ngsw:')).map(n => caches.delete(n)));
    } catch { /* pas grave si ça échoue, le reload reste utile seul */ }
  }
}
