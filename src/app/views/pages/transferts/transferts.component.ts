import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  TransfertService, TransfertStock, BoutiquePartenaire, TransfertRequest
} from '../../../shared/services/transfert.service';
import { ProductService } from '../../../shared/services/product.service';

@Component({
  selector: 'app-transferts',
  templateUrl: './transferts.component.html',
  styleUrls: ['./transferts.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TransfertsComponent implements OnInit {

  transferts: TransfertStock[] = [];
  partenaires: BoutiquePartenaire[] = [];
  produits: any[] = [];
  isLoading = false;

  // Formulaire nouveau transfert
  afficherFormulaire = false;
  editingTransfert: TransfertStock | null = null;
  form: TransfertRequest = {
    boutiqueDestId: 0,
    typePaiement: 'SANS_PAIEMENT',
    notes: '',
    lignes: []
  };

  // Formulaire partenaire
  afficherFormPartenaire = false;
  editingPartenaire: BoutiquePartenaire | null = null;
  formPartenaire: BoutiquePartenaire = { nom: '', url: '', actif: true };

  // Détail
  transfertDetail: TransfertStock | null = null;

  readonly TYPES_PAIEMENT = [
    { v: 'SANS_PAIEMENT', l: 'Sans paiement' },
    { v: 'IMMEDIAT',      l: 'Paiement immédiat' },
    { v: 'CREDIT',        l: 'Crédit' }
  ];

  readonly STATUT_LABELS: Record<string, string> = {
    CREE: 'Créé',
    EN_ATTENTE_CONFIRMATION: 'En attente',
    CONFIRME: 'Confirmé',
    ANNULE: 'Annulé'
  };

  readonly STATUT_COLORS: Record<string, string> = {
    CREE: 'primary',
    EN_ATTENTE_CONFIRMATION: 'warning',
    CONFIRME: 'success',
    ANNULE: 'secondary'
  };

  constructor(
    private transfertService: TransfertService,
    private produitService: ProductService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerPartenaires();
    this.chargerProduits();
  }

  charger(): void {
    this.isLoading = true;
    this.transfertService.getTout().subscribe({
      next: t => { this.transferts = t; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  chargerPartenaires(): void {
    this.transfertService.getPartenaires().subscribe(p => this.partenaires = p);
  }

  chargerProduits(): void {
    this.produitService.getProducts().subscribe(p => this.produits = p);
  }

  // ── Formulaire transfert ──

  nouveauTransfert(): void {
    this.editingTransfert = null;
    this.form = { boutiqueDestId: 0, typePaiement: 'SANS_PAIEMENT', notes: '', lignes: [] };
    this.ajouterLigne();
    this.afficherFormulaire = true;
  }

  editerTransfert(t: TransfertStock): void {
    if (t.statut === 'CONFIRME' || t.statut === 'ANNULE') return;
    this.editingTransfert = t;
    const dest = this.partenaires.find(p => p.nom === t.boutiqueDestNom);
    this.form = {
      boutiqueDestId: dest?.id ?? 0,
      typePaiement: t.typePaiement,
      notes: t.notes ?? '',
      lignes: t.lignes.map(l => ({
        produitId: l.produitId,
        produitNom: l.produitNom,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire
      }))
    };
    this.afficherFormulaire = true;
  }

  ajouterLigne(): void {
    this.form.lignes.push({ produitId: 0, produitNom: '', quantite: 1 });
  }

  supprimerLigne(i: number): void {
    this.form.lignes.splice(i, 1);
  }

  onProduitChange(i: number): void {
    const p = this.produits.find(pr => pr.id === +this.form.lignes[i].produitId);
    if (p) {
      this.form.lignes[i].produitNom = p.nom;
      this.form.lignes[i].prixUnitaire = p.prixVente;
    }
  }

  sauvegarder(): void {
    if (!this.form.boutiqueDestId || this.form.lignes.length === 0) {
      Swal.fire('Erreur', 'Sélectionnez une boutique destination et ajoutez au moins un produit', 'error');
      return;
    }
    const obs$ = this.editingTransfert
      ? this.transfertService.modifier(this.editingTransfert.id!, this.form)
      : this.transfertService.creer(this.form);

    obs$.subscribe({
      next: () => {
        this.afficherFormulaire = false;
        this.charger();
        Swal.fire('Succès', this.editingTransfert ? 'Transfert modifié' : 'Transfert créé', 'success');
      },
      error: e => Swal.fire('Erreur', e.error?.message ?? 'Erreur', 'error')
    });
  }

  confirmer(t: TransfertStock): void {
    Swal.fire({
      title: 'Confirmer définitivement ?',
      text: 'Une fois confirmé, aucune modification ne sera possible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.confirmer(t.id!).subscribe({
          next: () => { this.charger(); Swal.fire('Confirmé !', '', 'success'); },
          error: e => Swal.fire('Erreur', e.error?.message, 'error')
        });
      }
    });
  }

  annuler(t: TransfertStock): void {
    Swal.fire({
      title: 'Motif d\'annulation',
      input: 'text',
      inputPlaceholder: 'Raison de l\'annulation',
      showCancelButton: true,
      confirmButtonText: 'Annuler le transfert',
      cancelButtonText: 'Retour',
      icon: 'question'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.annuler(t.id!, r.value).subscribe({
          next: () => { this.charger(); Swal.fire('Annulé', '', 'info'); },
          error: e => Swal.fire('Erreur', e.error?.message, 'error')
        });
      }
    });
  }

  voirDetail(t: TransfertStock): void {
    this.transfertService.getById(t.id!).subscribe(detail => this.transfertDetail = detail);
  }

  exporterFacture(): void {
    if (!this.transfertDetail) return;
    const t = this.transfertDetail;
    const lignesHtml = t.lignes.map(l =>
      `<tr><td>${l.produitNom}</td><td style="text-align:right">${l.quantite}</td>
       <td style="text-align:right">${l.prixUnitaire ? this.fmt(l.prixUnitaire) : '—'}</td>
       <td style="text-align:right">${l.prixUnitaire ? this.fmt(l.prixUnitaire * l.quantite) : '—'}</td></tr>`
    ).join('');

    const total = t.lignes.reduce((s, l) => s + (l.prixUnitaire ? l.prixUnitaire * l.quantite : 0), 0);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Facture ${t.numeroTransfert}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:32px;color:#111}
      h1{color:#3b82f6;margin-bottom:4px}
      .meta{display:flex;gap:40px;margin:20px 0;padding:16px;background:#f9fafb;border-radius:8px}
      .meta div{flex:1}
      .label{font-size:11px;color:#6b7280;margin-bottom:2px}
      .val{font-weight:600}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #e5e7eb;padding:8px 10px;font-size:12px}
      th{background:#f3f4f6;font-weight:700}
      tfoot td{font-weight:700;background:#f0fdf4}
      .badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;
             background:${t.statut === 'CONFIRME' ? '#dcfce7' : '#fef9c3'};
             color:${t.statut === 'CONFIRME' ? '#16a34a' : '#92400e'}}
      @media print{button{display:none}}
    </style></head><body>
    <h1>Facture de transfert</h1>
    <p style="color:#6b7280">${t.numeroTransfert} &nbsp;|&nbsp; <span class="badge">${this.STATUT_LABELS[t.statut]}</span></p>
    <div class="meta">
      <div><div class="label">Boutique source</div><div class="val">${t.boutiqueSourceNom}</div></div>
      <div><div class="label">Boutique destination</div><div class="val">${t.boutiqueDestNom}</div></div>
      <div><div class="label">Paiement</div><div class="val">${this.TYPES_PAIEMENT.find(tp => tp.v === t.typePaiement)?.l ?? t.typePaiement}</div></div>
      <div><div class="label">Date</div><div class="val">${new Date(t.dateCreation!).toLocaleDateString('fr-FR')}</div></div>
    </div>
    <table>
      <thead><tr><th>Produit</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
      <tfoot><tr><td colspan="3">TOTAL</td><td style="text-align:right">${this.fmt(total)}</td></tr></tfoot>
    </table>
    ${t.notes ? `<p style="margin-top:16px;color:#6b7280"><em>Notes : ${t.notes}</em></p>` : ''}
    <br><button onclick="window.print()" style="background:#3b82f6;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">Imprimer</button>
    <script>window.addEventListener('afterprint',()=>window.close());<\/script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 300);
  }

  // ── Partenaires ──

  nouveauPartenaire(): void {
    this.editingPartenaire = null;
    this.formPartenaire = { nom: '', url: '', actif: true };
    this.afficherFormPartenaire = true;
  }

  editerPartenaire(p: BoutiquePartenaire): void {
    this.editingPartenaire = p;
    this.formPartenaire = { ...p };
    this.afficherFormPartenaire = true;
  }

  sauvegarderPartenaire(): void {
    const obs$ = this.editingPartenaire
      ? this.transfertService.modifierPartenaire(this.editingPartenaire.id!, this.formPartenaire)
      : this.transfertService.ajouterPartenaire(this.formPartenaire);
    obs$.subscribe({
      next: () => { this.afficherFormPartenaire = false; this.chargerPartenaires(); },
      error: e => Swal.fire('Erreur', e.error?.message, 'error')
    });
  }

  supprimerPartenaire(p: BoutiquePartenaire): void {
    Swal.fire({ title: 'Supprimer ' + p.nom + ' ?', icon: 'warning', showCancelButton: true })
      .then(r => {
        if (r.isConfirmed) {
          this.transfertService.supprimerPartenaire(p.id!).subscribe(() => this.chargerPartenaires());
        }
      });
  }

  labelPaiement(v: string): string {
    return this.TYPES_PAIEMENT.find(tp => tp.v === v)?.l ?? v;
  }

  fmt(v: number): string {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v) + ' FCFA';
  }
}
