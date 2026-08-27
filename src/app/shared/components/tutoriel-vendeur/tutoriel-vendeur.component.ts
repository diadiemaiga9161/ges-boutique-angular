import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BoutiqueService } from '../../services/boutique.service';
import { TutorielVendeurService } from '../../services/tutoriel-vendeur.service';

/**
 * Tutoriel d'accueil pour un nouveau vendeur (overlay plein écran, 3 étapes).
 *
 * Affiché automatiquement une seule fois lors de la première connexion d'un
 * utilisateur avec le rôle VENDEUR (jamais ADMIN), sur la base de la clé
 * locale `tutoriel_vendeur_vu_{userId}` (voir `tutoriel-vendeur.util.ts`).
 * Peut aussi être rouvert manuellement à tout moment via
 * `TutorielVendeurService.demanderOuverture()` (lien "Revoir le tutoriel"
 * dans le Profil), sans toucher à la clé locale.
 *
 * 100% frontend : aucun appel HTTP, aucune dépendance backend.
 */
@Component({
  selector: 'app-tutoriel-vendeur',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tutoriel-vendeur.component.html',
  styleUrls: ['./tutoriel-vendeur.component.scss']
})
export class TutorielVendeurComponent implements OnInit, OnDestroy {

  readonly totalEtapes = 3;

  visible = false;
  etape = 1;

  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private boutiqueService: BoutiqueService,
    private tutorielService: TutorielVendeurService
  ) {}

  ngOnInit(): void {
    // Affichage automatique : uniquement pour un VENDEUR qui n'a jamais vu le tutoriel.
    const user = this.auth.getUser();
    if (user && this.auth.isVendeur() && !this.tutorielService.estDejaVu(user.id)) {
      this.ouvrir();
    }

    // Réouverture manuelle demandée depuis une autre page (ex: Profil).
    this.sub = this.tutorielService.demandeOuverture$.subscribe(() => this.ouvrir());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get progression(): number {
    return (this.etape / this.totalEtapes) * 100;
  }

  get userNom(): string {
    return this.auth.getDisplayName();
  }

  get roleLabel(): string {
    return this.auth.getFormattedRole();
  }

  get boutiqueNom(): string {
    return this.boutiqueService.getInfo()?.nom || '';
  }

  ouvrir(): void {
    this.etape = 1;
    this.visible = true;
  }

  suivant(): void {
    if (this.etape < this.totalEtapes) {
      this.etape++;
    } else {
      this.terminer();
    }
  }

  precedent(): void {
    if (this.etape > 1) {
      this.etape--;
    }
  }

  /** Croix de fermeture : équivalente à "Compris" — marque aussi comme vu. */
  fermer(): void {
    this.terminer();
  }

  terminer(): void {
    const user = this.auth.getUser();
    if (user) {
      this.tutorielService.marquerVu(user.id);
    }
    this.visible = false;
  }
}
