import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Depense, DepenseRequest, DepenseService, TypeDepense } from '../../../shared/services/depense.service';
import { PaiementEmployeService, PaiementEmploye } from '../../../shared/services/paiement-employe.service';
import { FactureService } from '../../../shared/services/facture.service';
import { TranslateModule } from '@ngx-translate/core';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

import { ActionPermission, MesPermissions, RoleService } from '../../../shared/services/role.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { nouvelIdentifiantDemande } from '../../../shared/utils/identifiant-demande.util';
@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective],
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss']
})
export class DepensesComponent implements OnInit, OnDestroy {

  typesDepense: TypeDepense[] = [];
  showTypesModal = false;
  newTypeName = '';
  editingTypeId: number | null = null;
  editingTypeName = '';
  typesLoading = false;
  typesError = '';

  depenses: Depense[] = [];
  paiementsEmploye: PaiementEmploye[] = [];
  totalDepenses = 0;
  loading = false;
  showForm = false;
  editing: Depense | null = null;

  form: DepenseRequest = this.emptyForm();
  /**
   * Identifiant anti-doublon de la création en cours : le même pour chaque nouvel essai après une
   * erreur, renouvelé seulement pour une nouvelle dépense (ouverture du formulaire, ou après succès).
   */
  private identifiantCreation: string | null = null;

  /**
   * Dernière création dont le résultat est inconnu (réponse perdue, erreur serveur) : la dépense a
   * peut-être été enregistrée. Gardée en mémoire seulement (rien dans le navigateur), avec son
   * identifiant et son contenu exact : rouvrir le formulaire propose de renvoyer CETTE demande
   * (le serveur ne l'enregistre jamais deux fois) ; une nouvelle dépense demande d'abandonner
   * explicitement cette tentative.
   */
  tentativeIncertaine: { identifiant: string; demande: DepenseRequest } | null = null;

  /** Salaires refusés par le serveur (403 : rôle sans le droit Personnel) : dépenses affichées sans eux. */
  salairesIndisponibles = false;
  /** La dernière actualisation de la liste a échoué : la liste affichée n'est pas à jour. */
  listeNonActualisee = false;

  /** « Caisse par sessions » relue à l'ouverture de la page ; null = inconnu. */
  private caisseSessionsActive: boolean | null = null;
  private mesPermissions: MesPermissions | null = null;
  private abonnementPermissions?: Subscription;

  dateDebut = '';
  dateFin = '';
  filtreActif = false;

  totauxParType: { type: string; total: number }[] = [];

  private _typeFiltre: string = '';
  get typeFiltre(): string { return this._typeFiltre; }
  set typeFiltre(v: string) { this._typeFiltre = v; this.pageActuelle = 1; }

  private _moisFiltre: string = '';
  get moisFiltre(): string { return this._moisFiltre; }
  set moisFiltre(v: string) { this._moisFiltre = v; this.pageActuelle = 1; }

  pageActuelle: number = 1;
  itemsParPage: number = 10;

  constructor(
    private roleService: RoleService,
    private depenseService: DepenseService,
    private paiementEmployeService: PaiementEmployeService,
    private factureService: FactureService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
    this.lireComportementCreation();
  }

  ngOnDestroy(): void {
    this.abonnementPermissions?.unsubscribe();
  }

  /**
   * Ce que fera le serveur à la création, pour le texte du formulaire : relit « Caisse par
   * sessions » (la liste chargée à la connexion peut avoir changé) et suit les droits de la personne.
   */
  private lireComportementCreation(): void {
    this.boutiqueService.getFonctionnalitesAvancees().subscribe({
      next: liste => {
        const f = (liste || []).find(x => x.cle === 'CAISSE_SESSIONS');
        this.caisseSessionsActive = f ? f.actif === true : null;
      },
      error: () => { this.caisseSessionsActive = null; }
    });
    this.abonnementPermissions = this.roleService.mesPermissions$.subscribe(p => this.mesPermissions = p);
  }

  /**
   * immediat : l'argent sortira tout de suite ; attente : la dépense attendra la validation du
   * gérant ; inconnu : impossible de le savoir avec certitude (texte neutre). Même règle que le
   * serveur : en attente seulement si « Caisse par sessions » est active ET que la personne n'a pas
   * tous les droits. Les droits ne sont fiables que s'ils viennent vraiment du serveur (nom du rôle
   * présent ; en cas d'échec de lecture, le site retombe sur « aucune restriction » sans nom).
   */
  get comportementCreation(): 'immediat' | 'attente' | 'inconnu' {
    if (this.caisseSessionsActive === false) return 'immediat';
    const p = this.mesPermissions;
    if (this.caisseSessionsActive === true && p && p.roleNom) {
      return p.toutAutorise ? 'immediat' : 'attente';
    }
    return 'inconnu';
  }

  /** Texte du formulaire quand l'argent ne sortira pas forcément tout de suite. */
  get texteCreationSansDeduction(): string {
    return this.comportementCreation === 'attente'
      ? 'La dépense sera enregistrée en attente de validation. Aucun argent ne sortira de la caisse avant sa validation par le gérant.'
      : 'Selon vos droits, la dépense sera déduite de la caisse tout de suite ou mise en attente de validation par le gérant : le résultat vous sera confirmé à l\'enregistrement.';
  }

  /**
   * Salaires (onglet Employés) : un refus 403 (rôle sans le droit Personnel) n'empêche plus
   * d'afficher les dépenses ; toute autre erreur reste une erreur.
   */
  private chargerSalaires(): Observable<PaiementEmploye[] | null> {
    return this.paiementEmployeService.getTous().pipe(
      catchError(err => err?.status === 403 ? of(null) : throwError(() => err))
    );
  }

  loadTypes(): void {
    this.depenseService.getTypes().subscribe({
      next: types => this.typesDepense = types,
      error: () => {}
    });
  }

  ouvrirGestionTypes(): void { this.showTypesModal = true; this.typesError = ''; }
  fermerGestionTypes(): void { this.showTypesModal = false; this.newTypeName = ''; this.editingTypeId = null; this.editingTypeName = ''; }

  ajouterType(): void {
    const nom = this.newTypeName.trim();
    if (!nom) return;
    this.typesLoading = true;
    this.depenseService.creerType(nom).subscribe({
      next: t => {
        this.typesDepense.push(t);
        this.typesDepense.sort((a, b) => a.nom.localeCompare(b.nom));
        this.newTypeName = '';
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message; this.typesLoading = false; }
    });
  }

  startEditType(type: TypeDepense): void { this.editingTypeId = type.id; this.editingTypeName = type.nom; }

  saveEditType(): void {
    if (!this.editingTypeId || !this.editingTypeName.trim()) return;
    this.typesLoading = true;
    this.depenseService.modifierType(this.editingTypeId, this.editingTypeName.trim()).subscribe({
      next: t => {
        const idx = this.typesDepense.findIndex(x => x.id === t.id);
        if (idx >= 0) this.typesDepense[idx] = t;
        this.typesDepense.sort((a, b) => a.nom.localeCompare(b.nom));
        this.editingTypeId = null;
        this.editingTypeName = '';
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message; this.typesLoading = false; }
    });
  }

  cancelEditType(): void { this.editingTypeId = null; this.editingTypeName = ''; }

  supprimerTypeDepense(type: TypeDepense): void {
    this.typesLoading = true;
    this.depenseService.supprimerType(type.id).subscribe({
      next: () => {
        this.typesDepense = this.typesDepense.filter(t => t.id !== type.id);
        this.typesLoading = false;
        this.typesError = '';
      },
      error: e => { this.typesError = e.message || 'Ce type est utilisé par des dépenses existantes'; this.typesLoading = false; }
    });
  }

  /**
   * silencieux : actualisation après une action déjà réussie (ex. création) ; en cas d'échec, pas
   * de fenêtre d'erreur qui cacherait la confirmation : une bande « liste non actualisée » avec
   * « Réessayer » s'affiche, et la liste précédente reste visible.
   */
  load(silencieux = false): void {
    this.loading = true;
    this.filtreActif = false;
    this.pageActuelle = 1;
    forkJoin({
      depenses: this.depenseService.getAll(),
      paiements: this.chargerSalaires()
    }).subscribe({
      next: ({ depenses, paiements }) => {
        this.depenses = depenses.depenses;
        this.totalDepenses = depenses.total;
        this.salairesIndisponibles = paiements === null;
        this.paiementsEmploye = (paiements || []).filter(p => p.statut === 'PAYE');
        this.listeNonActualisee = false;
        this.loading = false;
        this.calculerTotauxParType();
      },
      error: e => {
        this.loading = false;
        if (silencieux) this.listeNonActualisee = true;
        else this.showError(e.message);
      }
    });
  }

  /** « Réessayer » de la bande : relit seulement la liste, ne recrée jamais de dépense. */
  reessayerChargement(): void {
    this.load(true);
  }

  filtrer(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.loading = true;
    this.filtreActif = true;
    this.pageActuelle = 1;
    forkJoin({
      depenses: this.depenseService.getParPeriode(this.dateDebut, this.dateFin),
      paiements: this.chargerSalaires()
    }).subscribe({
      next: ({ depenses, paiements }) => {
        this.depenses = depenses.depenses;
        this.totalDepenses = depenses.total;
        this.salairesIndisponibles = paiements === null;
        this.listeNonActualisee = false;
        // Filtrer les paiements employés par période si filtre actif
        this.paiementsEmploye = (paiements || []).filter(p => {
          if (p.statut !== 'PAYE') return false;
          const d = p.datePaiement?.split('T')[0] || '';
          return d >= this.dateDebut && d <= this.dateFin;
        });
        this.loading = false;
        this.calculerTotauxParType();
      },
      error: e => { this.loading = false; this.showError(e.message); }
    });
  }

  // Paiements employés mappés en objets dépense-like
  get paiementsCommeDep(): any[] {
    return this.paiementsEmploye.map(p => ({
      id: 'emp_' + p.id,
      nom: p.employeNomComplet,
      motif: p.employePoste || 'Salaire',
      date: (p.datePaiement || '').split('T')[0],
      montant: p.montant,
      typeDepense: 'Salaire',
      periodeDebut: p.periodeDebut,
      periodeFin: p.periodeFin,
      sourceExterne: true
    }));
  }

  // Liste unifiée (vraies dépenses + salaires)
  get toutesDepenses(): any[] {
    return [...this.depenses, ...this.paiementsCommeDep];
  }

  startCreate(): void {
    this.editing = null;
    if (this.tentativeIncertaine) {
      // Même demande, même identifiant : rien ne peut être enregistré une deuxième fois.
      this.form = { ...this.tentativeIncertaine.demande };
      this.identifiantCreation = this.tentativeIncertaine.identifiant;
    } else {
      this.form = this.emptyForm();
      this.identifiantCreation = nouvelIdentifiantDemande();
    }
    this.showForm = true;
  }

  /** Formulaire de création ouvert sur une tentative dont le résultat est inconnu (champs bloqués). */
  get enRepriseIncertaine(): boolean {
    return !this.editing && !!this.tentativeIncertaine;
  }

  /**
   * Erreur après laquelle la dépense a PU être enregistrée : aucune réponse (réseau coupé, réponse
   * perdue) ou erreur du serveur (5xx). Un refus 4xx signifie que rien n'a été enregistré.
   */
  private static resultatIncertain(e: any): boolean {
    const status = e?.status;
    return status === undefined || status === null || status === 0 || status >= 500;
  }

  /**
   * Abandon explicite de la tentative incertaine, pour saisir une dépense réellement nouvelle :
   * confirmation (vérifier la liste d'abord), puis liste relue et nouvel identifiant.
   */
  abandonnerTentative(): void {
    if (!this.tentativeIncertaine) return;
    const d = this.tentativeIncertaine.demande;
    Swal.fire({
      icon: 'warning',
      title: 'Abandonner cette tentative ?',
      html: `<b>${this.echapper(d.nom)}</b> — ${this.formatPrice(d.montant || 0)}<br><br>`
        + 'Elle a peut-être déjà été enregistrée. Vérifiez d\'abord la liste des dépenses :'
        + ' si elle y figure, ne la saisissez pas une deuxième fois.',
      showCancelButton: true,
      confirmButtonText: 'Abandonner et saisir une nouvelle dépense',
      cancelButtonText: 'Garder la tentative',
      confirmButtonColor: '#dc2626'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.tentativeIncertaine = null;
      this.identifiantCreation = nouvelIdentifiantDemande();
      this.form = this.emptyForm();
      this.load(true);
    });
  }

  calculerTotauxParType(): void {
    const map = new Map<string, number>();
    for (const d of this.toutesDepenses) {
      if ((d as any).annulee || this.estEnAttente(d)) continue;
      const type = (d as any).typeDepense || 'Sans type';
      if (type) map.set(type, (map.get(type) || 0) + d.montant);
    }
    this.totauxParType = Array.from(map.entries())
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);
  }

  chargerTotauxParType(): void {
    this.calculerTotauxParType();
  }

  startEdit(d: Depense): void {
    this.editing = d;
    this.form = { nom: d.nom, motif: d.motif || '', date: d.date, montant: d.montant, typeDepense: (d as any).typeDepense || '' };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.nom?.trim()) { this.showError('Le nom est obligatoire'); return; }
    if (!this.form.montant || this.form.montant <= 0) { this.showError('Le montant doit être supérieur à 0'); return; }
    if (!this.form.date) { this.showError('La date est obligatoire'); return; }

    const enEdition = this.editing;
    if (enEdition) {
      this.depenseService.modifier(enEdition.id!, this.form).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
          Swal.fire({
            icon: 'success', title: 'Dépense modifiée',
            text: this.estEnAttente(enEdition)
              ? 'Elle attend toujours la validation du gérant : la caisse n\'a pas bougé.'
              : 'La caisse a été ajustée automatiquement.',
            timer: 2500, timerProgressBar: true, confirmButtonColor: '#1a56db'
          });
        },
        error: e => this.showError(e.message)
      });
      return;
    }

    // Même identifiant pour chaque nouvel essai de cette création (pas de doublon côté serveur).
    // Tentative incertaine : on renvoie exactement la même demande, avec le même identifiant.
    if (!this.identifiantCreation) this.identifiantCreation = nouvelIdentifiantDemande();
    const identifiant = this.tentativeIncertaine ? this.tentativeIncertaine.identifiant : this.identifiantCreation;
    const demande: DepenseRequest = this.tentativeIncertaine ? { ...this.tentativeIncertaine.demande } : { ...this.form };
    this.depenseService.creer(demande, identifiant).subscribe({
      next: resultat => {
        // La dépense est enregistrée : l'identifiant est oublié (aucun renvoi automatique).
        this.identifiantCreation = null;
        this.tentativeIncertaine = null;
        this.showForm = false;
        let confirmation: Promise<unknown>;
        if (resultat.message === 'Dépense déjà enregistrée') {
          confirmation = Swal.fire({
            icon: 'info', title: 'Dépense déjà enregistrée',
            text: 'Cette dépense avait déjà été enregistrée : elle n\'a pas été ajoutée une deuxième fois.'
              + (resultat.validationRequise
                ? ' Elle attend la validation du gérant : aucun argent n\'est encore sorti de la caisse.'
                : ''),
            confirmButtonColor: '#1a56db'
          });
        } else if (resultat.validationRequise) {
          confirmation = this.afficherDepenseEnAttente(resultat.depense);
        } else {
          confirmation = Swal.fire({ icon: 'success', title: 'Dépense créée', text: 'Le montant a été déduit de la caisse.', timer: 2500, timerProgressBar: true, confirmButtonColor: '#1a56db' });
        }
        // Actualisation de la liste une fois la confirmation fermée, et sans fenêtre d'erreur : un
        // échec (et le message global « Mise à jour en cours » d'une coupure réseau) ne peut pas la
        // remplacer ; il donne la bande « liste non actualisée » avec « Réessayer ».
        Promise.resolve(confirmation).catch(() => undefined).then(() => this.load(true));
      },
      error: e => {
        if (DepensesComponent.resultatIncertain(e)) {
          this.tentativeIncertaine = { identifiant, demande };
          Swal.fire({
            icon: 'warning',
            title: 'Résultat inconnu',
            html: 'La réponse du serveur n\'est pas arrivée : la dépense a peut-être été enregistrée.<br><br>'
              + 'Renvoyez la même demande : elle ne sera jamais enregistrée deux fois.',
            confirmButtonText: 'Compris',
            confirmButtonColor: '#1a56db'
          });
        } else {
          this.showError(e.message);
        }
      }
    });
  }

  /** Fenêtre affichée quand la dépense attend la validation du gérant (rien n'est encore sorti). */
  private afficherDepenseEnAttente(d: Depense): Promise<unknown> {
    return Swal.fire({
      icon: 'info',
      title: 'Dépense notée — en attente de validation',
      html: `<b>${this.echapper(d?.nom)}</b> — ${this.formatPrice(d?.montant || 0)}<br><br>`
        + 'Elle doit être validée par le gérant pour être prise en compte.<br>'
        + '<b>Aucun argent n\'est encore sorti de la caisse.</b>',
      confirmButtonText: 'J\'ai compris',
      confirmButtonColor: '#1a56db',
      allowOutsideClick: false
    });
  }

  valider(d: Depense): void {
    const enAttente = this.estEnAttente(d);
    Swal.fire({
      icon: 'question',
      title: 'Valider cette dépense ?',
      html: `<b>${d.nom}</b> — ${this.formatPrice(d.montant)}<br>`
        + (enAttente ? `<b>${this.formatPrice(d.montant)} vont sortir de la caisse maintenant.</b><br>` : '')
        + '<small class="text-muted">Une fois validée, elle ne pourra plus être supprimée directement — seulement annulée avec un motif tracé.</small>',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Valider',
      confirmButtonColor: '#198754'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.depenseService.valider(d.id!).subscribe({
        next: () => {
          this.load();
          Swal.fire({
            icon: 'success', title: 'Dépense validée',
            text: enAttente ? `${this.formatPrice(d.montant)} sortis de la caisse.` : undefined,
            timer: 2500, showConfirmButton: false
          });
        },
        error: e => this.showError(e.message)
      });
    });
  }

  supprimer(d: Depense): void {
    // Dépense validée = verrouillée dans les comptes : suppression tracée (motif obligatoire)
    // au lieu d'une suppression silencieuse (comme l'annulation d'une vente).
    if (d.validee) {
      Swal.fire({
        icon: 'warning',
        title: 'Annuler cette dépense validée ?',
        html: `<b>${d.nom}</b> — ${this.formatPrice(d.montant)}<br><small class="text-muted">Le montant sera remis en caisse. Cette dépense reste visible dans l'historique, marquée "Annulée".</small>`,
        input: 'text',
        inputPlaceholder: "Motif d'annulation (obligatoire)",
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        confirmButtonText: 'Confirmer l\'annulation',
        confirmButtonColor: '#dc2626',
        preConfirm: (motif) => {
          if (!motif || motif.trim() === '') {
            Swal.showValidationMessage('Le motif est obligatoire pour une dépense déjà validée');
          }
          return motif;
        }
      }).then(result => {
        if (!result.isConfirmed || !result.value) return;
        this.depenseService.supprimer(d.id!, result.value).subscribe({
          next: () => {
            this.load();
            Swal.fire({ icon: 'success', title: 'Dépense annulée', text: 'Le montant a été remis en caisse.', timer: 2500, showConfirmButton: false });
          },
          error: e => this.showError(e.message)
        });
      });
      return;
    }

    const enAttente = this.estEnAttente(d);
    Swal.fire({
      icon: 'warning',
      title: 'Supprimer cette dépense ?',
      html: `<b>${d.nom}</b> — ${this.formatPrice(d.montant)}<br><small class="text-muted">`
        + (enAttente
          ? 'Elle n\'avait pas encore été prise en compte : la caisse ne changera pas.'
          : 'Le montant sera remis en caisse.')
        + '</small>',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Supprimer',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.depenseService.supprimer(d.id!).subscribe({
        next: () => {
          this.load();
          Swal.fire({
            icon: 'success', title: 'Supprimée',
            text: enAttente ? 'La caisse n\'a pas changé.' : 'Le montant a été remis en caisse.',
            timer: 2000, showConfirmButton: false
          });
        },
        error: e => this.showError(e.message)
      });
    });
  }

  cancel(): void {
    this.showForm = false;
  }

  formatPrice(v: number): string {
    return this.depenseService.formatPrice(v);
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get depensesFiltrees(): any[] {
    return this.toutesDepenses.filter(d => {
      const typeOk = !this.typeFiltre || (d as any).typeDepense === this.typeFiltre;
      const moisOk = !this.moisFiltre || (d.date || '').startsWith(this.moisFiltre);
      return typeOk && moisOk;
    });
  }

  get depensesPaginees(): any[] {
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    return this.depensesFiltrees.slice(debut, debut + this.itemsParPage);
  }

  get totalPages(): number {
    return Math.ceil(this.depensesFiltrees.length / this.itemsParPage);
  }

  allerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const debut = Math.max(1, this.pageActuelle - 2);
    const fin = Math.min(this.totalPages, debut + 4);
    for (let i = debut; i <= fin; i++) pages.push(i);
    return pages;
  }

  /** Dépense notée par un non-gérant, pas encore validée : l'argent n'est pas sorti de la caisse. */
  estEnAttente(d: any): boolean {
    return !!d && d.sortieEnAttente === true && !d.annulee;
  }

  /**
   * Bouton « Valider » : pour une dépense en attente, le serveur exige « Dépenses : supprimer »
   * (ou un gérant avec tous les droits) car c'est là que l'argent sort ; sinon « Dépenses : modifier ».
   */
  peutValider(d: any): boolean {
    return this.estEnAttente(d) ? this.peut('DEPENSES', 'SUPPRIMER') : this.peut('DEPENSES', 'GERER');
  }

  /** Total effectif : hors annulées et hors dépenses en attente (même règle que le serveur). */
  get totalDepensesFiltrees(): number {
    return this.depensesFiltrees
      .filter(d => !(d as any).annulee && !this.estEnAttente(d))
      .reduce((s, d) => s + d.montant, 0);
  }

  get depensesEnAttenteFiltrees(): any[] {
    return this.depensesFiltrees.filter(d => this.estEnAttente(d));
  }

  get totalEnAttenteFiltrees(): number {
    return this.depensesEnAttenteFiltrees.reduce((s, d) => s + d.montant, 0);
  }

  /** Moyenne du total effectif (les dépenses en attente ne comptent pas encore). */
  get moyenneDepensesFiltrees(): number {
    const nombre = this.depensesFiltrees.length - this.depensesEnAttenteFiltrees.length;
    return nombre > 0 ? this.totalDepensesFiltrees / nombre : 0;
  }

  get totalToutesFiltrees(): number {
    return this.totalDepensesFiltrees;
  }

  get resumeParTypeFiltrees(): { type: string; total: number }[] {
    const map = new Map<string, number>();
    for (const d of this.depensesFiltrees) {
      if ((d as any).annulee || this.estEnAttente(d)) continue;
      const type = (d as any).typeDepense || 'Sans type';
      map.set(type, (map.get(type) || 0) + d.montant);
    }
    return Array.from(map.entries())
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);
  }

  telechargerPdf(): void {
    const liste = this.depensesFiltrees;
    if (!liste.length) {
      Swal.fire({ icon: 'info', title: 'Aucune donnée', text: 'Aucune dépense à exporter.', timer: 2000, showConfirmButton: false }); return;
    }

    const periode = this.moisFiltre
      ? this.moisFiltre
      : (this.dateDebut && this.dateFin ? `${this.dateDebut} au ${this.dateFin}` : 'Toutes les périodes');

    const qrData = encodeURIComponent(`DEPENSES_${periode}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const total = this.totalDepensesFiltrees;
    const totalSalaires = liste.filter(d => d.typeDepense === 'Salaire').reduce((s: number, d: any) => s + d.montant, 0);
    const totalAutres = total - totalSalaires;
    const nombreEnAttente = this.depensesEnAttenteFiltrees.length;
    const totalEnAttente = this.totalEnAttenteFiltrees;

    const resumeRows = this.resumeParTypeFiltrees.map(r =>
      `<tr><td>${r.type}</td><td style="text-align:right;font-weight:700">${this.formatPrice(r.total)}</td></tr>`
    ).join('');

    const depenseRows = liste.map((d: any) =>
      `<tr>
        <td>${d.date || '—'}</td>
        <td><strong>${d.nom}</strong>${d.periodeDebut ? `<br><small style="color:#64748b">${d.periodeDebut}${d.periodeFin && d.periodeFin !== d.periodeDebut ? ' → ' + d.periodeFin : ''}</small>` : ''}${this.estEnAttente(d) ? '<br><small style="color:#b45309;font-weight:700">En attente de validation — hors total</small>' : ''}</td>
        <td><span style="background:${d.typeDepense === 'Salaire' ? '#fef3c7' : '#eff6ff'};color:${d.typeDepense === 'Salaire' ? '#92400e' : '#1e40af'};padding:2px 8px;border-radius:12px;font-size:0.75rem">${d.typeDepense || '—'}</span></td>
        <td>${d.motif || '—'}</td>
        <td style="text-align:right;font-weight:700;color:${this.estEnAttente(d) ? '#b45309' : '#dc2626'}">${this.formatPrice(d.montant)}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Dépenses — ${periode}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:750px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}
.hdr-title{font-size:22px;font-weight:900}
.hdr-sub{font-size:12px;opacity:.7;margin-top:4px}
.body{padding:24px 28px}
.section{margin-bottom:22px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
.kpi-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.kpi{flex:1;min-width:130px;background:#f8fafc;border-radius:10px;padding:14px 16px;text-align:center;border:1px solid #e2e8f0}
.kpi.red{background:#fef2f2;border-color:#fca5a5}
.kpi-val{font-size:1.1rem;font-weight:900;color:#1e293b}
.kpi.red .kpi-val{color:#dc2626}
.kpi-lbl{font-size:0.7rem;color:#64748b;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:0.82rem}
th{background:#f8fafc;padding:8px 10px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151}
tr:last-child td{border-bottom:none}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:#7c3aed;color:#fff}
.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#7c3aed,#a855f7);color:rgba(255,255,255,.6);text-align:center;padding:12px;font-size:11px}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">Rapport Dépenses</div>
      <div class="hdr-sub">Période : ${periode}</div>
      <div class="hdr-sub">${liste.length} dépense(s) dont ${this.paiementsCommeDep.filter((p: any) => this.depensesFiltrees.includes(p)).length} salaire(s)</div>
    </div>
    <img src="${qrUrl}" width="72" height="72" style="border-radius:8px;background:#fff;padding:3px" alt="QR" onerror="this.style.display='none'">
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">
    <div class="kpi-row">
      <div class="kpi red"><div class="kpi-val">${this.formatPrice(total)}</div><div class="kpi-lbl">Total dépenses</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#92400e">${this.formatPrice(totalSalaires)}</div><div class="kpi-lbl">dont Salaires</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#7c3aed">${this.formatPrice(totalAutres)}</div><div class="kpi-lbl">dont Autres</div></div>
    </div>
    ${nombreEnAttente ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:10px 14px;margin-bottom:20px;color:#92400e">
      <strong>${nombreEnAttente} dépense(s) en attente de validation : ${this.formatPrice(totalEnAttente)}</strong><br>
      <small>Hors du total ci-dessus : l'argent ne sort de la caisse qu'à la validation du gérant.</small></div>` : ''}
    <div class="section">
      <div class="section-title">Répartition par type</div>
      <table>
        <thead><tr><th>Type</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${resumeRows || '<tr><td colspan="2" style="color:#94a3b8;text-align:center">Aucun type renseigné</td></tr>'}</tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Détail des dépenses</div>
      <table>
        <thead><tr><th>Date</th><th>Nom</th><th>Type</th><th>Motif</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>${depenseRows}</tbody>
      </table>
    </div>
  </div>
  <div class="ftr">Ges Boutique &middot; Rapport généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</div>
</body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }

  getIconeType(nom: string): string {
    const n = (nom || '').toLowerCase();
    if (/loyer|maison|location|logement|appartement|bail/.test(n)) return 'fa-home';
    if (/transport|carburant|essence|voiture|taxi|moto|bus|véhicule|vehicule/.test(n)) return 'fa-car';
    if (/électricité|electricite|courant|énergie|energie|lumière|lumiere|kwh/.test(n)) return 'fa-bolt';
    if (/\beau\b|eau courante/.test(n)) return 'fa-tint';
    if (/nourriture|alimentation|repas|restaurant|manger|vivres|provisions|courses/.test(n)) return 'fa-cutlery';
    if (/téléphone|telephone|mobile|forfait|appel/.test(n)) return 'fa-phone';
    if (/internet|wifi|connexion|web|fibre/.test(n)) return 'fa-wifi';
    if (/salaire|employé|employe|paie|personnel/.test(n)) return 'fa-users';
    if (/santé|sante|médecin|medecin|pharmacie|médicament|medicament|hôpital|hopital/.test(n)) return 'fa-heartbeat';
    if (/publicité|publicite|marketing|\bpub\b|annonce/.test(n)) return 'fa-bullhorn';
    if (/entretien|nettoyage|maintenance|réparation|reparation|fourniture|matériel|materiel|bureau|papeterie/.test(n)) return 'fa-wrench';
    if (/impôt|impot|taxe|fiscalité|fiscalite|douane/.test(n)) return 'fa-file-text';
    if (/assurance/.test(n)) return 'fa-shield';
    if (/formation|école|ecole|éducation|education|cours/.test(n)) return 'fa-graduation-cap';
    if (/pétrole|petrole|fuel/.test(n)) return 'fa-fire';
    return 'fa-tag';
  }

  private echapper(v: string | undefined | null): string {
    return (v || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);
  }

  private emptyForm(): DepenseRequest {
    return { nom: '', motif: '', date: this.today, montant: 0, typeDepense: '' };
  }

  private showError(msg: string): void {
    Swal.fire({ icon: 'error', title: 'Erreur', text: msg, confirmButtonColor: '#dc2626' });
  }

  /** Bouton visible seulement si le rôle de la personne permet l'action (rôles personnalisés). */
  peut(module: string, action: ActionPermission): boolean {
    return this.roleService.peut(module, action);
  }
}
