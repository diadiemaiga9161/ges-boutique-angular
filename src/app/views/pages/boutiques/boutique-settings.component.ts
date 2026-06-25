import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BoutiqueService, BoutiqueInfo } from '../../../shared/services/boutique.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-boutique-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './boutique-settings.component.html',
  styleUrls: ['./boutique-settings.component.scss']
})
export class BoutiqueSettingsComponent implements OnInit {
  model: BoutiqueInfo = {
    id: 1,
    nom: '',
    adresse: '',
    numeroRc: '',
    numeroIfu: '',
    telephone: '',
    email: '',
    ville: '',
    pays: '',
    logoPath: ''
  };
  previewLogo: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  isUploadingLogo: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedLogoFile: File | null = null;

  // Nouvelles propriétés pour la personnalisation globale
  isDarkMode: boolean = false;
  selectedGlobalColor: string = '#2a63ff'; // Couleur par défaut

  // Fonctionnalités optionnelles
  conditionnementActif: boolean = false;

  // Palette de couleurs disponibles
  colorPalette = [
    { name: 'Bleu', value: '#2a63ff', class: 'color-blue' },
    { name: 'Violet', value: '#7c3aed', class: 'color-purple' },
    { name: 'Rouge', value: '#ef4444', class: 'color-red' },
    { name: 'Vert', value: '#10b981', class: 'color-green' },
    { name: 'Orange', value: '#f97316', class: 'color-orange' },
    { name: 'Rose', value: '#ec4899', class: 'color-pink' },
    { name: 'Gris', value: '#6b7280', class: 'color-gray' },
    { name: 'Indigo', value: '#6366f1', class: 'color-indigo' }
  ];

  constructor(
    private boutiqueService: BoutiqueService,
    private router: Router,
    private renderer: Renderer2
  ) {
    // Charger les préférences sauvegardées
    this.loadPreferences();
  }

  ngOnInit() {
    this.loadBoutiqueInfo();
    // Appliquer les préférences au chargement
    this.applyTheme();
    this.applyGlobalColor();
  }

  private loadBoutiqueInfo() {
    this.isLoading = true;
    this.errorMessage = '';

    this.boutiqueService.refreshBoutique().subscribe({
      next: (boutique) => {
        this.model = { ...boutique, id: boutique.id || 1 };
        this.previewLogo = this.model.logoPath || '';
        this.isLoading = false;
      },
      error: (error) => {
        console.warn('Failed to load boutique info', error);
        this.errorMessage = error.message || 'Impossible de charger les informations de la boutique ID 1';
        this.model = { ...this.boutiqueService.getInfo(), id: 1 };
        this.previewLogo = this.model.logoPath || '';
        this.isLoading = false;
      }
    });
  }

  private loadPreferences() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedGlobalColor = localStorage.getItem('globalColor');
    if (savedDarkMode) this.isDarkMode = savedDarkMode === 'true';
    if (savedGlobalColor) this.selectedGlobalColor = savedGlobalColor;
    this.conditionnementActif = localStorage.getItem('feat_conditionnement') === 'true';
  }

  private savePreferences() {
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    localStorage.setItem('globalColor', this.selectedGlobalColor);
  }

  toggleConditionnement(): void {
    this.conditionnementActif = !this.conditionnementActif;
    localStorage.setItem('feat_conditionnement', String(this.conditionnementActif));
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.savePreferences();
  }

  changeGlobalColor(color: string) {
    this.selectedGlobalColor = color;
    this.applyGlobalColor();
    this.savePreferences();
  }

  private applyTheme() {
    const body = document.body;
    if (this.isDarkMode) {
      this.renderer.addClass(body, 'dark-mode');
    } else {
      this.renderer.removeClass(body, 'dark-mode');
    }
  }

  private applyGlobalColor() {
    const root = document.documentElement;
    root.style.setProperty('--primary', this.selectedGlobalColor);

    // Calculer les couleurs dérivées
    const primarySoft = this.lightenColor(this.selectedGlobalColor, 0.85);
    root.style.setProperty('--primary-soft', primarySoft);
  }

  private lightenColor(color: string, percent: number): string {
    // Convertir hex en RGB
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  save() {
    if (!this.model.nom?.trim()) {
      this.errorMessage = 'Le nom de la boutique est obligatoire.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.model.id = 1;
    this.boutiqueService.updateBoutique({ ...this.model }).subscribe({
      next: (boutique) => {
        this.model = { ...boutique, id: 1 };
        this.previewLogo = this.model.logoPath || '';
        this.savePreferences();
        this.successMessage = 'Parametres de la boutique ID 1 enregistres dans la base.';
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Impossible d enregistrer la boutique ID 1 dans la base.';
        this.isSaving = false;
      }
    });
  }

  resetDefaults() {
    Swal.fire({
      title: 'Réinitialiser les paramètres ?',
      text: 'Tous les paramètres seront réinitialisés aux valeurs par défaut.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Réinitialiser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => { if (!result.isConfirmed) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Réinitialiser le thème
    this.isDarkMode = false;
    this.selectedGlobalColor = '#2a63ff';
    this.applyTheme();
    this.applyGlobalColor();

    // Supprimer les préférences sauvegardées
    localStorage.removeItem('darkMode');
    localStorage.removeItem('globalColor');

    this.boutiqueService.resetToDefaults().subscribe({
      next: (boutique) => {
        this.model = { ...boutique, id: 1 };
        this.previewLogo = this.model.logoPath || '';
        this.isSaving = false;
        Swal.fire({ icon: 'success', title: 'Réinitialisé', text: 'Paramètres réinitialisés avec succès.', timer: 2500, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Impossible de réinitialiser.';
        this.isSaving = false;
      }
    });
    });
  }

  cancel() {
    this.router.navigate(['/sessions/connexion']);
  }

  onLogoChange() {
    this.previewLogo = this.model.logoPath || '';
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Veuillez sélectionner une image (PNG, JPG, SVG...)';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Le logo ne doit pas dépasser 2 Mo';
      return;
    }
    this.selectedLogoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.previewLogo = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  uploadLogo(): void {
    if (!this.selectedLogoFile) return;
    this.isUploadingLogo = true;
    this.errorMessage = '';
    this.boutiqueService.uploadLogo(this.selectedLogoFile).subscribe({
      next: () => {
        this.successMessage = 'Logo mis à jour avec succès — visible partout dans l\'application';
        this.selectedLogoFile = null;
        this.isUploadingLogo = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Erreur lors de l\'upload du logo';
        this.isUploadingLogo = false;
      }
    });
  }
}
