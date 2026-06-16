// src/app/shared/services/rapport.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ProductService, Produit } from './product.service';
import { VenteService, VenteMap } from './vente.service';
import { CaisseService, CreditInfo, SituationCredits } from './caisse.service';
import { environment } from '../../../environments/environment';

// =====================================================
// INTERFACES
// =====================================================

export interface RapportJournalier {
  date: string;
  chiffreAffaireTotal: number;
  montantRemisesTotal: number;
  nombreVentes: number;
  ventes: any[];
  produitsVendus: { [key: string]: number };
  chiffreAffaireParProduit: { [key: string]: number };
  dateRapport: string;
  produitsEnStockFaible?: number;
  valeurStockTotale?: number;
  topProduits?: Array<{
    nom: string;
    quantite: number;
    chiffreAffaire: number;
    categorie?: string;
  }>;
  modePaiementStats?: Array<{
    mode: string;
    montant: number;
    nombreVentes: number;
    pourcentage?: number;
  }>;
  statistiquesCategories?: Array<{
    nom: string;
    nombreProduits: number;
    chiffreAffaire: number;
    nombreProduitsVendus?: number;
  }>;
  credits?: {
    nouveauxCredits: number;
    montantNouveauxCredits: number;
    reglementsCredits: number;
    montantReglementsCredits: number;
    creditsEnCours: number;
    montantCreditsEnCours: number;
  };
  gains?: {
    totalRevenus: number;
    beneficeBrut: number;
    margeBrute: number;
    detailsRevenus: {
      ventesComptant: number;
      reglementsCredit: number;
      autresEntrees: number;
    };
  };
  pertes?: {
    totalPertes: number;
    detailsPertes: {
      annulations: number;
      sortiesCaisse: number;
      ecartsNegatifs: number;
    };
  };
  bilanNet?: number;
}

export interface RapportHebdomadaire {
  debutSemaine: string;
  finSemaine: string;
  chiffreAffaireTotal: number;
  montantRemisesTotal: number;
  nombreVentes: number;
  moyenneJournaliere: number;
  ventesParJour: number;
  chiffreAffaireParJour: { [key: string]: number };
  topProduits?: Array<{
    nom: string;
    quantite: number;
    categorie?: string;
    chiffreAffaire?: number;
  }>;
  modePaiementStats?: Array<{
    mode: string;
    montant: number;
    nombreVentes: number;
    pourcentage?: number;
  }>;
  statistiquesCategories?: Array<{
    nom: string;
    nombreProduitsVendus: number;
    chiffreAffaire: number;
  }>;
  credits?: {
    totalCredits: number;
    montantTotalCredits: number;
    creditsEnRetard: number;
    montantCreditsEnRetard: number;
  };
  gains?: {
    totalRevenus: number;
    beneficeBrut: number;
    margeBrute: number;
  };
  pertes?: {
    totalPertes: number;
  };
  bilanNet?: number;
  evolution?: {
    parRapportPeriodePrecedente: number;
    tendance: 'hausse' | 'baisse' | 'stable';
  };
}

export interface RapportMensuel {
  mois: string;
  annee: number;
  debutMois: string;
  finMois: string;
  chiffreAffaireTotal: number;
  montantRemisesTotal: number;
  nombreVentes: number;
  moyenneJournaliere: number;
  ventesParJour: number;
  topProduits: { [key: string]: number };
  produitsEnStockFaible?: number;
  valeurStockTotale?: number;
  modePaiementStats?: Array<{
    mode: string;
    montant: number;
    nombreVentes: number;
    pourcentage?: number;
  }>;
  statistiquesCategories?: Array<{
    nom: string;
    nombreProduitsVendus: number;
    chiffreAffaire: number;
  }>;
  credits?: {
    totalCredits: number;
    montantTotalCredits: number;
    creditsRegles: number;
    montantCreditsRegles: number;
    creditsEnRetard: number;
    montantCreditsEnRetard: number;
  };
  gains?: {
    totalRevenus: number;
    beneficeBrut: number;
    margeBrute: number;
  };
  pertes?: {
    totalPertes: number;
  };
  bilanNet?: number;
  evolution?: {
    parRapportMoisPrecedent: number;
    tendance: 'hausse' | 'baisse' | 'stable';
  };
}

export interface StatistiquesGenerales {
  chiffreAffaire: {
    journalier: number;
    hebdomadaire: number;
    mensuel: number;
    totalVentes: number;
    panierMoyen: number;
    totalRemises: number;
    chiffreAffaireParModePaiement: { [key: string]: number };
    nombreVentesParModePaiement: { [key: string]: number };
  };
  inventaire: {
    valeurTotale: number;
    produitsStockFaible: number;
    produitsRupture: number;
    totalProduits: number;
    totalCategories: number;
    pourcentageStockFaible: number;
    pourcentageRupture: number;
  };
  vendeurs: Array<{
    id: number;
    nomComplet: string;
    email: string;
    telephone: string;
    nombreVentes: number;
    chiffreAffaire: number;
  }>;
  produitsPlusVendus: Array<{
    id: number;
    nom: string;
    categorie: string;
    quantiteVendue: number;
    chiffreAffaire: number;
    prixVente: number;
  }>;
  categoriesStats: Array<{
    nom: string;
    nombreProduits: number;
    chiffreAffaire: number;
    pourcentage: number;
    nombreProduitsVendus?: number;
  }>;
  modePaiementStats: Array<{
    mode: string;
    montant: number;
    nombreVentes: number;
    pourcentage: number;
  }>;
  categoriesLesPlusUtilisees: Array<{
    nom: string;
    nombreProduits: number;
    pourcentage: number;
  }>;
  credits: {
    totalCredits: number;
    montantTotalCredits: number;
    creditsRegles: number;
    montantCreditsRegles: number;
    creditsEnCours: number;
    montantCreditsEnCours: number;
    creditsEnRetard: number;
    montantCreditsEnRetard: number;
    details?: CreditInfo[];
  };
  gainsPertes?: {
    totalRevenus: number;
    totalPertes: number;
    bilanNet: number;
    tauxMarge: number;
    evolutionParRapportMoisPrecedent: number;
    tendance: 'hausse' | 'baisse' | 'stable';
  };
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService,
    private venteService: VenteService,
    private caisseService: CaisseService
  ) { }

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let errorMessage = `Impossible de ${context}`;
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    } else if (error.status === 401) {
      errorMessage = 'Session expirée';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.status === 404) {
      errorMessage = 'Données non trouvées';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur';
    }
    return throwError(() => new Error(errorMessage));
  }

  // ============= MÉTHODES DE CALCUL =============

  private calculerTopProduits(ventes: VenteMap[], produits: Produit[]): Array<{nom: string, quantite: number, chiffreAffaire: number, categorie?: string}> {
    const map = new Map<string, {quantite: number, chiffreAffaire: number, categorie?: string}>();

    for (const vente of ventes) {
      if (vente.produits) {
        for (const p of vente.produits) {
          const produitId = p.produitId;
          const quantite = p.quantite || 0;
          const prix = p.prixApresRemise || p.prixUnitaire || 0;
          const produit = produits.find(prod => prod.id === produitId);
          const nom = p.produitNom || produit?.nom || 'Produit';
          const categorie = produit?.categorie?.nom;

          if (map.has(nom)) {
            const existing = map.get(nom)!;
            existing.quantite += quantite;
            existing.chiffreAffaire += quantite * prix;
          } else {
            map.set(nom, { quantite, chiffreAffaire: quantite * prix, categorie });
          }
        }
      }
    }

    return Array.from(map.entries())
      .map(([nom, data]) => ({ nom, quantite: data.quantite, chiffreAffaire: data.chiffreAffaire, categorie: data.categorie }))
      .sort((a, b) => b.quantite - a.quantite);
  }

  private calculerModePaiementStats(ventes: VenteMap[]): Array<{mode: string, montant: number, nombreVentes: number, pourcentage: number}> {
    const map = new Map<string, {montant: number, nombreVentes: number}>();
    let totalMontant = 0;

    for (const vente of ventes) {
      const mode = vente.modePaiement;
      const montant = vente.montantTotal || 0;
      totalMontant += montant;

      if (map.has(mode)) {
        const existing = map.get(mode)!;
        existing.montant += montant;
        existing.nombreVentes++;
      } else {
        map.set(mode, { montant, nombreVentes: 1 });
      }
    }

    return Array.from(map.entries())
      .map(([mode, data]) => ({
        mode,
        montant: data.montant,
        nombreVentes: data.nombreVentes,
        pourcentage: totalMontant > 0 ? (data.montant / totalMontant) * 100 : 0
      }))
      .sort((a, b) => b.montant - a.montant);
  }

  private calculerStatsCategories(ventes: VenteMap[], produits: Produit[], categories: any[]): Array<{nom: string, nombreProduits: number, chiffreAffaire: number, nombreProduitsVendus: number}> {
    const map = new Map<string, {nombreProduits: number, chiffreAffaire: number, nombreProduitsVendus: number}>();

    for (const categorie of categories) {
      map.set(categorie.nom, { nombreProduits: 0, chiffreAffaire: 0, nombreProduitsVendus: 0 });
    }
    map.set('Non catégorisé', { nombreProduits: 0, chiffreAffaire: 0, nombreProduitsVendus: 0 });

    for (const produit of produits) {
      const catNom = produit.categorie?.nom || 'Non catégorisé';
      if (map.has(catNom)) {
        const existing = map.get(catNom)!;
        existing.nombreProduits++;
      }
    }

    for (const vente of ventes) {
      if (vente.produits) {
        for (const p of vente.produits) {
          const produitId = p.produitId;
          const quantite = p.quantite || 0;
          const prix = p.prixApresRemise || p.prixUnitaire || 0;
          const produit = produits.find(prod => prod.id === produitId);
          const catNom = produit?.categorie?.nom || 'Non catégorisé';

          if (map.has(catNom)) {
            const existing = map.get(catNom)!;
            existing.chiffreAffaire += quantite * prix;
            existing.nombreProduitsVendus += quantite;
          }
        }
      }
    }

    return Array.from(map.entries())
      .map(([nom, data]) => ({
        nom,
        nombreProduits: data.nombreProduits,
        chiffreAffaire: data.chiffreAffaire,
        nombreProduitsVendus: data.nombreProduitsVendus
      }))
      .filter(c => c.chiffreAffaire > 0)
      .sort((a, b) => b.chiffreAffaire - a.chiffreAffaire);
  }

  private calculerStatsParVendeur(ventes: VenteMap[]): Array<{id: number, nomComplet: string, email: string, telephone: string, nombreVentes: number, chiffreAffaire: number}> {
    const map = new Map<number, {nomComplet: string, email: string, telephone: string, nombreVentes: number, chiffreAffaire: number}>();

    for (const vente of ventes) {
      const vendeurId = vente.vendeurId;
      if (map.has(vendeurId)) {
        const existing = map.get(vendeurId)!;
        existing.nombreVentes++;
        existing.chiffreAffaire += vente.montantTotal || 0;
      } else {
        map.set(vendeurId, {
          nomComplet: vente.vendeurNom || `Vendeur ${vendeurId}`,
          email: '',
          telephone: '',
          nombreVentes: 1,
          chiffreAffaire: vente.montantTotal || 0
        });
      }
    }

    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.chiffreAffaire - a.chiffreAffaire);
  }

  private calculerCategoriesLesPlusUtilisees(produits: Produit[], categories: any[]): Array<{nom: string, nombreProduits: number, pourcentage: number}> {
    const map = new Map<string, number>();
    const totalProduits = produits.length;

    for (const produit of produits) {
      const catNom = produit.categorie?.nom || 'Non catégorisé';
      map.set(catNom, (map.get(catNom) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([nom, nombreProduits]) => ({
        nom,
        nombreProduits,
        pourcentage: totalProduits > 0 ? (nombreProduits / totalProduits) * 100 : 0
      }))
      .sort((a, b) => b.nombreProduits - a.nombreProduits);
  }

  private calculerChiffreParJour(ventes: VenteMap[]): { [key: string]: number } {
    const result: { [key: string]: number } = {};
    for (const vente of ventes) {
      const date = vente.dateVente.split('T')[0];
      result[date] = (result[date] || 0) + (vente.montantTotal || 0);
    }
    return result;
  }

  private calculerBeneficeBrut(ventes: VenteMap[], produits: Produit[]): number {
    let benefice = 0;
    for (const vente of ventes) {
      if (vente.beneficeTotal) {
        benefice += vente.beneficeTotal;
      } else if (vente.produits) {
        for (const p of vente.produits) {
          const produitId = p.produitId;
          const quantite = p.quantite || 0;
          const prixVente = p.prixApresRemise || p.prixUnitaire || 0;
          const produit = produits.find(prod => prod.id === produitId);
          const prixAchat = produit?.prixAchat || p.prixAchat || 0;
          benefice += (prixVente - prixAchat) * quantite;
        }
      }
    }
    return benefice;
  }

  // ============= MÉTHODES DE RAPPORT =============

  genererRapportJournalier(date: string): Observable<RapportJournalier> {
    return forkJoin({
      ventesJour: this.venteService.getVentesParPeriode(date, date),
      produits: this.productService.getProducts(),
      categories: this.productService.getAllCategories(),
      situationCredits: this.caisseService.getSituationCredits().pipe(catchError(() => of(null))),
      revenusPertes: this.caisseService.getRevenusEtPertesParPeriode(date, date).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ ventesJour, produits, categories, situationCredits, revenusPertes }) => {
        const totalChiffreAffaire = ventesJour.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
        const totalRemises = ventesJour.reduce((sum, v) => sum + (v.montantRemiseTotal || 0), 0);
        const nombreVentes = ventesJour.length;

        const produitsStockFaible = produits.filter(p => p.quantite <= p.seuilAlerte).length;
        let valeurStockTotale = 0;
        for (const produit of produits) {
          valeurStockTotale += (produit.prixAchat || 0) * produit.quantite;
        }

        const topProduits = this.calculerTopProduits(ventesJour, produits);
        const modePaiementStats = this.calculerModePaiementStats(ventesJour);
        const statistiquesCategories = this.calculerStatsCategories(ventesJour, produits, categories);

        let gains = undefined;
        let pertes = undefined;
        let bilanNet = 0;

        if (revenusPertes) {
          gains = {
            totalRevenus: revenusPertes.totalRevenus || 0,
            beneficeBrut: this.calculerBeneficeBrut(ventesJour, produits),
            margeBrute: revenusPertes.totalRevenus > 0 ? (this.calculerBeneficeBrut(ventesJour, produits) / revenusPertes.totalRevenus) * 100 : 0,
            detailsRevenus: revenusPertes.detailsRevenus || { ventesComptant: 0, reglementsCredit: 0, autresEntrees: 0 }
          };
          pertes = {
            totalPertes: revenusPertes.totalPertes || 0,
            detailsPertes: revenusPertes.detailsPertes || { annulations: 0, sortiesCaisse: 0, ecartsNegatifs: 0 }
          };
          bilanNet = (revenusPertes.totalRevenus || 0) - (revenusPertes.totalPertes || 0);
        }

        return {
          date: date,
          chiffreAffaireTotal: totalChiffreAffaire,
          montantRemisesTotal: totalRemises,
          nombreVentes: nombreVentes,
          ventes: ventesJour,
          produitsVendus: {},
          chiffreAffaireParProduit: {},
          dateRapport: new Date().toISOString(),
          produitsEnStockFaible: produitsStockFaible,
          valeurStockTotale: valeurStockTotale,
          topProduits: topProduits.slice(0, 10),
          modePaiementStats: modePaiementStats,
          statistiquesCategories: statistiquesCategories,
          credits: {
            nouveauxCredits: 0,
            montantNouveauxCredits: 0,
            reglementsCredits: 0,
            montantReglementsCredits: 0,
            creditsEnCours: situationCredits?.nombreCreditsNonRegles || 0,
            montantCreditsEnCours: situationCredits?.montantTotalCredits || 0
          },
          gains: gains,
          pertes: pertes,
          bilanNet: bilanNet
        };
      }),
      catchError((error) => this.handleError(error, 'générer le rapport journalier'))
    );
  }

  genererRapportHebdomadaire(): Observable<RapportHebdomadaire> {
    const aujourdhui = new Date();
    const debutSemaine = this.getDateDebutSemaine();
    const finSemaine = this.getDateFinSemaine();

    return forkJoin({
      ventes: this.venteService.getVentesParPeriode(debutSemaine, finSemaine),
      produits: this.productService.getProducts(),
      categories: this.productService.getAllCategories(),
      situationCredits: this.caisseService.getSituationCredits().pipe(catchError(() => of(null))),
      creditsEnRetard: this.caisseService.getCreditsEnRetard().pipe(catchError(() => of([]))),
      revenusPertes: this.caisseService.getRevenusEtPertesParPeriode(debutSemaine, finSemaine).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ ventes, produits, categories, situationCredits, creditsEnRetard, revenusPertes }) => {
        const totalChiffreAffaire = ventes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
        const totalRemises = ventes.reduce((sum, v) => sum + (v.montantRemiseTotal || 0), 0);
        const nombreVentes = ventes.length;
        const moyenneJournaliere = totalChiffreAffaire / 7;

        const topProduits = this.calculerTopProduits(ventes, produits).map(p => ({
          nom: p.nom,
          quantite: p.quantite,
          categorie: p.categorie,
          chiffreAffaire: p.chiffreAffaire
        }));
        
        const modePaiementStats = this.calculerModePaiementStats(ventes);
        
        const categoriesStatsRaw = this.calculerStatsCategories(ventes, produits, categories);
        const statistiquesCategories = categoriesStatsRaw.map(c => ({
          nom: c.nom,
          nombreProduitsVendus: c.nombreProduitsVendus,
          chiffreAffaire: c.chiffreAffaire
        }));

        let montantCreditsEnRetard = 0;
        for (const credit of creditsEnRetard) {
          montantCreditsEnRetard += credit.montantRestant || credit.montantTotal || 0;
        }

        let gains = undefined;
        let pertes = undefined;
        let bilanNet = 0;

        if (revenusPertes) {
          gains = {
            totalRevenus: revenusPertes.totalRevenus || 0,
            beneficeBrut: this.calculerBeneficeBrut(ventes, produits),
            margeBrute: revenusPertes.totalRevenus > 0 ? (this.calculerBeneficeBrut(ventes, produits) / revenusPertes.totalRevenus) * 100 : 0
          };
          pertes = {
            totalPertes: revenusPertes.totalPertes || 0
          };
          bilanNet = (revenusPertes.totalRevenus || 0) - (revenusPertes.totalPertes || 0);
        }

        return {
          debutSemaine: debutSemaine,
          finSemaine: finSemaine,
          chiffreAffaireTotal: totalChiffreAffaire,
          montantRemisesTotal: totalRemises,
          nombreVentes: nombreVentes,
          moyenneJournaliere: moyenneJournaliere,
          ventesParJour: nombreVentes / 7,
          chiffreAffaireParJour: this.calculerChiffreParJour(ventes),
          topProduits: topProduits.slice(0, 10),
          modePaiementStats: modePaiementStats,
          statistiquesCategories: statistiquesCategories,
          credits: {
            totalCredits: situationCredits?.nombreCreditsNonRegles || 0,
            montantTotalCredits: situationCredits?.montantTotalCredits || 0,
            creditsEnRetard: creditsEnRetard.length,
            montantCreditsEnRetard: montantCreditsEnRetard
          },
          gains: gains,
          pertes: pertes,
          bilanNet: bilanNet
        };
      }),
      catchError((error) => this.handleError(error, 'générer le rapport hebdomadaire'))
    );
  }

  genererRapportMensuel(): Observable<RapportMensuel> {
    const aujourdhui = new Date();
    const debutMois = this.formaterDate(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1));
    const finMois = this.formaterDate(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0));

    return forkJoin({
      ventes: this.venteService.getVentesParPeriode(debutMois, finMois),
      produits: this.productService.getProducts(),
      categories: this.productService.getAllCategories(),
      situationCredits: this.caisseService.getSituationCredits().pipe(catchError(() => of(null))),
      creditsEnRetard: this.caisseService.getCreditsEnRetard().pipe(catchError(() => of([]))),
      revenusPertes: this.caisseService.getRevenusEtPertesParPeriode(debutMois, finMois).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ ventes, produits, categories, situationCredits, creditsEnRetard, revenusPertes }) => {
        const totalChiffreAffaire = ventes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
        const totalRemises = ventes.reduce((sum, v) => sum + (v.montantRemiseTotal || 0), 0);
        const nombreVentes = ventes.length;
        const joursDansMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0).getDate();
        const moyenneJournaliere = totalChiffreAffaire / joursDansMois;

        const produitsStockFaible = produits.filter(p => p.quantite <= p.seuilAlerte).length;
        let valeurStockTotale = 0;
        for (const produit of produits) {
          valeurStockTotale += (produit.prixAchat || 0) * produit.quantite;
        }

        const topProduitsMap: { [key: string]: number } = {};
        for (const vente of ventes) {
          if (vente.produits) {
            for (const p of vente.produits) {
              const nom = p.produitNom || 'Produit';
              topProduitsMap[nom] = (topProduitsMap[nom] || 0) + (p.quantite || 0);
            }
          }
        }

        const modePaiementStats = this.calculerModePaiementStats(ventes);
        
        const categoriesStatsRaw = this.calculerStatsCategories(ventes, produits, categories);
        const statistiquesCategories = categoriesStatsRaw.map(c => ({
          nom: c.nom,
          nombreProduitsVendus: c.nombreProduitsVendus,
          chiffreAffaire: c.chiffreAffaire
        }));

        let montantCreditsEnRetard = 0;
        for (const credit of creditsEnRetard) {
          montantCreditsEnRetard += credit.montantRestant || credit.montantTotal || 0;
        }

        let gains = undefined;
        let pertes = undefined;
        let bilanNet = 0;

        if (revenusPertes) {
          gains = {
            totalRevenus: revenusPertes.totalRevenus || 0,
            beneficeBrut: this.calculerBeneficeBrut(ventes, produits),
            margeBrute: revenusPertes.totalRevenus > 0 ? (this.calculerBeneficeBrut(ventes, produits) / revenusPertes.totalRevenus) * 100 : 0
          };
          pertes = {
            totalPertes: revenusPertes.totalPertes || 0
          };
          bilanNet = (revenusPertes.totalRevenus || 0) - (revenusPertes.totalPertes || 0);
        }

        return {
          mois: this.getNomMois(aujourdhui.getMonth()),
          annee: aujourdhui.getFullYear(),
          debutMois: debutMois,
          finMois: finMois,
          chiffreAffaireTotal: totalChiffreAffaire,
          montantRemisesTotal: totalRemises,
          nombreVentes: nombreVentes,
          moyenneJournaliere: moyenneJournaliere,
          ventesParJour: nombreVentes / joursDansMois,
          topProduits: topProduitsMap,
          produitsEnStockFaible: produitsStockFaible,
          valeurStockTotale: valeurStockTotale,
          modePaiementStats: modePaiementStats,
          statistiquesCategories: statistiquesCategories,
          credits: {
            totalCredits: situationCredits?.nombreCreditsNonRegles || 0,
            montantTotalCredits: situationCredits?.montantTotalCredits || 0,
            creditsRegles: 0,
            montantCreditsRegles: 0,
            creditsEnRetard: creditsEnRetard.length,
            montantCreditsEnRetard: montantCreditsEnRetard
          },
          gains: gains,
          pertes: pertes,
          bilanNet: bilanNet
        };
      }),
      catchError((error) => this.handleError(error, 'générer le rapport mensuel'))
    );
  }

  genererRapportPeriodique(dateDebut: string, dateFin: string): Observable<any> {
    return forkJoin({
      ventes: this.venteService.getVentesParPeriode(dateDebut, dateFin),
      produits: this.productService.getProducts(),
      categories: this.productService.getAllCategories(),
      situationCredits: this.caisseService.getSituationCredits().pipe(catchError(() => of(null))),
      creditsEnRetard: this.caisseService.getCreditsEnRetard().pipe(catchError(() => of([]))),
      revenusPertes: this.caisseService.getRevenusEtPertesParPeriode(dateDebut, dateFin).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ ventes, produits, categories, situationCredits, creditsEnRetard, revenusPertes }) => {
        const totalChiffreAffaire = ventes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
        const totalRemises = ventes.reduce((sum, v) => sum + (v.montantRemiseTotal || 0), 0);
        const nombreVentes = ventes.length;
        const panierMoyen = nombreVentes > 0 ? totalChiffreAffaire / nombreVentes : 0;

        const produitsStockFaible = produits.filter(p => p.quantite <= p.seuilAlerte).length;
        let valeurStockTotale = 0;
        for (const produit of produits) {
          valeurStockTotale += (produit.prixAchat || 0) * produit.quantite;
        }

        const topProduits = this.calculerTopProduits(ventes, produits);
        const modePaiementStats = this.calculerModePaiementStats(ventes);
        const statistiquesCategories = this.calculerStatsCategories(ventes, produits, categories);

        let montantCreditsEnRetard = 0;
        for (const credit of creditsEnRetard) {
          montantCreditsEnRetard += credit.montantRestant || credit.montantTotal || 0;
        }

        let gains = undefined;
        let pertes = undefined;
        let bilanNet = 0;

        if (revenusPertes) {
          gains = {
            totalRevenus: revenusPertes.totalRevenus || 0,
            beneficeBrut: this.calculerBeneficeBrut(ventes, produits),
            margeBrute: revenusPertes.totalRevenus > 0 ? (this.calculerBeneficeBrut(ventes, produits) / revenusPertes.totalRevenus) * 100 : 0
          };
          pertes = {
            totalPertes: revenusPertes.totalPertes || 0
          };
          bilanNet = (revenusPertes.totalRevenus || 0) - (revenusPertes.totalPertes || 0);
        }

        return {
          periode: { dateDebut, dateFin },
          resume: {
            totalChiffreAffaire,
            totalRemises,
            nombreVentes,
            panierMoyen,
            produitsStockFaible,
            valeurStockTotale
          },
          topProduits: topProduits.slice(0, 10),
          modePaiementStats: modePaiementStats,
          statistiquesCategories: statistiquesCategories,
          credits: {
            totalCredits: situationCredits?.nombreCreditsNonRegles || 0,
            montantTotalCredits: situationCredits?.montantTotalCredits || 0,
            creditsEnRetard: creditsEnRetard.length,
            montantCreditsEnRetard: montantCreditsEnRetard
          },
          gains: gains,
          pertes: pertes,
          bilanNet: bilanNet
        };
      }),
      catchError((error) => this.handleError(error, 'générer le rapport périodique'))
    );
  }

  obtenirStatistiquesGenerales(): Observable<StatistiquesGenerales> {
    const aujourdhui = new Date();
    const debutMois = this.formaterDate(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1));
    const finMois = this.formaterDate(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0));

    return forkJoin({
      ventes: this.venteService.getAllVentes(),
      produits: this.productService.getProducts(),
      categories: this.productService.getAllCategories(),
      situationCredits: this.caisseService.getSituationCredits().pipe(catchError(() => of(null))),
      creditsEnRetard: this.caisseService.getCreditsEnRetard().pipe(catchError(() => of([]))),
      revenusPertes: this.caisseService.getRevenusEtPertesParPeriode(debutMois, finMois).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ ventes, produits, categories, situationCredits, creditsEnRetard, revenusPertes }) => {
        const totalChiffreAffaire = ventes.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
        const totalVentes = ventes.length;
        const panierMoyen = totalVentes > 0 ? totalChiffreAffaire / totalVentes : 0;
        const totalRemises = ventes.reduce((sum, v) => sum + (v.montantRemiseTotal || 0), 0);

        const rawProduitsPlusVendus = this.calculerTopProduits(ventes, produits);
        const produitsPlusVendus = rawProduitsPlusVendus.map((p, index) => ({
          id: index + 1,
          nom: p.nom,
          categorie: p.categorie || 'Non catégorisé',
          quantiteVendue: p.quantite,
          chiffreAffaire: p.chiffreAffaire,
          prixVente: 0
        }));

        const statsParVendeur = this.calculerStatsParVendeur(ventes);
        const modePaiementStats = this.calculerModePaiementStats(ventes);
        
        const categoriesStatsRaw = this.calculerStatsCategories(ventes, produits, categories);
        let totalChiffreAffaireCategories = 0;
        for (const cat of categoriesStatsRaw) {
          totalChiffreAffaireCategories += cat.chiffreAffaire;
        }
        const categoriesStats = categoriesStatsRaw.map(c => ({
          nom: c.nom,
          nombreProduits: c.nombreProduits,
          chiffreAffaire: c.chiffreAffaire,
          pourcentage: totalChiffreAffaireCategories > 0 ? (c.chiffreAffaire / totalChiffreAffaireCategories) * 100 : 0,
          nombreProduitsVendus: c.nombreProduitsVendus
        }));
        
        const categoriesLesPlusUtilisees = this.calculerCategoriesLesPlusUtilisees(produits, categories);

        let valeurStockTotale = 0;
        let produitsStockFaible = 0;
        let produitsRupture = 0;
        for (const produit of produits) {
          valeurStockTotale += (produit.prixAchat || 0) * produit.quantite;
          if (produit.quantite <= produit.seuilAlerte) produitsStockFaible++;
          if (produit.quantite === 0) produitsRupture++;
        }

        const chiffreAffaireParModePaiement: { [key: string]: number } = {};
        const nombreVentesParModePaiement: { [key: string]: number } = {};
        for (const vente of ventes) {
          const mode = vente.modePaiement;
          chiffreAffaireParModePaiement[mode] = (chiffreAffaireParModePaiement[mode] || 0) + (vente.montantTotal || 0);
          nombreVentesParModePaiement[mode] = (nombreVentesParModePaiement[mode] || 0) + 1;
        }

        let montantCreditsEnRetard = 0;
        for (const credit of creditsEnRetard) {
          montantCreditsEnRetard += credit.montantRestant || credit.montantTotal || 0;
        }

        let gainsPertes = undefined;
        if (revenusPertes) {
          const totalRevenus = revenusPertes.totalRevenus || 0;
          const totalPertesNumerique = revenusPertes.totalPertes || 0;
          const bilanNetCalcul = totalRevenus - totalPertesNumerique;
          gainsPertes = {
            totalRevenus: totalRevenus,
            totalPertes: totalPertesNumerique,
            bilanNet: bilanNetCalcul,
            tauxMarge: totalRevenus > 0 ? (bilanNetCalcul / totalRevenus) * 100 : 0,
            evolutionParRapportMoisPrecedent: 0,
            tendance: 'stable' as 'hausse' | 'baisse' | 'stable'
          };
        }

        return {
          chiffreAffaire: {
            journalier: 0,
            hebdomadaire: 0,
            mensuel: totalChiffreAffaire,
            totalVentes: totalVentes,
            panierMoyen: panierMoyen,
            totalRemises: totalRemises,
            chiffreAffaireParModePaiement: chiffreAffaireParModePaiement,
            nombreVentesParModePaiement: nombreVentesParModePaiement
          },
          inventaire: {
            valeurTotale: valeurStockTotale,
            produitsStockFaible: produitsStockFaible,
            produitsRupture: produitsRupture,
            totalProduits: produits.length,
            totalCategories: categories.length,
            pourcentageStockFaible: produits.length > 0 ? (produitsStockFaible / produits.length) * 100 : 0,
            pourcentageRupture: produits.length > 0 ? (produitsRupture / produits.length) * 100 : 0
          },
          vendeurs: statsParVendeur,
          produitsPlusVendus: produitsPlusVendus.slice(0, 10),
          categoriesStats: categoriesStats,
          modePaiementStats: modePaiementStats,
          categoriesLesPlusUtilisees: categoriesLesPlusUtilisees,
          credits: {
            totalCredits: situationCredits?.nombreCreditsNonRegles || 0,
            montantTotalCredits: situationCredits?.montantTotalCredits || 0,
            creditsRegles: 0,
            montantCreditsRegles: 0,
            creditsEnCours: situationCredits?.nombreCreditsNonRegles || 0,
            montantCreditsEnCours: situationCredits?.montantTotalCredits || 0,
            creditsEnRetard: creditsEnRetard.length,
            montantCreditsEnRetard: montantCreditsEnRetard,
            details: creditsEnRetard
          },
          gainsPertes: gainsPertes
        };
      }),
      catchError((error) => this.handleError(error, 'obtenir les statistiques générales'))
    );
  }

  // ============= EXPORT PDF =============

  exporterRapportPDF(rapport: any, type: string): void {
    if (!rapport) {
      console.error('Aucun rapport à exporter');
      return;
    }

    try {
      const html = this.genererHTMLRapport(rapport, type);
      const fenetre = window.open('', '_blank');
      if (!fenetre) {
        throw new Error('Impossible d\'ouvrir la fenêtre');
      }
      fenetre.document.write(html);
      fenetre.document.close();
      fenetre.onload = () => {
        setTimeout(() => {
          fenetre.focus();
          fenetre.print();
          fenetre.addEventListener('afterprint', () => fenetre.close());
        }, 500);
      };
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  }

  formatDateLong(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short'
      });
    } catch {
      return dateString;
    }
  }

  private genererHTMLRapport(rapport: any, type: string): string {
    const titre = this.getTitreRapport(rapport, type);
    const dateGeneration = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const styles = `
      <style>
        @media print {
          @page { margin: 15mm; size: A4 portrait; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; margin: 0; padding: 0; }
          .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .rapport-container { background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
        .shop-name { font-size: 20pt; font-weight: bold; color: #27ae60; }
        .rapport-title { font-size: 16pt; font-weight: bold; color: #2c3e50; margin: 10px 0; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14pt; font-weight: bold; background: #ecf0f1; padding: 8px 12px; margin-bottom: 15px; border-left: 4px solid #27ae60; }
        .stats-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; }
        .stat-card { flex: 1; min-width: 150px; background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; }
        .stat-card h3 { margin: 0; color: #27ae60; font-size: 18pt; }
        .stat-card p { margin: 5px 0 0; color: #6c757d; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background: #ecf0f1; font-weight: bold; }
        .text-right { text-align: right; }
        .text-success { color: #27ae60; font-weight: bold; }
        .text-danger { color: #e74c3c; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 8pt; color: #6c757d; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; }
        .badge-success { background: #27ae60; color: white; }
        .badge-info { background: #3498db; color: white; }
        .gain-card { background: #d4edda; border-color: #c3e6cb; }
        .perte-card { background: #f8d7da; border-color: #f5c6cb; }
        .print-btn { display: block; margin: 20px auto; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; }
      </style>
    `;

    // Construction simplifiée du HTML
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>${titre}</title>
        ${styles}
      </head>
      <body>
        <div class="rapport-container">
          <div class="header">
            <div class="shop-name">Boutique Alimentation Ndjim Et Frères</div>
            <div>📍 Misa bougou | 📞 76 96 21 20 / 66 43 66 03</div>
            <div class="rapport-title">${titre}</div>
            <div>Généré le : ${dateGeneration}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-card"><h3>${this.formaterPrixFCFA(rapport.chiffreAffaireTotal || 0)}</h3><p>Chiffre d'Affaires</p></div>
            <div class="stat-card"><h3>${rapport.nombreVentes || 0}</h3><p>Nombre de Ventes</p></div>
            <div class="stat-card"><h3>${this.formaterPrixFCFA(rapport.montantRemisesTotal || 0)}</h3><p>Total Remises</p></div>
            <div class="stat-card"><h3>${this.formaterPrixFCFA((rapport.chiffreAffaireTotal || 0) / (rapport.nombreVentes || 1))}</h3><p>Panier Moyen</p></div>
          </div>

          <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>© ${new Date().getFullYear()} - Boutique Alimentation Ndjim Et Frères</p>
          </div>

          <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / Télécharger PDF</button>
          <button class="no-print" style="margin-left:10px;padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer" onclick="window.close()">✕ Fermer</button>
          <script>window.addEventListener('afterprint',function(){window.close();});<\/script>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private getTitreRapport(rapport: any, type: string): string {
    if (type === 'journalier' && rapport.date) {
      return `Rapport Journalier - ${this.formatDateLong(rapport.date)}`;
    } else if (type === 'hebdomadaire' && rapport.debutSemaine) {
      return `Rapport Hebdomadaire - Du ${this.formatDateShort(rapport.debutSemaine)} au ${this.formatDateShort(rapport.finSemaine)}`;
    } else if (type === 'mensuel' && rapport.mois) {
      return `Rapport Mensuel - ${rapport.mois} ${rapport.annee}`;
    } else if (rapport.periode) {
      return `Rapport Périodique - Du ${this.formatDateShort(rapport.periode.dateDebut)} au ${this.formatDateShort(rapport.periode.dateFin)}`;
    }
    return 'Rapport';
  }

  // ============= MÉTHODES UTILITAIRES =============

  formaterDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formaterPrixFCFA(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant || 0);
  }

  getModePaiementLabel(mode: string): string {
    const labels: Record<string, string> = {
      'ESPECES': 'Espèces',
      'ORANGE_MONEY': 'Orange Money',
      'MOOV_MONEY': 'Moov Money',
      'CARTE_BANCAIRE': 'Carte Bancaire',
      'VIREMENT': 'Virement'
    };
    return labels[mode] || mode;
  }

  getNomMois(index: number): string {
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return mois[index] || '';
  }

  getDateDebutSemaine(): string {
    const date = new Date();
    const jour = date.getDay();
    const diff = date.getDate() - jour + (jour === 0 ? -6 : 1);
    date.setDate(diff);
    return this.formaterDate(date);
  }

  getDateFinSemaine(): string {
    const date = new Date(this.getDateDebutSemaine());
    date.setDate(date.getDate() + 6);
    return this.formaterDate(date);
  }
}