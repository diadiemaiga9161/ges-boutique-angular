import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { envoyerWhatsAppDirect, nettoyerTelephone } from '../../../shared/utils/whatsapp.util';

interface ClientAbsent {
  clientId: number;
  nom: string;
  telephone: string | null;
  nbAchats: number;
  montantTotal: number;
  panierMoyen: number;
  derniereVisite: string;
  joursAbsence: number;
  intervalleHabituel: number;
  produits: string[];
}

interface Reponse {
  jours: number;
  minAchats: number;
  total: number;
  clients: ClientAbsent[];
}

/** Bons clients qui ne viennent plus : à rappeler avant de les perdre (gérant). */
@Component({
  selector: 'app-clients-absents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-absents.component.html',
  styleUrls: ['./clients-absents.component.scss']
})
export class ClientsAbsentsComponent implements OnInit {
  readonly choix = [
    { jours: 14, libelle: '2 semaines' },
    { jours: 21, libelle: '3 semaines' },
    { jours: 30, libelle: '1 mois' }
  ];
  jours = 14;
  donnees: Reponse | null = null;
  chargement = false;
  erreur = '';
  private nomBoutique = 'votre boutique';

  constructor(private http: HttpClient, private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.boutiqueService.info$.subscribe(info => { if (info?.nom) this.nomBoutique = info.nom; });
    this.charger();
  }

  choisir(jours: number): void {
    if (this.jours === jours) return;
    this.jours = jours;
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';
    this.http.get<Reponse>(`${environment.apiUrl}/rapports/clients-absents`, { params: { jours: this.jours } }).subscribe({
      next: r => { this.donnees = r; this.chargement = false; },
      error: e => { this.erreur = e?.error?.message || 'Impossible de charger la liste.'; this.chargement = false; }
    });
  }

  libelleChoix(): string {
    return this.choix.find(c => c.jours === this.jours)?.libelle || `${this.jours} jours`;
  }

  initiales(nom: string): string {
    return nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0].toUpperCase()).join('') || '?';
  }

  urgent(c: ClientAbsent): boolean {
    return c.joursAbsence >= 30 || (c.intervalleHabituel > 0 && c.joursAbsence >= c.intervalleHabituel * 5);
  }

  habitude(c: ClientAbsent): string {
    if (c.intervalleHabituel <= 1) return 'Venait presque tous les jours';
    if (c.intervalleHabituel < 7) return `Venait tous les ${c.intervalleHabituel} jours`;
    const semaines = Math.round(c.intervalleHabituel / 7);
    return semaines <= 1 ? 'Venait chaque semaine' : `Venait toutes les ${semaines} semaines`;
  }

  date(iso: string): string {
    const [a, m, j] = iso.split('-').map(Number);
    return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  aUnNumero(c: ClientAbsent): boolean {
    return !!nettoyerTelephone(c.telephone);
  }

  whatsapp(c: ClientAbsent): void {
    const prenom = c.nom.split(/\s+/)[0];
    envoyerWhatsAppDirect(c.telephone, `Bonjour ${prenom}, ça fait longtemps qu'on ne vous a pas vu chez ${this.nomBoutique} ! `
      + `Tout va bien ? Vos produits habituels vous attendent. À bientôt !`);
  }

  prix(v: number): string {
    return Math.round(v || 0).toLocaleString('fr-FR') + ' F';
  }
}
