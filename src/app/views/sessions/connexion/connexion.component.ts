import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService, LoginCredentials } from '../../../shared/services/auth.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [FormsModule, CommonModule, RouterLink]
})
export class ConnexionComponent implements OnInit, OnDestroy {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  boutiqueName: string = '';

  // Slideshow du panneau de marque — ajouter d'autres chemins ici pour enrichir le défilement
  readonly slides: string[] = ['/assets/images/alim1.jpg'];
  activeSlide = 0;
  private slideInterval?: ReturnType<typeof setInterval>;

  constructor(
    public authService: AuthService,
    private router: Router,
    public boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    this.boutiqueName = this.boutiqueService.getInfo().nom || 'Boutique';
    if (this.slides.length > 1) {
      this.slideInterval = setInterval(() => {
        this.activeSlide = (this.activeSlide + 1) % this.slides.length;
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  private resolveIdentifier(identifier: string): string {
    const trimmed = identifier.trim();
    if (/^[\d\s+\-().]{6,}$/.test(trimmed)) {
      return trimmed.replace(/[\s\-().]/g, '');
    }
    return trimmed;
  }

  login() {
    if (!this.username.trim()) {
      this.showMessage('Veuillez saisir votre identifiant (email, téléphone ou nom d\'utilisateur)', true);
      return;
    }

    if (!this.password.trim()) {
      this.showMessage('Veuillez saisir votre mot de passe', true);
      return;
    }

    const credentials: LoginCredentials = {
      username: this.resolveIdentifier(this.username),
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

        // Recharger les infos boutique depuis le serveur pour avoir le bon nom
        this.boutiqueService.refreshBoutique().subscribe({
          next: (info) => this.afficherBienvenue(nom, roleLabel, info.nom),
          error: () => this.afficherBienvenue(nom, roleLabel, '')
        });
      },
      error: (err: Error) => {
        this.isLoading = false;
        const msg = err.message || 'Identifiant ou mot de passe incorrect';
        this.showMessage(msg, true);
      }
    });
  }

  private afficherBienvenue(nom: string, roleLabel: string, boutique: string) {
    Swal.fire({
      title: `Bienvenue, ${nom} !`,
      html: `<p style="margin:8px 0"><strong>${roleLabel}</strong></p>
             ${boutique ? `<p style="color:#6c757d;font-size:0.9rem">${boutique}</p>` : ''}`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      timer: 4000,
      timerProgressBar: true,
      showClass: { popup: 'animate__animated animate__fadeInDown' }
    }).then(() => {
      this.router.navigate(['/produit']);
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
    this.router.navigate(['/inscription']);
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