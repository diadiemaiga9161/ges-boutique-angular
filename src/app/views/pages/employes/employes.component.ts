import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService, Employe, EmployeRequest } from '../../../shared/services/employe.service';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.scss']
})
export class EmployesComponent implements OnInit {

  employes: Employe[] = [];
  isLoading = false;
  isSaving = false;

  showFormModal = false;
  isEditing = false;
  selectedEmploye: Employe | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  form: EmployeRequest = {
    nom: '', prenom: '', poste: '', salaireMensuel: 0,
    telephone: '', observation: '', statut: 'ACTIF', dateEmbauche: ''
  };

  searchQuery = '';

  get filteredEmployes(): Employe[] {
    if (!this.searchQuery) return this.employes;
    const q = this.searchQuery.toLowerCase();
    return this.employes.filter(e =>
      e.nomComplet.toLowerCase().includes(q) ||
      e.poste.toLowerCase().includes(q) ||
      (e.telephone || '').includes(q)
    );
  }

  get paginatedEmployes(): Employe[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEmployes.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  constructor(private employeService: EmployeService, private authService: AuthService) {}

  ngOnInit(): void { this.chargerEmployes(); }

  chargerEmployes(): void {
    this.isLoading = true;
    this.employeService.getTous().subscribe({
      next: data => { this.employes = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  ouvrirFormAjout(): void {
    this.isEditing = false;
    this.selectedEmploye = null;
    this.form = { nom: '', prenom: '', poste: '', salaireMensuel: 0, telephone: '', observation: '', statut: 'ACTIF', dateEmbauche: '' };
    this.showFormModal = true;
  }

  ouvrirFormModification(employe: Employe): void {
    this.isEditing = true;
    this.selectedEmploye = employe;
    this.form = {
      nom: employe.nom,
      prenom: employe.prenom || '',
      poste: employe.poste,
      salaireMensuel: employe.salaireMensuel,
      telephone: employe.telephone || '',
      observation: employe.observation || '',
      statut: employe.statut,
      dateEmbauche: employe.dateEmbauche || ''
    };
    this.showFormModal = true;
  }

  fermerModal(): void { this.showFormModal = false; }

  sauvegarder(): void {
    if (!this.form.nom || !this.form.poste || !this.form.salaireMensuel) {
      Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'Nom, poste et salaire sont obligatoires.', confirmButtonColor: '#3085d6' });
      return;
    }

    const action = this.isEditing
      ? this.employeService.modifier(this.selectedEmploye!.id, this.form)
      : this.employeService.creer(this.form);

    this.isSaving = true;
    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerEmployes();
        Swal.fire({ icon: 'success', title: 'Succès', text: this.isEditing ? 'Employé modifié avec succès.' : 'Employé ajouté avec succès.', timer: 2000, showConfirmButton: false });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Une erreur est survenue.', confirmButtonColor: '#d33' });
      }
    });
  }

  confirmerDesactivation(employe: Employe): void {
    Swal.fire({
      title: 'Désactiver cet employé ?',
      text: `${employe.nomComplet} sera marqué comme inactif.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, désactiver',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.employeService.desactiver(employe.id).subscribe({
          next: () => {
            this.chargerEmployes();
            Swal.fire({ icon: 'success', title: 'Désactivé', text: 'Employé désactivé.', timer: 1800, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors de la désactivation.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  confirmerActivation(employe: Employe): void {
    Swal.fire({
      title: 'Activer cet employé ?',
      text: `${employe.nomComplet} sera à nouveau actif.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, activer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.employeService.activer(employe.id).subscribe({
          next: () => {
            this.chargerEmployes();
            Swal.fire({ icon: 'success', title: 'Activé', text: 'Employé activé.', timer: 1800, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  confirmerSuppression(employe: Employe): void {
    Swal.fire({
      title: 'Supprimer cet employé ?',
      text: `${employe.nomComplet} sera définitivement supprimé.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.employeService.supprimer(employe.id).subscribe({
          next: () => {
            this.chargerEmployes();
            Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Employé supprimé.', timer: 1800, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors de la suppression.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-FR').format(m) + ' FCFA';
  }
}
