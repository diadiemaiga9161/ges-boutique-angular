import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, map, forkJoin, switchMap } from 'rxjs';
import { ClientService, Client } from './client.service';
import { FactureService } from './facture.service';
import { environment } from '../../../environments/environment';

export interface TicketAvecClient {
  id?: number;
  numeroTicket?: string;
  dateCreation?: string;
  dateRdv?: string;
  prixTotal?: number;
  statut?: string;
  client?: Client;
  clientId?: number;
  articles?: string[];
  quantites?: number[];
  prixArticles?: number[];
}

export interface Paiement {
  id?: number;
  montant: number;
  datePaiement?: string;
  modePaiement: string;
  typePaiement?: string;
  ticketId: number;
  reference?: string;
  ticket?: TicketAvecClient;
}

export interface RapportCaisse {
  dateCaisse: string;
  montantInitial: number;
  totalCaJour: number;
  totalResteAPayer: number;
  totalEncaisse: number;
  sortiesCaisse: number;
  soldeFinal: number;
  paiementsParMode: { mode: string, montant: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private baseUrl = `${environment.apiUrl}/paiements`;
  private ticketsUrl = `${environment.apiUrl}/tickets`;

  constructor(
    private http: HttpClient,
    private clientService: ClientService,
    private factureService: FactureService
  ) {}

  // ============================================
  // CRUD OPERATIONS PAIEMENTS - AMÉLIORÉ
  // ============================================

  payer(ticketId: number, paiement: any): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.baseUrl}/${ticketId}`, paiement);
  }

  modifier(id: number, paiement: Paiement): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.baseUrl}/${id}`, paiement);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  afficherTous(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/tous`);
  }

  afficherTousAvecDetails(): Observable<Paiement[]> {
    return this.afficherTous().pipe(
      switchMap(paiements => {
        const paiementsAvecDetails = paiements.map(paiement => 
          this.chargerDetailsPaiementObservable(paiement)
        );
        return forkJoin(paiementsAvecDetails);
      })
    );
  }

  afficherParId(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Erreur récupération paiement ${id}:`, error);
        const emptyPaiement: Paiement = {
          id: id,
          montant: 0,
          modePaiement: 'CASH',
          ticketId: 0,
          typePaiement: 'SOLDE'
        };
        return of(emptyPaiement);
      })
    );
  }

  afficherParIdAvecDetails(id: number): Observable<Paiement> {
    return this.afficherParId(id).pipe(
      switchMap(paiement => this.chargerDetailsPaiementObservable(paiement))
    );
  }

  afficherParTicket(ticketId: number): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/ticket/${ticketId}`);
  }

  afficherParTicketAvecDetails(ticketId: number): Observable<Paiement[]> {
    return this.afficherParTicket(ticketId).pipe(
      switchMap(paiements => {
        const paiementsAvecDetails = paiements.map(paiement => 
          this.chargerDetailsPaiementObservable(paiement)
        );
        return forkJoin(paiementsAvecDetails);
      })
    );
  }

  totalPaye(ticketId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total/${ticketId}`);
  }

  totalEntreDates(start: string, end: string): Observable<number> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<number>(`${this.baseUrl}/total`, { params });
  }

  // ============================================
  // OPERATIONS TICKETS - AMÉLIORÉ
  // ============================================

  getTickets(): Observable<TicketAvecClient[]> {
    return this.http.get<TicketAvecClient[]>(`${this.ticketsUrl}`);
  }

  getTicketsAvecClients(): Observable<TicketAvecClient[]> {
    return this.getTickets().pipe(
      switchMap(tickets => {
        const ticketsAvecDetails = tickets.map(ticket => 
          this.chargerDetailsTicketObservable(ticket)
        );
        return forkJoin(ticketsAvecDetails);
      })
    );
  }

  getTicketById(id: number): Observable<TicketAvecClient> {
    if (!id || id <= 0 || isNaN(id)) {
      const emptyTicket: TicketAvecClient = {
        id: 0,
        numeroTicket: 'Non spécifié',
        prixTotal: 0,
        statut: 'INCONNU'
      };
      return of(emptyTicket);
    }
    
    return this.http.get<TicketAvecClient>(`${this.ticketsUrl}/${id}`).pipe(
      switchMap(ticket => this.chargerDetailsTicketObservable(ticket)),
      catchError((error) => {
        console.error(`Erreur récupération ticket ${id}:`, error);
        const emptyTicket: TicketAvecClient = {
          id: id,
          numeroTicket: `Ticket #${id}`,
          prixTotal: 0,
          statut: 'INCONNU'
        };
        return of(emptyTicket);
      })
    );
  }

  getTicketByIdAvecPaiements(id: number): Observable<{
    ticket: TicketAvecClient,
    paiements: Paiement[]
  }> {
    return forkJoin({
      ticket: this.getTicketById(id),
      paiements: this.afficherParTicket(id)
    });
  }

  getClientById(id: number): Observable<Client> {
    if (!id || id <= 0) {
      return of({
        id: 0,
        nom: '',
        prenom: '',
        telephone: ''
      });
    }
    
    return this.clientService.getById(id).pipe(
      catchError((error) => {
        console.error(`Erreur récupération client ${id}:`, error);
        return of({
          id: id,
          nom: '',
          prenom: '',
          telephone: ''
        });
      })
    );
  }

  // NOUVELLE MÉTHODE: Charger les détails d'un ticket de manière synchrone (Observable)
  private chargerDetailsTicketObservable(ticket: TicketAvecClient): Observable<TicketAvecClient> {
    if (ticket.clientId && !ticket.client) {
      return this.getClientById(ticket.clientId).pipe(
        map(client => {
          ticket.client = client;
          return ticket;
        }),
        catchError(err => {
          console.error('Erreur chargement client:', err);
          ticket.client = {
            id: ticket.clientId,
            nom: '',
            prenom: '',
            telephone: ''
          };
          return of(ticket);
        })
      );
    }
    return of(ticket);
  }

  // NOUVELLE MÉTHODE: Charger les détails d'un paiement de manière synchrone (Observable)
  private chargerDetailsPaiementObservable(paiement: Paiement): Observable<Paiement> {
    if (paiement.ticketId && !paiement.ticket) {
      return this.getTicketById(paiement.ticketId).pipe(
        map(ticket => {
          paiement.ticket = ticket;
          return paiement;
        }),
        catchError(err => {
          console.error('Erreur chargement ticket:', err);
          paiement.ticket = {
            id: paiement.ticketId,
            numeroTicket: `Ticket #${paiement.ticketId}`,
            prixTotal: 0,
            statut: 'INCONNU'
          };
          return of(paiement);
        })
      );
    }
    return of(paiement);
  }

  getTicketClientFullName(ticket: TicketAvecClient): string {
    if (ticket.client) {
      return this.clientService.getFullName(ticket.client);
    }
    return `Client #${ticket.clientId || 'Inconnu'}`;
  }

  getTicketClientInfo(ticket: TicketAvecClient): { nom: string, prenom: string, telephone: string } {
    if (ticket.client) {
      return {
        nom: ticket.client.nom || '',
        prenom: ticket.client.prenom || '',
        telephone: ticket.client.telephone || ''
      };
    }
    return { nom: '', prenom: '', telephone: '' };
  }

  calculerResteAPayerTicket(ticket: TicketAvecClient, totalDejaPaye: number): number {
    const prixTotal = ticket.prixTotal || 0;
    return Math.max(0, prixTotal - totalDejaPaye);
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  getModesPaiement(): string[] {
    return ['CASH', 'MOBILE_MONEY', 'CARTE'];
  }

  getTypesPaiement(): string[] {
    return ['ACOMPTE', 'SOLDE'];
  }

  formatMontant(montant?: number): string {
    if (montant === undefined || montant === null) return '0 CFA';
    try {
      const formatted = Math.round(montant).toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace(/,/g, '.');
      return formatted + ' CFA';
    } catch (error) {
      console.error('Erreur formatage montant:', error);
      return '0 CFA';
    }
  }

  isValidPaiement(paiement: any): boolean {
    return !!(
      paiement.montant &&
      paiement.montant > 0 &&
      paiement.modePaiement &&
      paiement.ticketId &&
      paiement.ticketId > 0
    );
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  formatDateHeure(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getStartOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  getStartOfWeek(): string {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  }

  getModePaiementLibelle(mode: string): string {
    switch (mode) {
      case 'CASH': return 'Espèces';
      case 'MOBILE_MONEY': return 'Mobile Money';
      case 'CARTE': return 'Carte bancaire';
      default: return mode;
    }
  }

  getTypePaiementLibelle(type: string): string {
    switch (type) {
      case 'ACOMPTE': return 'Acompte';
      case 'SOLDE': return 'Solde';
      default: return type;
    }
  }

  getModePaiementIcon(mode: string): string {
    switch (mode) {
      case 'CASH': return 'bi bi-cash';
      case 'MOBILE_MONEY': return 'bi bi-phone';
      case 'CARTE': return 'bi bi-credit-card';
      default: return 'bi bi-currency-exchange';
    }
  }

  getModePaiementColor(mode: string): string {
    switch (mode) {
      case 'CASH': return 'success';
      case 'MOBILE_MONEY': return 'primary';
      case 'CARTE': return 'info';
      default: return 'secondary';
    }
  }

  calculerPourcentagePaye(totalPaye: number, prixTotal: number): number {
    if (!prixTotal || prixTotal <= 0) return 0;
    return Math.round((totalPaye / prixTotal) * 100);
  }

  getStatutPaiement(totalPaye: number, prixTotal: number): string {
    if (totalPaye === 0) return 'NON_PAYE';
    if (totalPaye >= prixTotal) return 'PAYE_TOTAL';
    return 'PAYE_PARTIEL';
  }

  getStatutPaiementColor(statut: string): string {
    switch (statut) {
      case 'PAYE_TOTAL': return 'bg-success';
      case 'PAYE_PARTIEL': return 'bg-warning';
      case 'NON_PAYE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatutPaiementText(statut: string): string {
    switch (statut) {
      case 'PAYE_TOTAL': return 'Payé total';
      case 'PAYE_PARTIEL': return 'Payé partiel';
      case 'NON_PAYE': return 'Non payé';
      default: return 'Inconnu';
    }
  }

  calculerResteAPayer(totalPaye: number, prixTotal: number): number {
    return Math.max(0, prixTotal - totalPaye);
  }

  // ============================================
  // GÉNÉRATION PDF - VERSION AMÉLIORÉE
  // ============================================

  async genererPetitRecuCompletPDF(paiement: Paiement, ticket?: TicketAvecClient, totalDejaPaye?: number): Promise<void> {
    const lignes: string[][] = [[
      paiement.reference || `#${paiement.id}`,
      this.formatDateHeure(paiement.datePaiement || new Date().toISOString()),
      this.getModePaiementLibelle(paiement.modePaiement),
      this.formatMontant(paiement.montant)
    ]];

    const totaux: { label: string; valeur: string }[] = [
      { label: 'Montant payé', valeur: this.formatMontant(paiement.montant) }
    ];
    if (totalDejaPaye !== undefined && ticket?.prixTotal) {
      const resteAPayer = this.calculerResteAPayer(totalDejaPaye, ticket.prixTotal);
      totaux.push({ label: 'Reste à payer', valeur: this.formatMontant(resteAPayer) });
    }

    const clientNom = ticket?.client
      ? [ticket.client.prenom, ticket.client.nom].filter(Boolean).join(' ') || 'N/A'
      : 'N/A';

    this.factureService.ouvrirDocumentPDF({
      titre: 'REÇU DE PAIEMENT',
      sousTitre: ticket
        ? `Ticket N° ${ticket.numeroTicket || ticket.id} — Client : ${clientNom}`
        : '',
      colonnes: ['Référence', 'Date', 'Mode', 'Montant'],
      lignes,
      totaux
    });
  }

  // ============================================
  // MÉTHODE PRINCIPALE POUR TÉLÉCHARGEMENT
  // ============================================

  async telechargerRecuPaiementPDF(paiement: Paiement): Promise<void> {
    await this.genererPetitRecuCompletPDF(paiement);
  }

  async telechargerPaiementsTicketPDF(ticketId: number): Promise<void> {
    const [ticketData, paiementsData] = await Promise.all([
      this.getTicketByIdAvecPaiements(ticketId).toPromise(),
      this.afficherParTicketAvecDetails(ticketId).toPromise()
    ]);

    if (!ticketData || !ticketData.ticket) {
      throw new Error('Ticket non trouvé');
    }

    const ticket = ticketData.ticket;
    const paiements = paiementsData || [];

    if (paiements.length === 0) {
      throw new Error('Aucun paiement pour ce ticket');
    }

    const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
    const resteAPayer = this.calculerResteAPayer(totalPaye, ticket.prixTotal || 0);

    const clientNom = ticket.client
      ? [ticket.client.prenom, ticket.client.nom].filter(Boolean).join(' ') || 'N/A'
      : 'N/A';

    const lignes = paiements.map(p => [
      this.formatDate(p.datePaiement),
      this.getModePaiementLibelle(p.modePaiement),
      this.formatMontant(p.montant)
    ]);

    this.factureService.ouvrirDocumentPDF({
      titre: 'RELEVÉ DES PAIEMENTS',
      sousTitre: `Ticket N° ${ticket.numeroTicket || ticket.id} — Client : ${clientNom}`,
      colonnes: ['Date', 'Mode', 'Montant'],
      lignes,
      totaux: [
        { label: 'Total payé', valeur: this.formatMontant(totalPaye) },
        { label: 'Reste à payer', valeur: this.formatMontant(resteAPayer) }
      ]
    });
  }

  async getTicketPaymentInfo(ticketId: number): Promise<{
    ticket: TicketAvecClient,
    paiements: Paiement[],
    totalPaye: number,
    resteAPayer: number,
    pourcentagePaye: number
  }> {
    try {
      const [ticket, paiements] = await Promise.all([
        this.getTicketById(ticketId).toPromise(),
        this.afficherParTicket(ticketId).toPromise()
      ]);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      const paiementsList = paiements || [];
      const totalPaye = paiementsList.reduce((sum, p) => sum + p.montant, 0);
      const resteAPayer = this.calculerResteAPayer(totalPaye, ticket.prixTotal || 0);
      const pourcentagePaye = this.calculerPourcentagePaye(totalPaye, ticket.prixTotal || 0);
      
      return {
        ticket,
        paiements: paiementsList,
        totalPaye,
        resteAPayer,
        pourcentagePaye
      };
    } catch (error) {
      console.error('Erreur récupération info paiement:', error);
      throw error;
    }
  }

  async genererRecuPDF(paiement: Paiement): Promise<void> {
    await this.telechargerRecuPaiementPDF(paiement);
  }
}
