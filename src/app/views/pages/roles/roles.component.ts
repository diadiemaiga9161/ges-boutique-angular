import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import {
  ActionPermission,
  ModuleCatalogue,
  RoleBoutique,
  RoleService
} from '../../../shared/services/role.service';
import { AuthService } from '../../../shared/services/auth.service';

interface Personne {
  id: number;
  nomComplet: string;
  username: string;
  role: string;
  actif: boolean;
  roleBoutiqueId?: number | null;
}

/** Brouillon du rôle en cours d'édition (nouveau ou existant). */
interface Brouillon {
  id: number | null;
  nom: string;
  description: string;
  roleBase: 'ADMIN' | 'VENDEUR';
  systeme: boolean;
  verrouille: boolean;
  permissions: Set<string>;
}

const ACTIONS: ActionPermission[] = ['VOIR', 'GERER', 'SUPPRIMER'];

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  readonly actions = ACTIONS;
  readonly libellesActions: Record<ActionPermission, string> = {
    VOIR: 'Voir',
    GERER: 'Ajouter / modifier',
    SUPPRIMER: 'Supprimer / annuler'
  };

  catalogue: ModuleCatalogue[] = [];
  roles: RoleBoutique[] = [];
  personnes: Personne[] = [];

  chargement = true;
  erreur = '';
  enregistrement = false;
  brouillon: Brouillon | null = null;
  attributionEnCours: number | null = null;

  constructor(private roleService: RoleService, private authService: AuthService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(idASelectionner?: number | null): void {
    this.chargement = true;
    this.erreur = '';
    forkJoin({
      catalogue: this.roleService.catalogue(),
      roles: this.roleService.lister(),
      personnes: this.roleService.utilisateurs()
    }).subscribe({
      next: ({ catalogue, roles, personnes }) => {
        this.catalogue = catalogue;
        this.roles = roles;
        const moi = this.authService.getUserId();
        this.personnes = (personnes || []).filter(p => p.id !== moi) as Personne[];
        this.chargement = false;
        const cible = roles.find(r => r.id === (idASelectionner ?? this.brouillon?.id)) || roles[0];
        if (cible) this.selectionner(cible);
      },
      error: err => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Impossible de charger les rôles.';
      }
    });
  }

  // ---------------------------------------------------------------- édition

  selectionner(r: RoleBoutique): void {
    this.brouillon = {
      id: r.id,
      nom: r.nom,
      description: r.description || '',
      roleBase: r.roleBase,
      systeme: r.systeme,
      verrouille: r.verrouille,
      permissions: new Set(r.permissions)
    };
  }

  nouveauRole(): void {
    this.brouillon = {
      id: null,
      nom: '',
      description: '',
      roleBase: 'VENDEUR',
      systeme: false,
      verrouille: false,
      permissions: new Set(['VENTES_VOIR', 'VENTES_GERER', 'PRODUITS_VOIR', 'CLIENTS_VOIR'])
    };
  }

  /** Parties visibles dans le tableau : un rôle basé sur Vendeur n'a pas accès aux autres. */
  get modulesAffiches(): ModuleCatalogue[] {
    if (!this.brouillon) return [];
    return this.brouillon.roleBase === 'VENDEUR'
      ? this.catalogue.filter(m => m.accessibleVendeur)
      : this.catalogue;
  }

  changerBase(base: 'ADMIN' | 'VENDEUR'): void {
    if (!this.brouillon || this.brouillon.systeme) return;
    this.brouillon.roleBase = base;
    const permis = new Set(this.modulesAffiches.flatMap(m => m.actions.map(a => a.code)));
    this.brouillon.permissions = new Set([...this.brouillon.permissions].filter(c => permis.has(c)));
  }

  aAction(m: ModuleCatalogue, a: ActionPermission): boolean {
    return m.actions.some(x => x.action === a);
  }

  coche(m: ModuleCatalogue, a: ActionPermission): boolean {
    return !!this.brouillon?.permissions.has(`${m.module}_${a}`);
  }

  basculer(m: ModuleCatalogue, a: ActionPermission): void {
    const b = this.brouillon;
    if (!b || b.verrouille) return;
    const code = `${m.module}_${a}`;
    if (b.permissions.has(code)) {
      b.permissions.delete(code);
      // Sans "Voir", les autres droits n'ont pas de sens (la page serait cachée).
      if (a === 'VOIR') ACTIONS.forEach(x => b.permissions.delete(`${m.module}_${x}`));
    } else {
      b.permissions.add(code);
      if (a !== 'VOIR') b.permissions.add(`${m.module}_VOIR`);
    }
  }

  ligneComplete(m: ModuleCatalogue): boolean {
    return m.actions.every(a => this.brouillon?.permissions.has(a.code));
  }

  basculerLigne(m: ModuleCatalogue): void {
    const b = this.brouillon;
    if (!b || b.verrouille) return;
    const complete = this.ligneComplete(m);
    m.actions.forEach(a => complete ? b.permissions.delete(a.code) : b.permissions.add(a.code));
  }

  toutCocher(valeur: boolean): void {
    const b = this.brouillon;
    if (!b || b.verrouille) return;
    b.permissions = valeur ? new Set(this.modulesAffiches.flatMap(m => m.actions.map(a => a.code))) : new Set();
  }

  get nombreDroits(): number {
    return this.brouillon?.permissions.size || 0;
  }

  enregistrer(): void {
    const b = this.brouillon;
    if (!b || b.verrouille) return;
    if (!b.nom.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nom manquant', text: 'Donnez un nom au rôle (ex : Caissier).', confirmButtonColor: '#2563eb' });
      return;
    }
    const req = { nom: b.nom.trim(), description: b.description.trim(), roleBase: b.roleBase, permissions: [...b.permissions] };
    this.enregistrement = true;
    const obs = b.id ? this.roleService.modifier(b.id, req) : this.roleService.creer(req);
    obs.subscribe({
      next: r => {
        this.enregistrement = false;
        Swal.fire({ icon: 'success', title: 'Rôle enregistré', timer: 1400, showConfirmButton: false });
        this.charger(r.id);
      },
      error: err => {
        this.enregistrement = false;
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible', text: err?.error?.message || 'Réessayez.', confirmButtonColor: '#2563eb' });
      }
    });
  }

  supprimer(): void {
    const b = this.brouillon;
    if (!b?.id || b.systeme) return;
    Swal.fire({
      icon: 'warning',
      title: `Supprimer le rôle « ${b.nom} » ?`,
      text: 'Cette action est définitive.',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.roleService.supprimer(b.id!).subscribe({
        next: () => { this.brouillon = null; this.charger(); },
        error: err => Swal.fire({ icon: 'error', title: 'Suppression impossible', text: err?.error?.message || 'Réessayez.', confirmButtonColor: '#2563eb' })
      });
    });
  }

  annuler(): void {
    const r = this.roles.find(x => x.id === this.brouillon?.id) || this.roles[0];
    if (r) this.selectionner(r); else this.brouillon = null;
  }

  @HostListener('document:keydown.escape')
  onEchap(): void {
    if (this.brouillon && !this.brouillon.id) this.annuler();
  }

  // ---------------------------------------------------------------- attribution

  roleDe(p: Personne): number {
    if (p.roleBoutiqueId) return p.roleBoutiqueId;
    const base = (p.role || '').replace('ROLE_', '');
    return this.roles.find(r => r.systeme && r.roleBase === base)?.id || 0;
  }

  attribuer(p: Personne, roleId: number): void {
    const role = this.roles.find(r => r.id === +roleId);
    if (!role) return;
    const ancien = this.roleDe(p);
    const changeBase = role.roleBase !== (p.role || '').replace('ROLE_', '');
    const confirmer = changeBase && role.roleBase === 'ADMIN'
      ? Swal.fire({
          icon: 'question',
          title: `Donner le rôle « ${role.nom} » à ${p.nomComplet} ?`,
          text: 'Ce rôle est basé sur Gérant : cette personne aura accès aux pages de gestion cochées pour ce rôle.',
          showCancelButton: true,
          confirmButtonText: 'Confirmer',
          cancelButtonText: 'Annuler',
          confirmButtonColor: '#2563eb'
        }).then(r => r.isConfirmed)
      : Promise.resolve(true);
    confirmer.then(ok => {
      if (!ok) { this.reafficher(p); return; }
      this.attributionEnCours = p.id;
      this.roleService.attribuer(p.id, role.id).subscribe({
        next: res => {
          this.attributionEnCours = null;
          p.role = res.role;
          p.roleBoutiqueId = res.roleBoutiqueId;
          this.roles = this.roles.map(r => ({
            ...r,
            nombreUtilisateurs: r.nombreUtilisateurs + (r.id === role.id ? 1 : 0) - (r.id === ancien ? 1 : 0)
          }));
          Swal.fire({ icon: 'success', title: `${p.nomComplet} : ${res.roleNom}`, text: 'Le changement s\'applique à sa prochaine action.', timer: 1800, showConfirmButton: false });
        },
        error: err => {
          this.attributionEnCours = null;
          this.reafficher(p);
          Swal.fire({ icon: 'error', title: 'Changement impossible', text: err?.error?.message || 'Réessayez.', confirmButtonColor: '#2563eb' });
        }
      });
    });
  }

  /** Remet la liste déroulante sur le rôle réel (après annulation ou erreur). */
  private reafficher(p: Personne): void {
    this.personnes = this.personnes.map(x => (x === p ? { ...x } : x));
  }

  libelleBase(base: string): string {
    return base === 'ADMIN' ? 'Basé sur Gérant' : 'Basé sur Vendeur';
  }
}
