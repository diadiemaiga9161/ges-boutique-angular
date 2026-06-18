// vendeur.component.ts - Version mise à jour avec modales et confirmations
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, UserUpdate } from '../../../shared/services/user.service';

export const COUNTRY_CODES = [
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie' },
  { code: '+220', flag: '🇬🇲', name: 'Gambie' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+231', flag: '🇱🇷', name: 'Libéria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+236', flag: '🇨🇫', name: 'Centrafrique' },
  { code: '+235', flag: '🇹🇩', name: 'Tchad' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+20',  flag: '🇪🇬', name: 'Égypte' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne' },
  { code: '+55',  flag: '🇧🇷', name: 'Brésil' },
];
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendeur',
  templateUrl: './vendeur.component.html',
  styleUrls: ['./vendeur.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class VendeurComponent implements OnInit {
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

  // Indicatif pays
  countryCodes = COUNTRY_CODES;
  selectedCountryCode = '+223';
  newVendeurPhoneNumber = '';

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

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
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
      nomComplet: user.nomComplet,
      email: user.email,
      telephone: user.telephone,
      role: user.role
    };
    this.showEditModal = true;
    this.showEditPassword = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.modalUser = null;
    this.editedUser = {};
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
    if (!this.editedUser.nomComplet?.trim()) {
      Swal.fire('Erreur', 'Le nom complet est obligatoire', 'error');
      return;
    }

    if (!this.editedUser.email?.trim() || !this.validateEmail(this.editedUser.email)) {
      Swal.fire('Erreur', 'Veuillez saisir un email valide', 'error');
      return;
    }

    if (!this.editedUser.telephone?.trim() || !this.validatePhone(this.editedUser.telephone)) {
      Swal.fire('Erreur', 'Veuillez saisir un numéro de téléphone valide (10 chiffres)', 'error');
      return;
    }

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

          this.userService.updateUser(this.modalUser!.id, updateData, token).subscribe({
            next: (updatedUser) => {
              // Mettre à jour la liste
              const index = this.users.findIndex(u => u.id === updatedUser.id);
              if (index !== -1) {
                this.users[index] = updatedUser;
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
    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous ${user.actif ? 'désactiver' : 'activer'} l'utilisateur "${user.nomComplet}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Oui, ${user.actif ? 'désactiver' : 'activer'}`,
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Note: Cette fonctionnalité nécessitera un endpoint API spécifique
        Swal.fire('Info', 'Fonctionnalité à implémenter avec l\'API', 'info');
      }
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
              this.users.push(newUser);
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

    if (!this.newVendeurPhoneNumber.trim()) {
      Swal.fire('Erreur', 'Veuillez saisir un numéro de téléphone', 'error');
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
  }

  // Utilitaires
  getInitiales(nom: string): string {
    return nom.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone: string): boolean {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
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