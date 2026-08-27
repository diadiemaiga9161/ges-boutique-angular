import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  isTutorielVendeurVu,
  marquerTutorielVendeurVu
} from '../utils/tutoriel-vendeur.util';

/**
 * Service de coordination du tutoriel d'accueil vendeur.
 *
 * Ne fait aucun appel HTTP : encapsule uniquement la lecture/écriture de la
 * clé locale (voir `tutoriel-vendeur.util.ts`) et fournit un canal pour
 * qu'un composant éloigné (ex: la page Profil) puisse demander la
 * réouverture manuelle de l'overlay affiché dans le layout principal.
 */
@Injectable({ providedIn: 'root' })
export class TutorielVendeurService {

  /** Émis quand un composant demande d'afficher (ou réafficher) le tutoriel. */
  private readonly demandeOuvertureSubject = new Subject<void>();
  readonly demandeOuverture$ = this.demandeOuvertureSubject.asObservable();

  estDejaVu(userId: number): boolean {
    return isTutorielVendeurVu(userId);
  }

  marquerVu(userId: number): void {
    marquerTutorielVendeurVu(userId);
  }

  /** Demande l'ouverture de l'overlay (ex: lien "Revoir le tutoriel" du Profil). */
  demanderOuverture(): void {
    this.demandeOuvertureSubject.next();
  }
}
