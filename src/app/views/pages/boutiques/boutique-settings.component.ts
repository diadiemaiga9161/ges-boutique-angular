import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BoutiqueService, BoutiqueInfo } from '../../../shared/services/boutique.service';
import { ProduitNiveauService, ProduitNiveau } from '../../../shared/services/produit-niveau.service';
import { ProductService } from '../../../shared/services/product.service';
import { TranslateModule } from '@ngx-translate/core';

interface ProduitDropdown {
  id: number;
  nom: string;
  prixAchat: number;
}

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

  // ── Gestion des niveaux ──────────────────────────────────────────────────
  produits: ProduitDropdown[] = [];
  produitsLoading: boolean = false;
  selectedProduitId: number | null = null;

  niveaux: ProduitNiveau[] = [];
  niveauxLoading: boolean = false;
  niveauxError: string = '';

  // Formulaire ajout / modification d'un niveau
  showNiveauForm: boolean = false;
  editingNiveauId: number | null = null;  // null = création
  niveauForm: {
    nom: string;
    parentId: number | null;
    facteur: number;
    prixAchat: number;
    prixVente: number;
    stock: number;
  } = { nom: '', parentId: null, facteur: 1, prixAchat: 0, prixVente: 0, stock: 0 };
  niveauSaving: boolean = false;
  niveauError: string = '';

  constructor(
    private boutiqueService: BoutiqueService,
    private niveauService: ProduitNiveauService,
    private productService: ProductService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.loadPreferences();
  }

  ngOnInit() {
    this.loadBoutiqueInfo();
    this.applyTheme();
    this.applyGlobalColor();
    if (this.conditionnementActif) {
      this.loadProduits();
    }
  }

  // ── Informations boutique ────────────────────────────────────────────────

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

  // ── Préférences ──────────────────────────────────────────────────────────

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
    if (this.conditionnementActif && this.produits.length === 0) {
      this.loadProduits();
    }
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
    const primarySoft = this.lightenColor(this.selectedGlobalColor, 0.85);
    root.style.setProperty('--primary-soft', primarySoft);
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  // ── Sauvegarde boutique ──────────────────────────────────────────────────

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
        setTimeout(() => (this.successMessage = ''), 5000);
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
    }).then(result => {
      if (!result.isConfirmed) return;

      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.isDarkMode = false;
      this.selectedGlobalColor = '#2a63ff';
      this.applyTheme();
      this.applyGlobalColor();

      localStorage.removeItem('darkMode');
      localStorage.removeItem('globalColor');

      this.boutiqueService.resetToDefaults().subscribe({
        next: (boutique) => {
          this.model = { ...boutique, id: 1 };
          this.previewLogo = this.model.logoPath || '';
          this.isSaving = false;
          Swal.fire({
            icon: 'success',
            title: 'Réinitialisé',
            text: 'Paramètres réinitialisés avec succès.',
            timer: 2500,
            timerProgressBar: true,
            confirmButtonColor: '#198754'
          });
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Impossible de réinitialiser.';
          this.isSaving = false;
        }
      });
    });
  }

  cancel() {
    this.router.navigate(['/connexion']);
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
    reader.onload = (e) => {
      this.previewLogo = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadLogo(): void {
    if (!this.selectedLogoFile) return;
    this.isUploadingLogo = true;
    this.errorMessage = '';
    this.boutiqueService.uploadLogo(this.selectedLogoFile).subscribe({
      next: () => {
        this.successMessage = "Logo mis à jour avec succès — visible partout dans l'application";
        this.selectedLogoFile = null;
        this.isUploadingLogo = false;
        setTimeout(() => (this.successMessage = ''), 5000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || "Erreur lors de l'upload du logo";
        this.isUploadingLogo = false;
      }
    });
  }

  // ── Gestion des niveaux ──────────────────────────────────────────────────

  private loadProduits() {
    this.produitsLoading = true;
    this.productService.getAllProduitsForDropdown().subscribe({
      next: (list) => {
        this.produits = list;
        this.produitsLoading = false;
      },
      error: () => {
        this.produitsLoading = false;
      }
    });
  }

  onProduitChange() {
    if (!this.selectedProduitId) {
      this.niveaux = [];
      return;
    }
    this.chargerNiveaux(this.selectedProduitId);
  }

  private chargerNiveaux(produitId: number) {
    this.niveauxLoading = true;
    this.niveauxError = '';
    this.niveauService.getNiveaux(produitId).subscribe({
      next: (list) => {
        this.niveaux = list;
        this.niveauxLoading = false;
      },
      error: (err: Error) => {
        this.niveauxError = err.message;
        this.niveauxLoading = false;
      }
    });
  }

  // Retourne les niveaux triés depuis la racine (parentId=null) jusqu'aux feuilles
  buildNiveauxChaine(niveaux: ProduitNiveau[]): ProduitNiveau[] {
    const roots = niveaux.filter(n => !n.parentId);
    const result: ProduitNiveau[] = [];
    const addWithChildren = (n: ProduitNiveau) => {
      result.push(n);
      niveaux.filter(c => c.parentId === n.id).forEach(addWithChildren);
    };
    roots.forEach(addWithChildren);
    // Si aucun root trouvé (données legacy sans parentId), retourner triés par ordre
    if (result.length === 0 && niveaux.length > 0) {
      return [...niveaux].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
    }
    return result;
  }

  // Nom du parent d'un niveau
  nomParent(niveau: ProduitNiveau, niveaux: ProduitNiveau[]): string {
    if (!niveau.parentId) return '';
    return niveaux.find(n => n.id === niveau.parentId)?.nom || '';
  }

  // Niveaux disponibles comme parents pour le formulaire (tous sauf le niveau en cours d'édition)
  get niveauxParentDisponibles(): ProduitNiveau[] {
    return this.niveaux.filter(n => n.id !== this.editingNiveauId);
  }

  // Label dynamique du champ facteur
  get labelFacteur(): string {
    const nomEnfant = this.niveauForm.nom || 'cet emballage';
    if (this.niveauForm.parentId) {
      const parent = this.niveaux.find(n => n.id === this.niveauForm.parentId);
      const nomParent = parent?.nom || 'le parent';
      return `Combien de ${nomEnfant} dans 1 ${nomParent} ?`;
    }
    return `Contenance (combien d'unités dans 1 ${nomEnfant} ?)`;
  }

  ouvrirFormulaireCreation() {
    this.editingNiveauId = null;
    this.niveauForm = { nom: '', parentId: null, facteur: 1, prixAchat: 0, prixVente: 0, stock: 0 };
    this.niveauError = '';
    this.showNiveauForm = true;
  }

  ouvrirFormulaireEdition(niveau: ProduitNiveau) {
    this.editingNiveauId = niveau.id ?? null;
    this.niveauForm = {
      nom: niveau.nom,
      parentId: niveau.parentId ?? null,
      facteur: niveau.facteur,
      prixAchat: niveau.prixAchat,
      prixVente: niveau.prixVente,
      stock: niveau.stock ?? 0
    };
    this.niveauError = '';
    this.showNiveauForm = true;
  }

  annulerFormulaireNiveau() {
    this.showNiveauForm = false;
    this.niveauError = '';
  }

  sauvegarderNiveau() {
    if (!this.selectedProduitId) return;
    if (!this.niveauForm.nom.trim()) {
      this.niveauError = 'Le nom de l\'emballage est obligatoire.';
      return;
    }
    if (this.niveauForm.prixVente <= 0) {
      this.niveauError = 'Le prix de vente doit être supérieur à 0.';
      return;
    }

    const payload: Partial<ProduitNiveau> = {
      nom: this.niveauForm.nom.trim(),
      parentId: this.niveauForm.parentId ?? undefined,
      facteur: this.niveauForm.parentId ? this.niveauForm.facteur : 1,
      prixAchat: this.niveauForm.prixAchat,
      prixVente: this.niveauForm.prixVente,
      stock: this.niveauForm.stock
    };

    this.niveauSaving = true;
    this.niveauError = '';

    const op$ = this.editingNiveauId
      ? this.niveauService.modifier(this.editingNiveauId, payload)
      : this.niveauService.creer(this.selectedProduitId, payload);

    op$.subscribe({
      next: () => {
        this.niveauSaving = false;
        this.showNiveauForm = false;
        this.chargerNiveaux(this.selectedProduitId!);
      },
      error: (err: Error) => {
        this.niveauError = err.message;
        this.niveauSaving = false;
      }
    });
  }

  supprimerNiveau(niveau: ProduitNiveau) {
    Swal.fire({
      title: `Supprimer "${niveau.nom}" ?`,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed || !niveau.id) return;
      this.niveauService.supprimer(niveau.id).subscribe({
        next: () => this.chargerNiveaux(this.selectedProduitId!),
        error: (err: Error) => {
          this.niveauxError = err.message;
        }
      });
    });
  }

  decomposerNiveau(niveau: ProduitNiveau) {
    if (!niveau.id) return;
    this.niveauService.decomposer(niveau.id).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Décomposition réussie',
          text: res.message || 'Le stock a été mis à jour.',
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: '#198754'
        });
        this.chargerNiveaux(this.selectedProduitId!);
      },
      error: (err: Error) => {
        this.niveauxError = err.message;
      }
    });
  }

  // Indique si un niveau a des enfants
  aDesEnfants(niveau: ProduitNiveau): boolean {
    return this.niveaux.some(n => n.parentId === niveau.id);
  }
}
