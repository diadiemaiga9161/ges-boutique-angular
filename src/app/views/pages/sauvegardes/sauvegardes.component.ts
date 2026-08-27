// src/app/views/pages/sauvegardes/sauvegardes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { AuthService } from '../../../shared/services/auth.service';
import { BackupService, BackupInfo } from '../../../shared/services/backup.service';

@Component({
  selector: 'app-sauvegardes',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sauvegardes.component.html',
  styleUrls: ['./sauvegardes.component.scss']
})
export class SauvegardesComponent implements OnInit {

  // ==================== DONNÉES ====================
  sauvegardes: BackupInfo[] = [];

  // ==================== ÉTATS ====================
  loading: boolean = false;
  errorMessage: string = '';
  isDeclenchement: boolean = false;
  /** Nom du fichier en cours de téléchargement (un seul à la fois par simplicité). */
  telechargementEnCours: string | null = null;

  constructor(
    private authService: AuthService,
    private backupService: BackupService,
    private translate: TranslateService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      return;
    }
    this.chargerListe();
  }

  // ==================== CHARGEMENT ====================

  chargerListe(): void {
    this.loading = true;
    this.errorMessage = '';
    this.backupService.getListe().subscribe({
      next: (res) => {
        this.sauvegardes = res.sauvegardes || [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.sauvegardes = [];
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.chargerListe();
  }

  // ==================== DÉCLENCHEMENT MANUEL ====================

  declencherSauvegarde(): void {
    if (this.isDeclenchement) return;

    Swal.fire({
      title: this.t('BACKUP.CONFIRM_TITLE'),
      text: this.t('BACKUP.CONFIRM_TEXT'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.t('BACKUP.BTN_BACKUP_NOW'),
      cancelButtonText: this.t('COMMON.CANCEL'),
      confirmButtonColor: '#2a63ff',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.isDeclenchement = true;
      this.errorMessage = '';

      this.backupService.declencher().subscribe({
        next: (res) => {
          this.isDeclenchement = false;
          Swal.fire({
            icon: 'success',
            title: this.t('BACKUP.SUCCESS_MESSAGE'),
            text: res?.nomFichier || '',
            timer: 3000,
            timerProgressBar: true,
            confirmButtonColor: '#198754'
          });
          this.chargerListe();
        },
        error: (err) => {
          this.isDeclenchement = false;
          Swal.fire({
            icon: 'error',
            title: this.t('BACKUP.ERROR_MESSAGE'),
            text: err.message,
            confirmButtonColor: '#dc3545'
          });
        }
      });
    });
  }

  // ==================== TÉLÉCHARGEMENT ====================

  telecharger(sauvegarde: BackupInfo): void {
    if (this.telechargementEnCours) return;

    this.telechargementEnCours = sauvegarde.nomFichier;
    this.backupService.telecharger(sauvegarde.nomFichier).subscribe({
      next: () => {
        this.telechargementEnCours = null;
      },
      error: (err) => {
        this.telechargementEnCours = null;
        Swal.fire({
          icon: 'error',
          title: this.t('BACKUP.ERROR_MESSAGE'),
          text: err.message,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // ==================== FORMATAGE ====================

  formatDate(date: string): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString('fr-FR');
    } catch {
      return date;
    }
  }

  /** Formate une taille en octets en Ko/Mo/Go lisible. */
  formatTaille(octets: number): string {
    if (octets === undefined || octets === null) return '-';
    if (octets < 1024) return `${octets} o`;
    const ko = octets / 1024;
    if (ko < 1024) return `${ko.toFixed(1)} Ko`;
    const mo = ko / 1024;
    if (mo < 1024) return `${mo.toFixed(1)} Mo`;
    const go = mo / 1024;
    return `${go.toFixed(2)} Go`;
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
