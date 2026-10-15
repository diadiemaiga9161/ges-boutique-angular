import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode';
import { environment } from '../../../../environments/environment';

interface LignePointage {
  employeId: number;
  nom: string;
  poste: string;
  pointageId: number | null;
  heureArrivee: string | null;
  heureDepart: string | null;
  methodeArrivee: string | null;
  methodeDepart: string | null;
  saisiPar: string | null;
  observation: string | null;
  retardMinutes: number;
  minutesTravail: number | null;
  statut: 'PAS_ENCORE' | 'ABSENT' | 'PRESENT' | 'PARTI' | 'REPOS';
  aCompte?: boolean;
  horaire?: string | null;
}

interface Journee {
  date: string;
  estJourRepos: boolean;
  employes: LignePointage[];
  presents: number;
  retards: number;
}

interface ResumeEmploye {
  employeId: number;
  nom: string;
  poste: string;
  joursPresence: number;
  absences: number;
  retards: number;
  minutesRetard: number;
  minutesTravail: number;
}

interface Reglages {
  heureArriveePrevue: string;
  toleranceMinutes: number;
  jourRepos: string;
}

const STATUTS: Record<string, string> = {
  PAS_ENCORE: 'Pas encore arrivé',
  ABSENT: 'Absent',
  PRESENT: 'Présent',
  PARTI: 'Parti',
  REPOS: 'Repos'
};

/**
 * Pointage des employés (gérant) : code QR à afficher dans la boutique, journée,
 * résumé du mois, saisie à la main et réglages (heure d'arrivée, tolérance, repos).
 */
@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pointage.component.html',
  styleUrls: ['./pointage.component.scss']
})
export class PointageComponent implements OnInit, OnDestroy {
  private readonly api = `${environment.apiUrl}/pointage`;

  onglet: 'jour' | 'mois' | 'reglages' = 'jour';
  date = this.aujourdhui();
  mois = this.aujourdhui().slice(0, 7);

  journee: Journee | null = null;
  resume: ResumeEmploye[] = [];
  reglages: Reglages = { heureArriveePrevue: '08:00', toleranceMinutes: 10, jourRepos: 'SUNDAY' };
  readonly jours = [
    { cle: 'AUCUN', libelle: 'Aucun (ouvert tous les jours)' },
    { cle: 'MONDAY', libelle: 'Lundi' }, { cle: 'TUESDAY', libelle: 'Mardi' },
    { cle: 'WEDNESDAY', libelle: 'Mercredi' }, { cle: 'THURSDAY', libelle: 'Jeudi' },
    { cle: 'FRIDAY', libelle: 'Vendredi' }, { cle: 'SATURDAY', libelle: 'Samedi' },
    { cle: 'SUNDAY', libelle: 'Dimanche' }
  ];

  chargement = false;
  erreur = '';
  message = '';

  /** Saisie à la main en cours (null = formulaire fermé). */
  saisie: { employeId: number | null; nom: string; heureArrivee: string; heureDepart: string; observation: string } | null = null;
  enregistrement = false;

  // Écran du code QR
  ecranQr = false;
  qrImage = '';
  changeDans = 0;
  heure = '';
  qrErreur = '';
  private minuterie: any = null;
  private prochainCode = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerJour();
    this.http.get<Reglages>(`${this.api}/parametres`).subscribe({ next: r => (this.reglages = r), error: () => {} });
  }

  ngOnDestroy(): void {
    this.fermerQr();
  }

  // ------------------------------------------------------------------ onglets

  choisirOnglet(o: 'jour' | 'mois' | 'reglages'): void {
    this.onglet = o;
    this.message = '';
    this.erreur = '';
    if (o === 'jour') this.chargerJour();
    if (o === 'mois') this.chargerMois();
  }

  chargerJour(): void {
    this.chargement = true;
    this.erreur = '';
    this.http.get<Journee>(`${this.api}/jour`, { params: { date: this.date } }).subscribe({
      next: j => { this.journee = j; this.chargement = false; },
      error: e => { this.erreur = this.texteErreur(e, 'Impossible de charger la journée.'); this.chargement = false; }
    });
  }

  chargerMois(): void {
    this.chargement = true;
    this.erreur = '';
    this.http.get<{ employes: ResumeEmploye[] }>(`${this.api}/resume`, { params: { mois: this.mois } }).subscribe({
      next: r => { this.resume = r.employes; this.chargement = false; },
      error: e => { this.erreur = this.texteErreur(e, 'Impossible de charger le mois.'); this.chargement = false; }
    });
  }

  // ------------------------------------------------------------------ saisie à la main

  ouvrirSaisie(l: LignePointage): void {
    this.message = '';
    this.erreur = '';
    const maintenant = new Date().toTimeString().slice(0, 5);
    this.saisie = {
      employeId: l.employeId,
      nom: l.nom,
      heureArrivee: l.heureArrivee || (this.date === this.aujourdhui() ? maintenant : this.reglages.heureArriveePrevue),
      heureDepart: l.heureDepart || '',
      observation: l.observation || ''
    };
  }

  enregistrerSaisie(): void {
    if (!this.saisie) return;
    this.enregistrement = true;
    this.erreur = '';
    const corps = {
      employeId: this.saisie.employeId,
      date: this.date,
      heureArrivee: this.saisie.heureArrivee,
      heureDepart: this.saisie.heureDepart || null,
      observation: this.saisie.observation
    };
    this.http.post(`${this.api}/manuel`, corps).subscribe({
      next: () => {
        this.message = `Pointage de ${this.saisie?.nom} enregistré.`;
        this.saisie = null;
        this.enregistrement = false;
        this.chargerJour();
      },
      error: e => { this.erreur = this.texteErreur(e, 'Enregistrement impossible.'); this.enregistrement = false; }
    });
  }

  effacer(l: LignePointage): void {
    if (!l.pointageId || !confirm(`Effacer le pointage de ${l.nom} pour ce jour ?`)) return;
    this.http.delete(`${this.api}/${l.pointageId}`).subscribe({
      next: () => { this.message = `Pointage de ${l.nom} effacé.`; this.chargerJour(); },
      error: e => (this.erreur = this.texteErreur(e, 'Suppression impossible.'))
    });
  }

  // ------------------------------------------------------------------ réglages

  enregistrerReglages(): void {
    this.enregistrement = true;
    this.erreur = '';
    this.message = '';
    this.http.put<Reglages>(`${this.api}/parametres`, this.reglages).subscribe({
      next: r => { this.reglages = r; this.message = 'Réglages enregistrés.'; this.enregistrement = false; },
      error: e => { this.erreur = this.texteErreur(e, 'Enregistrement impossible.'); this.enregistrement = false; }
    });
  }

  // ------------------------------------------------------------------ code QR

  ouvrirQr(): void {
    this.ecranQr = true;
    this.qrErreur = '';
    this.prochainCode = 0;
    this.tic();
    this.minuterie = setInterval(() => this.tic(), 1000);
  }

  fermerQr(): void {
    this.ecranQr = false;
    if (this.minuterie) { clearInterval(this.minuterie); this.minuterie = null; }
  }

  private tic(): void {
    this.heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (this.changeDans > 0) this.changeDans--;
    if (Date.now() < this.prochainCode) return;
    // Évite de redemander tant que la réponse n'est pas arrivée.
    this.prochainCode = Date.now() + 5000;
    this.http.get<{ code: string; changeDans: number }>(`${this.api}/code`).subscribe({
      next: r => {
        this.qrErreur = '';
        this.changeDans = r.changeDans;
        this.prochainCode = Date.now() + r.changeDans * 1000 + 300;
        const contenu = `${window.location.origin}/mobile/pointage?c=${encodeURIComponent(r.code)}`;
        QRCode.toDataURL(contenu, { width: 640, margin: 1, errorCorrectionLevel: 'M' })
          .then((url: string) => (this.qrImage = url))
          .catch(() => (this.qrErreur = 'Impossible de dessiner le code.'));
      },
      error: () => (this.qrErreur = 'Connexion perdue. Le code reviendra dès que la connexion revient.')
    });
  }

  // ------------------------------------------------------------------ affichage

  libelleStatut(l: LignePointage): string {
    if (l.statut === 'PRESENT' && l.retardMinutes > 0) return 'En retard';
    return STATUTS[l.statut] || l.statut;
  }

  classeStatut(l: LignePointage): string {
    if (l.statut === 'ABSENT') return 'pt-badge--absent';
    if (l.statut === 'PAS_ENCORE' || l.statut === 'REPOS') return 'pt-badge--attente';
    if (l.retardMinutes > 0) return 'pt-badge--retard';
    return l.statut === 'PARTI' ? 'pt-badge--parti' : 'pt-badge--present';
  }

  duree(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} h ${m.toString().padStart(2, '0')}` : `${m} min`;
  }

  get totalEmployes(): number {
    return this.journee?.employes.length || 0;
  }

  private aujourdhui(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private texteErreur(e: any, defaut: string): string {
    return e?.error?.message || defaut;
  }
}
