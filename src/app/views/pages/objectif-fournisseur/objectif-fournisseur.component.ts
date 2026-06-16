import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ObjectifFournisseurService,
  ObjectifFournisseur,
  ObjectifFournisseurRequest,
  StatsObjectif,
  MOIS_LABELS
} from '../../../shared/services/objectif-fournisseur.service';
import { ProductService } from '../../../shared/services/product.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-objectif-fournisseur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './objectif-fournisseur.component.html',
  styleUrls: ['./objectif-fournisseur.component.scss']
})
export class ObjectifFournisseurComponent implements OnInit {

  objectifs: ObjectifFournisseur[] = [];
  fournisseurs: any[] = [];
  produits: any[] = [];
  stats: StatsObjectif = {
    mois: new Date().getMonth() + 1, annee: new Date().getFullYear(),
    totalObjectifs: 0, objectifsAtteints: 0, objectifsNonAtteints: 0,
    totalBonusCalcule: 0, totalQuantiteBonusRecue: 0
  };

  isLoading = false;
  isSaving = false;
  showFormModal = false;
  isEditing = false;
  selected: ObjectifFournisseur | null = null;

  filtreMois = new Date().getMonth() + 1;
  filtreAnnee = new Date().getFullYear();
  filtreFournisseurId = 0;
  filtreStatut = '';
  modeFiltre: 'mois' | 'annee' | 'tous' = 'mois';

  moisLabels = MOIS_LABELS;
  annees = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  moisOptions = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: MOIS_LABELS[i + 1] }));

  form: ObjectifFournisseurRequest = {
    fournisseurId: 0, mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(), objectifQuantite: 0,
    bonusParUnite: 0, quantiteAtteinte: 0, quantiteBonusRecue: 0
  };

  get bonusCalculePreview(): number {
    return (this.form.quantiteAtteinte || 0) * (this.form.bonusParUnite || 0);
  }

  get objectifsFiltres(): ObjectifFournisseur[] {
    let liste = this.objectifs;
    if (this.filtreFournisseurId) liste = liste.filter(o => o.fournisseurId === this.filtreFournisseurId);
    if (this.filtreStatut) liste = liste.filter(o => o.statut === this.filtreStatut);
    return liste;
  }

  get totalBonusFiltres(): number {
    return this.objectifsFiltres
      .filter(o => o.statut === 'ATTEINT')
      .reduce((s, o) => s + (o.bonusCalcule || 0), 0);
  }

  constructor(
    public objectifService: ObjectifFournisseurService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.isLoading = true;
    this.chargerFournisseurs();
    this.chargerProduits();
    this.chargerObjectifs();
  }

  private chargerFournisseurs(): void {
    this.productService.getAllFournisseurs().subscribe({
      next: d => this.fournisseurs = d,
      error: () => {}
    });
  }

  private chargerProduits(): void {
    this.productService.getAllProduitsForDropdown().subscribe({
      next: d => this.produits = d,
      error: () => {}
    });
  }

  chargerObjectifs(): void {
    this.isLoading = true;
    let obs;
    if (this.modeFiltre === 'mois') {
      obs = this.objectifService.getParMoisAnnee(this.filtreMois, this.filtreAnnee);
    } else if (this.modeFiltre === 'annee') {
      obs = this.objectifService.getParAnnee(this.filtreAnnee);
    } else {
      obs = this.objectifService.getTous();
    }
    obs.subscribe({
      next: data => { this.objectifs = data; this.isLoading = false; this.chargerStats(); },
      error: () => { this.isLoading = false; }
    });
  }

  private chargerStats(): void {
    this.objectifService.getStatistiques(this.filtreMois, this.filtreAnnee).subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  ouvrirFormulaire(objectif?: ObjectifFournisseur): void {
    this.isEditing = !!objectif;
    this.selected = objectif || null;
    if (objectif) {
      this.form = {
        fournisseurId: objectif.fournisseurId,
        produitId: objectif.produitId,
        mois: objectif.mois,
        annee: objectif.annee,
        objectifQuantite: objectif.objectifQuantite,
        bonusParUnite: objectif.bonusParUnite,
        quantiteAtteinte: objectif.quantiteAtteinte,
        quantiteBonusRecue: objectif.quantiteBonusRecue,
        observation: objectif.observation
      };
    } else {
      this.form = {
        fournisseurId: 0, mois: this.filtreMois, annee: this.filtreAnnee,
        objectifQuantite: 0, bonusParUnite: 0, quantiteAtteinte: 0, quantiteBonusRecue: 0
      };
    }
    this.showFormModal = true;
  }

  enregistrer(): void {
    if (!this.form.fournisseurId) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Sélectionnez un fournisseur.' }); return;
    }
    if (!this.form.objectifQuantite || this.form.objectifQuantite <= 0) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: "L'objectif de quantité doit être supérieur à 0." }); return;
    }
    if (this.form.bonusParUnite === undefined || this.form.bonusParUnite < 0) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le bonus par unité ne peut pas être négatif.' }); return;
    }

    this.isSaving = true;
    const obs = this.isEditing && this.selected
      ? this.objectifService.modifier(this.selected.id, this.form)
      : this.objectifService.creer(this.form);

    obs.subscribe({
      next: (result: ObjectifFournisseur) => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerObjectifs();
        if (result.statut === 'ATTEINT') {
          Swal.fire({
            icon: 'success',
            title: '🎯 Objectif atteint !',
            html: `<strong>${result.fournisseurNom}</strong><br>${this.moisLabels[result.mois]} ${result.annee}<br><br>Cliquez sur <b>Valider</b> pour ajouter les bonus au stock.`,
            confirmButtonText: '✅ Valider le stock',
            showCancelButton: true,
            cancelButtonText: 'Plus tard',
            confirmButtonColor: '#16a34a'
          }).then(r => {
            if (r.isConfirmed) this.confirmerValider(result);
          });
        } else {
          Swal.fire({ icon: 'success', title: 'Succès', text: this.isEditing ? 'Objectif modifié.' : 'Objectif enregistré.', timer: 2000, showConfirmButton: false });
        }
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Enregistrement impossible.' });
      }
    });
  }

  confirmerValider(objectif: ObjectifFournisseur): void {
    if (objectif.statut !== 'ATTEINT') {
      Swal.fire({ icon: 'warning', title: 'Impossible', text: "Seuls les objectifs atteints peuvent être validés pour ajout en stock." }); return;
    }
    if (!objectif.produitId) {
      Swal.fire({ icon: 'warning', title: 'Produit manquant', text: 'Associez un produit à cet objectif avant de valider.' }); return;
    }
    if (!objectif.quantiteBonusRecue || objectif.quantiteBonusRecue <= 0) {
      Swal.fire({ icon: 'warning', title: 'Quantité manquante', text: 'Renseignez la quantité bonus reçue avant de valider.' }); return;
    }
    Swal.fire({
      icon: 'question',
      title: 'Valider le bonus ?',
      html: `<b>${objectif.quantiteBonusRecue} unités</b> de <b>${objectif.produitNom}</b> seront ajoutées au stock.`,
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb'
    }).then(r => {
      if (r.isConfirmed) this.valider(objectif.id);
    });
  }

  private valider(id: number): void {
    this.objectifService.valider(id).subscribe({
      next: (result: ObjectifFournisseur) => {
        this.chargerObjectifs();
        Swal.fire({
          icon: 'success',
          title: '✅ Stock mis à jour !',
          html: `<b>${result.quantiteBonusRecue} unité(s)</b> de <b>${result.produitNom || 'produit'}</b> ont été ajoutées au stock avec succès.`,
          confirmButtonColor: '#16a34a',
          timer: 3500,
          showConfirmButton: false
        });
      },
      error: err => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Validation impossible.' })
    });
  }

  confirmerSupprimer(objectif: ObjectifFournisseur): void {
    Swal.fire({
      icon: 'warning',
      title: 'Supprimer ?',
      text: `Supprimer l'objectif ${objectif.fournisseurNom} – ${this.moisLabels[objectif.mois]} ${objectif.annee} ?`,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.objectifService.supprimer(objectif.id).subscribe({
          next: () => { this.chargerObjectifs(); Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false }); },
          error: err => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Suppression impossible.' })
        });
      }
    });
  }

  getPourcentage(o: ObjectifFournisseur): number {
    return this.objectifService.getPourcentageAtteinte(o);
  }

  fmt(m: number): string {
    return this.objectifService.formatMontant(m);
  }

  genererPdfMensuel(): void {
    this.objectifService.getRapportMensuel(this.filtreMois, this.filtreAnnee).subscribe({
      next: rapport => this.exporterPdf(rapport, 'mensuel'),
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Génération PDF impossible.' })
    });
  }

  genererPdfAnnuel(): void {
    this.objectifService.getRapportAnnuel(this.filtreAnnee).subscribe({
      next: rapport => this.exporterPdf(rapport, 'annuel'),
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Génération PDF impossible.' })
    });
  }

  private exporterPdf(rapport: any, type: 'mensuel' | 'annuel'): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();

    // En-tête
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT BONUS FOURNISSEURS', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const periode = type === 'mensuel'
      ? `${MOIS_LABELS[rapport.mois]} ${rapport.annee}`
      : `Année ${rapport.annee}`;
    doc.text(`Période : ${periode}`, pageW / 2, 20, { align: 'center' });
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, pageW / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    let y = 38;

    // Résumé stats
    const stats: StatsObjectif = rapport.statistiques || {};
    const rows4 = [
      ['Total objectifs', String(stats.totalObjectifs || 0)],
      ['Objectifs atteints', String(stats.objectifsAtteints || 0)],
      ['Total bonus fournisseurs', this.fmt(rapport.totalBonusFournisseur || 0)],
      ['Quantité bonus reçue', String(rapport.totalQuantiteBonusRecue || 0) + ' unités']
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Indicateur', 'Valeur']],
      body: rows4,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80, halign: 'right' } },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Tableau des objectifs
    const objectifsList: ObjectifFournisseur[] = rapport.objectifs || [];
    if (objectifsList.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Détail des objectifs', 14, y);
      y += 4;

      const bodyRows = objectifsList.map(o => [
        o.fournisseurNom,
        o.produitNom || '—',
        MOIS_LABELS[o.mois] + ' ' + o.annee,
        this.formatQte(o.objectifQuantite),
        this.formatQte(o.quantiteAtteinte),
        this.fmt(o.bonusParUnite) + '/u',
        this.fmt(o.bonusCalcule),
        this.formatQte(o.quantiteBonusRecue),
        o.statut === 'ATTEINT' ? 'Atteint ✓' : 'Non atteint',
        o.stockAjoute ? 'Oui' : 'Non'
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Fournisseur', 'Produit', 'Période', 'Objectif', 'Atteint', 'Bonus/u', 'Bonus total', 'Qté bonus', 'Statut', 'Stock']],
        body: bodyRows,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], fontSize: 7 },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 8) {
            const val = data.cell.text[0] || '';
            if (val.includes('Atteint')) doc.setTextColor(22, 163, 74);
            else doc.setTextColor(220, 38, 38);
          }
        },
        margin: { left: 6, right: 6 }
      });
    }

    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} / ${pageCount}`, pageW / 2, 290, { align: 'center' });
      doc.text('Ges Boutique — Rapport confidentiel', 14, 290);
    }

    const nomFichier = `bonus-fournisseurs-${type}-${rapport.annee}${type === 'mensuel' ? '-' + String(rapport.mois).padStart(2, '0') : ''}.pdf`;
    doc.save(nomFichier);
  }

  private formatQte(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n || 0);
  }
}
