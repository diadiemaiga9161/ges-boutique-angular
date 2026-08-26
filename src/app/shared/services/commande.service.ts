import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { BoutiqueService } from './boutique.service';
import { FactureService } from './facture.service';
import { formaterMessageWhatsApp } from '../utils/whatsapp.util';

export enum StatutCommande {
  BROUILLON = 'BROUILLON',
  VALIDEE = 'VALIDEE',
  ANNULEE = 'ANNULEE'
}

export interface LigneCommande {
  id?: number;
  produitId?: number;
  produitNom?: string;
  produit?: { id: number; nom: string; prixVente: number; prixAchat: number };
  quantite: number;
  prixUnitaire: number;
  prixAchat?: number;
  sousTotal?: number;
}

export interface Commande {
  id: number;
  numeroCommande: string;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  client?: { id: number; nom: string; prenom: string; numeroTelephone: string };
  lignes: LigneCommande[];
  montantTotal: number;
  modePaiement: string;
  referencePaiement?: string;
  estCredit: boolean;
  montantVerse: number;
  montantRestant: number;
  dateEcheance?: string;
  statut: StatutCommande;
  dateCommande: string;
  dateValidation?: string;
  venteId?: number;
  notes?: string;
  vendeur?: { id: number; nomComplet: string };
}

export interface CommandeRequest {
  vendeurId: number;
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  lignes: { produitId: number; quantite: number; prixUnitaire: number }[];
  modePaiement: string;
  referencePaiement?: string;
  estCredit?: boolean;
  montantVerse?: number;
  dateEcheance?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private readonly apiUrl = `${environment.apiUrl}/commandes`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private boutiqueService: BoutiqueService,
    private factureService: FactureService
  ) {}

  private get headers() {
    return { headers: this.auth.getAuthHeaders() };
  }

  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl, this.headers);
  }

  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`, this.headers);
  }

  creer(request: CommandeRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request, this.headers);
  }

  modifier(id: number, request: CommandeRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, this.headers);
  }

  valider(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/valider`, {}, this.headers);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.headers);
  }

  payerCredit(id: number, montant: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/payer-credit`, { montant }, this.headers);
  }

  payerCreditsGroupes(ids: number[], montantTotal: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payer-credits-groupes`, { ids, montantTotal }, this.headers);
  }

  annuler(id: number, utilisateurId?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/annuler`, { utilisateurId }, this.headers);
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v || 0) + ' FCFA';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ─── Facture BON DE COMMANDE ──────────────────────────────────────────────

  imprimerFactureCommande(commande: Commande): void {
    const boutique = this.boutiqueService.getInfo();
    const clientNom = [commande.clientNom, commande.clientPrenom].filter(Boolean).join(' ') || commande.client?.nom || 'N/A';
    const statut = commande.statut === StatutCommande.VALIDEE ? 'VALIDÉE' : 'BROUILLON';

    const lignes = commande.lignes.map((l, i) => [
      String(i + 1),
      l.produit?.nom || l.produitNom || 'Produit',
      String(l.quantite),
      this.formatMontant(l.prixUnitaire),
      this.formatMontant(l.sousTotal ?? l.prixUnitaire * l.quantite)
    ]);

    const totaux: { label: string; valeur: string }[] = [
      { label: 'TOTAL', valeur: this.formatMontant(commande.montantTotal) }
    ];
    if (commande.estCredit) {
      totaux.push({ label: 'Versé', valeur: this.formatMontant(commande.montantVerse) });
      totaux.push({ label: 'Reste dû', valeur: this.formatMontant(commande.montantRestant) });
      if (commande.dateEcheance) {
        totaux.push({ label: 'Échéance', valeur: commande.dateEcheance });
      }
    }

    const lignesDetailWa = commande.lignes.map(l =>
      `${l.produit?.nom || l.produitNom || 'Produit'} ×${l.quantite} — ${this.formatMontant(l.sousTotal ?? l.prixUnitaire * l.quantite)}`
    );
    const telephone = commande.clientTelephone || commande.client?.numeroTelephone;

    this.factureService.ouvrirDocumentPDF({
      titre: 'BON DE COMMANDE',
      sousTitre: `${boutique?.nom || ''} · N° ${commande.numeroCommande} · Client : ${clientNom} · ${statut} · Date : ${this.formatDate(commande.dateCommande)}`,
      colonnes: ['#', 'Produit', 'Qté', 'Prix unitaire', 'Sous-total'],
      lignes,
      totaux,
      pied: [
        (commande as any).chauffeur ? `Chauffeur : ${(commande as any).chauffeur}` : null,
        commande.notes || null
      ].filter(Boolean).join(' | ') || undefined,
      whatsapp: {
        telephone,
        message: formaterMessageWhatsApp({
          boutiqueNom: boutique?.nom || 'Ges Boutique',
          boutiqueTelephone: boutique?.telephone,
          titreDocument: `Bon de commande N°${commande.numeroCommande}`,
          personneLabel: 'Client',
          personneNom: clientNom,
          date: this.formatDate(commande.dateCommande),
          lignes: lignesDetailWa,
          totaux
        })
      }
    });
  }
}
