import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

export const COUNTRY_CODES = [
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+225', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie' },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+231', flag: '🇱🇷', name: 'Libéria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+235', flag: '🇹🇩', name: 'Tchad' },
  { code: '+236', flag: '🇨🇫', name: 'Centrafrique' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+20',  flag: '🇪🇬', name: 'Égypte' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne' },
  { code: '+49',  flag: '🇩🇪', name: 'Allemagne' },
  { code: '+86',  flag: '🇨🇳', name: 'Chine' },
];

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  imports: [FormsModule, CommonModule, TranslateModule]
})
export class ProfilComponent implements OnInit {
  user: any = null;

  updateData: any = {
    nomComplet: '',
    email: '',
    telephone: '',
    password: ''
  };

  selectedCountryCode = '+223';
  readonly countryCodes = COUNTRY_CODES;

  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;
  showForm: boolean = false;
  showPassword: boolean = false;

  photoPreview: string | null = null;
  loadingPhoto: boolean = false;
  photoMessage: string = '';
  photoError: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.authService.isAuthenticated()) {
      this.message = 'Veuillez vous connecter pour accéder à votre profil';
      this.isError = true;
      this.showForm = false;
      return;
    }

    this.isLoading = true;
    this.message = 'Chargement du profil...';

    this.authService.getCurrentProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        this.photoPreview = userData.photo || null;
        this.fillForm(userData);

        this.isLoading = false;
        this.showForm = true;
        this.message = '';
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
        this.isLoading = false;

        if (error.status === 401 || error.status === 403) {
          this.authService.signout();
        } else {
          const cachedUser = this.authService.getUser();
          if (cachedUser) {
            this.user = cachedUser;
            this.photoPreview = cachedUser.photo || null;
            this.fillForm(cachedUser);
            this.showForm = true;
            this.message = 'Données en cache (connectez-vous pour actualiser)';
          } else {
            this.showForm = false;
            this.message = 'Impossible de charger les données du profil';
            this.isError = true;
          }
        }
      }
    });
  }

  private fillForm(user: any): void {
    const tel = user.telephone || '';
    const matched = COUNTRY_CODES.find(c => tel.startsWith(c.code));
    if (matched) {
      this.selectedCountryCode = matched.code;
      this.updateData = { nomComplet: user.nomComplet || '', email: user.email || '', telephone: tel.slice(matched.code.length).trim(), password: '' };
    } else {
      this.updateData = { nomComplet: user.nomComplet || '', email: user.email || '', telephone: tel, password: '' };
    }
    this.isLoading = false;
    this.showForm = true;
    this.message = '';
  }

  getFullPhone(): string {
    return this.selectedCountryCode + this.updateData.telephone.replace(/^0+/, '');
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    input.value = '';

    this.compressImage(file).then(base64 => {
      this.photoPreview = base64;
      this.uploadPhoto(base64);
    }).catch(() => {
      this.showPhotoMessage('Erreur lors du traitement de l\'image', true);
    });
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200;
          let w = img.width, h = img.height;
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  uploadPhoto(base64: string): void {
    this.loadingPhoto = true;
    this.photoMessage = '';

    this.authService.updatePhoto(base64).subscribe({
      next: () => {
        this.loadingPhoto = false;
        this.showPhotoMessage('Photo mise à jour avec succès !', false);
      },
      error: () => {
        this.loadingPhoto = false;
        this.showPhotoMessage('Erreur lors de la mise à jour de la photo', true);
      }
    });
  }

  removePhoto(): void {
    this.loadingPhoto = true;
    this.authService.removePhoto().subscribe({
      next: () => {
        this.photoPreview = null;
        this.loadingPhoto = false;
        this.showPhotoMessage('Photo supprimée', false);
      },
      error: () => {
        this.loadingPhoto = false;
        this.showPhotoMessage('Erreur lors de la suppression', true);
      }
    });
  }

  private showPhotoMessage(msg: string, isError: boolean): void {
    this.photoMessage = msg;
    this.photoError = isError;
    setTimeout(() => { this.photoMessage = ''; }, 3500);
  }

  updateProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.message = 'Mise à jour en cours...';
    this.isError = false;

    const updatePayload: any = {};
    if (this.updateData.nomComplet !== this.user.nomComplet) {
      updatePayload.nomComplet = this.updateData.nomComplet;
    }
    if (this.updateData.email !== this.user.email) {
      updatePayload.email = this.updateData.email;
    }
    const fullPhone = this.getFullPhone();
    if (fullPhone !== this.user.telephone) {
      updatePayload.telephone = fullPhone;
    }
    if (this.updateData.password) {
      updatePayload.password = this.updateData.password;
    }

    this.authService.updateProfile(updatePayload).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.authService.checkAuth();

        this.isLoading = false;
        this.message = 'Profil mis à jour avec succès !';
        this.isError = false;

        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Erreur mise à jour profil:', error);
        this.isLoading = false;
        this.message = error.message || 'Erreur lors de la mise à jour du profil';
        this.isError = true;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.updateData.nomComplet.trim()) {
      this.showMessage('Le nom complet est obligatoire', true);
      return false;
    }

    if (!this.updateData.email.trim()) {
      this.showMessage('L\'email est obligatoire', true);
      return false;
    }

    if (!this.validateEmail(this.updateData.email)) {
      this.showMessage('Veuillez saisir un email valide', true);
      return false;
    }

    if (!this.updateData.telephone.trim()) {
      this.showMessage('Le téléphone est obligatoire', true);
      return false;
    }

    if (!this.validatePhone(this.updateData.telephone)) {
      this.showMessage('Veuillez saisir un numéro de téléphone valide (10 chiffres)', true);
      return false;
    }

    if (this.updateData.password && this.updateData.password.length < 6) {
      this.showMessage('Le mot de passe doit contenir au moins 6 caractères', true);
      return false;
    }

    return true;
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePhone(phone: string): boolean {
    return /^[0-9]{6,15}$/.test(phone.trim());
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  logout(): void {
    this.authService.signout();
  }

  private showMessage(message: string, isError: boolean = false): void {
    this.message = message;
    this.isError = isError;

    if (!isError) {
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }

  goToPage(): void {
    this.router.navigate(['/sessions/connexion']);
  }

  getFormattedRole(): string {
    if (!this.user || !this.user.role) return '';
    const role = this.user.role.toString();
    return role.replace('ROLE_', '');
  }

  get isFormValid(): boolean {
    return !!this.updateData.nomComplet?.trim() &&
           !!this.updateData.email?.trim() &&
           !!this.updateData.telephone?.trim() &&
           this.validateEmail(this.updateData.email) &&
           this.validatePhone(this.updateData.telephone.trim());
  }
}
