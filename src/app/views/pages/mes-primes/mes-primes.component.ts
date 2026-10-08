import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionService, MesPrimes, RegleCommission } from '../../../shared/services/commission.service';

type Periode = 'mois' | 'mois-dernier' | 'annee';

/** Primes du vendeur connecté : ce qu'il a gagné, ce qui lui reste à recevoir, et ce qui rapporte. */
@Component({
  selector: 'app-mes-primes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-primes.component.html',
  styleUrls: ['./mes-primes.component.scss']
})
export class MesPrimesComponent implements OnInit {
  periode: Periode = 'mois';
  donnees: MesPrimes | null = null;
  chargement = true;
  erreur = '';

  constructor(public cs: CommissionService) {}

  ngOnInit(): void {
    this.choisir('mois');
  }

  choisir(p: Periode): void {
    this.periode = p;
    const auj = new Date();
    let debut: Date, fin: Date;
    if (p === 'mois') {
      debut = new Date(auj.getFullYear(), auj.getMonth(), 1);
      fin = new Date(auj.getFullYear(), auj.getMonth() + 1, 0);
    } else if (p === 'mois-dernier') {
      debut = new Date(auj.getFullYear(), auj.getMonth() - 1, 1);
      fin = new Date(auj.getFullYear(), auj.getMonth(), 0);
    } else {
      debut = new Date(auj.getFullYear(), 0, 1);
      fin = new Date(auj.getFullYear(), 11, 31);
    }
    this.charger(CommissionService.iso(debut), CommissionService.iso(fin));
  }

  charger(debut: string, fin: string): void {
    this.chargement = true;
    this.erreur = '';
    this.cs.mesPrimes(debut, fin).subscribe({
      next: d => { this.donnees = d; this.chargement = false; },
      error: err => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Impossible de charger vos primes.';
      }
    });
  }

  progression(r: RegleCommission): number {
    if (!r.quantiteObjectif) return 0;
    return Math.min(100, Math.round(((r.quantiteVendue || 0) / r.quantiteObjectif) * 100));
  }

  reste(r: RegleCommission): number {
    return Math.max(0, (r.quantiteObjectif || 0) - (r.quantiteVendue || 0));
  }

  cible(r: RegleCommission): string {
    return r.produitNom || (r.categorieNom ? `Catégorie ${r.categorieNom}` : '');
  }
}
