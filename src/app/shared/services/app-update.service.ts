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
    }).then(result => {
      if (result.isConfirmed) {
        document.location.reload();
      }
    });
  }
}
