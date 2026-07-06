import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Depense, DepenseRequest, DepenseService, TypeDepense } from '../../../shared/services/depense.service';
import { PaiementEmployeService, PaiementEmploye } from '../../../shared/services/paiement-employe.service';
import { FactureService } from '../../../shared/services/facture.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss']
})
export class DepensesComponent implements OnInit {

  typesDepense: TypeDepense[] = [];
  showTypesModal = false;
  newTypeName = '';
  editingTypeId: number | null = null;
  editingTypeName = '';
  typesLoading = false;
  typesError = '';

  depenses: Depense[] = [];
  paiementsEmploye: PaiementEmploye[] = [];
  totalDepenses = 0;
  loading = false;
  showForm = false;
  editing: Depense | null = null;

  form: DepenseRequest = this.emptyForm();

  dateDebut = '';
  dateFin = '';
  filtreActif = false;

  totauxParType: { type: string; total: number }[] = [];

  private _typeFiltre: string = '';
  get typeFiltre(): string { return this._typeFiltre; }
  set typeFiltre(v: string) { this._typeFiltre = v; this.pageActuelle = 1; }

  private _moisFiltre: string = '';
  get moisFiltre(): string { return this._moisFiltre; }
  set moisFiltre(v: string) { this._moisFiltre = v; this.pageActuelle = 1; }

  pageActuelle: number = 1;
  itemsParPage: number = 10;

  constructor(
    private depenseService: DepenseService,
    private paiementEmployeService: PaiementEmployeService,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
  }

  loadTypes(): void {
    this.depenseService.getTypes().subscribe({
      next: types => this.typesDepense = types,
      error: () => {}
    });
  }

  ouvrirGestionTypes(): void { this.showTypesModal = true; this.typesError = ''; }
  fermerGestionTypes(): void { this.showTypesModal = false; this.newTypeName = ''; this.editingTypeId = null; this.editingTypeName = ''; }

  ajouterType(): void {
    const nom = this.newTypeName.trim();
    if (!nom) return;
    this.typesLoading = true;
    this.depenseService.creerType(nom).subscribe({
      next: t => {
        this.typesDepense.push(t);
        this.typesDepense.sort((a, b) => a.nom.localeCompare(b.nom));
        this.newTypeName = '';
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message; this.typesLoading = false; }
    });
  }

  startEditType(type: TypeDepense): void { this.editingTypeId = type.id; this.editingTypeName = type.nom; }

  saveEditType(): void {
    if (!this.editingTypeId || !this.editingTypeName.trim()) return;
    this.typesLoading = true;
    this.depenseService.modifierType(this.editingTypeId, this.editingTypeName.trim()).subscribe({
      next: t => {
        const idx = this.typesDepense.findIndex(x => x.id === t.id);
        if (idx >= 0) this.typesDepense[idx] = t;
        this.typesDepense.sort((a, b) => a.nom.localeCompare(b.nom));
        this.editingTypeId = null;
        this.editingTypeName = '';
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message; this.typesLoading = false; }
    });
  }

  cancelEditType(): void { this.editingTypeId = null; this.editingTypeName = ''; }

  supprimerTypeDepense(type: TypeDepense): void {
    this.typesLoading = true;
    this.depenseService.supprimerType(type.id).subscribe({
      next: () => {
        this.typesDepense = this.typesDepense.filter(t => t.id !== type.id);
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message || 'Ce type est utilisé par des dépenses existantes'; this.typesLoading = false; }
    });
  }

  load(): void {
    this.loading = true;
    this.filtreActif = false;
    this.pageActuelle = 1;
    forkJoin({
      depenses: this.depenseService.getAll(),
      paiements: this.paiementEmployeService.getTous()
    }).subscribe({
      next: ({ depenses, paiements }) => {
        this.depenses = depenses.depenses;
        this.totalDepenses = depenses.total;
        this.paiementsEmploye = paiements.filter(p => p.statut === 'PAYE');
        this.loading = false;
        this.calculerTotauxParType();
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  filtrer(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.loading = true;
    this.filtreActif = true;
    this.pageActuelle = 1;
    forkJoin({
      depenses: this.depenseService.getParPeriode(this.dateDebut, this.dateFin),
      paiements: this.paiementEmployeService.getTous()
    }).subscribe({
      next: ({ depenses, paiements }) => {
        this.depenses = depenses.depenses;
        this.totalDepenses = depenses.total;
        // Filtrer les paiements employés par période si filtre actif
        this.paiementsEmploye = paiements.filter(p => {
          if (p.statut !== 'PAYE') return false;
          const d = p.datePaiement?.split('T')[0] || '';
          return d >= this.dateDebut && d <= this.dateFin;
        });
        this.loading = false;
        this.calculerTotauxParType();
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  // Paiements employés mappés en objets dépense-like
  get paiementsCommeDep(): any[] {
    return this.paiementsEmploye.map(p => ({
      id: 'emp_' + p.id,
      nom: p.employeNomComplet,
      motif: p.employePoste || 'Salaire',
      date: (p.datePaiement || '').split('T')[0],
      montant: p.montant,
      typeDepense: 'Salaire',
      periodeDebut: p.periodeDebut,
      periodeFin: p.periodeFin,
      sourceExterne: true
    }));
  }

  // Liste unifiée (vraies dépenses + salaires)
  get toutesDepenses(): any[] {
    return [...this.depenses, ...this.paiementsCommeDep];
  }

  startCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  calculerTotauxParType(): void {
    const map = new Map<string, number>();
    for (const d of this.toutesDepenses) {
      const type = (d as any).typeDepense || 'Sans type';
      if (type) map.set(type, (map.get(type) || 0) + d.montant);
    }
    this.totauxParType = Array.from(map.entries())
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);
  }

  chargerTotauxParType(): void {
    this.calculerTotauxParType();
  }

  startEdit(d: Depense): void {
    this.editing = d;
    this.form = { nom: d.nom, motif: d.motif || '', date: d.date, montant: d.montant, typeDepense: (d as any).typeDepense || '' };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.nom?.trim()) { this.showError('Le nom est obligatoire'); return; }
    if (!this.form.montant || this.form.montant <= 0) { this.showError('Le montant doit être supérieur à 0'); return; }
    if (!this.form.date) { this.showError('La date est obligatoire'); return; }

    const action = this.editing
      ? this.depenseService.modifier(this.editing.id!, this.form)
      : this.depenseService.creer(this.form);

    action.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
        Swal.fire({ icon: 'success', title: this.editing ? 'Dépense modifiée' : 'Dépense créée', text: this.editing ? 'La caisse a été ajustée automatiquement.' : 'Le montant a été déduit de la caisse.', timer: 2500, timerProgressBar: true, confirmButtonColor: '#1a56db' });
      },
      error: e => this.showError(e.message)
    });
  }

  supprimer(d: Depense): void {
    Swal.fire({
      icon: 'warning',
      title: 'Supprimer cette dépense ?',
      html: `<b>${d.nom}</b> — ${this.formatPrice(d.montant)}<br><small class="text-muted">Le montant sera remis en caisse.</small>`,
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Supprimer',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.depenseService.supprimer(d.id!).subscribe({
        next: () => {
          this.load();
          Swal.fire({ icon: 'success', title: 'Supprimée', text: 'Le montant a été remis en caisse.', timer: 2000, showConfirmButton: false });
        },
        error: e => this.showError(e.message)
      });
    });
  }

  cancel(): void {
    this.showForm = false;
  }

  formatPrice(v: number): string {
    return this.depenseService.formatPrice(v);
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get depensesFiltrees(): any[] {
    return this.toutesDepenses.filter(d => {
      const typeOk = !this.typeFiltre || (d as any).typeDepense === this.typeFiltre;
      const moisOk = !this.moisFiltre || (d.date || '').startsWith(this.moisFiltre);
      return typeOk && moisOk;
    });
  }

  get depensesPaginees(): any[] {
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    return this.depensesFiltrees.slice(debut, debut + this.itemsParPage);
  }

  get totalPages(): number {
    return Math.ceil(this.depensesFiltrees.length / this.itemsParPage);
  }

  allerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const debut = Math.max(1, this.pageActuelle - 2);
    const fin = Math.min(this.totalPages, debut + 4);
    for (let i = debut; i <= fin; i++) pages.push(i);
    return pages;
  }

  get totalDepensesFiltrees(): number {
    return this.depensesFiltrees.reduce((s, d) => s + d.montant, 0);
  }

  get totalToutesFiltrees(): number {
    return this.totalDepensesFiltrees;
  }

  get resumeParTypeFiltrees(): { type: string; total: number }[] {
    const map = new Map<string, number>();
    for (const d of this.depensesFiltrees) {
      const type = (d as any).typeDepense || 'Sans type';
      map.set(type, (map.get(type) || 0) + d.montant);
    }
    return Array.from(map.entries())
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);
  }

  telechargerPdf(): void {
    const liste = this.depensesFiltrees;
    if (!liste.length) {
      Swal.fire({ icon: 'info', title: 'Aucune donnée', text: 'Aucune dépense à exporter.', timer: 2000, showConfirmButton: false }); return;
    }

    const periode = this.moisFiltre
      ? this.moisFiltre
      : (this.dateDebut && this.dateFin ? `${this.dateDebut} au ${this.dateFin}` : 'Toutes les périodes');

    const qrData = encodeURIComponent(`DEPENSES_${periode}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const total = this.totalDepensesFiltrees;
    const totalSalaires = liste.filter(d => d.typeDepense === 'Salaire').reduce((s: number, d: any) => s + d.montant, 0);
    const totalAutres = total - totalSalaires;

    const resumeRows = this.resumeParTypeFiltrees.map(r =>
      `<tr><td>${r.type}</td><td style="text-align:right;font-weight:700">${this.formatPrice(r.total)}</td></tr>`
    ).join('');

    const depenseRows = liste.map((d: any) =>
      `<tr>
        <td>${d.date || '—'}</td>
        <td><strong>${d.nom}</strong>${d.periodeDebut ? `<br><small style="color:#64748b">${d.periodeDebut}${d.periodeFin && d.periodeFin !== d.periodeDebut ? ' → ' + d.periodeFin : ''}</small>` : ''}</td>
        <td><span style="background:${d.typeDepense === 'Salaire' ? '#fef3c7' : '#eff6ff'};color:${d.typeDepense === 'Salaire' ? '#92400e' : '#1e40af'};padding:2px 8px;border-radius:12px;font-size:0.75rem">${d.typeDepense || '—'}</span></td>
        <td>${d.motif || '—'}</td>
        <td style="text-align:right;font-weight:700;color:#dc2626">${this.formatPrice(d.montant)}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Dépenses — ${periode}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:750px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}
.hdr-title{font-size:22px;font-weight:900}
.hdr-sub{font-size:12px;opacity:.7;margin-top:4px}
.body{padding:24px 28px}
.section{margin-bottom:22px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
.kpi-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.kpi{flex:1;min-width:130px;background:#f8fafc;border-radius:10px;padding:14px 16px;text-align:center;border:1px solid #e2e8f0}
.kpi.red{background:#fef2f2;border-color:#fca5a5}
.kpi-val{font-size:1.1rem;font-weight:900;color:#1e293b}
.kpi.red .kpi-val{color:#dc2626}
.kpi-lbl{font-size:0.7rem;color:#64748b;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:0.82rem}
th{background:#f8fafc;padding:8px 10px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151}
tr:last-child td{border-bottom:none}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:#7c3aed;color:#fff}
.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#7c3aed,#a855f7);color:rgba(255,255,255,.6);text-align:center;padding:12px;font-size:11px}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">Rapport Dépenses</div>
      <div class="hdr-sub">Période : ${periode}</div>
      <div class="hdr-sub">${liste.length} dépense(s) dont ${this.paiementsCommeDep.filter((p: any) => this.depensesFiltrees.includes(p)).length} salaire(s)</div>
    </div>
    <img src="${qrUrl}" width="72" height="72" style="border-radius:8px;background:#fff;padding:3px" alt="QR" onerror="this.style.display='none'">
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">
    <div class="kpi-row">
      <div class="kpi red"><div class="kpi-val">${this.formatPrice(total)}</div><div class="kpi-lbl">Total dépenses</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#92400e">${this.formatPrice(totalSalaires)}</div><div class="kpi-lbl">dont Salaires</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#7c3aed">${this.formatPrice(totalAutres)}</div><div class="kpi-lbl">dont Autres</div></div>
    </div>
    <div class="section">
      <div class="section-title">Répartition par type</div>
      <table>
        <thead><tr><th>Type</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${resumeRows || '<tr><td colspan="2" style="color:#94a3b8;text-align:center">Aucun type renseigné</td></tr>'}</tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Détail des dépenses</div>
      <table>
        <thead><tr><th>Date</th><th>Nom</th><th>Type</th><th>Motif</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>${depenseRows}</tbody>
      </table>
    </div>
  </div>
  <div class="ftr">Ges Boutique &middot; Rapport généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</div>
</body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }

  private emptyForm(): DepenseRequest {
    return { nom: '', motif: '', date: this.today, montant: 0, typeDepense: '' };
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: msg, confirmButtonColor: '#dc2626' });
  }
}
