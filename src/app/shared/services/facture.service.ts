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
    this.openHtmlBlob(this.genererHTMLFacture(facture), true);
  }

  ouvrirFacture(facture: Facture): void {
    this.openHtmlBlob(this.genererHTMLFacture(facture), false);
  }

  ouvrirRecuPaiementFournisseur(paiement: any, fournisseur: any): void {
    const boutique = this.boutiqueService.getInfo();
    const nom = boutique.nom || 'Ges Boutique';
    const tel = boutique.telephone || '';
    const adr = boutique.adresse || '';
    const date = new Date().toLocaleDateString('fr-FR');
    const datePai = paiement.datePaiement
      ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR')
      : date;

    const qrData = encodeURIComponent(
      `RECU PAIEMENT FOURNISSEUR\nFournisseur: ${fournisseur.nom}\nDate: ${datePai}\nMontant: ${this.formatPlainNumber(paiement.montant)} FCFA\nMode: ${paiement.modePaiement || 'ESPECES'}\nRef: ${paiement.reference || '-'}\nBoutique: ${nom}`
    );

    const html = this.buildHtmlRecu({
      type: 'PAIEMENT FOURNISSEUR',
      numero: paiement.id ? `PAI-${paiement.id}` : 'PAI-XXX',
      date: datePai,
      entite: fournisseur.nom + (fournisseur.code ? ` (${fournisseur.code})` : ''),
      entiteLabel: 'Fournisseur',
      telephone: fournisseur.telephone,
      rows: [
        ['Mode de paiement', paiement.modePaiement || 'ESPECES'],
        ...(paiement.reference ? [['Référence', paiement.reference]] : []),
        ...(paiement.observation ? [['Observation', paiement.observation]] : []),
      ],
      montant: paiement.montant,
      montantLabel: 'MONTANT PAYÉ',
      boutique: nom, tel, adr, qrData
    });
    this.openHtmlBlob(html, false);
  }

  ouvrirRecuReglementCredit(reglement: any, client: any): void {
    const boutique = this.boutiqueService.getInfo();
    const nom = boutique.nom || 'Ges Boutique';
    const tel = boutique.telephone || '';
    const adr = boutique.adresse || '';
    const date = new Date().toLocaleDateString('fr-FR');
    const dateReg = reglement.datePaiement
      ? new Date(reglement.datePaiement).toLocaleDateString('fr-FR')
      : date;
    const clientNom = [client.prenom, client.nom].filter(Boolean).join(' ') || client.nom || 'Client';

    const qrData = encodeURIComponent(
      `RECU REGLEMENT CREDIT\nClient: ${clientNom}\nDate: ${dateReg}\nMontant: ${this.formatPlainNumber(reglement.montant)} FCFA\nMode: ${reglement.modePaiement || 'ESPECES'}\nBoutique: ${nom}`
    );

    const html = this.buildHtmlRecu({
      type: 'RÈGLEMENT CRÉDIT',
      numero: reglement.id ? `REG-${reglement.id}` : 'REG-XXX',
      date: dateReg,
      entite: clientNom,
      entiteLabel: 'Client',
      telephone: client.telephone,
      rows: [
        ['Mode de paiement', reglement.modePaiement || 'ESPECES'],
        ...(reglement.montantRestant != null ? [['Reste dû', this.formatPlainNumber(reglement.montantRestant) + ' FCFA']] : []),
      ],
      montant: reglement.montant,
      montantLabel: 'MONTANT RÉGLÉ',
      boutique: nom, tel, adr, qrData
    });
    this.openHtmlBlob(html, false);
  }

  private buildHtmlRecu(c: {
    type: string; numero: string; date: string; entite: string; entiteLabel: string;
    telephone?: string; rows: string[][]; montant: number; montantLabel: string;
    boutique: string; tel: string; adr: string; qrData: string;
  }): string {
    const design = this.designService.getDesign();
    const acc = design === 2 ? '#f59e0b' : design === 3 ? '#18181b' : '#1a56db';
    const hdrGrad = design === 2
      ? 'linear-gradient(135deg,#0f172a,#1e293b)'
      : design === 3 ? '#18181b'
      : 'linear-gradient(135deg,#081648,#1a56db)';
    const rowsHtml = c.rows.map(([l, v]) =>
      `<div class="r"><span class="rl">${l}</span><span class="rv">${v}</span></div>`
    ).join('');
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>${c.type} — ${c.numero}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px}
.sheet{background:#fff;max-width:520px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:${hdrGrad};color:#fff;padding:28px 24px;text-align:center}
.hdr-type{font-size:11px;letter-spacing:3px;opacity:.7;text-transform:uppercase;margin-bottom:6px}
.hdr-title{font-size:24px;font-weight:900;letter-spacing:1px}
.hdr-num{font-size:12px;opacity:.65;margin-top:6px}
.body{padding:24px}
.section{margin-bottom:18px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:8px}
.entity{font-size:17px;font-weight:700;color:#1e293b}
.entity-sub{font-size:12px;color:#64748b;margin-top:2px}
.r{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f1f5f9}
.rl{color:#64748b;font-size:12px}
.rv{font-weight:600;color:#1e293b;font-size:12px}
.total-box{background:#eff6ff;border:2px solid ${acc};border-radius:10px;padding:18px;text-align:center;margin:18px 0}
.total-lbl{font-size:11px;letter-spacing:2px;color:${acc};text-transform:uppercase;margin-bottom:6px}
.total-val{font-size:32px;font-weight:900;color:${acc}}
.qr-block{text-align:center;padding:12px 0}
.qr-block img{border-radius:8px;border:3px solid #e2e8f0}
.qr-hint{font-size:10px;color:#94a3b8;margin-top:6px}
.ftr{background:${hdrGrad};color:rgba(255,255,255,.6);text-align:center;padding:14px;font-size:11px}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:${acc};color:#fff}
.btn-d{background:#16a34a;color:#fff}
.btn-c{background:#ef4444;color:#fff}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div class="hdr-type">${c.boutique}</div>
    <div class="hdr-title">RECU</div>
    <div class="hdr-num">${c.type} &middot; ${c.numero} &middot; ${c.date}</div>
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer</button>
    <button class="btn btn-d" onclick="dl()">Telecharger</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">${c.entiteLabel}</div>
      <div class="entity">${c.entite}</div>
      ${c.telephone ? `<div class="entity-sub">${c.telephone}</div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">Details</div>
      ${rowsHtml}
    </div>
    <div class="total-box">
      <div class="total-lbl">${c.montantLabel}</div>
      <div class="total-val">${this.formatPlainNumber(c.montant)} FCFA</div>
    </div>
    <div class="qr-block">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${c.qrData}" width="110" height="110" alt="QR Code" onerror="this.style.display='none'">
      <div class="qr-hint">Scanner pour verifier ce recu</div>
    </div>
    ${c.adr || c.tel ? `<div style="text-align:center;color:#94a3b8;font-size:11px">${[c.boutique, c.adr, c.tel].filter(Boolean).join(' &middot; ')}</div>` : ''}
  </div>
  <div class="ftr">Document officiel - Ges Boutique &middot; Genere le ${new Date().toLocaleDateString('fr-FR')}</div>
</div>
<script>
function dl(){
  var h=document.documentElement.outerHTML;
  var b=new Blob([h],{type:'text/html'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(b);
  a.download='recu-${c.numero}.html';
  a.click();
}
<\/script>
</body></html>`;
  }

  protected openHtmlBlob(html: string, autoprint: boolean): void {
    document.getElementById('ang-inv-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'ang-inv-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;background:rgba(0,0,0,.65)';

    const frame = document.createElement('iframe');
    frame.id = 'ang-inv-frame';
    frame.style.cssText = 'flex:1;width:100%;border:none;background:#f8fafc';
    frame.setAttribute('srcdoc', html);

    const bar = document.createElement('div');
    bar.style.cssText = 'background:#1a56db;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.3)';

    const btnClose = document.createElement('button');
    btnClose.textContent = '✕ Fermer';
    btnClose.style.cssText = 'background:#ef4444;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer';
    btnClose.addEventListener('click', () => overlay.remove());

    const btnPrint = document.createElement('button');
    btnPrint.textContent = '🖨 Imprimer / PDF';
    btnPrint.style.cssText = 'background:#fff;color:#1a56db;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer';
    btnPrint.addEventListener('click', () => frame.contentWindow?.print());

    bar.appendChild(btnClose);
    bar.appendChild(btnPrint);
    overlay.appendChild(bar);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    if (autoprint) {
      frame.addEventListener('load', () => setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      }, 400));
    }
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

  protected formatPlainNumber(price: number): string {
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

  // ══════════════════════════════════════════
  // DOCUMENT GÉNÉRIQUE (même look que les factures)
  // ══════════════════════════════════════════

  genererHTMLDocument(config: {
    titre: string;
    sousTitre?: string;
    colonnes: string[];
    lignes: any[][];
    totaux?: { label: string; valeur: string }[];
    pied?: string;
  }): string {
    const design = this.designService.getDesign();
    const boutique = this.boutiqueService.getInfo();
    const nom = boutique.nom || this.BOUTIQUE_NOM;
    const adr = boutique.adresse || this.BOUTIQUE_ADRESSE;
    const tel = boutique.telephone || this.BOUTIQUE_TELEPHONE;
    const date = new Date().toLocaleDateString('fr-FR');

    // Couleurs selon design (identiques à genererHTMLFacture)
    let primaryColor = '#1a56db';
    let headerBg = 'linear-gradient(135deg,#081648 0%,#0d2b85 50%,#1a56db 100%)';
    let headerTextColor = '#ffffff';
    let tblHeadBg = 'linear-gradient(135deg,#081648,#1a56db)';
    if (design === 2) {
      primaryColor = '#f59e0b';
      headerBg = 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)';
      headerTextColor = '#ffffff';
      tblHeadBg = 'linear-gradient(135deg,#0f172a,#1e293b)';
    } else if (design === 3) {
      primaryColor = '#18181b';
      headerBg = '#ffffff';
      headerTextColor = '#18181b';
      tblHeadBg = '#18181b';
    }

    const colonnesHTML = config.colonnes.map(c => `<th>${c}</th>`).join('');
    const lignesHTML = config.lignes.map((row, ri) =>
      `<tr class="${ri % 2 === 0 ? 'even' : ''}">${row.map((cell, ci) =>
        `<td style="${ci === row.length - 1 ? 'text-align:right;font-weight:700' : ''}">${cell ?? ''}</td>`
      ).join('')}</tr>`
    ).join('');

    const totauxHTML = (config.totaux || []).map(t =>
      `<tr class="total-row">
        <td colspan="${config.colonnes.length - 1}" style="text-align:right;font-weight:700;color:${primaryColor}">${t.label}</td>
        <td style="text-align:right;font-weight:900;color:${primaryColor}">${t.valeur}</td>
      </tr>`
    ).join('');

    const footerBg = design === 3 ? '#18181b'
      : design === 2 ? 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)'
      : 'linear-gradient(135deg,#081648 0%,#0d2b85 100%)';

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${config.titre} — ${nom}</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#f8fafc;padding:32px 24px;font-size:13px;line-height:1.5}
  .doc-sheet{background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(8,22,72,.10);max-width:900px;margin:0 auto;overflow:hidden}
  .doc-header{background:${headerBg};padding:24px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .doc-header-brand{color:${headerTextColor}}
  .doc-header-brand h1{font-size:20px;font-weight:900;margin-bottom:4px}
  .doc-header-brand p{font-size:11px;opacity:0.75}
  .doc-header-right{text-align:right;color:${headerTextColor}}
  .doc-header-right .doc-title{font-size:22px;font-weight:900;opacity:0.9;text-transform:uppercase}
  .doc-header-right .doc-subtitle{font-size:13px;margin-top:4px;opacity:0.75}
  .doc-header-right .doc-date{font-size:11px;margin-top:6px;opacity:0.6}
  .doc-body{padding:24px 32px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  thead tr th{background:${tblHeadBg};color:#fff;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;text-align:left}
  tbody tr.even td{background:#f8fafc}
  tbody tr td{padding:9px 14px;font-size:12.5px;border-bottom:1px solid #f1f5f9;color:#334155}
  tfoot tr.total-row td{padding:12px 14px;background:${design === 2 ? '#fef3c7' : design === 3 ? '#f4f4f5' : '#eff6ff'};border-top:2px solid ${primaryColor};font-size:13px}
  .doc-footer{background:${footerBg};padding:14px 32px;display:flex;align-items:center;justify-content:space-between}
  .doc-footer span{color:rgba(255,255,255,.75);font-size:12px}
  .doc-footer-right{color:rgba(255,255,255,.55);font-size:11px;font-style:italic}
  .doc-pied{padding:12px 32px 20px;font-size:11px;color:#94a3b8;text-align:center}
  @media print{@page{size:A4;margin:10mm}body{background:white;padding:0}.doc-sheet{box-shadow:none;border-radius:0;max-width:100%;margin:0}}
</style></head><body>
<div class="doc-sheet">
  <div class="doc-header">
    <div class="doc-header-brand">
      <h1>${nom}</h1>
      <p>${adr ? adr + (tel ? ' — ' : '') : ''}${tel ? 'Tél : ' + tel : ''}</p>
    </div>
    <div class="doc-header-right">
      <div class="doc-title">${config.titre}</div>
      ${config.sousTitre ? `<div class="doc-subtitle">${config.sousTitre}</div>` : ''}
      <div class="doc-date">Généré le ${date}</div>
    </div>
  </div>
  <div class="doc-body">
    <table>
      <thead><tr>${colonnesHTML}</tr></thead>
      <tbody>${lignesHTML}</tbody>
      ${totauxHTML ? `<tfoot>${totauxHTML}</tfoot>` : ''}
    </table>
  </div>
  <div class="doc-footer">
    <span>${nom}</span>
    <span class="doc-footer-right">Document généré par Ges Boutique</span>
  </div>
  ${config.pied ? `<div class="doc-pied">${config.pied}</div>` : ''}
</div>
</body></html>`;
  }

  ouvrirHtmlPersonnalise(html: string): void {
    this.openHtmlBlob(html, false);
  }

  ouvrirDocumentPDF(config: {
    titre: string;
    sousTitre?: string;
    colonnes: string[];
    lignes: any[][];
    totaux?: { label: string; valeur: string }[];
    pied?: string;
  }): void {
    const html = this.genererHTMLDocument(config);
    this.openHtmlBlob(html, false);
  }

  private genererHTMLFacture(facture: Facture): string {
    const design = this.designService.getDesign();
    const shop   = this.boutiqueService.getInfo();
    const nom    = shop.nom  || this.BOUTIQUE_NOM;
    const adr    = shop.adresse   || this.BOUTIQUE_ADRESSE;
    const ville  = shop.ville || '';
    const tel    = shop.telephone || this.BOUTIQUE_TELEPHONE;
    const email  = shop.email || this.BOUTIQUE_EMAIL;
    const rc     = shop.numeroRc  || '';
    const ifu    = shop.numeroIfu || '';

    // Priorité : logo boutique uploadé, sinon logo base64 codé en dur
    const shopLogo = shop.logo || shop.logoPath || '';
    const rawLogo = (shopLogo.startsWith('data:') || shopLogo.startsWith('http')) ? shopLogo : (this.LOGO_BASE64 || '');
    const logoUrl = rawLogo.startsWith('data:') || rawLogo.startsWith('http') ? rawLogo
      : rawLogo ? `${window.location.origin}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}` : '';
    const initial = (nom.charAt(0) || 'B').toUpperCase();
    const logoBlock = logoUrl
      ? `<img src="${logoUrl}" alt="${nom}" class="inv-logo-img" onerror="this.style.display='none';document.getElementById('inv-logo-fb').style.display='flex'">
         <div id="inv-logo-fb" class="inv-logo-fallback" style="display:none">${initial}</div>`
      : `<div class="inv-logo-fallback">${initial}</div>`;

    const rows = facture.lignes.map((l, i) => {
      const remise = l.remisePourcentage ? `${l.remisePourcentage}%`
        : l.remiseMontant ? `${this.formatPlainNumber(l.remiseMontant)} FCFA` : '—';
      return `<tr class="${i % 2 === 0 ? 'even' : ''}">
        <td class="td-name">${l.designation || 'Produit'}</td>
        <td class="td-center">${l.quantite}</td>
        <td class="td-right">${this.formatPlainNumber(l.prixUnitaire)} FCFA</td>
        <td class="td-center td-remise">${remise}</td>
        <td class="td-right td-bold">${this.formatPlainNumber(l.sousTotal || l.quantite * l.prixUnitaire)} FCFA</td>
      </tr>`;
    }).join('');

    const sousTotal = (facture.montantTotal || 0) + (facture.montantRemiseTotal || 0);
    const totauxRows = `
      <tr class="subtotal-row"><td colspan="4" class="td-right td-light">Sous-total</td><td class="td-right">${this.formatPlainNumber(sousTotal)} FCFA</td></tr>
      ${facture.montantRemiseTotal > 0 ? `<tr class="subtotal-row"><td colspan="4" class="td-right td-light">Remise</td><td class="td-right td-red">-${this.formatPlainNumber(facture.montantRemiseTotal)} FCFA</td></tr>` : ''}
      <tr class="total-row">
        <td colspan="4" class="td-right td-total-label">TOTAL À PAYER</td>
        <td class="td-right td-total-val">${this.formatPlainNumber(facture.montantTotal)} FCFA</td>
      </tr>`;

    const pdfAbsoluteUrl = encodeURIComponent(`${window.location.origin}/api/caisse/factures/${facture.id}/pdf`);
    const qrBlock = `<div style="margin-top:10px;text-align:center">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${pdfAbsoluteUrl}"
           width="72" height="72" style="border-radius:6px;background:#fff;padding:3px" alt="QR" onerror="this.style.display='none'">
      <p style="font-size:9px;margin-top:2px;opacity:.65">Scanner pour télécharger le PDF</p>
    </div>`;

    // Couleurs selon design
    const p1 = design === 2 ? '#0f172a' : design === 3 ? '#18181b' : '#081648';
    const p2 = design === 2 ? '#1e293b' : design === 3 ? '#3f3f46' : '#1a56db';
    const acc = design === 2 ? '#f59e0b' : design === 3 ? '#18181b' : '#1a56db';
    const accLight = design === 2 ? '#fef3c7' : design === 3 ? '#f4f4f5' : '#eff6ff';
    const headerGrad = design === 2
      ? `background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);`
      : design === 3 ? `background:#ffffff;border-bottom:3px solid #18181b;`
      : `background:linear-gradient(135deg,#081648 0%,#0d2b85 50%,#1a56db 100%);`;
    const headerTextColor = design === 3 ? '#18181b' : '#ffffff';
    const headerSubColor  = design === 3 ? '#52525b' : design === 2 ? '#94a3b8' : 'rgba(255,255,255,0.60)';
    const logoFallbackBg  = design === 3 ? '#e4e4e7' : 'rgba(255,255,255,0.15)';
    const logoFallbackColor = design === 3 ? '#18181b' : '#ffffff';
    const numColor = design === 2 ? '#fbbf24' : design === 3 ? '#52525b' : '#93c5fd';
    const footerGrad = design === 2
      ? `background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);`
      : design === 3 ? `background:#18181b;`
      : `background:linear-gradient(135deg,#081648 0%,#0d2b85 100%);`;
    const tblHead = design === 2 ? `background:linear-gradient(135deg,#0f172a,#1e293b);`
      : design === 3 ? `background:#18181b;`
      : `background:linear-gradient(135deg,#081648,#1a56db);`;

    const statutBadge = `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;${
      facture.statut === 'PAYEE' ? 'background:#d1fae5;color:#065f46' :
      facture.statut === 'ANNULEE' ? 'background:#fee2e2;color:#991b1b' :
      facture.statut === 'VALIDE' ? 'background:#dbeafe;color:#1e40af' :
      'background:#fef3c7;color:#92400e'}">${this.getStatutText(facture.statut)}</span>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Facture ${facture.numeroFacture} — ${nom}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#f8fafc;padding:32px 24px;font-size:13px;line-height:1.5}
    .invoice-sheet{background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(8,22,72,.10);max-width:820px;margin:0 auto;overflow:hidden}
    .inv-header{${headerGrad}padding:28px 32px 24px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
    .inv-brand{display:flex;align-items:center;gap:14px}
    .inv-logo{flex-shrink:0;display:flex;align-items:center;justify-content:center}
    .inv-logo-img{width:72px;height:72px;object-fit:contain;border-radius:12px;border:1.5px solid rgba(128,128,128,.3)}
    .inv-logo-fallback{width:64px;height:64px;border-radius:16px;background:${logoFallbackBg};border:2px solid rgba(128,128,128,.25);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:${logoFallbackColor};flex-shrink:0}
    .inv-brand-text{color:${headerTextColor}}
    .inv-brand-name{font-size:22px;font-weight:900;letter-spacing:.5px;margin-bottom:3px}
    .inv-brand-sub{font-size:12px;color:${headerSubColor};letter-spacing:.4px}
    .inv-brand-contact{margin-top:8px;font-size:11.5px;color:${headerSubColor};line-height:1.7}
    .inv-title-block{text-align:right;color:${headerTextColor}}
    .inv-title{font-size:28px;font-weight:900;letter-spacing:-.5px;text-transform:uppercase;opacity:.9}
    .inv-number{font-size:16px;font-weight:700;color:${numColor};margin-top:4px;letter-spacing:.5px}
    .inv-date{font-size:12px;color:${headerSubColor};margin-top:6px}
    .inv-info{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f1f5f9}
    .inv-info-block{padding:20px 32px;border-right:1px solid #f1f5f9}
    .inv-info-block:last-child{border-right:none}
    .inv-info-label{font-size:10px;font-weight:800;color:${acc};text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
    .inv-info-name{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px}
    .inv-info-detail{font-size:12.5px;color:#64748b;line-height:1.7}
    .inv-table-wrap{overflow:hidden}
    table{width:100%;border-collapse:collapse}
    thead tr{${tblHead}color:#fff}
    thead th{padding:11px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}
    .th-right{text-align:right}.th-center{text-align:center}
    tbody tr.even{background:#f8fafc}
    td{padding:10px 16px;font-size:13px;border-bottom:1px solid #f1f5f9}
    .td-name{font-weight:600;color:#0f172a}.td-center{text-align:center;color:#475569}
    .td-right{text-align:right;color:#475569}.td-bold{font-weight:700;color:#0f172a}
    .td-remise{color:#dc2626;font-weight:600}.td-light{color:#64748b;font-size:12px}.td-red{color:#dc2626;font-weight:700}
    .subtotal-row td{border-bottom:none;padding:6px 16px}
    .total-row{background:${accLight}}
    .total-row td{padding:14px 16px;border-top:2px solid ${acc}}
    .td-total-label{font-size:13px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.5px}
    .td-total-val{font-size:20px;font-weight:900;color:${acc}}
    .inv-footer{${footerGrad}padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .inv-footer-brand{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.75);font-size:12px}
    .inv-footer-shop-name{font-weight:800;font-size:14px;color:#fff}
    .inv-footer-thank{font-size:12px;color:rgba(255,255,255,.60);font-style:italic}
    @media print{
      @page{size:A4;margin:10mm}
      body{background:white;padding:0;margin:0}
      .invoice-sheet{box-shadow:none;border-radius:0;max-width:100%;margin:0}
    }
  </style>
</head>
<body>
<div class="invoice-sheet">
  <div class="inv-header">
    <div class="inv-brand">
      <div class="inv-logo">${logoBlock}</div>
      <div class="inv-brand-text">
        <p class="inv-brand-name">${nom}</p>
        <p class="inv-brand-sub">${ville || 'Gestion de boutique'}</p>
        <div class="inv-brand-contact">
          ${adr ? `📍 ${adr}${ville ? ', ' + ville : ''}<br>` : ''}
          ${tel ? `📞 ${tel}<br>` : ''}
          ${email ? `✉ ${email}<br>` : ''}
          ${rc ? `RC: ${rc}` : ''}${rc && ifu ? ' · ' : ''}${ifu ? `IFU: ${ifu}` : ''}
        </div>
      </div>
    </div>
    <div class="inv-title-block">
      <p class="inv-title">Facture</p>
      <p class="inv-number">${facture.numeroFacture}</p>
      <p class="inv-date">Émise le ${this.formatDate(facture.dateCreation)}</p>
      ${facture.utilisateurNom ? `<p class="inv-date">Vendeur : ${facture.utilisateurNom}</p>` : ''}
      ${qrBlock}
    </div>
  </div>

  <div class="inv-info">
    <div class="inv-info-block">
      <p class="inv-info-label">Facturé à</p>
      <p class="inv-info-name">${facture.clientNom || 'Client divers'} ${facture.clientPrenom || ''}</p>
      <div class="inv-info-detail">
        ${facture.clientTelephone ? `📞 ${facture.clientTelephone}<br>` : ''}
        ${facture.clientAdresse ? `📍 ${facture.clientAdresse}<br>` : ''}
        ${!facture.clientTelephone && !facture.clientAdresse ? 'Aucune coordonnée' : ''}
      </div>
    </div>
    <div class="inv-info-block">
      <p class="inv-info-label">Détails facture</p>
      <div class="inv-info-detail">
        <strong>N° :</strong> ${facture.numeroFacture}<br>
        <strong>Date :</strong> ${this.formatDate(facture.dateCreation)}<br>
        <strong>Statut :</strong> ${statutBadge}<br>
        ${facture.notes ? `<strong>Notes :</strong> ${facture.notes}` : ''}
      </div>
    </div>
  </div>

  <div class="inv-table-wrap">
    <table>
      <thead><tr>
        <th>Désignation</th>
        <th class="th-center">Qté</th>
        <th class="th-right">Prix unitaire</th>
        <th class="th-center">Remise</th>
        <th class="th-right">Sous-total</th>
      </tr></thead>
      <tbody>${rows}${totauxRows}</tbody>
    </table>
  </div>

  <div class="inv-footer">
    <div class="inv-footer-brand">
      <span class="inv-footer-shop-name">${nom}</span>
      ${adr || tel ? `<span style="color:rgba(255,255,255,.35);margin:0 6px">·</span><span>${adr}${ville ? ' ' + ville : ''}${tel ? ' — ' + tel : ''}</span>` : ''}
    </div>
    <p class="inv-footer-thank">Merci pour votre confiance !</p>
  </div>
</div>
</body>
</html>`;
  }
}