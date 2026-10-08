// vendeur.component.ts - Version mise à jour avec modales et confirmations
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, UserUpdate } from '../../../shared/services/user.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable, Subscription, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { RoleBoutique, RoleService } from '../../../shared/services/role.service';
import { COUNTRY_CODES, validatePhoneForCountry, construireNumeroComplet, separerIndicatif } from '../../../shared/utils/telephone.util';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

@Component({
  selector: 'app-vendeur',
  templateUrl: './vendeur.component.html',
  styleUrls: ['./vendeur.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective]
})
export class VendeurComponent implements OnInit, OnDestroy {
  // Liste des utilisateurs
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Filtres et recherche
  searchTerm: string = '';
  roleFilter: 'ALL' | 'ADMIN' | 'VENDEUR' = 'ALL';
  showInactive: boolean = false;
  
  // États et messages
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Données pour création de vendeur
  newVendeur = {
    username: '',
    password: '',
    confirmPassword: '',
    nomComplet: '',
    email: '',
    telephone: '',
    role: 'VENDEUR' as 'VENDEUR'
  };
  showCreateForm: boolean = false;

  // Case "Ce vendeur est aussi employé" (paie) — création
  newVendeurEstEmploye: boolean = false;
  newVendeurPoste: string = 'Vendeur';
  newVendeurSalaire: number = 0;

  // Idem, édition
  editEstEmploye: boolean = false;
  editEstEmployeOriginal: boolean = false;
  editPosteEmploye: string = 'Vendeur';
  editSalaireEmploye: number = 0;

  // Indicatif pays (création d'un nouveau vendeur)
  countryCodes = COUNTRY_CODES;
  selectedCountryCode = '+223';
  newVendeurPhoneNumber = '';

  // Indicatif pays (édition d'un vendeur existant)
  editSelectedCountryCode = '+223';
  editTelephoneLocal = '';
  private editTelephoneLocalOriginal = '';

  // Force de mot de passe
  passwordStrength: number = 0;
  passwordStrengthText: string = '';
  showPassword: boolean = false;

  // Modal d'édition
  showEditModal: boolean = false;
  modalUser: User | null = null;
  editedUser: UserUpdate = {};
  showEditPassword: boolean = false;
  
  // Modal de suppression
  showDeleteModal: boolean = false;
  userToDelete: User | null = null;

  // "Qui est en ligne" — visible seulement si le super admin a activé
  // feature.VOIR_PERSONNES_EN_LIGNE pour cette boutique (voir BoutiqueService).
  voirPersonnesEnLigneActif = false;
  usernamesEnLigne = new Set<string>();
  private enLigneSub?: Subscription;
  private fonctionnalitesSub?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private router: Router,
    private roleService: RoleService
  ) {}

  // ── Rôle d'une personne : tous les rôles (Gérant, Vendeur + rôles créés) quand les
  //    rôles personnalisés sont activés ; sinon le choix d'origine Vendeur/Administrateur.
  rolesBoutique: RoleBoutique[] = [];
  private rolesSub?: Subscription;
  roleChoisiId: number | null = null;
  private roleInitialId: number | null = null;

  private roleIdDe(u: User): number | null {
    if (u.roleBoutiqueId) return u.roleBoutiqueId;
    return this.rolesBoutique.find(r => r.systeme && r.roleBase === u.role)?.id ?? null;
  }

  /** Nom du rôle affiché sur la carte (rôle créé si la personne en a un). */
  nomRole(u: User): string {
    const cree = u.roleBoutiqueId ? this.rolesBoutique.find(r => r.id === u.roleBoutiqueId) : undefined;
    return cree ? cree.nom : (u.role === 'ADMIN' ? 'Administrateur' : 'Vendeur');
  }

  choisirRole(id: number | null): void {
    this.roleChoisiId = id;
    const r = this.rolesBoutique.find(x => x.id === id);
    if (r) this.editedUser.role = r.roleBase;
  }

  ngOnInit(): void {
    this.loadUsers();
    // Les permissions arrivent un peu après l'ouverture de la page : on attend de savoir
    // si les rôles personnalisés sont activés avant de charger la liste des rôles.
    this.rolesSub = this.roleService.mesPermissions$.subscribe(p => {
      if (p.actif && this.authService.isAdmin() && !this.rolesBoutique.length) {
        this.roleService.lister().subscribe({ next: roles => this.rolesBoutique = roles, error: () => this.rolesBoutique = [] });
      }
    });

    this.fonctionnalitesSub = this.boutiqueService.fonctionnalitesAvancees$.subscribe(liste => {
      const actif = liste.find(f => f.cle === 'VOIR_PERSONNES_EN_LIGNE')?.actif === true;
      if (actif && !this.voirPersonnesEnLigneActif) {
        this.demarrerSuiviPresence();
      } else if (!actif && this.voirPersonnesEnLigneActif) {
        this.enLigneSub?.unsubscribe();
        this.usernamesEnLigne = new Set();
      }
      this.voirPersonnesEnLigneActif = actif;
    });
  }

  ngOnDestroy(): void {
    this.enLigneSub?.unsubscribe();
    this.fonctionnalitesSub?.unsubscribe();
    this.rolesSub?.unsubscribe();
  }

  private demarrerSuiviPresence(): void {
    const token = this.authService.getToken();
    if (!token) return;
    // Premier appel immédiat, puis toutes les 30s tant que la page est ouverte.
    this.enLigneSub = timer(0, 30000).pipe(
      switchMap(() => this.userService.getUtilisateursEnLigne(token))
    ).subscribe(usernames => {
      this.usernamesEnLigne = new Set(usernames);
    });
  }

  estEnLigne(user: User): boolean {
    return this.usernamesEnLigne.has(user.username);
  }

  voirHistoriqueVentes(): void {
    this.router.navigate(['/historique-vendeur']);
  }

  loadUsers(): void {
    this.isLoading = true;
    const token = this.authService.getToken();
    
    if (token) {
      this.userService.getAllUsers(token).subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = [...users];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.showMessage(`Erreur lors du chargement des utilisateurs: ${error.message}`, true);
          this.isLoading = false;
        }
      });
    } else {
      this.showMessage('Token d\'authentification manquant', true);
      this.isLoading = false;
    }
  }

  // Gestion des filtres
  applyFilters(): void {
    let result = this.users;

    // Filtrer par rôle
    if (this.roleFilter !== 'ALL') {
      result = result.filter(user => user.role === this.roleFilter);
    }

    // Filtrer par statut actif/inactif
    if (!this.showInactive) {
      result = result.filter(user => user.actif);
    }

    // Filtrer par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(user =>
        user.nomComplet.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.telephone.includes(term)
      );
    }

    this.filteredUsers = result;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // Pagination
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Gestion des modales
  openEditModal(user: User): void {
    this.modalUser = user;
    this.editedUser = {
      username: user.username,
      nomComplet: user.nomComplet,
      email: user.email,
      telephone: user.telephone,
      role: user.role
    };
    this.roleChoisiId = this.roleInitialId = this.roleIdDe(user);
    const sep = separerIndicatif(user.telephone);
    this.editSelectedCountryCode = sep.code;
    this.editTelephoneLocal = sep.local;
    this.editTelephoneLocalOriginal = sep.local;
    this.editEstEmploye = !!user.employeId;
    this.editEstEmployeOriginal = this.editEstEmploye;
    this.editPosteEmploye = 'Vendeur';
    this.editSalaireEmploye = 0;
    this.showEditModal = true;
    this.showEditPassword = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.modalUser = null;
    this.editedUser = {};
    this.editTelephoneLocal = '';
    this.editTelephoneLocalOriginal = '';
    this.editSelectedCountryCode = '+223';
    this.editEstEmploye = false;
    this.editEstEmployeOriginal = false;
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  // Gestion des utilisateurs
  saveUser(): void {
    if (!this.modalUser) return;

    // Validation
    if (!this.editedUser.username?.trim()) {
      Swal.fire('Erreur', 'Le nom d\'utilisateur est obligatoire', 'error');
      return;
    }

    if (!this.editedUser.nomComplet?.trim()) {
      Swal.fire('Erreur', 'Le nom complet est obligatoire', 'error');
      return;
    }

    if (!this.editedUser.email?.trim() || !this.validateEmail(this.editedUser.email)) {
      Swal.fire('Erreur', 'Veuillez saisir un email valide', 'error');
      return;
    }

    // La règle stricte par indicatif (ex: Mali = 8 chiffres) ne bloque que si le numéro a
    // été modifié — un numéro déjà enregistré avant ce correctif (ancien format) reste
    // modifiable sans forcer l'admin à d'abord corriger un champ qu'il ne voulait pas toucher.
    const telephoneModifie = this.editTelephoneLocal !== this.editTelephoneLocalOriginal;
    if (!this.editTelephoneLocal?.trim() || (telephoneModifie && !this.validatePhone(this.editTelephoneLocal))) {
      Swal.fire('Erreur', 'Veuillez saisir un numéro de téléphone valide pour l\'indicatif sélectionné', 'error');
      return;
    }
    this.editedUser.telephone = construireNumeroComplet(this.editSelectedCountryCode, this.editTelephoneLocal);

    // Si un nouveau mot de passe est fourni, vérifier sa longueur
    if (this.editedUser.password && this.editedUser.password.length < 6) {
      Swal.fire('Erreur', 'Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    // Confirmation avant modification
    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous modifier l'utilisateur "${this.modalUser.nomComplet}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const token = this.authService.getToken();

        if (token) {
          // Si aucun nouveau mot de passe n'est fourni, supprimer le champ
          const updateData: UserUpdate = { ...this.editedUser };
          if (!updateData.password) {
            delete updateData.password;
          }

          // Rôle créé choisi (ou changé) : attribué d'abord (il fixe aussi Gérant/Vendeur).
          const roleChange = this.rolesBoutique.length > 0 && this.roleChoisiId != null && this.roleChoisiId !== this.roleInitialId;
          const attribution: Observable<unknown> = roleChange
            ? this.roleService.attribuer(this.modalUser!.id, this.roleChoisiId)
            : of(null);
          attribution.pipe(
            switchMap(() => this.userService.updateUser(this.modalUser!.id, updateData, token))
          ).subscribe({
            next: (updatedUser) => {
              const applyUpdate = (finalUser: User) => {
                const index = this.users.findIndex(u => u.id === finalUser.id);
                if (index !== -1) {
                  this.users[index] = finalUser;
                }
                this.applyFilters();
                this.isLoading = false;
                this.closeEditModal();
                Swal.fire({
                  icon: 'success',
                  title: 'Utilisateur mis à jour',
                  timer: 1500,
                  showConfirmButton: false
                });
              };

              // La case "Ce vendeur est aussi employé" n'a été touchée que si son état a changé
              // depuis l'ouverture du formulaire — sinon on ne touche jamais à la fiche employé liée.
              if (this.editEstEmploye !== this.editEstEmployeOriginal) {
                this.userService.gererLienEmploye(
                  updatedUser.id, this.editEstEmploye, this.editPosteEmploye, this.editSalaireEmploye, token
                ).subscribe({
                  next: (userAvecLien) => applyUpdate(userAvecLien),
                  error: (error) => {
                    this.isLoading = false;
                    Swal.fire('Erreur', `Utilisateur modifié mais erreur sur le lien employé: ${error.message}`, 'error');
                  }
                });
              } else {
                applyUpdate(updatedUser);
              }
            },
            error: (error) => {
              this.isLoading = false;
              Swal.fire('Erreur', `Erreur lors de la mise à jour: ${error.message}`, 'error');
            }
          });
        } else {
          this.isLoading = false;
          Swal.fire('Erreur', 'Token d\'authentification manquant', 'error');
        }
      }
    });
  }

  toggleUserStatus(user: User): void {
    const nouveauStatut = !user.actif;
    Swal.fire({
      title: 'Confirmation',
      text: nouveauStatut
        ? `Voulez-vous réactiver le compte de "${user.nomComplet}" ? Il pourra de nouveau se connecter.`
        : `Voulez-vous geler le compte de "${user.nomComplet}" ? Il ne pourra plus se connecter tant qu'il ne sera pas réactivé.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: nouveauStatut ? 'Oui, réactiver' : 'Oui, geler le compte',
      cancelButtonText: 'Annuler',
      confirmButtonColor: nouveauStatut ? '#198754' : '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (!result.isConfirmed) return;
      const token = this.authService.getToken();
      if (!token) {
        Swal.fire('Erreur', 'Token d\'authentification manquant', 'error');
        return;
      }
      this.isLoading = true;
      this.userService.changerStatut(user.id, nouveauStatut, token).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) { this.users[index] = updatedUser; }
          if (this.modalUser && this.modalUser.id === updatedUser.id) { this.modalUser = updatedUser; }
          this.applyFilters();
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: nouveauStatut ? 'Compte réactivé' : 'Compte gelé',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire('Erreur', error.message || 'Changement de statut impossible', 'error');
        }
      });
    });
  }

  deleteUser(user: User): void {
    this.openDeleteModal(user);
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    Swal.fire({
      title: 'Confirmation de suppression',
      text: `Voulez-vous vraiment supprimer l'utilisateur "${this.userToDelete.nomComplet}" ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = this.authService.getToken();
        if (token) {
          this.isLoading = true;
          this.userService.deleteUser(this.userToDelete!.id, token).subscribe({
            next: () => {
              // Supprimer de la liste
              this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
              this.applyFilters();
              this.isLoading = false;
              this.closeDeleteModal();
              Swal.fire({
                icon: 'success',
                title: 'Utilisateur supprimé',
                timer: 1500,
                showConfirmButton: false
              });
            },
            error: (error) => {
              this.isLoading = false;
              Swal.fire('Erreur', `Erreur lors de la suppression: ${error.message}`, 'error');
            }
          });
        }
      }
    });
  }

  // Création d'un nouveau vendeur
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.resetNewVendeurForm();
    }
  }

  createVendeur(): void {
    if (!this.validateNewVendeurForm()) {
      return;
    }

    // Confirmation avant création
    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous créer le vendeur "${this.newVendeur.nomComplet}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = this.authService.getToken();
        if (token) {
          this.isLoading = true;
          
          const userData = {
            username: this.newVendeur.username,
            password: this.newVendeur.password,
            nomComplet: this.newVendeur.nomComplet,
            email: this.newVendeur.email,
            telephone: this.getFullPhone(),
            role: this.newVendeur.role
          };

          this.userService.createUser(userData, token).subscribe({
            next: (newUser) => {
              const finaliser = (u: User) => {
                this.users.push(u);
                this.applyFilters();
                this.isLoading = false;
                this.showCreateForm = false;
                this.resetNewVendeurForm();
                Swal.fire({
                  icon: 'success',
                  title: 'Vendeur créé avec succès',
                  timer: 1500,
                  showConfirmButton: false
                });
              };

              if (this.newVendeurEstEmploye) {
                this.userService.gererLienEmploye(
                  newUser.id, true, this.newVendeurPoste, this.newVendeurSalaire, token
                ).subscribe({
                  next: (userAvecLien) => finaliser(userAvecLien),
                  error: (error) => {
                    this.isLoading = false;
                    Swal.fire('Erreur', `Vendeur créé mais erreur sur le lien employé: ${error.message}`, 'error');
                  }
                });
              } else {
                finaliser(newUser);
              }
            },
            error: (error) => {
              this.isLoading = false;
              Swal.fire('Erreur', `Erreur lors de la création: ${error.message}`, 'error');
            }
          });
        }
      }
    });
  }

  private validateNewVendeurForm(): boolean {
    if (!this.newVendeur.username.trim()) {
      Swal.fire('Erreur', 'Le nom d\'utilisateur est obligatoire', 'error');
      return false;
    }

    if (!this.newVendeur.password.trim()) {
      Swal.fire('Erreur', 'Le mot de passe est obligatoire', 'error');
      return false;
    }

    if (this.newVendeur.password !== this.newVendeur.confirmPassword) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return false;
    }

    if (this.newVendeur.password.length < 6) {
      Swal.fire('Erreur', 'Le mot de passe doit contenir au moins 6 caractères', 'error');
      return false;
    }

    if (!this.newVendeur.nomComplet.trim()) {
      Swal.fire('Erreur', 'Le nom complet est obligatoire', 'error');
      return false;
    }

    if (!this.newVendeur.email.trim() || !this.validateEmail(this.newVendeur.email)) {
      Swal.fire('Erreur', 'Veuillez saisir un email valide', 'error');
      return false;
    }

    if (!this.newVendeurPhoneNumber.trim() || !validatePhoneForCountry(this.newVendeurPhoneNumber, this.selectedCountryCode)) {
      Swal.fire('Erreur', 'Veuillez saisir un numéro de téléphone valide pour l\'indicatif sélectionné', 'error');
      return false;
    }

    return true;
  }

  checkPasswordStrength(password: string): void {
    let strength = 0;
    let text = '';

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFullPhone(): string {
    const num = this.newVendeurPhoneNumber.replace(/^0/, '');
    return this.selectedCountryCode + num;
  }

  resetNewVendeurForm(): void {
    this.newVendeur = {
      username: '',
      password: '',
      confirmPassword: '',
      nomComplet: '',
      email: '',
      telephone: '',
      role: 'VENDEUR'
    };
    this.newVendeurPhoneNumber = '';
    this.selectedCountryCode = '+223';
    this.passwordStrength = 0;
    this.passwordStrengthText = '';
    this.showPassword = false;
    this.newVendeurEstEmploye = false;
    this.newVendeurPoste = 'Vendeur';
    this.newVendeurSalaire = 0;
  }

  // Utilitaires
  getInitiales(nom: string): string {
    return nom.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phoneLocal: string): boolean {
    return validatePhoneForCountry(phoneLocal, this.editSelectedCountryCode);
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

  // Getter pour les statistiques
  get stats() {
    const total = this.users.length;
    const admins = this.users.filter(u => u.role === 'ADMIN').length;
    const vendeurs = this.users.filter(u => u.role === 'VENDEUR').length;
    const actifs = this.users.filter(u => u.actif).length;
    
    return {
      total,
      admins,
      vendeurs,
      actifs,
      inactifs: total - actifs
    };
  }
}