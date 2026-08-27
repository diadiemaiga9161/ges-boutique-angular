import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {
  ObjectifVendeurService,
  ObjectifVendeur,
  ObjectifVendeurRequest
} from '../../../shared/services/objectif-vendeur.service';
import { UserService, User } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

/** Retourne le numéro de semaine ISO-8601 et l'année correspondante pour une date donnée. */
function getSemaineIso(date: Date): { semaine: number; annee: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semaine = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { semaine, annee: d.getUTCFullYear() };
}

@Component({
  selector: 'app-objectif-vendeur',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective],
  templateUrl: './objectif-vendeur.component.html',
  styleUrls: ['./objectif-vendeur.component.scss']
})
export class ObjectifVendeurComponent implements OnInit {

  objectifs: ObjectifVendeur[] = [];
  vendeurs: User[] = [];

  isLoading = false;
  isSaving = false;
  showFormModal = false;
  isEditing = false;
  selected: ObjectifVendeur | null = null;

  private readonly semaineCourante = getSemaineIso(new Date());

  filtreSemaine = this.semaineCourante.semaine;
  filtreAnnee = this.semaineCourante.annee;
  filtreVendeurId = 0;
  filtreStatut = '';
  modeFiltre: 'semaine' | 'annee' | 'vendeur' | 'tous' = 'semaine';

  annees = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  semaines = Array.from({ length: 53 }, (_, i) => i + 1);

  form: ObjectifVendeurRequest = {
    vendeurId: 0,
    semaine: this.semaineCourante.semaine,
    annee: this.semaineCourante.annee,
    objectifNombreVentes: 0,
    bonusMontant: 0
  };

  get objectifsFiltres(): ObjectifVendeur[] {
    let liste = this.objectifs;
    if (this.filtreVendeurId) liste = liste.filter(o => o.vendeurId === this.filtreVendeurId);
    if (this.filtreStatut) liste = liste.filter(o => o.statut === this.filtreStatut);
    return liste;
  }

  get totalBonusFiltres(): number {
    return this.objectifsFiltres
      .filter(o => o.statut === 'ATTEINT')
      .reduce((s, o) => s + (o.bonusMontant || 0), 0);
  }

  get totalObjectifs(): number {
    return this.objectifsFiltres.length;
  }

  get totalAtteints(): number {
    return this.objectifsFiltres.filter(o => o.statut === 'ATTEINT').length;
  }

  constructor(
    public objectifService: ObjectifVendeurService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerVendeurs();
    this.chargerObjectifs();
  }

  private chargerVendeurs(): void {
    const token = this.authService.getToken();
    if (!token) return;
    // L'admin/patron peut aussi vendre et recevoir une prime : on inclut donc les deux rôles.
    this.userService.getUsersByRole(['VENDEUR', 'ADMIN'], token).subscribe({
      next: d => this.vendeurs = d,
      error: () => {}
    });
  }

  chargerObjectifs(): void {
    this.isLoading = true;
    let obs;
    if (this.modeFiltre === 'semaine') {
      obs = this.objectifService.getParSemaineAnnee(this.filtreSemaine, this.filtreAnnee);
    } else if (this.modeFiltre === 'annee') {
      obs = this.objectifService.getParAnnee(this.filtreAnnee);
    } else if (this.modeFiltre === 'vendeur' && this.filtreVendeurId) {
      obs = this.objectifService.getParVendeur(this.filtreVendeurId);
    } else {
      obs = this.objectifService.getTous();
    }
    obs.subscribe({
      next: data => { this.objectifs = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  ouvrirFormulaire(objectif?: ObjectifVendeur): void {
    this.isEditing = !!objectif;
    this.selected = objectif || null;
    if (objectif) {
      this.form = {
        vendeurId: objectif.vendeurId,
        semaine: objectif.semaine,
        annee: objectif.annee,
        objectifNombreVentes: objectif.objectifNombreVentes,
        bonusMontant: objectif.bonusMontant,
        observation: objectif.observation
      };
    } else {
      this.form = {
        vendeurId: 0,
        semaine: this.filtreSemaine,
        annee: this.filtreAnnee,
        objectifNombreVentes: 0,
        bonusMontant: 0
      };
    }
    this.showFormModal = true;
  }

  fermerFormulaire(): void {
    this.showFormModal = false;
  }

  enregistrer(): void {
    if (!this.form.vendeurId) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Sélectionnez un vendeur.' }); return;
    }
    if (!this.form.semaine || this.form.semaine < 1 || this.form.semaine > 53) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'La semaine doit être comprise entre 1 et 53.' }); return;
    }
    if (!this.form.objectifNombreVentes || this.form.objectifNombreVentes <= 0) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: "L'objectif de nombre de ventes doit être supérieur à 0." }); return;
    }
    if (this.form.bonusMontant === undefined || this.form.bonusMontant < 0) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le bonus ne peut pas être négatif.' }); return;
    }

    this.isSaving = true;
    const obs = this.isEditing && this.selected
      ? this.objectifService.modifier(this.selected.id, this.form)
      : this.objectifService.creer(this.form);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerObjectifs();
        Swal.fire({ icon: 'success', title: 'Succès', text: this.isEditing ? 'Prime modifiée.' : 'Prime enregistrée.', timer: 2000, showConfirmButton: false });
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Enregistrement impossible.' });
      }
    });
  }

  confirmerValider(objectif: ObjectifVendeur): void {
    if (objectif.statut !== 'ATTEINT' || objectif.bonusValide) return;
    Swal.fire({
      icon: 'question',
      title: 'Valider la prime ?',
      html: `Confirmer que l'objectif de <b>${objectif.vendeurNom}</b> pour la semaine <b>${objectif.semaine}/${objectif.annee}</b> est atteint et que le bonus de <b>${this.fmt(objectif.bonusMontant)}</b> est validé.`,
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a'
    }).then(r => {
      if (r.isConfirmed) this.valider(objectif.id);
    });
  }

  private valider(id: number): void {
    this.objectifService.valider(id).subscribe({
      next: (result: ObjectifVendeur) => {
        this.chargerObjectifs();
        Swal.fire({
          icon: 'success',
          title: 'Prime validée !',
          html: `La prime de <b>${this.fmt(result.bonusMontant)}</b> pour <b>${result.vendeurNom}</b> est validée.`,
          confirmButtonColor: '#16a34a',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: err => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Validation impossible.' })
    });
  }

  confirmerSupprimer(objectif: ObjectifVendeur): void {
    Swal.fire({
      icon: 'warning',
      title: 'Supprimer ?',
      text: `Supprimer la prime de ${objectif.vendeurNom} – Semaine ${objectif.semaine}/${objectif.annee} ?`,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.objectifService.supprimer(objectif.id).subscribe({
          next: () => { this.chargerObjectifs(); Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false }); },
          error: err => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Suppression impossible.' })
        });
      }
    });
  }

  getPourcentage(o: ObjectifVendeur): number {
    return this.objectifService.getPourcentageAtteinte(o);
  }

  fmt(m: number): string {
    return this.objectifService.formatMontant(m);
  }
}
