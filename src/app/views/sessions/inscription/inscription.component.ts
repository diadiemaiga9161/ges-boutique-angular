import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, UserCreate } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class InscriptionComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  nomComplet: string = '';
  email: string = '';
  telephone: string = '';
  role: 'VENDEUR' | 'ADMIN' = 'VENDEUR';
  
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;
  showPassword: boolean = false;
  
  passwordStrength: number = 0;
  passwordStrengthText: string = '';

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier si l'utilisateur est admin
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.message = 'Accès refusé. Seuls les administrateurs peuvent créer des comptes.';
      this.isError = true;
    }
  }

  register() {
    if (!this.validateForm()) {
      return;
    }

    const userData: UserCreate = {
      username: this.username,
      password: this.password,
      nomComplet: this.nomComplet,
      email: this.email,
      telephone: this.telephone,
      role: this.role
    };

    this.isLoading = true;
    this.message = 'Création du compte en cours...';
    this.isError = false;

    const token = this.authService.getToken();
    if (token) {
      this.userService.createUser(userData, token).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showMessage('Utilisateur créé avec succès !', false);
          this.resetForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.showMessage(error.message || 'Erreur lors de la création du compte', true);
        }
      });
    } else {
      this.isLoading = false;
      this.showMessage('Token d\'authentification manquant', true);
    }
  }

  private validateForm(): boolean {
    if (!this.username.trim()) {
      this.showMessage('Le nom d\'utilisateur est obligatoire', true);
      return false;
    }

    if (!this.password.trim()) {
      this.showMessage('Le mot de passe est obligatoire', true);
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.showMessage('Les mots de passe ne correspondent pas', true);
      return false;
    }

    if (this.password.length < 6) {
      this.showMessage('Le mot de passe doit contenir au moins 6 caractères', true);
      return false;
    }

    if (!this.nomComplet.trim()) {
      this.showMessage('Le nom complet est obligatoire', true);
      return false;
    }

    if (!this.email.trim()) {
      this.showMessage('L\'email est obligatoire', true);
      return false;
    }

    if (!this.validateEmail(this.email)) {
      this.showMessage('Veuillez saisir un email valide', true);
      return false;
    }

    if (!this.telephone.trim()) {
      this.showMessage('Le téléphone est obligatoire', true);
      return false;
    }

    if (!this.validatePhone(this.telephone)) {
      this.showMessage('Veuillez saisir un numéro de téléphone valide (10 chiffres)', true);
      return false;
    }

    return true;
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePhone(phone: string): boolean {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  }

  checkPasswordStrength() {
    let strength = 0;
    let text = '';

    if (this.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(this.password)) strength += 1;
    if (/[0-9]/.test(this.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 1;

    this.passwordStrength = strength;

    switch (strength) {
      case 0:
      case 1:
        text = 'Faible';
        break;
      case 2:
        text = 'Moyen';
        break;
      case 3:
        text = 'Bon';
        break;
      case 4:
        text = 'Très bon';
        break;
    }

    this.passwordStrengthText = text;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private showMessage(message: string, isError: boolean = false) {
    this.message = message;
    this.isError = isError;
    
    if (!isError) {
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }

  resetForm() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.nomComplet = '';
    this.email = '';
    this.telephone = '';
    this.role = 'VENDEUR';
    this.passwordStrength = 0;
    this.passwordStrengthText = '';
    this.message = '';
  }

  goToLogin() {
    this.router.navigate(['/sessions/connexion']);
  }
}