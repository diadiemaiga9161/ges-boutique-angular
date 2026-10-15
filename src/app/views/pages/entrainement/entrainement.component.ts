import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModeEntrainementService } from '../../../shared/services/mode-entrainement.service';

/** Allumer / éteindre le mode entraînement (ventes « pour du faux »). */
@Component({
  selector: 'app-entrainement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entrainement.component.html',
  styleUrls: ['./entrainement.component.scss']
})
export class EntrainementComponent {
  constructor(public entrainement: ModeEntrainementService, private router: Router) {}

  basculer(): void {
    if (this.entrainement.actif) this.entrainement.desactiver();
    else this.entrainement.activer();
  }

  allerALaCaisse(): void {
    this.router.navigateByUrl('/vente');
  }
}
