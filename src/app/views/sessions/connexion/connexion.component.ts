import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService, LoginCredentials } from '../../../shared/services/auth.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class ConnexionComponent implements OnInit {
  username: string = '';
  password: string = '';
  
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  boutiqueName: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    this.boutiqueName = this.boutiqueService.getInfo().nom || 'Boutique';
  }

  login() {
    if (!this.username.trim()) {
      this.showMessage('Veuillez saisir votre nom d\'utilisateur', true);
      return;
    }

    if (!this.password.trim()) {
      this.showMessage('Veuillez saisir votre mot de passe', true);
      return;
    }

    const credentials: LoginCredentials = {
      username: this.username.trim(),
      password: this.password
    };

    this.isLoading = true;
    this.message = 'Connexion en cours...';
    this.isError = false;

    this.authService.signin(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        const user = this.authService.getUser();
        const nom = user?.nomComplet || user?.username || 'Utilisateur';
        const role = (user?.role || '').replace('ROLE_', '');
        const roleLabel = role === 'ADMIN' ? '👑 Administrateur' : '🛒 Vendeur';
        const boutique = this.boutiqueService.getInfo().nom || 'Boutique';

        Swal.fire({
          title: `Bienvenue, ${nom} !`,
          html: `<p style="margin:8px 0"><strong>${roleLabel}</strong></p>
                 <p style="color:#6c757d;font-size:0.9rem">${boutique}</p>`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb',
          timer: 4000,
          timerProgressBar: true,
          showClass: { popup: 'animate__animated animate__fadeInDown' }
        }).then(() => {
          this.router.navigate(['/pages/produit']);
        });
      }
    });
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

  goToPage() {
    this.router.navigate(['/sessions/inscription']);
  }

  resetForm() {
    this.username = '';
    this.password = '';
    this.message = '';
  }

 // Dans connexion.component.ts
useDemoCredentials(role: 'admin' | 'vendeur') {
  if (role === 'admin') {
    this.username = 'admin';
    this.password = 'admin123';
  } else {
    this.username = 'vendeur';
    this.password = 'vendeur123';
  }
  
  this.showMessage('Identifiants de démonstration chargés. Cliquez sur "Se connecter"', false);
}
}