import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { BoutiqueService } from './boutique.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export enum StatutCommande {
  BROUILLON = 'BROUILLON',
  VALIDEE = 'VALIDEE'
}

export interface LigneCommande {
  id?: number;
  produitId?: number;
  produitNom?: string;
  produit?: { id: number; nom: string; prixVente: number; prixAchat: number };
  quantite: number;
  prixUnitaire: number;
  prixAchat?: number;
  sousTotal?: number;
}

export interface Commande {
  id: number;
  numeroCommande: string;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  client?: { id: number; nom: string; prenom: string; numeroTelephone: string };
  lignes: LigneCommande[];
  montantTotal: number;
  modePaiement: string;
  referencePaiement?: string;
  estCredit: boolean;
  montantVerse: number;
  montantRestant: number;
  dateEcheance?: string;
  statut: StatutCommande;
  dateCommande: string;
  dateValidation?: string;
  venteId?: number;
  notes?: string;
  vendeur?: { id: number; nomComplet: string };
}

export interface CommandeRequest {
  vendeurId: number;
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  lignes: { produitId: number; quantite: number; prixUnitaire: number }[];
  modePaiement: string;
  referencePaiement?: string;
  estCredit?: boolean;
  montantVerse?: number;
  dateEcheance?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private readonly apiUrl = `${environment.apiUrl}/commandes`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private boutiqueService: BoutiqueService
  ) {}

  private get headers() {
    return { headers: this.auth.getAuthHeaders() };
  }

  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl, this.headers);
  }

  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`, this.headers);
  }

  creer(request: CommandeRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request, this.headers);
  }

  modifier(id: number, request: CommandeRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, this.headers);
  }

  valider(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/valider`, {}, this.headers);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.headers);
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-FR').format(v || 0) + ' FCFA';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ─── Facture BON DE COMMANDE ──────────────────────────────────────────────

  imprimerFactureCommande(commande: Commande): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const boutique = this.boutiqueService.getInfo();
    const nomBoutique = boutique?.nom || 'Boutique';
    const adresse = boutique?.adresse || '';
    const tel = boutique?.telephone || '';
    const W = doc.internal.pageSize.getWidth();

    // En-tête
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, W, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(nomBoutique.toUpperCase(), W / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text([adresse, tel].filter(Boolean).join(' · '), W / 2, 20, { align: 'center' });

    // Titre BON DE COMMANDE
    doc.setFillColor(245, 247, 255);
    doc.rect(0, 32, W, 18, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('BON DE COMMANDE', W / 2, 42, { align: 'center' });

    // Infos commande
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const clientNom = [commande.clientNom, commande.clientPrenom].filter(Boolean).join(' ') || commande.client?.nom || 'N/A';
    const dateCmd = this.formatDate(commande.dateCommande);
    const statut = commande.statut === StatutCommande.VALIDEE ? 'VALIDÉE' : 'BROUILLON';

    doc.text(`N° Commande : ${commande.numeroCommande}`, 14, 58);
    doc.text(`Statut : ${statut}`, W - 14, 58, { align: 'right' });
    doc.text(`Client : ${clientNom}`, 14, 64);
    doc.text(`Date : ${dateCmd}`, W - 14, 64, { align: 'right' });
    if (commande.clientTelephone) {
      doc.text(`Tél : ${commande.clientTelephone}`, 14, 70);
    }
    if (commande.dateValidation) {
      doc.text(`Validée le : ${this.formatDate(commande.dateValidation)}`, W - 14, 70, { align: 'right' });
    }

    // Tableau lignes
    const rows = commande.lignes.map((l, i) => [
      i + 1,
      l.produit?.nom || l.produitNom || 'Produit',
      l.quantite,
      this.formatMontant(l.prixUnitaire),
      this.formatMontant(l.sousTotal || l.prixUnitaire * l.quantite)
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['#', 'Produit', 'Qté', 'Prix unitaire', 'Sous-total']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      columnStyles: { 0: { cellWidth: 8 }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    const finalY: number = (doc as any).lastAutoTable.finalY + 6;

    // Totaux
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`TOTAL : ${this.formatMontant(commande.montantTotal)}`, W - 14, finalY, { align: 'right' });

    if (commande.estCredit) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Versé : ${this.formatMontant(commande.montantVerse)}`, W - 14, finalY + 6, { align: 'right' });
      doc.setTextColor(220, 38, 38);
      doc.text(`Reste dû : ${this.formatMontant(commande.montantRestant)}`, W - 14, finalY + 12, { align: 'right' });
      doc.setTextColor(30, 30, 30);
      if (commande.dateEcheance) {
        doc.text(`Échéance : ${commande.dateEcheance}`, W - 14, finalY + 18, { align: 'right' });
      }
    }

    // Mode de paiement
    doc.setFontSize(9);
    doc.text(`Mode de paiement : ${commande.modePaiement || ''}`, 14, finalY);
    if (commande.notes) {
      doc.text(`Notes : ${commande.notes}`, 14, finalY + 6);
    }

    // Pied
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Document généré par Ges-Boutique', W / 2, 285, { align: 'center' });

    const filename = `commande-${commande.numeroCommande}.pdf`;
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) w.onload = () => URL.revokeObjectURL(url);
  }
}
