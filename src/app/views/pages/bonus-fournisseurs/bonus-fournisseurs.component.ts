import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  BonusFournisseur,
  BonusFournisseurRequest,
  BonusFournisseurService,
  BonusStats,
  TypeBonus
} from '../../../shared/services/bonus-fournisseur.service';
import { ProductService } from '../../../shared/services/product.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-bonus-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './bonus-fournisseurs.component.html',
  styleUrls: ['./bonus-fournisseurs.component.scss']
})
export class BonusFournisseursComponent implements OnInit {

  bonus: BonusFournisseur[] = [];
  stats: BonusStats | null = null;
  fournisseurs: any[] = [];
  loading = false;
  showForm = false;
  editing: BonusFournisseur | null = null;

  form: BonusFournisseurRequest = this.emptyForm();

  dateDebut = '';
  dateFin = '';
  filtreActif = false;

  moisStats = new Date().getMonth() + 1;
  anneeStats = new Date().getFullYear();

  readonly types: { value: TypeBonus; label: string }[] = [
    { value: 'RISTOURNE', label: 'Ristourne' },
    { value: 'BONUS_VOLUME', label: 'Bonus Volume' },
    { value: 'PRIME_OBJECTIF', label: 'Prime Objectif' },
    { value: 'BONUS_ACHAT', label: 'Bonus Achat' }
  ];

  constructor(
    private bonusService: BonusFournisseurService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadFournisseurs();
    this.loadStats();
  }

  load(): void {
    this.loading = true;
    this.filtreActif = false;
    this.bonusService.getAll().subscribe({
      next: data => { this.bonus = data; this.loading = false; },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  filtrer(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.loading = true;
    this.filtreActif = true;
    this.bonusService.getParPeriode(this.dateDebut, this.dateFin).subscribe({
      next: data => { this.bonus = data; this.loading = false; },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  loadFournisseurs(): void {
    this.productService.getAllFournisseurs().subscribe({
      next: (data: any) => { this.fournisseurs = Array.isArray(data) ? data : []; },
      error: () => {}
    });
  }

  loadStats(): void {
    this.bonusService.getStatistiques(this.moisStats, this.anneeStats).subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  startCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  startEdit(b: BonusFournisseur): void {
    this.editing = b;
    this.form = {
      fournisseurId: b.fournisseurId,
      type: b.type,
      montant: b.montant,
      date: b.date,
      description: b.description || '',
      produitId: b.produitId,
      quantiteProduit: b.quantiteProduit
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.fournisseurId || !this.form.type || !this.form.date) {
      this.showError('Fournisseur, type et date sont obligatoires');
      return;
    }
    if (this.form.montant == null || this.form.montant < 0) {
      this.showError('Le montant doit être positif');
      return;
    }

    const obs = this.editing
      ? this.bonusService.modifier(this.editing.id!, this.form)
      : this.bonusService.creer(this.form);

    obs.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
        this.loadStats();
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1500, showConfirmButton: false });
      },
      error: e => this.showError(e.message)
    });
  }

  supprimer(b: BonusFournisseur): void {
    Swal.fire({
      title: 'Supprimer ce bonus ?',
      text: `${b.typeLibelle} — ${this.formatPrice(b.montant)}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.bonusService.supprimer(b.id!).subscribe({
          next: () => { this.load(); this.loadStats(); },
          error: e => this.showError(e.message)
        });
      }
    });
  }

  cancel(): void { this.showForm = false; }

  formatPrice(v: number): string { return this.bonusService.formatPrice(v); }

  totalBonus(): number { return this.bonus.reduce((s, b) => s + b.montant, 0); }

  badgeClass(type: TypeBonus): string {
    const map: Record<TypeBonus, string> = {
      RISTOURNE: 'bg-success',
      BONUS_VOLUME: 'bg-primary',
      PRIME_OBJECTIF: 'bg-warning text-dark',
      BONUS_ACHAT: 'bg-info text-dark'
    };
    return map[type] || 'bg-secondary';
  }

  private emptyForm(): BonusFournisseurRequest {
    return {
      fournisseurId: 0,
      type: 'RISTOURNE',
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: msg });
  }
}
