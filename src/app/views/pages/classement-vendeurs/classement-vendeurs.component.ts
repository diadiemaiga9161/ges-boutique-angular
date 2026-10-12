import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassementVendeurs, LigneClassementVendeur, RapportService } from '../../../shared/services/rapport.service';

type Periode = 'semaine' | 'mois' | 'mois-dernier' | 'perso';

/** Classement des vendeurs : réservé au gérant (menu Ressources humaines). */
@Component({
  selector: 'app-classement-vendeurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classement-vendeurs.component.html',
  styleUrls: ['./classement-vendeurs.component.scss']
})
export class ClassementVendeursComponent implements OnInit {
  periode: Periode = 'mois';
  dateDebut = '';
  dateFin = '';
  chargement = false;
  erreur = '';
  donnees: ClassementVendeurs | null = null;

  readonly periodes: { cle: Periode; libelle: string }[] = [
    { cle: 'semaine', libelle: 'Cette semaine' },
    { cle: 'mois', libelle: 'Ce mois-ci' },
    { cle: 'mois-dernier', libelle: 'Mois dernier' },
    { cle: 'perso', libelle: 'Autre période' }
  ];

  constructor(private rapportService: RapportService) {}

  ngOnInit(): void {
    this.choisir('mois');
  }

  get podium(): LigneClassementVendeur[] {
    return (this.donnees?.vendeurs ?? []).filter(v => v.chiffreAffaires > 0).slice(0, 3);
  }

  choisir(p: Periode): void {
    this.periode = p;
    const auj = new Date();
    if (p === 'semaine') {
      const lundi = new Date(auj);
      lundi.setDate(auj.getDate() - ((auj.getDay() + 6) % 7));
      this.dateDebut = this.iso(lundi);
      this.dateFin = this.iso(auj);
    } else if (p === 'mois') {
      this.dateDebut = this.iso(new Date(auj.getFullYear(), auj.getMonth(), 1));
      this.dateFin = this.iso(auj);
    } else if (p === 'mois-dernier') {
      this.dateDebut = this.iso(new Date(auj.getFullYear(), auj.getMonth() - 1, 1));
      this.dateFin = this.iso(new Date(auj.getFullYear(), auj.getMonth(), 0));
    }
    if (p !== 'perso') this.charger();
  }

  charger(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.chargement = true;
    this.erreur = '';
    this.rapportService.getClassementVendeurs(this.dateDebut, this.dateFin).subscribe({
      next: d => { this.donnees = d; this.chargement = false; },
      error: () => { this.erreur = 'Impossible de charger le classement. Réessayez.'; this.chargement = false; }
    });
  }

  /** Part du chiffre d'affaires total, au dixième près (« 99,9 »). */
  part(v: LigneClassementVendeur): string {
    const total = this.donnees?.totalChiffreAffaires || 0;
    const p = total > 0 ? Math.round((v.chiffreAffaires / total) * 1000) / 10 : 0;
    return p.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  }

  prix(v: number | null | undefined): string {
    return Math.round(v || 0).toLocaleString('fr-FR') + ' F';
  }

  private iso(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const j = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${j}`;
  }
}
