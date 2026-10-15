import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Produit, ProductService } from '../../../shared/services/product.service';
import { Client, ClientService } from '../../../shared/services/client.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { nombreEnLettres } from '../../../shared/utils/nombre-en-lettres.util';

interface LigneDevis {
  produitId: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal?: number;
}

interface Devis {
  id: number;
  numero: string;
  clientId: number | null;
  clientNom: string;
  clientTelephone: string | null;
  clientAdresse: string | null;
  objet: string | null;
  conditions: string | null;
  dateCreation: string;
  dateValidite: string;
  statut: 'EN_ATTENTE' | 'TRANSFORME' | 'REFUSE' | 'EXPIRE';
  venteId: number | null;
  creePar: string | null;
  sousTotal: number;
  remise: number;
  montantTotal: number;
  lignes: LigneDevis[];
}

interface Saisie {
  id?: number;
  clientId: number | null;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  objet: string;
  dateValidite: string;
  conditions: string;
  remise: number;
  lignes: LigneDevis[];
}

interface Transformation {
  devis: Devis;
  comptant: boolean;
  modePaiement: string;
  referencePaiement: string;
  dateEcheance: string;
  montantVerse: number;
}

const STATUTS: Record<string, { texte: string; classe: string }> = {
  EN_ATTENTE: { texte: 'En attente', classe: 'dv-badge--attente' },
  TRANSFORME: { texte: 'Devenu vente', classe: 'dv-badge--ok' },
  REFUSE: { texte: 'Refusé', classe: 'dv-badge--refuse' },
  EXPIRE: { texte: 'Expiré', classe: 'dv-badge--expire' }
};

/**
 * Devis pro forma pour les écoles, mairies, ONG… : préparer, imprimer, puis transformer en
 * vente d'un clic quand le client accepte (à crédit par défaut, ou payé tout de suite).
 */
@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss']
})
export class DevisComponent implements OnInit {
  private readonly api = `${environment.apiUrl}/devis`;
  devis: Devis[] = [];
  produits: Produit[] = [];
  clients: Client[] = [];
  chargement = false;
  enregistrement = false;
  message = '';
  erreur = '';
  saisie: Saisie | null = null;
  transformation: Transformation | null = null;
  rechercheProduit = '';
  rechercheClient = '';
  readonly modes = [
    { cle: 'ESPECES', libelle: 'Espèces' },
    { cle: 'ORANGE_MONEY', libelle: 'Orange Money' },
    { cle: 'MOOV_MONEY', libelle: 'Moov Money' },
    { cle: 'WAVE_MONEY', libelle: 'Wave' }
  ];

  constructor(private http: HttpClient, private productService: ProductService,
              private clientService: ClientService, private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.charger();
    this.productService.getProducts().subscribe({
      next: p => (this.produits = p.filter(x => !x.modeMesure).sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))),
      error: () => {}
    });
    this.clientService.getAll().subscribe({ next: c => (this.clients = c), error: () => {} });
  }

  charger(): void {
    this.chargement = true;
    this.http.get<Devis[]>(this.api).subscribe({
      next: d => { this.devis = d; this.chargement = false; },
      error: e => { this.erreur = e?.error?.message || 'Impossible de charger les devis.'; this.chargement = false; }
    });
  }

  statut(d: Devis): { texte: string; classe: string } {
    return STATUTS[d.statut] || { texte: d.statut, classe: '' };
  }

  // ------------------------------------------------------------------ saisie

  nouveau(): void {
    this.message = '';
    this.erreur = '';
    this.transformation = null;
    const dans30 = new Date();
    dans30.setDate(dans30.getDate() + 30);
    this.saisie = {
      clientId: null, clientNom: '', clientTelephone: '', clientAdresse: '', objet: '',
      dateValidite: this.iso(dans30), conditions: 'Paiement à la livraison.', remise: 0, lignes: []
    };
  }

  modifier(d: Devis): void {
    this.message = '';
    this.erreur = '';
    this.transformation = null;
    this.saisie = {
      id: d.id, clientId: d.clientId, clientNom: d.clientNom, clientTelephone: d.clientTelephone || '',
      clientAdresse: d.clientAdresse || '', objet: d.objet || '', dateValidite: d.dateValidite,
      conditions: d.conditions || '', remise: d.remise || 0,
      lignes: d.lignes.map(l => ({ ...l }))
    };
  }

  get clientsFiltres(): Client[] {
    const r = this.rechercheClient.trim().toLowerCase();
    if (!r) return [];
    return this.clients.filter(c => `${c.prenom || ''} ${c.nom}`.toLowerCase().includes(r)).slice(0, 8);
  }

  choisirClient(c: Client): void {
    if (!this.saisie) return;
    this.saisie.clientId = c.id ?? null;
    this.saisie.clientNom = `${c.prenom || ''} ${c.nom}`.trim();
    this.saisie.clientTelephone = c.numeroTelephone || c.telephone || '';
    this.saisie.clientAdresse = c.adresse || '';
    this.rechercheClient = '';
  }

  oublierClient(): void {
    if (!this.saisie) return;
    this.saisie.clientId = null;
  }

  get produitsFiltres(): Produit[] {
    const r = this.rechercheProduit.trim().toLowerCase();
    if (!r) return [];
    return this.produits.filter(p => (p.nom || '').toLowerCase().includes(r) || (p.codeBarre || '').includes(r)).slice(0, 8);
  }

  ajouterProduit(p: Produit): void {
    if (!this.saisie) return;
    const existant = this.saisie.lignes.find(l => l.produitId === p.id);
    if (existant) existant.quantite += 1;
    else this.saisie.lignes.push({ produitId: p.id, designation: p.nom, quantite: 1, prixUnitaire: p.prixVente || 0 });
    this.rechercheProduit = '';
  }

  retirerLigne(i: number): void {
    this.saisie?.lignes.splice(i, 1);
  }

  get sousTotalSaisie(): number {
    return (this.saisie?.lignes || []).reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);
  }

  get totalSaisie(): number {
    return Math.max(0, this.sousTotalSaisie - (Number(this.saisie?.remise) || 0));
  }

  enregistrer(): void {
    if (!this.saisie) return;
    this.enregistrement = true;
    this.erreur = '';
    const s = this.saisie;
    const corps = {
      clientId: s.clientId, clientNom: s.clientNom, clientTelephone: s.clientTelephone, clientAdresse: s.clientAdresse,
      objet: s.objet, dateValidite: s.dateValidite, conditions: s.conditions, remise: s.remise,
      lignes: s.lignes.map(l => ({ produitId: l.produitId, quantite: l.quantite, prixUnitaire: l.prixUnitaire }))
    };
    const appel = s.id ? this.http.put<Devis>(`${this.api}/${s.id}`, corps) : this.http.post<Devis>(this.api, corps);
    appel.subscribe({
      next: d => {
        this.message = `Devis ${d.numero} enregistré.`;
        this.saisie = null;
        this.enregistrement = false;
        this.charger();
      },
      error: e => { this.erreur = e?.error?.message || 'Enregistrement impossible.'; this.enregistrement = false; }
    });
  }

  // ------------------------------------------------------------------ actions

  ouvrirTransformation(d: Devis): void {
    this.saisie = null;
    this.message = '';
    this.erreur = '';
    const dans30 = new Date();
    dans30.setDate(dans30.getDate() + 30);
    this.transformation = { devis: d, comptant: false, modePaiement: 'ESPECES', referencePaiement: '', dateEcheance: this.iso(dans30), montantVerse: 0 };
  }

  transformer(): void {
    const t = this.transformation;
    if (!t) return;
    this.enregistrement = true;
    this.erreur = '';
    this.http.post<any>(`${this.api}/${t.devis.id}/transformer`, {
      comptant: t.comptant, modePaiement: t.modePaiement, referencePaiement: t.referencePaiement,
      dateEcheance: t.dateEcheance, montantVerse: t.montantVerse
    }).subscribe({
      next: r => {
        this.message = `Le devis ${r.numero} est devenu la vente ${r.numeroVente || ''} (${this.prix(r.montantVente)})`
          + (t.comptant ? '.' : ', à crédit au nom du client.');
        this.transformation = null;
        this.enregistrement = false;
        this.charger();
      },
      error: e => { this.erreur = e?.error?.message || 'Transformation impossible.'; this.enregistrement = false; }
    });
  }

  refuser(d: Devis): void {
    if (!confirm(`Marquer le devis ${d.numero} comme refusé par le client ?`)) return;
    this.http.post(`${this.api}/${d.id}/refuser`, {}).subscribe({
      next: () => { this.message = `Devis ${d.numero} marqué refusé.`; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Action impossible.')
    });
  }

  prolonger(d: Devis): void {
    const saisi = prompt('Prolonger de combien de jours ?', '30');
    if (!saisi) return;
    const jours = parseInt(saisi, 10);
    if (!jours || jours < 1) return;
    this.http.post(`${this.api}/${d.id}/prolonger`, { jours }).subscribe({
      next: () => { this.message = `Devis ${d.numero} prolongé de ${jours} jours.`; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Action impossible.')
    });
  }

  supprimer(d: Devis): void {
    if (!confirm(`Supprimer le devis ${d.numero} ?`)) return;
    this.http.delete(`${this.api}/${d.id}`).subscribe({
      next: () => { this.message = `Devis ${d.numero} supprimé.`; this.charger(); },
      error: e => (this.erreur = e?.error?.message || 'Suppression impossible.')
    });
  }

  // ------------------------------------------------------------------ impression

  imprimer(d: Devis): void {
    const b = this.boutiqueService.getInfo();
    const e = (t: string | null | undefined) => (t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
    const lignes = d.lignes.map(l => `<tr><td>${e(l.designation)}</td><td class="n">${l.quantite}</td>`
      + `<td class="n">${this.prix(l.prixUnitaire)}</td><td class="n">${this.prix(l.sousTotal || 0)}</td></tr>`).join('');
    const rempli = (v?: string) => !!v && !/x{3,}/i.test(v);
    const mentions = [rempli(b.numeroRc) ? `RC : ${e(b.numeroRc)}` : '', rempli(b.numeroIfu) ? `NIF/IFU : ${e(b.numeroIfu)}` : ''].filter(Boolean).join(' · ');
    const fenetre = window.open('', '_blank');
    if (!fenetre) { this.erreur = 'Le navigateur a bloqué la fenêtre d\'impression.'; return; }
    fenetre.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Devis ${e(d.numero)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 11pt; }
  .entete { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
  .boutique h1 { margin: 0; font-size: 18pt; color: #1a56db; }
  .boutique p, .client p { margin: 2px 0; }
  .titre { text-align: right; }
  .titre h2 { margin: 0; font-size: 16pt; }
  .titre p { margin: 2px 0; }
  .blocs { display: flex; justify-content: space-between; gap: 20px; margin: 16px 0; }
  .client { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; min-width: 45%; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #eef4ff; text-align: left; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; }
  .n { text-align: right; white-space: nowrap; }
  .totaux { margin-left: auto; width: 45%; margin-top: 8px; }
  .totaux td { border: none; padding: 3px 8px; }
  .totaux .grand td { font-size: 13pt; font-weight: bold; border-top: 2px solid #111; }
  .lettres { margin: 12px 0; font-style: italic; }
  .conditions { margin-top: 12px; font-size: 10pt; }
  .signature { margin-top: 30px; display: flex; justify-content: flex-end; }
  .signature div { width: 45%; height: 90px; border: 1px dashed #999; border-radius: 6px; padding: 6px 10px; font-size: 10pt; color: #555; }
</style></head><body>
<div class="entete">
  <div class="boutique"><h1>${e(b.nom)}</h1><p>${e(b.adresse)}${b.ville ? ', ' + e(b.ville) : ''}</p>
  <p>${b.telephone ? 'Tél : ' + e(b.telephone) : ''}${b.email ? ' · ' + e(b.email) : ''}</p><p>${mentions}</p></div>
  <div class="titre"><h2>DEVIS (FACTURE PRO FORMA)</h2><p><strong>N° ${e(d.numero)}</strong></p>
  <p>Date : ${this.date(d.dateCreation)}</p><p>Valable jusqu'au : <strong>${this.date(d.dateValidite)}</strong></p></div>
</div>
<div class="blocs">
  <div>${d.objet ? '<p><strong>Objet :</strong> ' + e(d.objet) + '</p>' : ''}</div>
  <div class="client"><p><strong>Client :</strong> ${e(d.clientNom)}</p>
  ${d.clientAdresse ? '<p>' + e(d.clientAdresse) + '</p>' : ''}${d.clientTelephone ? '<p>Tél : ' + e(d.clientTelephone) + '</p>' : ''}</div>
</div>
<table><thead><tr><th>Désignation</th><th class="n">Quantité</th><th class="n">Prix unitaire</th><th class="n">Montant</th></tr></thead>
<tbody>${lignes}</tbody></table>
<table class="totaux">
  ${d.remise > 0 ? `<tr><td>Sous-total</td><td class="n">${this.prix(d.sousTotal)}</td></tr><tr><td>Remise</td><td class="n">− ${this.prix(d.remise)}</td></tr>` : ''}
  <tr class="grand"><td>TOTAL</td><td class="n">${this.prix(d.montantTotal)}</td></tr>
</table>
<p class="lettres">Arrêté le présent devis à la somme de : <strong>${e(this.enLettres(d.montantTotal))} francs CFA</strong>.</p>
${d.conditions ? '<p class="conditions"><strong>Conditions :</strong> ' + e(d.conditions) + '</p>' : ''}
<div class="signature"><div>Cachet et signature</div></div>
<script>window.onload = function () { setTimeout(function () { window.print(); }, 300); };<\/script>
</body></html>`);
    fenetre.document.close();
  }

  // ------------------------------------------------------------------ outils

  prix(v: number): string {
    return Math.round(v || 0).toLocaleString('fr-FR') + ' F';
  }

  date(iso: string): string {
    const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private enLettres(v: number): string {
    try { return nombreEnLettres(Math.round(v || 0)); } catch { return String(Math.round(v || 0)); }
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
