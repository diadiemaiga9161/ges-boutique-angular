import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VenteService } from './vente.service';

/**
 * Suivi léger du tuto de démarrage (Étape 1 : premier produit — Étape 2 : première
 * vente) — jamais bloquant, disparaît dès que la vraie donnée existe. Pas de nouvelle
 * table/colonne côté serveur : juste un drapeau local pour éviter de rappeler l'API
 * une fois qu'on sait que la boutique a déjà au moins une vente.
 */
@Injectable({ providedIn: 'root' })
export class TutorielDemarrageService {
  private readonly CLE_A_DES_VENTES = 'tuto_demarrage_boutique_a_des_ventes';

  constructor(private venteService: VenteService) {}

  get boutiqueADejaUneVenteConnue(): boolean {
    try {
      return localStorage.getItem(this.CLE_A_DES_VENTES) === '1';
    } catch {
      return false;
    }
  }

  marquerBoutiqueADesVentes(): void {
    try {
      localStorage.setItem(this.CLE_A_DES_VENTES, '1');
    } catch { /* stockage indisponible : sans conséquence, juste un re-check plus tard */ }
  }

  /**
   * Vérifie une seule fois (puis mémorisé) si la boutique a déjà fait au moins une
   * vente, tous statuts confondus — évite de proposer l'étape 2 du tuto à une
   * boutique qui a en fait déjà un historique (ex: réinstallation de l'appli).
   */
  verifierSiVentesExistantes(): Observable<boolean> {
    if (this.boutiqueADejaUneVenteConnue) {
      return of(true);
    }
    const debut = '2020-01-01';
    const fin = new Date().toISOString().split('T')[0];
    return this.venteService.getVentesParPeriode(debut, fin).pipe(
      map(ventes => {
        const aDesVentes = (ventes?.length || 0) > 0;
        if (aDesVentes) this.marquerBoutiqueADesVentes();
        return aDesVentes;
      }),
      catchError(() => of(false))
    );
  }
}
