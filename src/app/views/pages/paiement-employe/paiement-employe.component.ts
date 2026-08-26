import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService, Employe } from '../../../shared/services/employe.service';
import { PaiementEmployeService, PaiementEmploye, PaiementEmployeRequest, StatsPaiementEmploye } from '../../../shared/services/paiement-employe.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FactureService } from '../../../shared/services/facture.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { formaterMessageWhatsApp, envoyerWhatsAppDirect } from '../../../shared/utils/whatsapp.util';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

@Component({
  selector: 'app-paiement-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './paiement-employe.component.html',
  styleUrls: ['./paiement-employe.component.scss']
})
export class PaiementEmployeComponent implements OnInit {

  employes: Employe[] = [];
  paiements: PaiementEmploye[] = [];
  stats: StatsPaiementEmploye = { totalPaiements: 0, totalPaies: 0, totalAnnules: 0, montantTotalPaye: 0 };

  isLoading = false;
  isSaving = false;
  showFormModal = false;

  // Filtres
  filtreStatut = '';
  filtreEmployeId: number | string = '';
  searchQuery = '';

  // Formulaire de paiement
  form: PaiementEmployeRequest = {
    employeId: 0,
    nombreMois: 1,
    periodeDebut: '',
    periodeFin: '',
    observation: '',
    utilisateurId: undefined
  };

  moisOptions: string[] = [];
  anneeOptions: number[] = [];
  selectedMoisDebut = '';
  selectedAnneeDebut = new Date().getFullYear();
  selectedMoisFin = '';
  selectedAnneeFin = new Date().getFullYear();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  get paiementsFiltres(): PaiementEmploye[] {
    let liste = this.paiements;
    if (this.filtreStatut) liste = liste.filter(p => p.statut === this.filtreStatut);
    if (this.filtreEmployeId !== '' && this.filtreEmployeId !== null) liste = liste.filter(p => p.employeId === this.filtreEmployeId);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      liste = liste.filter(p => p.employeNomComplet.toLowerCase().includes(q) || p.periodeDebut.toLowerCase().includes(q));
    }
    return liste;
  }

  get paginatedPaiements(): PaiementEmploye[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.paiementsFiltres.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.paiementsFiltres.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  get employeSelectionne(): Employe | undefined {
    return this.employes.find(e => e.id === this.form.employeId);
  }

  get montantCalcule(): number {
    if (!this.employeSelectionne) return 0;
    return this.employeSelectionne.salaireMensuel * this.form.nombreMois;
  }

  constructor(
    private employeService: EmployeService,
    private paiementService: PaiementEmployeService,
    private authService: AuthService,
    private factureService: FactureService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.genererOptions();
    this.chargerDonnees();
  }

  genererOptions(): void {
    this.moisOptions = MOIS_LABELS;
    const anneeActuelle = new Date().getFullYear();
    this.anneeOptions = Array.from({ length: 5 }, (_, i) => anneeActuelle - 2 + i);
    const moisActuel = MOIS_LABELS[new Date().getMonth()];
    this.selectedMoisDebut = moisActuel;
    this.selectedMoisFin = moisActuel;
  }

  chargerDonnees(): void {
    this.isLoading = true;
    this.employeService.getActifs().subscribe({
      next: d => this.employes = d,
      error: () => Swal.fire({ icon: 'warning', title: 'Attention', text: 'Impossible de charger la liste des employés.', confirmButtonColor: '#3085d6' })
    });
    this.paiementService.getTous().subscribe({
      next: d => { this.paiements = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    this.paiementService.getStatistiques().subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  ouvrirFormPaiement(): void {
    const user = this.authService.getUser?.();
    this.form = {
      employeId: 0,
      nombreMois: 1,
      periodeDebut: '',
      periodeFin: '',
      observation: '',
      utilisateurId: user?.id
    };
    this.showFormModal = true;
  }

  fermerModal(): void { this.showFormModal = false; }

  getPeriodeDebut(): string {
    return `${this.selectedMoisDebut} ${this.selectedAnneeDebut}`;
  }

  getPeriodeFin(): string {
    if (this.form.nombreMois <= 1) return this.getPeriodeDebut();
    return `${this.selectedMoisFin} ${this.selectedAnneeFin}`;
  }

  confirmerPaiement(): void {
    if (!this.form.employeId || this.form.employeId === 0) {
      Swal.fire({ icon: 'warning', title: 'Employé requis', text: 'Veuillez sélectionner un employé.', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!this.selectedMoisDebut) {
      Swal.fire({ icon: 'warning', title: 'Période requise', text: 'Veuillez choisir une période.', confirmButtonColor: '#3085d6' });
      return;
    }

    const employe = this.employeSelectionne!;
    const periodeDebut = this.getPeriodeDebut();
    const periodeFin = this.getPeriodeFin();
    const montant = this.montantCalcule;
    const periodeLabel = this.form.nombreMois > 1 ? `${periodeDebut} à ${periodeFin}` : periodeDebut;

    Swal.fire({
      title: 'Confirmer le paiement ?',
      html: `
        <div class="text-left">
          <p><strong>Employé :</strong> ${employe.nomComplet}</p>
          <p><strong>Poste :</strong> ${employe.poste}</p>
          <p><strong>Période :</strong> ${periodeLabel}</p>
          <p><strong>Nombre de mois :</strong> ${this.form.nombreMois}</p>
          <p><strong>Montant total :</strong> <span class="text-danger font-weight-bold">${this.formatMontant(montant)}</span></p>
          <p class="text-muted small">Ce montant sera débité de la caisse.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, payer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.form.periodeDebut = periodeDebut;
        this.form.periodeFin = this.form.nombreMois > 1 ? periodeFin : periodeDebut;
        this.effectuerPaiement();
      }
    });
  }

  private effectuerPaiement(): void {
    this.isSaving = true;
    this.paiementService.payer(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerDonnees();
        Swal.fire({ icon: 'success', title: 'Paiement effectué !', text: 'Le salaire a été payé avec succès.', timer: 2500, showConfirmButton: false });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Une erreur est survenue.', confirmButtonColor: '#d33' });
      }
    });
  }

  confirmerAnnulation(paiement: PaiementEmploye): void {
    Swal.fire({
      title: 'Annuler ce paiement ?',
      html: `
        <div class="text-left">
          <p><strong>Employé :</strong> ${paiement.employeNomComplet}</p>
          <p><strong>Période :</strong> ${paiement.periodeDebut}${paiement.periodeFin && paiement.periodeFin !== paiement.periodeDebut ? ' à ' + paiement.periodeFin : ''}</p>
          <p><strong>Montant :</strong> <span class="text-danger font-weight-bold">${this.formatMontant(paiement.montant)}</span></p>
          <p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Ce montant sera recrédité dans la caisse.</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Motif d\'annulation (obligatoire)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, annuler le paiement',
      cancelButtonText: 'Non',
      preConfirm: (motif) => {
        if (!motif || motif.trim() === '') {
          Swal.showValidationMessage('Le motif d\'annulation est obligatoire');
        }
        return motif;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const user = this.authService.getUser?.();
        this.paiementService.annuler(paiement.id, result.value, user?.id).subscribe({
          next: () => {
            this.chargerDonnees();
            Swal.fire({ icon: 'success', title: 'Paiement annulé', text: 'Le montant a été recrédité en caisse.', timer: 2500, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors de l\'annulation.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(m) + ' FCFA';
  }

  /** Envoi du reçu de paiement par WhatsApp directement au numéro enregistré sur la fiche employé. */
  envoyerRecuWhatsApp(p: PaiementEmploye): void {
    const employe = this.employes.find(e => e.id === p.employeId);
    const telephone = employe?.telephone;
    const boutique = this.boutiqueService.getInfo();
    const periodeLabel = p.periodeFin && p.periodeFin !== p.periodeDebut ? `${p.periodeDebut} à ${p.periodeFin}` : p.periodeDebut;

    const message = formaterMessageWhatsApp({
      boutiqueNom: boutique.nom || 'Ges Boutique',
      boutiqueTelephone: boutique.telephone,
      titreDocument: 'Reçu de paiement de salaire',
      personneLabel: 'Employé',
      personneNom: p.employeNomComplet,
      date: p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      lignes: [`Poste : ${p.employePoste || '—'}`, `Période : ${periodeLabel}`, `Nombre de mois : ${p.nombreMois}`],
      totaux: [{ label: 'Montant payé', valeur: this.formatMontant(p.montant) }],
      notePied: p.observation
    });

    if (!envoyerWhatsAppDirect(telephone, message)) {
      Swal.fire({
        icon: 'info',
        title: 'Aucun numéro enregistré',
        text: `Ajoutez un numéro de téléphone à la fiche de ${p.employeNomComplet} pour activer l'envoi WhatsApp.`,
        timer: 3500,
        showConfirmButton: false
      });
    }
  }

  telechargerRecuPaiement(p: PaiementEmploye): void {
    const qrData = encodeURIComponent(`PAIEMENT_EMPLOYE\nEmployé: ${p.employeNomComplet}\nPoste: ${p.employePoste || ''}\nMontant: ${p.montant} FCFA\nDate: ${p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : ''}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const montantFmt = (p.montant || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
    const salaireFmt = (p.salaireMensuel || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
    const datePaiement = p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) : '—';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Reçu paiement — ${p.employeNomComplet}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:540px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(5,80,40,.12)}
.hdr{background:linear-gradient(135deg,#064e3b,#10b981);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:center}
.hdr-title{font-size:20px;font-weight:900}.hdr-sub{font-size:12px;opacity:.7;margin-top:3px}
.recu-title{text-align:center;padding:18px;font-size:13px;font-weight:700;letter-spacing:2px;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0}
.body{padding:20px 28px}
.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9}
.info-row:last-child{border-bottom:none}
.info-label{color:#64748b;font-size:12px}
.info-val{font-weight:700;color:#1e293b;font-size:13px}
.montant-box{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin:20px 0}
.montant-val{font-size:2rem;font-weight:900;color:#166534}
.montant-lbl{font-size:11px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:#10b981;color:#fff}.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#064e3b,#10b981);color:rgba(255,255,255,.6);text-align:center;padding:12px;font-size:11px}
.stamp{display:inline-block;border:3px solid #10b981;border-radius:8px;padding:6px 16px;color:#064e3b;font-weight:900;font-size:14px;letter-spacing:2px;transform:rotate(-3deg);margin:8px auto}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">REÇU DE PAIEMENT</div>
      <div class="hdr-sub">Ges Boutique &mdash; Paiement Employé</div>
    </div>
    <img src="${qrUrl}" width="72" height="72" style="border-radius:8px;background:#fff;padding:3px" alt="QR" onerror="this.style.display='none'">
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="recu-title">Reçu de salaire</div>
  <div class="body">
    <div class="info-row"><span class="info-label">Employé</span><span class="info-val">${p.employeNomComplet}</span></div>
    <div class="info-row"><span class="info-label">Poste</span><span class="info-val">${p.employePoste || '—'}</span></div>
    <div class="info-row"><span class="info-label">Salaire mensuel</span><span class="info-val">${salaireFmt} FCFA</span></div>
    <div class="info-row"><span class="info-label">Nombre de mois</span><span class="info-val">${p.nombreMois} mois</span></div>
    <div class="info-row"><span class="info-label">Période</span><span class="info-val">${p.periodeDebut}${p.periodeFin && p.periodeFin !== p.periodeDebut ? ' → ' + p.periodeFin : ''}</span></div>
    <div class="info-row"><span class="info-label">Date de paiement</span><span class="info-val">${datePaiement}</span></div>
    ${p.observation ? `<div class="info-row"><span class="info-label">Observation</span><span class="info-val">${p.observation}</span></div>` : ''}
    <div class="montant-box">
      <div class="montant-lbl">Montant payé</div>
      <div class="montant-val">${montantFmt} FCFA</div>
    </div>
    <div style="text-align:center"><div class="stamp">✓ PAYÉ</div></div>
  </div>
  <div class="ftr">Ges Boutique &middot; Reçu généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</div></body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }
}
