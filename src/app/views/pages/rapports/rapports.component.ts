// src/app/views/pages/rapports/rapports.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../shared/services/websocket.service';

import { 
  RapportService, 
  RapportJournalier, 
  RapportHebdomadaire, 
  RapportMensuel, 
  StatistiquesGenerales
} from '../../../shared/services/rapport.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CaisseService, CreditInfo, SituationCredits } from '../../../shared/services/caisse.service';

Chart.register(...registerables);

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RapportsComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // ==================== ÉTATS ====================
  isLoading: boolean = false;
  isLoadingStats: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // ==================== DONNÉES ====================
  statistiquesGenerales: StatistiquesGenerales | null = null;
  rapportActif: RapportJournalier | RapportHebdomadaire | RapportMensuel | any = null;
  typeRapportActif: string = '';
  rapportsRecents: any[] = [];
  
  // Données pour la comparaison mensuelle
  comparaisonMensuelle: Array<{mois: string, annee: number, chiffreAffaire: number, benefice: number, nombreVentes: number, margeMoyenne: number}> = [];
  
  // ==================== DONNÉES CRÉDITS ====================
  creditsEnCours: CreditInfo[] = [];
  creditsEnRetard: CreditInfo[] = [];
  situationCredits: SituationCredits | null = null;
  
  // ==================== FILTRES ====================
  dateDebut: string = '';
  dateFin: string = '';
  typeRapport: string = 'journalier';
  
  // ==================== PAGINATION ====================
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // ==================== CHARTS ====================
  @ViewChild('topProduitsChart', { static: false }) topProduitsChartRef!: ElementRef;
  @ViewChild('paiementChart', { static: false }) paiementChartRef!: ElementRef;
  @ViewChild('categoriesChart', { static: false }) categoriesChartRef!: ElementRef;
  @ViewChild('creditsChart', { static: false }) creditsChartRef!: ElementRef;
  @ViewChild('evolutionMensuelleChart', { static: false }) evolutionMensuelleChartRef!: ElementRef;
  
  private topProduitsChart: Chart | undefined;
  private paiementChart: Chart | undefined;
  private categoriesChart: Chart | undefined;
  private creditsChart: Chart | undefined;
  private evolutionMensuelleChart: Chart | undefined;
  
  // ==================== SOUSCRIPTIONS ====================
  private subscriptions: Subscription[] = [];

  Math = Math;

  constructor(
    public rapportService: RapportService,
    private authService: AuthService,
    private caisseService: CaisseService,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.initialiserDates();
    this.chargerDonneesInitiales();
    this.chargerDonneesCredits();

    // Temps réel : rafraîchir les statistiques quand le dashboard change
    const wsSub = this.ws.subscribeTopic('/topic/dashboard').subscribe(() => {
      this.chargerDonneesInitiales();
    });
    this.subscriptions.push(wsSub);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initialiserCharts(), 500);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.detruireCharts();
  }

  // ==================== INITIALISATION ====================
  
  initialiserDates(): void {
    const aujourdhui = new Date();
    this.dateFin = this.rapportService.formaterDate(aujourdhui);
    
    const dateDebut = new Date(aujourdhui);
    dateDebut.setDate(dateDebut.getDate() - 7);
    this.dateDebut = this.rapportService.formaterDate(dateDebut);
  }

  chargerDonneesInitiales(): void {
    this.chargerStatistiquesGenerales();
    this.chargerRapportsRecents();
    this.genererComparaisonMensuelle();
  }

  chargerDonneesCredits(): void {
    const sub1 = this.caisseService.getCreditsNonRegles().subscribe({
      next: (credits) => { this.creditsEnCours = credits; this.mettreAJourCharts(); },
      error: (err) => console.error('Erreur chargement crédits:', err)
    });
    
    const sub2 = this.caisseService.getCreditsEnRetard().subscribe({
      next: (credits) => { this.creditsEnRetard = credits; this.mettreAJourCharts(); },
      error: (err) => console.error('Erreur chargement crédits en retard:', err)
    });
    
    const sub3 = this.caisseService.getSituationCredits().subscribe({
      next: (situation) => { this.situationCredits = situation; this.mettreAJourCharts(); },
      error: (err) => console.error('Erreur chargement situation crédits:', err)
    });
    
    this.subscriptions.push(sub1, sub2, sub3);
  }

  // ==================== CHARGEMENT DES DONNÉES ====================
  
  chargerStatistiquesGenerales(): void {
    this.isLoadingStats = true;
    const sub = this.rapportService.obtenirStatistiquesGenerales().subscribe({
      next: (stats) => {
        this.statistiquesGenerales = stats;
        this.isLoadingStats = false;
        this.genererComparaisonMensuelle();
        this.creerChartEvolutionMensuelle();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoadingStats = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    this.subscriptions.push(sub);
  }

  chargerRapportsRecents(): void {
    // Données factices pour la démonstration
    this.rapportsRecents = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      this.rapportsRecents.push({
        date: this.rapportService.formaterDate(date),
        type: i === 0 ? 'journalier' : (i % 3 === 0 ? 'hebdomadaire' : 'mensuel'),
        chiffreAffaire: Math.floor(Math.random() * 500000) + 100000,
        nombreVentes: Math.floor(Math.random() * 30) + 5
      });
    }
  }

  genererComparaisonMensuelle(): void {
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const anneeActuelle = new Date().getFullYear();
    
    this.comparaisonMensuelle = [];
    for (let i = 0; i < 12; i++) {
      const ca = Math.floor(Math.random() * 5000000) + 1000000;
      const benefice = ca * (0.15 + Math.random() * 0.2);
      this.comparaisonMensuelle.push({
        mois: moisNoms[i],
        annee: anneeActuelle,
        chiffreAffaire: ca,
        benefice: benefice,
        nombreVentes: Math.floor(Math.random() * 200) + 50,
        margeMoyenne: (benefice / ca) * 100
      });
    }
  }

  // ==================== MÉTHODES GET POUR GAINS/PERTES ====================
  
  getTotalGains(): number {
    if (this.rapportActif?.gains?.totalRevenus) {
      return this.rapportActif.gains.totalRevenus;
    }
    if (this.statistiquesGenerales?.gainsPertes?.totalRevenus) {
      return this.statistiquesGenerales.gainsPertes.totalRevenus;
    }
    // Calcul à partir des ventes si disponible
    if (this.rapportActif?.chiffreAffaireTotal) {
      return this.rapportActif.chiffreAffaireTotal;
    }
    return 0;
  }

  getTotalPertes(): number {
    if (this.rapportActif?.pertes?.totalPertes) {
      return this.rapportActif.pertes.totalPertes;
    }
    if (this.statistiquesGenerales?.gainsPertes?.totalPertes) {
      return this.statistiquesGenerales.gainsPertes.totalPertes;
    }
    return 0;
  }

  getBeneficeBrut(): number {
    if (this.rapportActif?.gains?.beneficeBrut !== undefined) {
      return this.rapportActif.gains.beneficeBrut;
    }
    if (this.rapportActif?.beneficeTotal !== undefined) {
      return this.rapportActif.beneficeTotal;
    }
    return 0;
  }

  getMargeBrute(): number {
    if (this.rapportActif?.gains?.margeBrute !== undefined) {
      return this.rapportActif.gains.margeBrute;
    }
    if (this.rapportActif?.margeMoyenne !== undefined) {
      return this.rapportActif.margeMoyenne;
    }
    const gains = this.getTotalGains();
    const benefice = this.getBeneficeBrut();
    return gains > 0 ? (benefice / gains) * 100 : 0;
  }

  getBilanNet(): number {
    if (this.rapportActif?.bilanNet !== undefined) {
      return this.rapportActif.bilanNet;
    }
    if (this.rapportActif?.gains?.totalRevenus && this.rapportActif?.pertes?.totalPertes) {
      return this.rapportActif.gains.totalRevenus - this.rapportActif.pertes.totalPertes;
    }
    if (this.statistiquesGenerales?.gainsPertes?.bilanNet !== undefined) {
      return this.statistiquesGenerales.gainsPertes.bilanNet;
    }
    return this.getTotalGains() - this.getTotalPertes();
  }

  getEvolutionPourcentage(): number {
    if (this.rapportActif?.evolution?.parRapportPeriodePrecedente !== undefined) {
      return this.rapportActif.evolution.parRapportPeriodePrecedente;
    }
    if (this.statistiquesGenerales?.gainsPertes?.evolutionParRapportMoisPrecedent !== undefined) {
      return this.statistiquesGenerales.gainsPertes.evolutionParRapportMoisPrecedent;
    }
    return 0;
  }

  getTendance(): 'hausse' | 'baisse' | 'stable' {
    const evolution = this.getEvolutionPourcentage();
    if (evolution > 0) return 'hausse';
    if (evolution < 0) return 'baisse';
    return 'stable';
  }

  // ==================== MÉTHODES POUR COMPARAISON MENSUELLE ====================
  
  getTotalCAComparaison(): number {
    return this.comparaisonMensuelle.reduce((s, m) => s + m.chiffreAffaire, 0);
  }

  getTotalBeneficeComparaison(): number {
    return this.comparaisonMensuelle.reduce((s, m) => s + m.benefice, 0);
  }

  getMargeMoyenneComparaison(): number {
    const totalCA = this.getTotalCAComparaison();
    const totalBenefice = this.getTotalBeneficeComparaison();
    return totalCA > 0 ? (totalBenefice / totalCA) * 100 : 0;
  }

  getTotalVentesComparaison(): number {
    return this.comparaisonMensuelle.reduce((s, m) => s + m.nombreVentes, 0);
  }

  // ==================== MÉTHODES POUR MEILLEURS PERFORMERS ====================
  
  getMeilleurVendeur(): any {
    if (!this.statistiquesGenerales?.vendeurs || this.statistiquesGenerales.vendeurs.length === 0) return null;
    return [...this.statistiquesGenerales.vendeurs].sort((a, b) => (b as any).chiffreAffaire - (a as any).chiffreAffaire)[0];
  }

  getMeilleurProduit(): any {
    if (!this.statistiquesGenerales?.produitsPlusVendus || this.statistiquesGenerales.produitsPlusVendus.length === 0) return null;
    return [...this.statistiquesGenerales.produitsPlusVendus].sort((a, b) => b.chiffreAffaire - a.chiffreAffaire)[0];
  }

  // ==================== GÉNÉRATION DES RAPPORTS ====================
  
  genererRapportJour(): void {
    this.genererRapportJournalier(this.dateFin);
  }

  genererRapportSemaine(): void {
    this.genererRapportHebdomadaire();
  }

  genererRapportMois(): void {
    this.genererRapportMensuel();
  }

  genererRapportJournalier(date: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.rapportService.genererRapportJournalier(date).subscribe({
      next: (rapport) => {
        this.rapportActif = this.enrichirRapportAvecCredits(rapport);
        this.typeRapportActif = 'journalier';
        this.isLoading = false;
        this.successMessage = 'Rapport journalier généré avec succès';
        setTimeout(() => this.initialiserCharts(), 200);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    this.subscriptions.push(sub);
  }

  genererRapportHebdomadaire(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.rapportService.genererRapportHebdomadaire().subscribe({
      next: (rapport) => {
        this.rapportActif = this.enrichirRapportAvecCredits(rapport);
        this.typeRapportActif = 'hebdomadaire';
        this.isLoading = false;
        this.successMessage = 'Rapport hebdomadaire généré avec succès';
        setTimeout(() => this.initialiserCharts(), 200);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    this.subscriptions.push(sub);
  }

  genererRapportMensuel(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.rapportService.genererRapportMensuel().subscribe({
      next: (rapport) => {
        this.rapportActif = this.enrichirRapportAvecCredits(rapport);
        this.typeRapportActif = 'mensuel';
        this.isLoading = false;
        this.successMessage = 'Rapport mensuel généré avec succès';
        setTimeout(() => this.initialiserCharts(), 200);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    this.subscriptions.push(sub);
  }

  genererRapportPersonnalise(): void {
    if (!this.dateDebut || !this.dateFin) {
      this.errorMessage = 'Veuillez sélectionner une période';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.rapportService.genererRapportPeriodique(this.dateDebut, this.dateFin).subscribe({
      next: (rapport) => {
        this.rapportActif = this.enrichirRapportAvecCredits({
          ...rapport.resume,
          dateDebut: this.dateDebut,
          dateFin: this.dateFin,
          topProduits: rapport.topProduits,
          modePaiementStats: rapport.modePaiementStats,
          statistiquesCategories: rapport.statistiquesCategories,
          gains: rapport.gains,
          pertes: rapport.pertes,
          bilanNet: rapport.bilanNet
        });
        this.typeRapportActif = 'personnalise';
        this.isLoading = false;
        this.successMessage = 'Rapport personnalisé généré avec succès';
        setTimeout(() => this.initialiserCharts(), 200);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    this.subscriptions.push(sub);
  }

  appliquerFiltres(): void {
    if (this.typeRapport === 'journalier') {
      this.genererRapportJournalier(this.dateFin);
    } else if (this.typeRapport === 'personnalise') {
      this.genererRapportPersonnalise();
    } else if (this.typeRapport === 'hebdomadaire') {
      this.genererRapportHebdomadaire();
    } else if (this.typeRapport === 'mensuel') {
      this.genererRapportMensuel();
    }
  }

  // ==================== ENRICHISSEMENT DES RAPPORTS ====================
  
  private enrichirRapportAvecCredits(rapport: any): any {
    if (!rapport) return rapport;
    
    return {
      ...rapport,
      credits: {
        enCours: this.creditsEnCours,
        enRetard: this.creditsEnRetard,
        situation: this.situationCredits,
        nombreTotal: this.situationCredits?.nombreCreditsNonRegles || 0,
        montantTotal: this.situationCredits?.montantTotalCredits || 0,
        nombreEnRetard: this.creditsEnRetard.length,
        montantEnRetard: this.calculerMontantTotalRetard(),
        tauxRecouvrement: this.calculerTauxRecouvrement()
      }
    };
  }

  private calculerMontantTotalRetard(): number {
    let total = 0;
    for (const credit of this.creditsEnRetard) {
      total += credit.montantRestant;
    }
    return total;
  }

  private calculerTauxRecouvrement(): number {
    if (!this.situationCredits || this.situationCredits.montantTotalCredits === 0) {
      return 0;
    }
    let verse = 0;
    for (const credit of this.creditsEnCours) {
      verse += credit.montantVerse;
    }
    const total = this.situationCredits.montantTotalCredits || 0;
    return total > 0 ? (verse / total) * 100 : 0;
  }

  // ==================== CHARGEMENT D'UN RAPPORT EXISTANT ====================
  
  voirRapport(rapport: any): void {
    if (rapport.type === 'journalier') {
      this.genererRapportJournalier(rapport.date);
    } else if (rapport.type === 'hebdomadaire') {
      this.genererRapportHebdomadaire();
    } else if (rapport.type === 'mensuel') {
      this.genererRapportMensuel();
    }
  }

  // ==================== EXPORTATION ====================
  
  exporterRapport(): void {
    if (!this.rapportActif) {
      this.errorMessage = 'Aucun rapport à exporter';
      return;
    }
    this.rapportService.exporterRapportPDF(this.rapportActif, this.typeRapportActif);
    this.successMessage = 'Export PDF lancé';
    setTimeout(() => this.successMessage = '', 3000);
  }

  fermerRapport(): void {
    this.rapportActif = null;
    this.typeRapportActif = '';
    this.detruireCharts();
  }

  // ==================== CHARTJS ====================
  
  initialiserCharts(): void {
    this.detruireCharts();
    setTimeout(() => {
      this.creerChartTopProduits();
      this.creerChartPaiement();
      this.creerChartCategories();
      this.creerChartCredits();
    }, 100);
  }

  mettreAJourCharts(): void {
    this.initialiserCharts();
  }

  private creerChartTopProduits(): void {
    const produits = this.getTopProduits();
    if (produits.length === 0) return;
    
    const ctx = this.topProduitsChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    
    this.topProduitsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: produits.map(p => p.nom.length > 15 ? p.nom.substring(0, 12) + '...' : p.nom),
        datasets: [
          {
            label: 'Quantité Vendue',
            data: produits.map(p => p.quantite),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Chiffre d\'Affaires (FCFA)',
            data: produits.map(p => p.chiffreAffaire),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { title: { display: true, text: 'Quantité' } },
          y1: { position: 'right', title: { display: true, text: 'Chiffre d\'Affaires (FCFA)' }, grid: { drawOnChartArea: false } }
        },
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 5 Produits' } }
      }
    });
  }

  private creerChartPaiement(): void {
    const modes = this.getModePaiementStats();
    if (modes.length === 0) return;
    
    const ctx = this.paiementChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    
    this.paiementChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: modes.map(m => this.rapportService.getModePaiementLabel(m.mode)),
        datasets: [{
          data: modes.map(m => m.montant),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' }, title: { display: true, text: 'Répartition par Mode de Paiement' } }
      }
    });
  }

  private creerChartCategories(): void {
    const categories = this.getCategoriesStats();
    if (categories.length === 0) return;
    
    const ctx = this.categoriesChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    
    this.categoriesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories.map(c => c.nom),
        datasets: [{
          data: categories.map(c => c.chiffreAffaire),
          backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40', '#36A2EB', '#FF6384'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' }, title: { display: true, text: 'Top 5 Catégories par CA' } }
      }
    });
  }

  private creerChartCredits(): void {
    if ((this.creditsEnCours?.length || 0) === 0 && (this.creditsEnRetard?.length || 0) === 0) return;
    
    const ctx = this.creditsChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    
    const stats = [
      { label: 'Crédits en cours', valeur: this.creditsEnCours?.length || 0, couleur: '#FFCE56' },
      { label: 'Crédits en retard', valeur: this.creditsEnRetard?.length || 0, couleur: '#FF6384' }
    ].filter(s => s.valeur > 0);
    
    if (stats.length === 0) return;
    
    this.creditsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.map(s => s.label),
        datasets: [{
          label: 'Nombre de crédits',
          data: stats.map(s => s.valeur),
          backgroundColor: stats.map(s => s.couleur),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Situation des Crédits' } }
      }
    });
  }

  private creerChartEvolutionMensuelle(): void {
    if (this.comparaisonMensuelle.length === 0) return;
    
    const ctx = this.evolutionMensuelleChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    
    this.evolutionMensuelleChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.comparaisonMensuelle.map(m => m.mois),
        datasets: [
          {
            label: 'Chiffre d\'Affaires (FCFA)',
            data: this.comparaisonMensuelle.map(m => m.chiffreAffaire),
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Bénéfice (FCFA)',
            data: this.comparaisonMensuelle.map(m => m.benefice),
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Montant (FCFA)' } } },
        plugins: { 
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${this.formatPrice(ctx.raw as number)}` } },
          legend: { position: 'top' }
        }
      }
    });
  }

  private detruireCharts(): void {
    if (this.topProduitsChart) { this.topProduitsChart.destroy(); this.topProduitsChart = undefined; }
    if (this.paiementChart) { this.paiementChart.destroy(); this.paiementChart = undefined; }
    if (this.categoriesChart) { this.categoriesChart.destroy(); this.categoriesChart = undefined; }
    if (this.creditsChart) { this.creditsChart.destroy(); this.creditsChart = undefined; }
    if (this.evolutionMensuelleChart) { this.evolutionMensuelleChart.destroy(); this.evolutionMensuelleChart = undefined; }
  }

  // ==================== MÉTHODES DE RÉCUPÉRATION DE DONNÉES ====================
  
  getTopProduits(): Array<{nom: string, quantite: number, chiffreAffaire: number}> {
    if (this.rapportActif?.topProduits && this.rapportActif.topProduits.length > 0) {
      return this.rapportActif.topProduits.slice(0, 5);
    }
    if (this.statistiquesGenerales?.produitsPlusVendus) {
      return this.statistiquesGenerales.produitsPlusVendus.slice(0, 5).map(p => ({
        nom: p.nom,
        quantite: p.quantiteVendue,
        chiffreAffaire: p.chiffreAffaire
      }));
    }
    return [];
  }

  getModePaiementStats(): Array<{mode: string, montant: number, pourcentage: number}> {
    if (this.rapportActif?.modePaiementStats) {
      return this.rapportActif.modePaiementStats;
    }
    if (this.statistiquesGenerales?.modePaiementStats) {
      return this.statistiquesGenerales.modePaiementStats;
    }
    return [];
  }

  getCategoriesStats(): Array<{nom: string, chiffreAffaire: number}> {
    if (this.rapportActif?.statistiquesCategories) {
      return this.rapportActif.statistiquesCategories.slice(0, 5).map((c: any) => ({
        nom: c.nom,
        chiffreAffaire: c.chiffreAffaire
      }));
    }
    if (this.statistiquesGenerales?.categoriesStats) {
      return this.statistiquesGenerales.categoriesStats.slice(0, 5).map(c => ({
        nom: c.nom,
        chiffreAffaire: c.chiffreAffaire
      }));
    }
    return [];
  }

  getRapportTitre(): string {
    if (!this.rapportActif) return '';
    
    if (this.typeRapportActif === 'mensuel' && this.rapportActif.mois) {
      return `Rapport Mensuel - ${this.rapportActif.mois} ${this.rapportActif.annee}`;
    } else if (this.typeRapportActif === 'hebdomadaire' && this.rapportActif.debutSemaine) {
      return `Rapport Hebdomadaire - Du ${this.formatDateShort(this.rapportActif.debutSemaine)} au ${this.formatDateShort(this.rapportActif.finSemaine)}`;
    } else if (this.typeRapportActif === 'personnalise' && this.rapportActif.dateDebut) {
      return `Rapport Personnalisé - Du ${this.formatDateShort(this.rapportActif.dateDebut)} au ${this.formatDateShort(this.rapportActif.dateFin)}`;
    }
    return `Rapport Journalier - ${this.formatDateLong(this.rapportActif.date)}`;
  }

  // ==================== PAGINATION ====================
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.rapportsRecents.length / this.itemsPerPage);
  }

  get paginatedRapports(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.rapportsRecents.slice(start, start + this.itemsPerPage);
  }

  get dateGeneration(): string {
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  // ==================== UTILITAIRES ====================
  
  formatPrice(price: number): string {
    return this.rapportService.formaterPrixFCFA(price);
  }

  formatDateLong(dateString: string): string {
    return this.rapportService.formatDateLong(dateString);
  }

  formatDateShort(dateString: string): string {
    return this.rapportService.formatDateShort(dateString);
  }

  formatPourcentage(value: number): string {
    return `${(value || 0).toFixed(1)}%`;
  }

  getModePaiementLabel(mode: string): string {
    return this.rapportService.getModePaiementLabel(mode);
  }

  getModePaiementBadge(mode: string): string {
    switch (mode) {
      case 'ESPECES': return 'bg-success';
      case 'ORANGE_MONEY': return 'bg-warning text-dark';
      case 'MOOV_MONEY': return 'bg-info';
      case 'CARTE_BANCAIRE': return 'bg-primary';
      case 'VIREMENT': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getCreditBadge(statut: string): string {
    switch (statut) {
      case 'En cours': return 'badge bg-warning text-dark';
      case 'En retard': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  
}