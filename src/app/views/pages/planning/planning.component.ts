import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Case {
  date: string;
  repos: boolean;
  heureDebut: string | null;
  heureFin: string | null;
  note: string | null;
  rempli: boolean;
}

interface LigneEmploye {
  employeId: number;
  nom: string;
  poste: string;
  cases: Case[];
  minutesSemaine: number;
  joursTravail: number;
}

interface Jour {
  date: string;
  nom: string;
  aujourdhui: boolean;
}

interface Semaine {
  debut: string;
  fin: string;
  jours: Jour[];
  employes: LigneEmploye[];
}

interface Edition {
  employe: LigneEmploye;
  index: number;
  repos: boolean;
  heureDebut: string;
  heureFin: string;
  note: string;
  autresJours: boolean[];
}

/** Planning de l'équipe (gérant) : semaine en tableau, une case par employé et par jour. */
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  private readonly api = `${environment.apiUrl}/planning`;
  debut = this.lundi(new Date());
  semaine: Semaine | null = null;
  chargement = false;
  erreur = '';
  message = '';
  edition: Edition | null = null;
  enregistrement = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';
    this.http.get<Semaine>(this.api, { params: { debut: this.debut } }).subscribe({
      next: s => { this.semaine = s; this.chargement = false; },
      error: e => { this.erreur = e?.error?.message || 'Impossible de charger le planning.'; this.chargement = false; }
    });
  }

  changerSemaine(sens: number): void {
    const d = this.versDate(this.debut);
    d.setDate(d.getDate() + 7 * sens);
    this.debut = this.iso(d);
    this.edition = null;
    this.message = '';
    this.charger();
  }

  revenirAujourdhui(): void {
    this.debut = this.lundi(new Date());
    this.edition = null;
    this.charger();
  }

  get titreSemaine(): string {
    if (!this.semaine) return '';
    const f = (iso: string) => this.versDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    return `Semaine du ${f(this.semaine.debut)} au ${f(this.semaine.fin)}`;
  }

  get estSemaineEnCours(): boolean {
    return this.debut === this.lundi(new Date());
  }

  numeroJour(j: Jour): string {
    return String(this.versDate(j.date).getDate());
  }

  duree(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
  }

  // ------------------------------------------------------------------ édition

  ouvrir(e: LigneEmploye, index: number): void {
    const c = e.cases[index];
    const modele = e.cases.find(x => x.rempli && !x.repos);
    this.message = '';
    this.erreur = '';
    this.edition = {
      employe: e,
      index,
      repos: c.repos,
      heureDebut: c.heureDebut || modele?.heureDebut || '08:00',
      heureFin: c.heureFin || modele?.heureFin || '18:00',
      note: c.note || '',
      autresJours: [false, false, false, false, false, false, false]
    };
  }

  enEdition(e: LigneEmploye, i: number): boolean {
    return !!this.edition && this.edition.employe.employeId === e.employeId && this.edition.index === i;
  }

  enregistrer(vider = false): void {
    if (!this.edition || !this.semaine) return;
    const ed = this.edition;
    if (!vider && !ed.repos && (!ed.heureDebut || !ed.heureFin || ed.heureFin <= ed.heureDebut)) {
      this.erreur = 'L\'heure de départ doit être après l\'heure d\'arrivée.';
      return;
    }
    const indices = [ed.index, ...ed.autresJours.map((v, i) => (v ? i : -1)).filter(i => i >= 0 && i !== ed.index)];
    const cellules = indices.map(i => ({
      employeId: ed.employe.employeId,
      date: this.semaine!.jours[i].date,
      repos: vider ? false : ed.repos,
      heureDebut: vider || ed.repos ? null : ed.heureDebut,
      heureFin: vider || ed.repos ? null : ed.heureFin,
      note: vider ? null : ed.note
    }));
    this.enregistrement = true;
    this.erreur = '';
    this.http.put(this.api, { cellules }).subscribe({
      next: () => {
        this.message = vider ? `Journée de ${ed.employe.nom} effacée.` : `Planning de ${ed.employe.nom} enregistré.`;
        this.enregistrement = false;
        this.edition = null;
        this.charger();
      },
      error: e => { this.erreur = e?.error?.message || 'Enregistrement impossible.'; this.enregistrement = false; }
    });
  }

  recopier(): void {
    if (!confirm('Recopier les horaires de la semaine précédente sur cette semaine ? Les jours déjà remplis ne changent pas.')) return;
    const precedent = this.versDate(this.debut);
    precedent.setDate(precedent.getDate() - 7);
    this.http.post<{ copiees: number }>(`${this.api}/copier`, { depuis: this.iso(precedent), vers: this.debut, ecraser: false }).subscribe({
      next: r => { this.message = `${r.copiees} journée(s) recopiée(s) depuis la semaine précédente.`; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Copie impossible.')
    });
  }

  // ------------------------------------------------------------------ outils

  private lundi(d: Date): string {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return this.iso(x);
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private versDate(iso: string): Date {
    const [a, m, j] = iso.split('-').map(Number);
    return new Date(a, m - 1, j);
  }
}
