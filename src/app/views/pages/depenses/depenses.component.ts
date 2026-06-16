import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Depense, DepenseRequest, DepenseService } from '../../../shared/services/depense.service';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss']
})
export class DepensesComponent implements OnInit {

  depenses: Depense[] = [];
  totalDepenses = 0;
  loading = false;
  showForm = false;
  editing: Depense | null = null;

  form: DepenseRequest = this.emptyForm();

  dateDebut = '';
  dateFin = '';
  filtreActif = false;

  constructor(private depenseService: DepenseService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.filtreActif = false;
    this.depenseService.getAll().subscribe({
      next: ({ depenses, total }) => {
        this.depenses = depenses;
        this.totalDepenses = total;
        this.loading = false;
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  filtrer(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.loading = true;
    this.filtreActif = true;
    this.depenseService.getParPeriode(this.dateDebut, this.dateFin).subscribe({
      next: ({ depenses, total }) => {
        this.depenses = depenses;
        this.totalDepenses = total;
        this.loading = false;
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  startCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  startEdit(d: Depense): void {
    this.editing = d;
    this.form = { nom: d.nom, motif: d.motif || '', date: d.date, montant: d.montant };
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

  private emptyForm(): DepenseRequest {
    return { nom: '', motif: '', date: this.today, montant: 0 };
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: msg, confirmButtonColor: '#dc2626' });
  }
}
