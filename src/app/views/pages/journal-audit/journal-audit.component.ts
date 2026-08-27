// src/app/views/pages/journal-audit/journal-audit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../shared/services/auth.service';
import { UserService, User } from '../../../shared/services/user.service';
import {
  JournalAuditService,
  JournalAuditEntry,
  TypeActionAudit
} from '../../../shared/services/journal-audit.service';

// Mapping FIXE code backend -> clé i18n. Liste FERMÉE (enum TypeActionAudit,
// 8 valeurs) : ne pas en ajouter sans confirmation du backend. Si un code
// inconnu arrive un jour, on affiche le code brut en repli (cf getActionLabel).
const ACTION_LABEL_KEYS: Record<TypeActionAudit, string> = {
  SUPPRESSION_VENTE: 'JOURNAL_AUDIT.ACTION_SUPPRESSION_VENTE',
  MODIFICATION_PRIX_PRODUIT: 'JOURNAL_AUDIT.ACTION_MODIFICATION_PRIX_PRODUIT',
  ANNULATION_TRANSFERT: 'JOURNAL_AUDIT.ACTION_ANNULATION_TRANSFERT',
  SUPPRESSION_TRANSFERT: 'JOURNAL_AUDIT.ACTION_SUPPRESSION_TRANSFERT',
  SUPPRESSION_CLIENT: 'JOURNAL_AUDIT.ACTION_SUPPRESSION_CLIENT',
  SUPPRESSION_FOURNISSEUR: 'JOURNAL_AUDIT.ACTION_SUPPRESSION_FOURNISSEUR',
  MODIFICATION_ROLE_UTILISATEUR: 'JOURNAL_AUDIT.ACTION_MODIFICATION_ROLE_UTILISATEUR',
  SUPPRESSION_CREDIT: 'JOURNAL_AUDIT.ACTION_SUPPRESSION_CREDIT'
};

@Component({
  selector: 'app-journal-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './journal-audit.component.html',
  styleUrls: ['./journal-audit.component.scss']
})
export class JournalAuditComponent implements OnInit {

  // ==================== DONNÉES ====================
  journaux: JournalAuditEntry[] = [];
  utilisateurs: User[] = [];

  // ==================== FILTRES ====================
  dateDebut: string = '';
  dateFin: string = '';
  utilisateurId: number | null = null;

  // ==================== PAGINATION (côté backend) ====================
  // Page 0-indexée pour coller à la convention Spring Data côté serveur.
  pageIndex: number = 0;
  size: number = 20;
  totalElements: number = 0;
  totalPages: number = 0;

  // ==================== ÉTATS ====================
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private journalAuditService: JournalAuditService,
    private translate: TranslateService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /** Vrai si le filtre de date a été changé par rapport à la vue par défaut (jour même). */
  get filtreDatePersonnalise(): boolean {
    const today = this.todayStr();
    return this.dateDebut !== today || this.dateFin !== today;
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      return;
    }
    // Par défaut, on affiche les actions du jour même (pas tout l'historique).
    // Pour voir un autre jour ou toute la période, on change le filtre de date.
    const today = this.todayStr();
    this.dateDebut = today;
    this.dateFin = today;
    this.loadUtilisateurs();
    this.loadJournal();
  }

  private todayStr(): string {
    const now = new Date();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const jour = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mois}-${jour}`;
  }

  // ==================== CHARGEMENT ====================

  loadUtilisateurs(): void {
    const token = this.authService.getToken();
    if (!token) return;
    this.userService.getAllUsers(token).subscribe({
      next: (users) => { this.utilisateurs = users; },
      // Non bloquant : si la liste des utilisateurs ne charge pas, le filtre
      // par utilisateur reste simplement vide, le reste de la page fonctionne.
      error: () => { this.utilisateurs = []; }
    });
  }

  loadJournal(): void {
    this.loading = true;
    this.errorMessage = '';
    this.journalAuditService.getJournal({
      page: this.pageIndex,
      size: this.size,
      dateDebut: this.dateDebut || undefined,
      dateFin: this.dateFin || undefined,
      utilisateurId: this.utilisateurId || undefined
    }).subscribe({
      next: (res) => {
        this.journaux = res.journaux || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.journaux = [];
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadJournal();
  }

  // ==================== FILTRES ====================

  onDateFilterChange(): void {
    this.pageIndex = 0;
    this.loadJournal();
  }

  /** Revient à la vue par défaut (jour même), pas à un historique complet non filtré. */
  resetDateFilter(): void {
    const today = this.todayStr();
    this.dateDebut = today;
    this.dateFin = today;
    this.pageIndex = 0;
    this.loadJournal();
  }

  onUtilisateurFilterChange(): void {
    this.pageIndex = 0;
    this.loadJournal();
  }

  // ==================== PAGINATION ====================

  goToPage(page: number): void {
    if (page < 0 || page > this.totalPages - 1) return;
    this.pageIndex = page;
    this.loadJournal();
  }

  pagePrecedente(): void {
    this.goToPage(this.pageIndex - 1);
  }

  pageSuivante(): void {
    this.goToPage(this.pageIndex + 1);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // ==================== AFFICHAGE ====================

  /** Libellé lisible de l'action, jamais le code technique brut si connu. */
  getActionLabel(action: string): string {
    const key = (ACTION_LABEL_KEYS as Record<string, string>)[action];
    if (!key) {
      // Repli : code brut si l'action n'est pas reconnue (sécurité, ne plante pas).
      return action;
    }
    return this.translate.instant(key);
  }

  getUserDisplayName(journal: JournalAuditEntry): string {
    return journal.utilisateurNom || `#${journal.utilisateurId}`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString('fr-FR');
    } catch {
      return date;
    }
  }
}
