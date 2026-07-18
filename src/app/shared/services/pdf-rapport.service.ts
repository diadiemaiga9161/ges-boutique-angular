import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface RapportConfig {
  titre: string;
  sousTitre?: string;
  periode?: string;
  sections: RapportSection[];
}

export interface RapportSection {
  titre: string;
  colonnes: string[];
  donnees: (string | number)[][];
  totaux?: (string | number | null)[];
}

@Injectable({ providedIn: 'root' })
export class PdfRapportService {
  private readonly HEADER_COLOR = '#081648';
  private readonly PRIMARY_COLOR = '#1a56db';
  private readonly TEXT_DARK = '#1e293b';
  private readonly TEXT_LIGHT = '#64748b';
  private readonly BORDER_COLOR = '#e2e8f0';
  private readonly BG_STRIPE = '#f8fafc';

  constructor(private http: HttpClient) {}

  // ===== Données API =====

  getVentes(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ventes`, { params }).pipe(catchError(() => of([])));
  }

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/produits`).pipe(catchError(() => of([])));
  }

  getTransferts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/transferts`).pipe(catchError(() => of([])));
  }

  getCredits(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/credits`).pipe(catchError(() => of([])));
  }

  // ===== Génération PDF =====

  async genererPDF(config: RapportConfig): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const marginL = 14;
    const marginR = 14;
    const contentW = pageW - marginL - marginR;
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = 25;
      this.drawPageFooter(doc, pageW, pageH);
    };

    const checkY = (needed: number) => {
      if (y + needed > pageH - 20) { addPage(); }
    };

    // === En-tête ===
    doc.setFillColor(this.HEADER_COLOR);
    doc.rect(0, 0, pageW, 36, 'F');

    doc.setFontSize(18);
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('MAIGA CONSULTING', marginL, 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Systeme de gestion de boutiques', marginL, 20);
    doc.text('+223 53 41 79 19  |  doumaiga3@gmail.com', marginL, 25);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(dateStr, pageW - marginR, 14, { align: 'right' });

    // Ligne séparatrice
    doc.setDrawColor(this.PRIMARY_COLOR);
    doc.setLineWidth(0.8);
    doc.line(0, 36, pageW, 36);

    y = 46;

    // === Titre rapport ===
    doc.setFillColor(this.PRIMARY_COLOR);
    doc.roundedRect(marginL, y, contentW, 14, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#ffffff');
    doc.text(config.titre.toUpperCase(), pageW / 2, y + 9, { align: 'center' });
    y += 20;

    if (config.sousTitre) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(this.TEXT_LIGHT);
      doc.text(config.sousTitre, pageW / 2, y, { align: 'center' });
      y += 6;
    }

    if (config.periode) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(this.TEXT_LIGHT);
      doc.text(`Periode : ${config.periode}`, pageW / 2, y, { align: 'center' });
      y += 8;
    }

    // === Sections ===
    for (const section of config.sections) {
      checkY(20);
      y += 4;

      // Titre section
      doc.setFillColor('#e8f0fe');
      doc.rect(marginL, y, contentW, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.HEADER_COLOR);
      doc.text(section.titre.toUpperCase(), marginL + 3, y + 5.5);
      y += 12;

      if (section.donnees.length === 0) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(this.TEXT_LIGHT);
        doc.text('Aucune donnee pour cette periode', marginL, y);
        y += 8;
        continue;
      }

      // En-tête tableau
      const colW = contentW / section.colonnes.length;
      doc.setFillColor(this.PRIMARY_COLOR);
      doc.rect(marginL, y, contentW, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#ffffff');
      section.colonnes.forEach((col, i) => {
        doc.text(col, marginL + colW * i + 2, y + 5);
      });
      y += 7;

      // Données
      section.donnees.forEach((row, idx) => {
        checkY(7);
        if (idx % 2 === 0) {
          doc.setFillColor(this.BG_STRIPE);
          doc.rect(marginL, y, contentW, 6.5, 'F');
        }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.TEXT_DARK);
        row.forEach((cell, i) => {
          const text = cell !== null && cell !== undefined ? String(cell) : '';
          doc.text(text.substring(0, 18), marginL + colW * i + 2, y + 4.5);
        });
        y += 6.5;
      });

      // Ligne bordure bas du tableau
      doc.setDrawColor(this.BORDER_COLOR);
      doc.setLineWidth(0.3);
      doc.line(marginL, y, marginL + contentW, y);

      // Totaux
      if (section.totaux) {
        doc.setFillColor('#e8f0fe');
        doc.rect(marginL, y, contentW, 7, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.HEADER_COLOR);
        section.totaux.forEach((total, i) => {
          if (total !== null) {
            doc.text(String(total), marginL + colW * i + 2, y + 5);
          }
        });
        y += 7;
      }
      y += 4;
    }

    // Pied de page
    this.drawPageFooter(doc, pageW, pageH);

    // Téléchargement
    const filename = `${config.titre.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  private drawPageFooter(doc: any, pageW: number, pageH: number): void {
    doc.setFillColor(this.HEADER_COLOR);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#ffffff');
    doc.text('MAIGA CONSULTING - Systeme Ges Boutique', 14, pageH - 4);
    doc.text(`Page generee le ${new Date().toLocaleString('fr-FR')}`, pageW - 14, pageH - 4, { align: 'right' });
  }

  // ===== Rapports prédéfinis =====

  async genererRapportVentes(ventes: any[]): Promise<void> {
    const total = ventes.reduce((s, v) => s + (v.montantTotal || v.total || 0), 0);
    const totalFormate = total.toLocaleString('fr-FR') + ' FCFA';

    const config: RapportConfig = {
      titre: 'Rapport des ventes',
      sousTitre: `${ventes.length} vente(s) enregistree(s)`,
      periode: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      sections: [{
        titre: 'Liste des ventes',
        colonnes: ['Date', 'Reference', 'Client', 'Mode', 'Montant'],
        donnees: ventes.map(v => [
          v.dateVente ? new Date(v.dateVente).toLocaleDateString('fr-FR') : '-',
          v.reference || v.id || '-',
          v.clientNom || v.nomClient || 'Comptant',
          v.modePaiement || v.mode || '-',
          (v.montantTotal || v.total || 0).toLocaleString('fr-FR') + ' F'
        ]),
        totaux: ['', '', '', 'TOTAL', totalFormate]
      }]
    };
    await this.genererPDF(config);
  }

  async genererRapportInventaire(produits: any[]): Promise<void> {
    const valeurTotal = produits.reduce((s, p) => s + (p.stock || 0) * (p.prixAchat || 0), 0);

    const config: RapportConfig = {
      titre: 'Rapport d inventaire',
      sousTitre: `${produits.length} produit(s) en stock`,
      sections: [{
        titre: 'Etat des stocks',
        colonnes: ['Produit', 'Categorie', 'Stock', 'Seuil', 'P.Achat', 'Valeur'],
        donnees: produits.map(p => [
          p.nom || '-',
          p.categorie || '-',
          p.stock || 0,
          p.seuilAlerte || 5,
          (p.prixAchat || 0).toLocaleString('fr-FR') + ' F',
          ((p.stock || 0) * (p.prixAchat || 0)).toLocaleString('fr-FR') + ' F'
        ]),
        totaux: ['', '', '', '', 'Valeur totale', valeurTotal.toLocaleString('fr-FR') + ' FCFA']
      }]
    };
    await this.genererPDF(config);
  }

  async genererRapportCredits(credits: any[]): Promise<void> {
    const totalDu = credits.filter(c => c.statut !== 'REGLE').reduce((s, c) => s + (c.montantRestant || c.montant || 0), 0);

    const config: RapportConfig = {
      titre: 'Rapport des credits',
      sousTitre: `${credits.length} credit(s) - Reste du : ${totalDu.toLocaleString('fr-FR')} FCFA`,
      sections: [{
        titre: 'Credits clients',
        colonnes: ['Client', 'Date', 'Montant', 'Verse', 'Restant', 'Statut'],
        donnees: credits.map(c => [
          c.clientNom || c.nomClient || '-',
          c.dateCredit ? new Date(c.dateCredit).toLocaleDateString('fr-FR') : '-',
          (c.montant || 0).toLocaleString('fr-FR') + ' F',
          (c.montantVerse || 0).toLocaleString('fr-FR') + ' F',
          (c.montantRestant || c.montant || 0).toLocaleString('fr-FR') + ' F',
          c.statut || '-'
        ]),
        totaux: ['', '', '', 'Restant du', totalDu.toLocaleString('fr-FR') + ' FCFA', '']
      }]
    };
    await this.genererPDF(config);
  }

  async genererRapportTransferts(transferts: any[]): Promise<void> {
    const config: RapportConfig = {
      titre: 'Rapport des transferts inter-boutiques',
      sousTitre: `${transferts.length} transfert(s)`,
      sections: [{
        titre: 'Transferts effectues',
        colonnes: ['Date', 'De', 'Vers', 'Statut', 'Paiement', 'Montant'],
        donnees: transferts.map(t => [
          t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR') : '-',
          t.boutiqueSrcNom || '-',
          t.boutiqueDestNom || '-',
          t.statut || '-',
          t.typePaiement || '-',
          (t.montantPaiement || 0).toLocaleString('fr-FR') + ' F'
        ])
      }]
    };
    await this.genererPDF(config);
  }
}
