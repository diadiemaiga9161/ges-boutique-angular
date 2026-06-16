import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  CompteService,
  Compte,
  CompteRequest,
  OperationCompteRequest,
  OperationCompte,
  TypeOperationCompte,
  TransfertCaisseBanqueRequest
} from '../../../shared/services/compte.service';
import { AuthService } from '../../../shared/services/auth.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe]
})
export class ComptesComponent implements OnInit {

  comptes: Compte[] = [];
  selectedCompte: Compte | null = null;
  historique: OperationCompte[] = [];
  historiqueFiltre: OperationCompte[] = [];

  isLoading = false;
  isLoadingHistorique = false;
  errorMessage = '';
  successMessage = '';

  showAddModal = false;
  showEditModal = false;
  showOperationModal = false;
  showHistoriqueModal = false;

  compteForm: CompteRequest = this.emptyCompteForm();

  operationForm: OperationCompteRequest = {
    compteId: 0,
    type: 'VERSEMENT',
    montant: 0,
    motif: '',
    reference: ''
  };

  typesOperation: { value: TypeOperationCompte; label: string }[] = [
    { value: 'VERSEMENT', label: 'Versement' },
    { value: 'RETRAIT', label: 'Retrait' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'FRAIS', label: 'Frais bancaires' },
    { value: 'BON_CAISSE', label: 'Bon de caisse' }
  ];

  // Pagination
  pageActuelle = 1;
  elementsParPage = 10;
  totalElements = 0;

  // Filtres date
  filtreDate: 'jour' | 'semaine' | 'mois' | 'tous' = 'tous';
  dateDebut: string = '';
  dateFin: string = '';

  constructor(
    private compteService: CompteService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadComptes();
    this.initDates();
  }

  initDates(): void {
    const today = new Date();
    this.dateFin = this.formatDate(today);
    
    const debutMois = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateDebut = this.formatDate(debutMois);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadComptes(): void {
    this.isLoading = true;
    this.compteService.getTousLesComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  get totalSoldes(): number {
    return this.comptes.reduce((sum, c) => sum + (c.soldeActuel || 0), 0);
  }

  get totalVersements(): number {
    return this.comptes.reduce((sum, c) => sum + (c.totalVersements || 0), 0);
  }

  get totalRetraits(): number {
    return this.comptes.reduce((sum, c) => sum + (c.totalRetraits || 0), 0);
  }

  openAddModal(): void {
    this.compteForm = this.emptyCompteForm();
    this.showAddModal = true;
  }

  openEditModal(compte: Compte): void {
    this.selectedCompte = compte;
    this.compteForm = {
      nomBanque: compte.nomBanque,
      numeroCompte: compte.numeroCompte || '',
      agence: compte.agence || '',
      titulaire: compte.titulaire || '',
      soldeInitial: compte.soldeInitial,
      description: compte.description || ''
    };
    this.showEditModal = true;
  }

  openOperationModal(compte: Compte): void {
    this.selectedCompte = compte;
    this.operationForm = {
      compteId: compte.id,
      type: 'VERSEMENT',
      montant: 0,
      motif: '',
      reference: ''
    };
    this.showOperationModal = true;
  }

  openHistoriqueModal(compte: Compte): void {
    this.selectedCompte = compte;
    this.showHistoriqueModal = true;
    this.pageActuelle = 1;
    this.filtreDate = 'tous';
    this.initDates();
    this.loadHistorique();
  }

  loadHistorique(): void {
    if (!this.selectedCompte) return;
    
    this.isLoadingHistorique = true;
    this.compteService.getHistoriqueOperations(this.selectedCompte.id).subscribe({
      next: (ops) => {
        this.historique = ops;
        this.appliquerFiltres();
        this.isLoadingHistorique = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoadingHistorique = false;
      }
    });
  }

  appliquerFiltres(): void {
    let resultats = [...this.historique];

    // Filtre par date
    if (this.filtreDate !== 'tous') {
      const maintenant = new Date();
      const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
      
      resultats = resultats.filter(op => {
        const dateOp = new Date(op.dateOperation);
        
        switch (this.filtreDate) {
          case 'jour':
            const dateOpJour = new Date(dateOp.getFullYear(), dateOp.getMonth(), dateOp.getDate());
            return dateOpJour.getTime() === aujourdhui.getTime();
          
          case 'semaine':
            const debutSemaine = new Date(aujourdhui);
            debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
            return dateOp >= debutSemaine;
          
          case 'mois':
            return dateOp.getMonth() === maintenant.getMonth() && 
                   dateOp.getFullYear() === maintenant.getFullYear();
          
          default:
            return true;
        }
      });
    }

    // Filtre par plage personnalisée
    if (this.dateDebut && this.filtreDate === 'tous') {
      const debut = new Date(this.dateDebut);
      debut.setHours(0, 0, 0, 0);
      resultats = resultats.filter(op => new Date(op.dateOperation) >= debut);
    }
    
    if (this.dateFin && this.filtreDate === 'tous') {
      const fin = new Date(this.dateFin);
      fin.setHours(23, 59, 59, 999);
      resultats = resultats.filter(op => new Date(op.dateOperation) <= fin);
    }

    // Trier par date décroissante
    resultats.sort((a, b) => new Date(b.dateOperation).getTime() - new Date(a.dateOperation).getTime());
    
    this.totalElements = resultats.length;
    const debut = (this.pageActuelle - 1) * this.elementsParPage;
    this.historiqueFiltre = resultats.slice(debut, debut + this.elementsParPage);
  }

  changerFiltreDate(): void {
    this.pageActuelle = 1;
    this.appliquerFiltres();
  }

  appliquerPlageDate(): void {
    this.filtreDate = 'tous';
    this.pageActuelle = 1;
    this.appliquerFiltres();
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.elementsParPage);
  }

  pagePrecedente(): void {
    if (this.pageActuelle > 1) {
      this.pageActuelle--;
      this.appliquerFiltres();
    }
  }

  pageSuivante(): void {
    if (this.pageActuelle < this.totalPages) {
      this.pageActuelle++;
      this.appliquerFiltres();
    }
  }

  allerPage(page: number): void {
    this.pageActuelle = page;
    this.appliquerFiltres();
  }

  get pages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.pageActuelle;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }
    return pages;
  }

  telechargerCSV(): void {
    if (!this.selectedCompte || this.historiqueFiltre.length === 0) {
      Swal.fire('Info', 'Aucune opération à exporter', 'info');
      return;
    }

    // Préparer les données CSV
    const entetes = ['Date', 'Type', 'Motif', 'Référence', 'Montant', 'Solde Avant', 'Solde Après'];
    
    const lignes = this.historiqueFiltre.map(op => [
      new Date(op.dateOperation).toLocaleString('fr-FR'),
      this.getTypeLabel(op.type),
      op.motif || '',
      op.reference || '',
      `${this.isDebit(op.type) ? '-' : '+'}${op.montant.toLocaleString('fr-FR')} F`,
      `${op.soldeAvant.toLocaleString('fr-FR')} F`,
      `${op.soldeApres.toLocaleString('fr-FR')} F`
    ]);

    const contenuCSV = [entetes, ...lignes]
      .map(ligne => ligne.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Ajouter BOM pour les caractères français
    const blob = new Blob(['\uFEFF' + contenuCSV], { type: 'text/csv;charset=utf-8;' });
    
    // Télécharger
    const lien = document.createElement('a');
    const url = URL.createObjectURL(blob);
    lien.href = url;
    lien.setAttribute('download', `historique_${this.selectedCompte.nomBanque}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Export CSV réussi',
      text: `${this.historiqueFiltre.length} opérations exportées`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  telechargerPDF(): void {
    if (!this.selectedCompte || this.historiqueFiltre.length === 0) {
      Swal.fire('Info', 'Aucune opération à exporter', 'error');
      return;
    }

    // Créer le document PDF
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    // Titre
    const titre = `Historique des opérations - ${this.selectedCompte.nomBanque}`;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(titre, 14, 15);
    
    // Informations du compte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let yOffset = 25;
    
    doc.text(`Titulaire: ${this.selectedCompte.titulaire || 'Non spécifié'}`, 14, yOffset);
    doc.text(`Numéro de compte: ${this.selectedCompte.numeroCompte || 'Non spécifié'}`, 14, yOffset + 5);
    doc.text(`Agence: ${this.selectedCompte.agence || 'Non spécifié'}`, 14, yOffset + 10);
    doc.text(`Solde actuel: ${this.selectedCompte.soldeActuel.toLocaleString('fr-FR')} F`, 14, yOffset + 15);
    
    // Informations sur le filtre
    let filtreInfo = '';
    if (this.filtreDate === 'jour') filtreInfo = 'Filtre: Aujourd\'hui';
    else if (this.filtreDate === 'semaine') filtreInfo = 'Filtre: Cette semaine';
    else if (this.filtreDate === 'mois') filtreInfo = 'Filtre: Ce mois';
    else if (this.dateDebut || this.dateFin) {
      filtreInfo = `Période: ${this.dateDebut || 'début'} au ${this.dateFin || 'aujourd\'hui'}`;
    } else {
      filtreInfo = 'Période: Toutes les opérations';
    }
    
    doc.text(filtreInfo, 200, yOffset, { align: 'right' });
    doc.text(`Date d'export: ${new Date().toLocaleString('fr-FR')}`, 200, yOffset + 5, { align: 'right' });
    doc.text(`Total opérations: ${this.totalElements}`, 200, yOffset + 10, { align: 'right' });
    
    // Préparer les données pour le tableau
    const entetes = [['Date', 'Type', 'Motif', 'Référence', 'Montant', 'Solde Avant', 'Solde Après']];
    
    const lignes = this.historiqueFiltre.map(op => [
      new Date(op.dateOperation).toLocaleString('fr-FR'),
      this.getTypeLabel(op.type),
      op.motif || '-',
      op.reference || '-',
      `${this.isDebit(op.type) ? '-' : '+'} ${op.montant.toLocaleString('fr-FR')} F`,
      `${op.soldeAvant.toLocaleString('fr-FR')} F`,
      `${op.soldeApres.toLocaleString('fr-FR')} F`
    ]);
    
    // Calculer la somme des montants
    const totalVersements = this.historiqueFiltre
      .filter(op => !this.isDebit(op.type))
      .reduce((sum, op) => sum + op.montant, 0);
    
    const totalDebits = this.historiqueFiltre
      .filter(op => this.isDebit(op.type))
      .reduce((sum, op) => sum + op.montant, 0);
    
    // Ajouter des lignes de récapitulatif
    lignes.push(['', '', '', '', '', '', '']);
    lignes.push(['', '', '', '', 'TOTAL VERSEMENTS:', `${totalVersements.toLocaleString('fr-FR')} F`, '']);
    lignes.push(['', '', '', '', 'TOTAL DÉBITS:', `${totalDebits.toLocaleString('fr-FR')} F`, '']);
    lignes.push(['', '', '', '', 'SOLDE FINAL:', `${this.selectedCompte.soldeActuel.toLocaleString('fr-FR')} F`, '']);
    
    // Créer le tableau
    autoTable(doc, {
      head: entetes,
      body: lignes,
      startY: 45,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 40, halign: 'left' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Ajouter le numéro de page en bas
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${data.pageNumber} sur ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });
    
    // Sauvegarder le PDF
    const nomFichier = `historique_${this.selectedCompte.nomBanque}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomFichier);
    
    Swal.fire({
      icon: 'success',
      title: 'Export PDF réussi',
      text: `${this.historiqueFiltre.length} opérations exportées`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  saveCompte(): void {
    if (!this.compteForm.nomBanque?.trim()) {
      Swal.fire('Erreur', 'Le nom de la banque est obligatoire', 'error');
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous créer le compte bancaire "${this.compteForm.nomBanque}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.compteService.creerCompte(this.compteForm).subscribe({
          next: () => {
            this.showAddModal = false;
            this.loadComptes();
            Swal.fire({ icon: 'success', title: 'Compte créé', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Erreur', err.message, 'error');
          }
        });
      }
    });
  }

  updateCompte(): void {
    if (!this.selectedCompte) return;

    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous modifier le compte "${this.selectedCompte.nomBanque}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.compteService.modifierCompte(this.selectedCompte!.id, this.compteForm).subscribe({
          next: () => {
            this.showEditModal = false;
            this.loadComptes();
            Swal.fire({ icon: 'success', title: 'Compte mis à jour', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Erreur', err.message, 'error');
          }
        });
      }
    });
  }

  // ==================== MÉTHODE POUR GÉRER LE VERSEMENT AVEC VÉRIFICATION CAISSE ====================
  enregistrerOperation(): void {
    if (!this.operationForm.montant || this.operationForm.montant <= 0) {
      Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'error');
      return;
    }

    const typeLabel = this.getTypeLabel(this.operationForm.type);
    const montantStr = this.operationForm.montant.toLocaleString('fr-FR');

    // ========== CAS VERSEMENT (Caisse → Banque) ==========
    if (this.operationForm.type === 'VERSEMENT') {
      // Vérifier d'abord le solde de la caisse via une requête
      this.isLoading = true;
      
      // Appel pour vérifier l'état de la caisse
      this.http.get<any>(`${environment.apiUrl}/caisse/etat`).subscribe({
        next: (caisseData) => {
          const soldeCaisse = caisseData.caisse?.soldeActuel || 0;
          
          if (soldeCaisse < this.operationForm.montant) {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: '❌ Solde caisse insuffisant !',
              html: `<strong>Vérifiez bien la caisse</strong><br><br>
                     📊 Solde actuel de la caisse : <strong>${soldeCaisse.toLocaleString('fr-FR')} F</strong><br>
                     💸 Montant demandé : <strong>${this.operationForm.montant.toLocaleString('fr-FR')} F</strong><br><br>
                     <span class="text-danger">Le solde de la caisse est insuffisant pour effectuer ce versement.</span><br>
                     Veuillez vérifier les entrées/sorties de caisse avant de réessayer.`,
              confirmButtonText: 'OK',
              confirmButtonColor: '#d33'
            });
            return;
          }
          
          // Solde caisse suffisant, on effectue le transfert
          const userId = this.authService.getUser()?.id;
          const motifOp = this.operationForm.motif || `Versement sur compte ${this.selectedCompte?.nomBanque}`;
          
          const transfertRequest: TransfertCaisseBanqueRequest = {
            compteId: this.selectedCompte!.id,
            montant: this.operationForm.montant,
            motif: motifOp,
            utilisateurId: userId,
            reference: this.operationForm.reference
          };
          
          this.compteService.transfererCaisseVersBanque(transfertRequest).subscribe({
            next: () => {
              this.showOperationModal = false;
              this.loadComptes();
              this.isLoading = false;
              Swal.fire({
                icon: 'success',
                title: '✅ Versement effectué !',
                text: `${this.operationForm.montant.toLocaleString('fr-FR')} F transférés de la caisse vers ${this.selectedCompte?.nomBanque}`,
                timer: 2500,
                showConfirmButton: false
              });
            },
            error: (err) => {
              this.isLoading = false;
              if (err.message?.toLowerCase().includes('insuffisant')) {
                Swal.fire({
                  icon: 'error',
                  title: 'Solde caisse insuffisant !',
                  text: 'Le solde de la caisse ne permet pas d\'effectuer ce versement. Veuillez vérifier la caisse.',
                  confirmButtonColor: '#d33'
                });
              } else {
                Swal.fire('Erreur', err.message, 'error');
              }
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire('Erreur', 'Impossible de vérifier l\'état de la caisse', 'error');
        }
      });
      return;
    }

    // ========== CAS AUTRES OPÉRATIONS (RETRAIT, CHEQUE, FRAIS, BON_CAISSE) ==========
    const nouveauSolde = this.isDebit(this.operationForm.type)
      ? (this.selectedCompte!.soldeActuel - this.operationForm.montant)
      : (this.selectedCompte!.soldeActuel + this.operationForm.montant);

    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous effectuer cette opération ?<br><br>
             <strong>Type :</strong> ${typeLabel}<br>
             <strong>Montant :</strong> ${montantStr} F<br>
             <strong>Compte :</strong> ${this.selectedCompte?.nomBanque}<br>
             <strong>Solde actuel :</strong> ${this.selectedCompte?.soldeActuel?.toLocaleString('fr-FR')} F<br>
             <strong>Après opération :</strong> ${nouveauSolde.toLocaleString('fr-FR')} F`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const userId = this.authService.getUser()?.id;
        this.compteService.enregistrerOperation({ ...this.operationForm, utilisateurId: userId }).subscribe({
          next: (res) => {
            this.showOperationModal = false;
            this.loadComptes();
            Swal.fire({
              icon: 'success',
              title: 'Opération enregistrée',
              text: `Nouveau solde : ${res.soldeActuel?.toLocaleString('fr-FR')} F`,
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Erreur', err.message, 'error');
          }
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    const found = this.typesOperation.find(t => t.value === type);
    if (found) return found.label;
    if (type === 'PAIEMENT_FOURNISSEUR') return 'Paiement fournisseur';
    if (type === 'AVANCE_FOURNISSEUR') return 'Avance fournisseur';
    if (type === 'REMBOURSEMENT_ACHAT') return 'Remboursement achat';
    return type;
  }

  isDebit(type: string): boolean {
    return ['RETRAIT', 'CHEQUE', 'FRAIS', 'BON_CAISSE', 'PAIEMENT_FOURNISSEUR', 'AVANCE_FOURNISSEUR'].includes(type);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  private emptyCompteForm(): CompteRequest {
    return { nomBanque: '', numeroCompte: '', agence: '', titulaire: '', soldeInitial: 0, description: '' };
  }
}