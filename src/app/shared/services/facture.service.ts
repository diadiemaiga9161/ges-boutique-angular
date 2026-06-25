import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BoutiqueService, BoutiqueInfo } from './boutique.service';
import { FactureDesignService, DesignFacture } from './facture-design.service';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export enum FactureStatut {
  BROUILLON = 'BROUILLON',
  VALIDE = 'VALIDE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

export enum FactureRemiseType {
  POURCENTAGE = 'POURCENTAGE',
  MONTANT_FIXE = 'MONTANT_FIXE'
}

export interface LigneFactureRequest {
  produitId: number;
  designation?: string;
  description?: string;
  quantite: number;
  prixUnitaire: number;
  remisePourcentage?: number;
  remiseMontant?: number;
}

export interface FactureRequest {
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  creerClient?: boolean;
  notes?: string;
  utilisateurId?: number;
  remiseGlobale?: number;
  typeRemiseGlobale?: string;
  lignes: LigneFactureRequest[];
}

export interface LigneFacture {
  id?: number;
  produitId?: number;
  produitNom?: string;
  designation: string;
  description?: string;
  quantite: number;
  prixUnitaire: number;
  prixAchat?: number;
  prixApresRemise?: number;
  sousTotal?: number;
  montantRemise?: number;
  remisePourcentage?: number;
  remiseMontant?: number;
  benefice?: number;
  factureId?: number;
}

export interface Facture {
  id: number;
  numeroFacture: string;
  dateCreation: string;
  dateModification?: string;
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  clientDivers?: boolean;
  lignes: LigneFacture[];
  montantTotal: number;
  montantRemiseTotal: number;
  montantApresRemise: number;
  beneficeTotal: number;
  remiseGlobale: number;
  typeRemiseGlobale?: FactureRemiseType;
  statut: FactureStatut | string;
  venteId?: number;
  utilisateurId?: number;
  utilisateurNom?: string;
  boutique?: BoutiqueInfo;
  notes?: string;
}

export interface StatistiquesFactures {
  nombreTotal: number;
  nombreBrouillons: number;
  nombreValides: number;
  nombrePayees: number;
  nombreAnnulees: number;
  montantTotal: number;
}

@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = `${environment.apiUrl}/caisse/factures`;
  private readonly BOUTIQUE_NOM = 'Boutique Alimentation Ndjim Et Frères';
  private readonly BOUTIQUE_TELEPHONE = '76 96 21 20/66 43 66 03';
  private readonly BOUTIQUE_EMAIL = 'ndjim@yahoo.fr';
  private readonly BOUTIQUE_ADRESSE = 'Misa bougou';
  private get LOGO_BASE64(): string { return this.boutiqueService.getLogoPath(); }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private designService: FactureDesignService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('Token non disponible');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let msg = `Impossible de ${context}`;
    if (error.status === 0) msg = 'Connexion au serveur impossible';
    else if (error.status === 401) { msg = 'Session expirée'; setTimeout(() => this.authService.signout(), 2000); }
    else if (error.status === 403) msg = 'Accès refusé';
    else if (error.status === 404) msg = 'Facture non trouvée';
    else if (error.status === 400 && (error.error?.message || error.error?.error)) msg = error.error.message || error.error.error;
    else if (error.status === 500 && (error.error?.message || error.error?.error)) msg = error.error.message || error.error.error;
    else if (error.status === 500) msg = 'Erreur serveur';
    return throwError(() => new Error(msg));
  }

  private mapFactureResponse(response: any): Facture {
    const data = response.facture || response;
    return {
      id: data.id || 0,
      numeroFacture: data.numeroFacture || '',
      dateCreation: data.dateCreation,
      dateModification: data.dateModification,
      clientId: data.clientId ?? data.client?.id,
      clientNom: data.clientNom ?? data.client?.nom,
      clientPrenom: data.clientPrenom ?? data.client?.prenom,
      clientTelephone: data.clientTelephone ?? data.client?.numeroTelephone,
      clientAdresse: data.clientAdresse ?? data.client?.adresse,
      clientDivers: data.clientDivers,
      lignes: (data.lignes || []).map((l: any) => ({
        id: l.id,
        produitId: l.produitId ?? l.produit?.id,
        produitNom: l.produitNom ?? l.produit?.nom,
        designation: l.designation,
        description: l.description,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        prixAchat: l.prixAchat,
        prixApresRemise: l.prixApresRemise,
        sousTotal: l.sousTotal,
        montantRemise: l.montantRemise,
        remisePourcentage: l.remisePourcentage,
        remiseMontant: l.remiseMontant,
        benefice: l.benefice,
        factureId: l.factureId
      })),
      montantTotal: data.montantTotal || 0,
      montantRemiseTotal: data.montantRemiseTotal || 0,
      montantApresRemise: data.montantApresRemise || 0,
      beneficeTotal: data.beneficeTotal || 0,
      remiseGlobale: data.remiseGlobale || 0,
      typeRemiseGlobale: data.typeRemiseGlobale,
      statut: data.statut || 'BROUILLON',
      venteId: data.venteId,
      utilisateurId: data.utilisateurId,
      utilisateurNom: data.utilisateurNom,
      boutique: data.boutique,
      notes: data.notes
    };
  }

  // CRUD
  creerFacture(request: FactureRequest): Observable<Facture> {
    return this.http.post<any>(this.apiUrl, request, { headers: this.getAuthHeaders() })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'créer la facture')));
  }

  modifierFacture(id: number, request: FactureRequest): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'modifier la facture')));
  }

  supprimerFacture(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map(() => undefined), catchError(err => this.handleError(err, 'supprimer la facture')));
  }

  obtenirFacture(id: number): Observable<Facture> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'récupérer la facture')));
  }

  obtenirToutesFactures(): Observable<Facture[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(map(res => (res.factures || []).map((f: any) => this.mapFactureResponse(f))),
        catchError(err => this.handleError(err, 'récupérer les factures')));
  }

  obtenirFacturesParStatut(statut: string): Observable<Facture[]> {
    return this.http.get<any>(`${this.apiUrl}/statut/${statut}`, { headers: this.getAuthHeaders() })
      .pipe(map(res => (res.factures || []).map((f: any) => this.mapFactureResponse(f))),
        catchError(err => this.handleError(err, 'récupérer les factures par statut')));
  }

  obtenirFacturesParClient(clientNom: string): Observable<Facture[]> {
    const params = new HttpParams().set('clientNom', clientNom);
    return this.http.get<any>(`${this.apiUrl}/client`, { headers: this.getAuthHeaders(), params })
      .pipe(map(res => (res.factures || []).map((f: any) => this.mapFactureResponse(f))),
        catchError(err => this.handleError(err, 'récupérer les factures par client')));
  }

  obtenirFacturesParPeriode(dateDebut: string, dateFin: string): Observable<Facture[]> {
    const params = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get<any>(`${this.apiUrl}/periode`, { headers: this.getAuthHeaders(), params })
      .pipe(map(res => (res.factures || []).map((f: any) => this.mapFactureResponse(f))),
        catchError(err => this.handleError(err, 'récupérer les factures par période')));
  }

  obtenirFacturesParVente(venteId: number): Observable<Facture[]> {
    return this.http.get<any>(`${this.apiUrl}/vente/${venteId}`, { headers: this.getAuthHeaders() })
      .pipe(map(res => (res.factures || []).map((f: any) => this.mapFactureResponse(f))),
        catchError(err => this.handleError(err, 'récupérer les factures par vente')));
  }

  creerFactureDepuisVente(venteId: number, dateFacture: string | null, utilisateurId: number): Observable<Facture> {
    let params = new HttpParams().set('utilisateurId', utilisateurId.toString());
    if (dateFacture) params = params.set('dateFacture', dateFacture);
    return this.http.post<any>(`${this.apiUrl}/depuis-vente/${venteId}`, null, { headers: this.getAuthHeaders(), params })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'créer la facture depuis la vente')));
  }

  getStatistiques(): Observable<StatistiquesFactures> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { headers: this.getAuthHeaders() })
      .pipe(map(res => res.statistiques || res), catchError(err => this.handleError(err, 'récupérer les statistiques')));
  }

  validerFacture(id: number): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/${id}/valider`, {}, { headers: this.getAuthHeaders() })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'valider la facture')));
  }

  annulerFacture(id: number): Observable<Facture> {
    return this.http.put<any>(`${this.apiUrl}/${id}/annuler`, {}, { headers: this.getAuthHeaders() })
      .pipe(map(res => this.mapFactureResponse(res)), catchError(err => this.handleError(err, 'annuler la facture')));
  }

  // Impression et PDF avec logo
  imprimerFacture(facture: Facture): void {
    const html = this.genererHTMLFacture(facture);
    const win = window.open('', '_blank');
    if (!win) throw new Error('Impossible d\'ouvrir la fenêtre');
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); win.addEventListener('afterprint', () => win.close()); }, 500);
  }

  exportFactureToPDF(facture: Facture): void {
    if (!facture) throw new Error('Aucune facture à exporter');
    const design = this.designService.getDesign();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const boutique = this.boutiqueService.getInfo();
    const E = {
      nom: boutique.nom || this.BOUTIQUE_NOM,
      adresse: boutique.adresse || this.BOUTIQUE_ADRESSE,
      telephone: boutique.telephone || this.BOUTIQUE_TELEPHONE,
      email: boutique.email || this.BOUTIQUE_EMAIL
    };
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const logo = this.LOGO_BASE64;

    if (design === 1) {
      // ── Design 1 : Classique bleu ──
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, W, 40, 'F');
      try { doc.addImage(logo, 'PNG', 10, 5, 25, 25); } catch {}
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16); doc.setFont(undefined, 'bold');
      doc.text(E.nom, W / 2, 15, { align: 'center' });
      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text(`${E.adresse} | ${E.telephone} | ${E.email}`, W / 2, 23, { align: 'center' });
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text('FACTURE', W / 2, 33, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(`N° ${facture.numeroFacture}`, 15, 50);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(100);
      doc.text(`Date : ${this.formatDateForExport(facture.dateCreation)}`, W - 15, 50, { align: 'right' });
      doc.text(`Statut : ${this.getStatutText(facture.statut)}`, W - 15, 56, { align: 'right' });
      doc.setDrawColor(30, 64, 175); doc.setLineWidth(0.5); doc.line(15, 58, W - 15, 58);
      doc.setTextColor(0); doc.setFontSize(9);
      doc.text(`Client : ${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}`, 15, 65);
      if (facture.clientTelephone) doc.text(`Tél : ${facture.clientTelephone}`, 15, 71);
      if (facture.utilisateurNom) doc.text(`Vendeur : ${facture.utilisateurNom}`, W - 15, 65, { align: 'right' });
      const tableData = facture.lignes.map(l => [l.designation || 'Produit', l.quantite.toString(), this.formatPlainNumber(l.prixUnitaire) + ' F', l.remisePourcentage ? l.remisePourcentage + '%' : (l.remiseMontant ? this.formatPlainNumber(l.remiseMontant) + ' F' : '-'), this.formatPlainNumber(l.sousTotal || l.quantite * l.prixUnitaire) + ' F']);
      autoTable(doc, { startY: 77, head: [['Désignation', 'Qté', 'Prix U.', 'Remise', 'Total']], body: tableData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
      let fy = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(9); doc.setTextColor(0);
      if (facture.montantRemiseTotal > 0) doc.text(`Remise : -${this.formatPlainNumber(facture.montantRemiseTotal)} F`, W - 15, fy, { align: 'right' });
      if (facture.remiseGlobale > 0) { fy += 6; doc.text(`Remise globale : ${this.formatPlainNumber(facture.remiseGlobale)}${facture.typeRemiseGlobale === FactureRemiseType.POURCENTAGE ? '%' : ' F'}`, W - 15, fy, { align: 'right' }); }
      fy += 8;
      doc.setFillColor(30, 64, 175); doc.rect(W - 65, fy - 5, 50, 10, 'F');
      doc.setTextColor(255); doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text(`${this.formatPlainNumber(facture.montantTotal)} FCFA`, W - 15, fy + 2, { align: 'right' });
      doc.setTextColor(255); doc.setFontSize(7); doc.setFont(undefined, 'normal');
      doc.text('TOTAL', W - 63, fy + 2);

    } else if (design === 2) {
      // ── Design 2 : Moderne sombre + doré ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, H, 'F');
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, W, 6, 'F');
      try { doc.addImage(logo, 'PNG', 10, 12, 22, 22); } catch {}
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(16); doc.setFont(undefined, 'bold');
      doc.text(E.nom, W / 2, 18, { align: 'center' });
      doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont(undefined, 'normal');
      doc.text(`${E.adresse} | ${E.telephone} | ${E.email}`, W / 2, 25, { align: 'center' });
      doc.setTextColor(255); doc.setFontSize(13); doc.setFont(undefined, 'bold');
      doc.text('FACTURE', W / 2, 34, { align: 'center' });
      doc.setFillColor(245, 158, 11); doc.rect(15, 38, W - 30, 0.5, 'F');
      doc.setTextColor(245, 158, 11); doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(`N° ${facture.numeroFacture}`, 15, 46);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
      doc.text(`Date : ${this.formatDateForExport(facture.dateCreation)} | Statut : ${this.getStatutText(facture.statut)}`, W - 15, 46, { align: 'right' });
      doc.setTextColor(255); doc.setFontSize(9);
      doc.text(`Client : ${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}`, 15, 56);
      if (facture.clientTelephone) doc.text(`Tél : ${facture.clientTelephone}`, 15, 62);
      if (facture.utilisateurNom) doc.text(`Vendeur : ${facture.utilisateurNom}`, W - 15, 56, { align: 'right' });
      const tableData2 = facture.lignes.map(l => [l.designation || 'Produit', l.quantite.toString(), this.formatPlainNumber(l.prixUnitaire) + ' F', l.remisePourcentage ? l.remisePourcentage + '%' : (l.remiseMontant ? this.formatPlainNumber(l.remiseMontant) + ' F' : '-'), this.formatPlainNumber(l.sousTotal || l.quantite * l.prixUnitaire) + ' F']);
      autoTable(doc, { startY: 68, head: [['Désignation', 'Qté', 'Prix U.', 'Remise', 'Total']], body: tableData2, theme: 'plain', styles: { fontSize: 8, cellPadding: 2.5, textColor: [255, 255, 255] }, headStyles: { fillColor: [30, 41, 59], textColor: [245, 158, 11], fontStyle: 'bold' }, alternateRowStyles: { fillColor: [30, 41, 59] }, bodyStyles: { fillColor: [15, 23, 42] }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
      let fy2 = (doc as any).lastAutoTable.finalY + 6;
      doc.setTextColor(148, 163, 184); doc.setFontSize(9);
      if (facture.montantRemiseTotal > 0) doc.text(`Remise : -${this.formatPlainNumber(facture.montantRemiseTotal)} F`, W - 15, fy2, { align: 'right' });
      fy2 += 8;
      doc.setFillColor(245, 158, 11); doc.rect(W - 70, fy2 - 6, 55, 12, 'F');
      doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text(`${this.formatPlainNumber(facture.montantTotal)} FCFA`, W - 17, fy2 + 2, { align: 'right' });
      doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont(undefined, 'normal');
      doc.text('TOTAL', W - 68, fy2 + 2);
      doc.setFillColor(245, 158, 11); doc.rect(0, H - 4, W, 4, 'F');

    } else {
      // ── Design 3 : Minimaliste noir & blanc ──
      try { doc.addImage(logo, 'PNG', 10, 8, 20, 20); } catch {}
      doc.setTextColor(24, 24, 27); doc.setFontSize(16); doc.setFont(undefined, 'bold');
      doc.text(E.nom, W / 2, 15, { align: 'center' });
      doc.setFontSize(7); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
      doc.text(`${E.adresse}  |  ${E.telephone}  |  ${E.email}`, W / 2, 21, { align: 'center' });
      doc.setDrawColor(24, 24, 27); doc.setLineWidth(1); doc.line(15, 26, W - 15, 26);
      doc.setLineWidth(0.2); doc.line(15, 27.5, W - 15, 27.5);
      doc.setTextColor(24, 24, 27); doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text('FACTURE', 15, 37);
      doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(80);
      doc.text(`N° ${facture.numeroFacture}`, 15, 44);
      doc.text(`Date : ${this.formatDateForExport(facture.dateCreation)}`, W - 15, 37, { align: 'right' });
      doc.text(`Statut : ${this.getStatutText(facture.statut)}`, W - 15, 44, { align: 'right' });
      doc.setDrawColor(200); doc.setLineWidth(0.3); doc.line(15, 48, W - 15, 48);
      doc.setTextColor(24, 24, 27); doc.setFontSize(9);
      doc.text(`Client : ${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}`, 15, 55);
      if (facture.clientTelephone) doc.text(`Tél : ${facture.clientTelephone}`, 15, 61);
      if (facture.utilisateurNom) doc.text(`Vendeur : ${facture.utilisateurNom}`, W - 15, 55, { align: 'right' });
      const tableData3 = facture.lignes.map(l => [l.designation || 'Produit', l.quantite.toString(), this.formatPlainNumber(l.prixUnitaire) + ' F', l.remisePourcentage ? l.remisePourcentage + '%' : (l.remiseMontant ? this.formatPlainNumber(l.remiseMontant) + ' F' : '-'), this.formatPlainNumber(l.sousTotal || l.quantite * l.prixUnitaire) + ' F']);
      autoTable(doc, { startY: 66, head: [['Désignation', 'Qté', 'Prix U.', 'Remise', 'Total']], body: tableData3, theme: 'grid', styles: { fontSize: 8, cellPadding: 2, textColor: [24, 24, 27] }, headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold' }, alternateRowStyles: { fillColor: [248, 248, 248] }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
      let fy3 = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(9); doc.setTextColor(80);
      if (facture.montantRemiseTotal > 0) doc.text(`Remise : -${this.formatPlainNumber(facture.montantRemiseTotal)} F`, W - 15, fy3, { align: 'right' });
      fy3 += 6;
      doc.setDrawColor(24, 24, 27); doc.setLineWidth(0.8); doc.line(W - 70, fy3, W - 15, fy3);
      doc.setTextColor(24, 24, 27); doc.setFontSize(12); doc.setFont(undefined, 'bold');
      doc.text(`${this.formatPlainNumber(facture.montantTotal)} FCFA`, W - 15, fy3 + 8, { align: 'right' });
      doc.setFontSize(7); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
      doc.text('TOTAL À PAYER', W - 68, fy3 + 8);
      doc.setDrawColor(24, 24, 27); doc.setLineWidth(1); doc.line(15, H - 18, W - 15, H - 18);
      doc.setLineWidth(0.2); doc.line(15, H - 16.5, W - 15, H - 16.5);
    }

    // Notes + pied de page communs
    const lastY = (doc as any).lastAutoTable?.finalY || 150;
    if (facture.notes && lastY + 20 < H - 25) {
      doc.setFontSize(8); doc.setTextColor(100); doc.setFont(undefined, 'normal');
      doc.text(`Notes : ${facture.notes}`, 15, lastY + 18);
    }
    doc.setFontSize(7); doc.setTextColor(150); doc.setFont(undefined, 'normal');
    doc.text('Merci de votre confiance !', W / 2, H - 8, { align: 'center' });

    doc.save(`Facture_${facture.numeroFacture}_${this.formatDateForFileName(new Date().toISOString())}.pdf`);
  }

  // Utilitaires
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price || 0);
  }
  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return dateString; }
  }
  formatDate(dateString: string): string {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return dateString; }
  }
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'BROUILLON': return 'badge-warning';
      case 'VALIDE': return 'badge-info';
      case 'PAYEE': return 'badge-success';
      case 'ANNULEE': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
  getStatutText(statut: string): string {
    const map: { [key: string]: string } = { BROUILLON: 'Brouillon', VALIDE: 'Validée', PAYEE: 'Payée', ANNULEE: 'Annulée' };
    return map[statut] || statut;
  }
  getStatutOptions(): { value: string; label: string }[] {
    return [
      { value: 'BROUILLON', label: 'Brouillon' },
      { value: 'VALIDE', label: 'Validée' },
      { value: 'PAYEE', label: 'Payée' },
      { value: 'ANNULEE', label: 'Annulée' }
    ];
  }
  isFactureModifiable(facture: Facture): boolean { return facture.statut === 'BROUILLON'; }
  isFactureSupprimable(facture: Facture): boolean { return facture.statut === 'BROUILLON'; }

  private formatPlainNumber(price: number): string {
    return (price === undefined || price === null) ? '0' : Math.round(price).toLocaleString('fr-FR');
  }
  private formatDateTimeForExport(dateString: string): string {
    try { const d = new Date(dateString); return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } catch { return dateString; }
  }
  private formatDateForExport(dateString: string): string {
    try { return new Date(dateString).toLocaleDateString('fr-FR'); } catch { return dateString; }
  }
  private formatDateForFileName(dateString: string): string {
    try { const d = new Date(dateString); return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`; } catch { return 'date'; }
  }

  private genererHTMLFacture(facture: Facture): string {
    const boutique = this.boutiqueService.getInfo();
    const entreprise = {
      nom: boutique.nom || this.BOUTIQUE_NOM,
      adresse: boutique.adresse || this.BOUTIQUE_ADRESSE,
      telephone: boutique.telephone || this.BOUTIQUE_TELEPHONE,
      email: boutique.email || this.BOUTIQUE_EMAIL
    };
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facture ${facture.numeroFacture}</title>
      <style>
        @media print { @page { margin: 15mm; size: A4; } body { margin: 0; padding: 0; } .print-btn { display: none; } }
        body { font-family: Arial, Helvetica, sans-serif; margin: 20px; padding: 0; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
        .header { text-align: center; border-bottom: 2px solid #27ae60; padding-bottom: 15px; margin-bottom: 20px; position: relative; }
        .logo { position: absolute; left: 0; top: 0; width: 80px; height: auto; }
        .shop-name { font-size: 22px; font-weight: bold; color: #27ae60; margin-bottom: 5px; }
        .shop-info { font-size: 11px; color: #666; margin: 3px 0; }
        .invoice-title { font-size: 18px; font-weight: bold; margin: 15px 0 5px; }
        .invoice-number { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
        .info-section { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .info-row { display: flex; margin: 5px 0; font-size: 11px; }
        .info-label { width: 100px; font-weight: bold; }
        .info-value { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; font-size: 11px; }
        td { font-size: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-section { text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #27ae60; }
        .total-row { margin: 5px 0; font-size: 12px; }
        .grand-total { font-size: 16px; font-weight: bold; color: #27ae60; }
        .notes { margin-top: 20px; padding: 10px; background: #fef9e6; border-left: 3px solid #f39c12; font-size: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #999; }
        .print-btn { display: block; margin: 20px auto; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 10px; font-weight: bold; }
        .badge-warning { background: #f39c12; color: white; }
        .badge-info { background: #16a085; color: white; }
        .badge-success { background: #27ae60; color: white; }
        .badge-danger { background: #e74c3c; color: white; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <img src="${this.LOGO_BASE64}" class="logo" alt="Logo">
          <div class="shop-name">${entreprise.nom}</div>
          <div class="shop-info">📍 ${entreprise.adresse}</div>
          <div class="shop-info">📞 ${entreprise.telephone}</div>
          <div class="shop-info">✉ ${entreprise.email}</div>
          <div class="invoice-title">FACTURE</div>
          <div class="invoice-number">N° ${facture.numeroFacture}</div>
          <div>Date: ${this.formatDate(facture.dateCreation)}</div>
        </div>
        <div class="info-section">
          <div class="info-row"><div class="info-label">Client :</div><div class="info-value">${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}</div></div>
          ${facture.clientTelephone ? `<div class="info-row"><div class="info-label">Téléphone :</div><div class="info-value">${facture.clientTelephone}</div></div>` : ''}
          ${facture.clientAdresse ? `<div class="info-row"><div class="info-label">Adresse :</div><div class="info-value">${facture.clientAdresse}</div></div>` : ''}
          <div class="info-row"><div class="info-label">Statut :</div><div class="info-value"><span class="badge ${this.getStatutClass(facture.statut)}">${this.getStatutText(facture.statut)}</span></div></div>
          ${facture.utilisateurNom ? `<div class="info-row"><div class="info-label">Vendeur :</div><div class="info-value">${facture.utilisateurNom}</div></div>` : ''}
        </div>
        <table>
          <thead><tr><th>Désignation</th><th class="text-center">Qté</th><th class="text-right">Prix U.</th><th class="text-right">Remise</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${facture.lignes.map(l => `
            <tr>
              <td>${l.designation || 'Produit'}</td>
              <td class="text-center">${l.quantite}</td>
              <td class="text-right">${this.formatPlainNumber(l.prixUnitaire)} FCFA</td>
              <td class="text-right">${l.remisePourcentage ? l.remisePourcentage + '%' : (l.remiseMontant ? this.formatPlainNumber(l.remiseMontant) + ' FCFA' : '-')}</td>
              <td class="text-right">${this.formatPlainNumber(l.sousTotal || l.quantite * l.prixUnitaire)} FCFA</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-row">Sous-total : ${this.formatPlainNumber(facture.montantTotal + facture.montantRemiseTotal)} FCFA</div>
          ${facture.montantRemiseTotal > 0 ? `<div class="total-row">Remise : -${this.formatPlainNumber(facture.montantRemiseTotal)} FCFA</div>` : ''}
          <div class="total-row grand-total">TOTAL À PAYER : ${this.formatPlainNumber(facture.montantTotal)} FCFA</div>
        </div>
        ${facture.notes ? `<div class="notes"><strong>Notes :</strong><br>${facture.notes}</div>` : ''}
        <div class="footer"><div>Merci de votre confiance ! À bientôt chez ${entreprise.nom}</div><div>© ${new Date().getFullYear()} - ${entreprise.nom}</div></div>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Télécharger PDF</button>
        <button style="margin-left:10px;padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer" onclick="window.close()">✕ Fermer</button>
        <script>window.addEventListener('afterprint',function(){window.close();});<\/script>
      </div>
    </body>
    </html>`;
  }
}