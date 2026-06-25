import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ResultatNetService, ResultatNet } from '../../../shared/services/resultat-net.service';
import { TranslateModule } from '@ngx-translate/core';

type Periode = 'JOURNALIER' | 'MENSUEL' | 'ANNUEL';

@Component({
  selector: 'app-resultat-net',
  templateUrl: './resultat-net.component.html',
  styleUrls: ['./resultat-net.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class ResultatNetComponent implements OnInit, OnDestroy {

  periodeActive: Periode = 'MENSUEL';
  isLoading = false;
  data: ResultatNet | null = null;
  erreur = '';

  dateJour = new Date().toISOString().split('T')[0];
  moisSelect = new Date().getMonth() + 1;
  anneeSelect = new Date().getFullYear();

  annees = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  mois = [
    { v: 1, l: 'Janvier' }, { v: 2, l: 'Février' }, { v: 3, l: 'Mars' },
    { v: 4, l: 'Avril' },   { v: 5, l: 'Mai' },     { v: 6, l: 'Juin' },
    { v: 7, l: 'Juillet' }, { v: 8, l: 'Août' },    { v: 9, l: 'Septembre' },
    { v: 10, l: 'Octobre'}, { v: 11, l: 'Novembre'},{ v: 12, l: 'Décembre' }
  ];

  private subs: Subscription[] = [];

  constructor(private resultatService: ResultatNetService) {}

  ngOnInit(): void { this.charger(); }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  selectionner(p: Periode): void {
    this.periodeActive = p;
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.erreur = '';
    this.data = null;

    const obs$ = this.periodeActive === 'JOURNALIER'
      ? this.resultatService.getJournalier(this.dateJour)
      : this.periodeActive === 'MENSUEL'
      ? this.resultatService.getMensuel(this.moisSelect, this.anneeSelect)
      : this.resultatService.getAnnuel(this.anneeSelect);

    const sub = obs$.subscribe({
      next: d => { this.data = d; this.isLoading = false; },
      error: e => { this.erreur = e.message; this.isLoading = false; }
    });
    this.subs.push(sub);
  }

  fmt(v: number): string { return this.resultatService.formatPrice(v); }

  get pctBonus(): number {
    if (!this.data || this.data.benefices + this.data.bonusFournisseurs === 0) return 0;
    return Math.round((this.data.bonusFournisseurs / (this.data.benefices + this.data.bonusFournisseurs)) * 100);
  }

  get pctDepenses(): number {
    if (!this.data || this.data.benefices + this.data.bonusFournisseurs === 0) return 0;
    return Math.round((this.data.depenses / (this.data.benefices + this.data.bonusFournisseurs)) * 100);
  }
}
