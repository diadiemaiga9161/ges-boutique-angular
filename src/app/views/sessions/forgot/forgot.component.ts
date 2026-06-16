import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { AuthService } from '../../../shared/services/auth.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
  animations: [SharedAnimations],
  standalone: false
})
export class ForgotComponent implements OnInit, OnDestroy {
  logoPath = '';
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private sub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private router: Router
  ) {}

  ngOnInit() {
    this.logoPath = this.boutiqueService.getLogoPath() || '';
    this.sub = this.boutiqueService.info$.subscribe(i => this.logoPath = i.logoPath || '');
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  submit(): void {
    if (!this.email.trim()) { this.errorMessage = "Veuillez saisir votre email"; return; }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.motDePasseOublie(this.email.trim()).subscribe({
      next: res => {
        this.isLoading = false;
        this.successMessage = res.message;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || "Une erreur est survenue";
      }
    });
  }
}
