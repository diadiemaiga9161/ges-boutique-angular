import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Promotion, PromotionService, WhatsAppLien, WhatsAppResult } from '../../../shared/services/promotion.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {

  promotions: Promotion[] = [];
  loading = false;
  showForm = false;
  editing: Promotion | null = null;

  // WhatsApp modal
  showWhatsAppModal = false;
  whatsAppResult: WhatsAppResult | null = null;
  loadingWA = false;
  searchWA = '';

  form: Partial<Promotion> = this.emptyForm();

  today = new Date().toISOString().split('T')[0];

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.promotionService.getAll().subscribe({
      next: (promos) => { this.promotions = promos; this.loading = false; },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  startCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.showForm = true;
  }

  startEdit(promo: Promotion): void {
    this.editing = promo;
    this.form = { ...promo };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = null;
    this.form = this.emptyForm();
  }

  save(): void {
    if (!this.form.titre?.trim()) { this.showError('Le titre est obligatoire'); return; }
    if (!this.form.dateDebut || !this.form.dateFin) { this.showError('Les dates sont obligatoires'); return; }
    if (this.form.dateFin! < this.form.dateDebut!) { this.showError('La date de fin doit être après la date de début'); return; }
    if (!this.form.valeurReduction || this.form.valeurReduction <= 0) { this.showError('La valeur de réduction doit être supérieure à 0'); return; }
    if (this.form.typeReduction === 'POURCENTAGE' && this.form.valeurReduction > 100) { this.showError('Le pourcentage ne peut pas dépasser 100'); return; }

    this.loading = true;
    const obs = this.editing
      ? this.promotionService.modifier(this.editing.id!, this.form)
      : this.promotionService.creer(this.form);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.cancel();
        this.load();
        Swal.fire({ icon: 'success', title: this.editing ? 'Promotion modifiée' : 'Promotion créée', timer: 1500, showConfirmButton: false });
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  supprimer(promo: Promotion): void {
    Swal.fire({
      title: 'Supprimer cette promotion ?',
      text: promo.titre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.promotionService.supprimer(promo.id!).subscribe({
        next: () => { this.load(); Swal.fire({ icon: 'success', title: 'Supprimée', timer: 1200, showConfirmButton: false }); },
        error: e => this.showError(e.message)
      });
    });
  }

  ouvrirWhatsApp(promo: Promotion): void {
    this.loadingWA = true;
    this.showWhatsAppModal = true;
    this.whatsAppResult = null;
    this.searchWA = '';
    this.promotionService.preparerWhatsApp(promo.id!).subscribe({
      next: (result) => { this.whatsAppResult = result; this.loadingWA = false; },
      error: e => { this.loadingWA = false; this.showError(e.message); this.showWhatsAppModal = false; }
    });
  }

  fermerWhatsApp(): void {
    this.showWhatsAppModal = false;
    this.whatsAppResult = null;
  }

  get liensFiltered(): WhatsAppLien[] {
    if (!this.whatsAppResult) return [];
    const q = this.searchWA.toLowerCase().trim();
    if (!q) return this.whatsAppResult.liens;
    return this.whatsAppResult.liens.filter(l =>
      l.nom.toLowerCase().includes(q) || l.telephone.includes(q)
    );
  }

  getStatut(promo: Promotion): { label: string; cls: string } {
    if (!promo.active) return { label: 'Inactive', cls: 'badge bg-secondary' };
    const today = new Date(); today.setHours(0,0,0,0);
    const debut = new Date(promo.dateDebut);
    const fin = new Date(promo.dateFin);
    if (fin < today) return { label: 'Expirée', cls: 'badge bg-danger' };
    if (debut > today) return { label: 'À venir', cls: 'badge bg-info' };
    return { label: 'En cours', cls: 'badge bg-success' };
  }

  private emptyForm(): Partial<Promotion> {
    return {
      titre: '',
      description: '',
      dateDebut: this.today,
      dateFin: '',
      typeReduction: 'POURCENTAGE',
      valeurReduction: undefined,
      active: true
    };
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: msg });
  }

  formatPrice(v: number): string { return this.promotionService.formatPrice(v); }
}
