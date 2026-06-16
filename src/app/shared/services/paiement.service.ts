import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, map, forkJoin, switchMap } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { ClientService, Client } from './client.service';
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
    private clientService: ClientService
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
    try {
      console.log('=== DÉBUT GÉNÉRATION PDF ===');
      console.log('Paiement:', paiement);
      console.log('Ticket fourni:', ticket);
      
      // Format A7 (74 x 105 mm) - petit format
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [74, 105]
      });

      const margin = 5;
      let yPos = margin;
      
      // En-tête - Titre principal
      doc.setFontSize(12);
      doc.setTextColor(67, 97, 238);
      doc.text('REÇU DE PAIEMENT', 74/2, yPos, { align: 'center' });
      yPos += 5;

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, 74 - margin, yPos);
      yPos += 3;

      // Informations du paiement
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      // Date et heure
      const datePaiement = paiement.datePaiement || new Date().toISOString();
      doc.text(`Date: ${this.formatDateHeure(datePaiement)}`, margin, yPos);
      yPos += 4;

      // Référence du paiement
      if (paiement.reference) {
        doc.text(`Réf: ${paiement.reference}`, margin, yPos);
        yPos += 4;
      }

      // ID Paiement
      doc.text(`Paiement #${paiement.id || 'N/A'}`, margin, yPos);
      yPos += 4;

      // Montant en gros
      doc.setFontSize(14);
      doc.setTextColor(39, 174, 96);
      doc.text(`${this.formatMontant(paiement.montant)}`, 74/2, yPos, { align: 'center' });
      yPos += 7;

      // Mode et type de paiement
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`Mode: ${this.getModePaiementLibelle(paiement.modePaiement)}`, margin, yPos);
      yPos += 4;
      
      if (paiement.typePaiement) {
        doc.text(`Type: ${this.getTypePaiementLibelle(paiement.typePaiement)}`, margin, yPos);
        yPos += 4;
      }

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, 74 - margin, yPos);
      yPos += 4;

      // Informations du ticket
      doc.setFontSize(9);
      doc.setTextColor(41, 128, 185);
      doc.text('INFORMATIONS DU TICKET', 74/2, yPos, { align: 'center' });
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      // Afficher les informations du ticket
      if (ticket) {
        console.log('Ticket disponible pour PDF:', ticket);
        
        // Numéro de ticket
        const ticketNumero = ticket.numeroTicket || `Ticket #${ticket.id || paiement.ticketId || 'N/A'}`;
        doc.text(`Ticket: ${ticketNumero}`, margin, yPos);
        yPos += 4;

        // Total du ticket
        const prixTotal = ticket.prixTotal || 0;
        doc.text(`Total: ${this.formatMontant(prixTotal)}`, margin, yPos);
        yPos += 4;

        // Date création ticket si disponible
        if (ticket.dateCreation) {
          doc.text(`Créé: ${this.formatDate(ticket.dateCreation)}`, margin, yPos);
          yPos += 4;
        }

        // Informations client
        if (ticket.client && (ticket.client.nom || ticket.client.prenom || ticket.client.telephone)) {
          doc.setFontSize(9);
          doc.setTextColor(52, 152, 219);
          doc.text('INFORMATIONS CLIENT', 74/2, yPos, { align: 'center' });
          yPos += 5;

          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          
          // Nom complet
          if (ticket.client.nom || ticket.client.prenom) {
            const nomComplet = `${ticket.client.prenom || ''} ${ticket.client.nom || ''}`.trim();
            doc.text(`Nom: ${nomComplet}`, margin, yPos);
            yPos += 4;
          }
          
          // Téléphone
          if (ticket.client.telephone) {
            doc.text(`Tél: ${ticket.client.telephone}`, margin, yPos);
            yPos += 4;
          }
        } else if (ticket.clientId) {
          // Afficher au moins l'ID client
          doc.text(`Client ID: ${ticket.clientId}`, margin, yPos);
          yPos += 4;
        } else {
          doc.text('Client: Non spécifié', margin, yPos);
          yPos += 4;
        }

        // Calcul du reste à payer
        try {
          let totalPayeLocal = totalDejaPaye || paiement.montant;
          
          if (ticket.id && ticket.id > 0 && !totalDejaPaye) {
            try {
              totalPayeLocal = await this.totalPaye(ticket.id).toPromise();
            } catch (error) {
              console.warn('Erreur récupération total payé:', error);
            }
          }
          
          const resteAPayer = this.calculerResteAPayer(totalPayeLocal, prixTotal);
          
          doc.setFontSize(9);
          if (resteAPayer > 0) {
            doc.setTextColor(231, 76, 60); // Rouge
          } else {
            doc.setTextColor(46, 204, 113); // Vert
          }
          
          doc.text(`Reste à payer: ${this.formatMontant(resteAPayer)}`, margin, yPos);
          yPos += 4;
        } catch (error) {
          console.warn('Erreur calcul reste à payer:', error);
        }
      } else {
        // Si aucun ticket disponible
        doc.text(`Ticket ID: #${paiement.ticketId || 'Non spécifié'}`, margin, yPos);
        yPos += 4;
        doc.text('Client: Information non disponible', margin, yPos);
        yPos += 4;
      }

      // QR Code
      if (yPos < 80) {
        const qrCodeData = `PAIEMENT#${paiement.id || 'new'}#T${paiement.ticketId || 0}#${paiement.montant}#${this.formatDate(datePaiement)}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { 
          width: 25, 
          margin: 0,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Positionner le QR code en bas à droite
        doc.addImage(qrCodeUrl, 'PNG', 74 - margin - 25, 105 - margin - 25, 25, 25);
        
        // Texte sous le QR code
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text('Scan pour vérifier', 74 - margin - 12.5, 105 - margin - 2, { align: 'center' });
      }

      // Pied de page
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      
      // Date de génération
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, margin, 105 - margin - 10);
      
      // Signature
      doc.line(margin, 105 - margin - 5, margin + 20, 105 - margin - 5);
      doc.text('Signature', margin + 10, 105 - margin - 2, { align: 'center' });

      // Nom du fichier
      const fileName = `recu-petit-${paiement.id || 'new'}-${this.formatDate(datePaiement).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      console.log('=== PDF GÉNÉRÉ AVEC SUCCÈS ===', fileName);

    } catch (error) {
      console.error('Erreur génération petit reçu complet:', error);
      throw new Error('Erreur lors de la génération du reçu petit format: ' + error);
    }
  }

  // ============================================
  // MÉTHODE PRINCIPALE POUR TÉLÉCHARGEMENT
  // ============================================

  async telechargerRecuPaiementPDF(paiement: Paiement): Promise<void> {
    try {
      console.log('=== DÉBUT TÉLÉCHARGEMENT REÇU ===');
      console.log('Paiement initial:', paiement);
      
      let ticketComplet: TicketAvecClient | undefined;
      let totalPayeTicket = 0;
      
      // ÉTAPE 1: Si le paiement a déjà un ticket complet avec client
      if (paiement.ticket && paiement.ticket.client && (paiement.ticket.client.nom || paiement.ticket.client.prenom)) {
        console.log('✅ Ticket complet déjà présent dans le paiement');
        ticketComplet = paiement.ticket;
      }
      // ÉTAPE 2: Sinon, charger le ticket avec toutes ses informations
      else if (paiement.ticketId && paiement.ticketId > 0) {
        console.log('🔄 Chargement du ticket complet... ID:', paiement.ticketId);
        
        try {
          // Charger le ticket avec ses détails complets
          const ticketObservable = this.getTicketById(paiement.ticketId);
          const totalPayeObservable = this.totalPaye(paiement.ticketId);
          
          const [ticket, totalPaye] = await Promise.all([
            ticketObservable.toPromise(),
            totalPayeObservable.toPromise().catch(() => paiement.montant)
          ]);
          
          ticketComplet = ticket;
          totalPayeTicket = totalPaye;
          
          console.log('✅ Ticket chargé avec succès:', ticketComplet);
          console.log('💰 Total déjà payé:', totalPayeTicket);
          
        } catch (ticketError) {
          console.error('❌ Erreur chargement ticket:', ticketError);
          // Créer un ticket minimal
          ticketComplet = {
            id: paiement.ticketId,
            numeroTicket: `Ticket #${paiement.ticketId}`,
            prixTotal: 0,
            statut: 'INCONNU',
            clientId: 0
          };
        }
      } else {
        console.warn('⚠️ Paiement sans ticketId valide');
        ticketComplet = {
          id: 0,
          numeroTicket: 'Non spécifié',
          prixTotal: 0,
          statut: 'INCONNU'
        };
      }
      
      // ÉTAPE 3: S'assurer que le paiement a une date
      if (!paiement.datePaiement) {
        paiement.datePaiement = new Date().toISOString();
        console.log('📅 Date de paiement ajoutée:', paiement.datePaiement);
      }
      
      // ÉTAPE 4: S'assurer que le paiement a un ID temporaire si nouveau
      if (!paiement.id) {
        paiement.id = Math.floor(Math.random() * 10000) + 1000;
        console.log('🆔 ID temporaire ajouté:', paiement.id);
      }
      
      console.log('=== DONNÉES POUR PDF ===');
      console.log('- Paiement ID:', paiement.id);
      console.log('- Ticket ID:', paiement.ticketId);
      console.log('- Ticket complet:', !!ticketComplet);
      if (ticketComplet) {
        console.log('- Numéro ticket:', ticketComplet.numeroTicket);
        console.log('- Client ID:', ticketComplet.clientId);
        console.log('- Client présent:', !!ticketComplet.client);
        if (ticketComplet.client) {
          console.log('- Nom client:', ticketComplet.client.nom);
          console.log('- Prénom client:', ticketComplet.client.prenom);
          console.log('- Téléphone client:', ticketComplet.client.telephone);
        }
      }
      
      // ÉTAPE 5: Générer le PDF
      await this.genererPetitRecuCompletPDF(paiement, ticketComplet, totalPayeTicket);
      console.log('=== PDF PETIT FORMAT GÉNÉRÉ AVEC SUCCÈS ===');
      
    } catch (error) {
      console.error('❌ Erreur téléchargement reçu petit format:', error);
      let errorMessage = 'Erreur lors du téléchargement du reçu';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  async telechargerPaiementsTicketPDF(ticketId: number): Promise<void> {
    try {
      console.log('Génération relevé pour ticket ID:', ticketId);
      
      // Récupérer toutes les informations nécessaires
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
      
      // Format petit pour le relevé
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [105, 148] // A6
      });
      
      // Titre
      doc.setFontSize(16);
      doc.setTextColor(67, 97, 238);
      doc.text('RELEVÉ DES PAIEMENTS', 105/2, 15, { align: 'center' });
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(10, 20, 95, 20);
      
      let yPos = 30;
      
      // Informations du ticket
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Ticket N°: ${ticket.numeroTicket || ticket.id}`, 10, yPos);
      yPos += 6;
      
      doc.text(`Date création: ${this.formatDate(ticket.dateCreation)}`, 10, yPos);
      yPos += 6;
      
      // Informations client
      if (ticket.client) {
        const nomComplet = `${ticket.client.prenom || ''} ${ticket.client.nom || ''}`.trim();
        if (nomComplet) {
          doc.text(`Client: ${nomComplet}`, 10, yPos);
          yPos += 6;
        }
        
        if (ticket.client.telephone) {
          doc.text(`Téléphone: ${ticket.client.telephone}`, 10, yPos);
          yPos += 6;
        }
      } else if (ticket.clientId) {
        doc.text(`Client: ID #${ticket.clientId}`, 10, yPos);
        yPos += 6;
      } else {
        doc.text('Client: Non spécifié', 10, yPos);
        yPos += 6;
      }
      
      yPos += 5;
      
      // Liste des paiements
      doc.setFontSize(12);
      doc.setTextColor(39, 174, 96);
      doc.text('LISTE DES PAIEMENTS', 10, yPos);
      yPos += 8;
      
      const tableData = paiements.map(p => [
        this.formatDate(p.datePaiement),
        this.getModePaiementLibelle(p.modePaiement).substring(0, 10),
        this.formatMontant(p.montant)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Mode', 'Montant']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [39, 174, 96], 
          textColor: [255, 255, 255],
          fontSize: 9 
        },
        margin: { left: 10, right: 10 },
        tableWidth: 85,
        styles: { fontSize: 8 }
      });
      
      // Calcul des totaux
      const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
      const resteAPayer = this.calculerResteAPayer(totalPaye, ticket.prixTotal || 0);
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total payé: ${this.formatMontant(totalPaye)}`, 10, yPos);
      yPos += 6;
      
      if (resteAPayer > 0) {
        doc.setTextColor(231, 76, 60);
      } else {
        doc.setTextColor(46, 204, 113);
      }
      doc.text(`Reste à payer: ${this.formatMontant(resteAPayer)}`, 10, yPos);
      
      // QR Code
      const qrData = `TICKET#${ticket.id}#${totalPaye}#${resteAPayer}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 40, margin: 0 });
      
      doc.addImage(qrCodeUrl, 'PNG', 60, yPos - 20, 35, 35);
      
      // Signature
      yPos += 25;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Signature client:', 10, yPos);
      doc.line(10, yPos + 2, 50, yPos + 2);
      
      // Sauvegarder
      const fileName = `releve-ticket-${ticket.numeroTicket || ticket.id}.pdf`;
      doc.save(fileName);
      
      console.log('Relevé petit format généré avec succès:', fileName);
      
    } catch (error) {
      console.error('Erreur génération relevé petit format:', error);
      throw new Error('Erreur lors de la génération du relevé: ' + (error instanceof Error ? error.message : String(error)));
    }
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
