import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

type StatutFilter = 'EN_COURS' | 'EN_RETARD' | 'REGLES' | 'TOUS' | 'PAR_CLIENT';

interface ReglementGroupeClient {
  nom: string;
  telephone: string;
  nbCredits: number;
  nbAvecVerse: number;
  totalCredit: number;
  totalVerse: number;
  totalRestant: number;
  credits: any[];
}
import {
  CaisseService, CreditInfo, ReglementCreditRequest, ModePaiementCaisse, OperationCaisse
} from '../../../shared/services/caisse.service';
import { VenteService, LigneVenteDto, VenteMap } from '../../../shared/services/vente.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FactureService } from '../../../shared/services/facture.service';
import Swal from 'sweetalert2';

interface GroupeClient {
  nom: string;
  telephone: string;
  count: number;
  total: number;
}

@Component({
  selector: 'app-reglement-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reglement-credits.component.html',
  styleUrl: './reglement-credits.component.scss'
})
export class ReglementCreditsComponent implements OnInit {
  allCredits: CreditInfo[] = [];
  credits: CreditInfo[] = [];
  creditsFiltres: CreditInfo[] = [];
  isLoading = false;
  searchTerm = '';
  statutFilter: StatutFilter = 'EN_COURS';

  // Pagination
  creditsCurrentPage = 1;
  creditsItemsPerPage = 10;

  // Groupement par client (restant dû)
  creditsGroupesParClient: GroupeClient[] = [];
  // Règlements groupés par client (montant versé)
  reglementGroupesParClient: ReglementGroupeClient[] = [];
  // Clients dont les détails sont ouverts dans la vue PAR_CLIENT
  clientsExpanded = new Set<string>();

  // ── Filtres date et client ────────────────────────────────────
  dateDebut: string = '';
  dateFin: string = '';
  clientSelectionne: string = '';

  // ── Modal détails crédit ──────────────────────────────────────
  showDetailsCreditModal = false;
  selectedCredit: CreditInfo | null = null;
  detailsLignes: LigneVenteDto[] = [];
  detailsLignesLoading = false;
  versements: OperationCaisse[] = [];
  versementsLoading = false;

  // ── Versements dans le modal détail ──────────────────────────
  versementsSimples: OperationCaisse[] = [];
  paiementsGroupesDetail: Map<string, OperationCaisse[]> = new Map();
  rechercheVersement: string = '';

  // ── Modal crédits par client ──────────────────────────────────
  showCreditsClientModal = false;
  selectedClientCreditsNom = '';
  selectedClientCreditsList: CreditInfo[] = [];

  // ── Modal paiement groupé ─────────────────────────────────────
  showPaiementGroupeModal = false;
  montantPaiementGroupe = 0;
  modePaiementGroupe: ModePaiementCaisse = ModePaiementCaisse.ESPECES;
  referenceGroupePaiement = '';
  repartitionGroupe: { credit: CreditInfo; montantAPayer: number }[] = [];
  isLoadingPaiementGroupe = false;

  // ── Modal règlement individuel ────────────────────────────────
  showModal = false;
  reglementForm = {
    montantRegle: 0,
    modePaiement: ModePaiementCaisse.ESPECES,
    referencePaiement: ''
  };
  isLoadingReglement = false;

  Math = Math;
  ModePaiementCaisseEnum = ModePaiementCaisse;

  // ── Onglet paiements groupés ──────────────────────────────
  activeMainTab: 'credits' | 'groupes' = 'credits';
  paiementsGroupes: any[] = [];
  paiementsGroupesLoading = false;
  expandedGroupes = new Set<string>();
  // venteIds dont au moins un versement est groupé
  ventesAvecGroupeIds = new Set<number>();

  constructor(
    private caisseService: CaisseService,
    private venteService: VenteService,
    private authService: AuthService,
    private factureService: FactureService
  ) {}

  ngOnInit() {
    this.loadCredits();
    this.loadPaiementsGroupes();
  }

  loadPaiementsGroupes() {
    this.paiementsGroupesLoading = true;
    this.caisseService.getPaiementsGroupes().subscribe({
      next: (data) => {
        this.paiementsGroupes = data;
        // Alimenter le Set des ventes avec versements groupés
        this.ventesAvecGroupeIds = new Set<number>();
        for (const pg of data) {
          for (const v of (pg.ventesImpliquees || [])) {
            if (v.venteCreditId) this.ventesAvecGroupeIds.add(v.venteCreditId);
          }
        }
        this.paiementsGroupesLoading = false;
      },
      error: () => { this.paiementsGroupesLoading = false; }
    });
  }

  toggleGroupe(ref: string) {
    if (this.expandedGroupes.has(ref)) {
      this.expandedGroupes.delete(ref);
    } else {
      this.expandedGroupes.add(ref);
    }
  }

  loadCredits() {
    this.isLoading = true;
    forkJoin({
      nonRegles: this.caisseService.getCreditsNonRegles(),
      regles: this.caisseService.getCreditsRegles(),
      toutesVentes: this.venteService.getVentesCredit()
    }).subscribe({
      next: ({ nonRegles, regles, toutesVentes }) => {
        // Les ventes sont la SOURCE DE VÉRITÉ (identique à l'historique client)
        // Les données caisse enrichissent uniquement (montantVerse précis, reglements, etc.)
        const caisseMap = new Map<number, CreditInfo>();
        [...nonRegles, ...regles].forEach(c => {
          if (c.venteId) caisseMap.set(c.venteId, c);
        });

        this.allCredits = toutesVentes
          .filter(v => !v.annulee)
          .map(v => {
            const creditCaisse = caisseMap.get(v.id);
            if (creditCaisse) {
              // Caisse a les détails de paiement — mais on force estReglee correct
              const montantRestant = creditCaisse.montantRestant ?? (v.montantRestant ?? 0);
              const estReglee = creditCaisse.estReglee || !!v.creditRegle || montantRestant <= 0.01;
              const maintenant = new Date();
              const echeance = creditCaisse.dateEcheance ? new Date(creditCaisse.dateEcheance) : null;
              const enRetard = !estReglee && echeance ? echeance < maintenant : false;
              const joursRetard = enRetard && echeance
                ? Math.ceil((maintenant.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              return { ...creditCaisse, montantRestant, estReglee, enRetard, joursRetard };
            }
            return this.venteMapToCreditInfo(v);
          });

        this.applyStatutFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private venteMapToCreditInfo(v: VenteMap): CreditInfo {
    const maintenant = new Date();
    const montantTotal = v.montantTotal || 0;
    const montantVerse = v.montantVerse || 0;
    const montantRestant = v.montantRestant ?? Math.max(0, montantTotal - montantVerse);
    const echeance = v.dateEcheance ? new Date(v.dateEcheance) : null;
    const estReglee = v.creditRegle || montantRestant <= 0;
    const enRetard = !estReglee && echeance ? echeance < maintenant : false;
    const joursRetard = enRetard && echeance
      ? Math.ceil((maintenant.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const rawProg = montantTotal > 0 ? (montantVerse / montantTotal) * 100 : 0;
    return {
      id: v.id,
      clientNom: v.clientNom || 'Client divers',
      clientPrenom: v.clientPrenom,
      clientTelephone: v.clientTelephone || '',
      montantTotal,
      montantVerse,
      montantRestant,
      dateOperation: v.dateVente || '',
      dateEcheance: v.dateEcheance || '',
      dateReglement: v.dateReglement,
      venteId: v.id,
      numeroVente: v.numeroVente || '',
      estReglee,
      regleParNom: v.regleParNom,
      regleParId: v.regleParId,
      vendeurNom: v.vendeurNom,
      enRetard,
      joursRetard,
      progression: montantRestant > 0 ? Math.min(rawProg, 99) : rawProg,
      venteAnnulee: v.annulee || false
    };
  }

  setStatutFilter(s: StatutFilter) {
    this.statutFilter = s;
    if (s === 'PAR_CLIENT') {
      this.buildReglementGroupesParClient();
    } else {
      this.applyStatutFilter();
    }
  }

  buildReglementGroupesParClient() {
    const map = new Map<string, ReglementGroupeClient>();
    for (const c of this.allCredits) {
      const nom = (c.clientNom || 'Inconnu').trim();
      if (!map.has(nom)) {
        map.set(nom, {
          nom,
          telephone: c.clientTelephone || '',
          nbCredits: 0, nbAvecVerse: 0,
          totalCredit: 0, totalVerse: 0, totalRestant: 0,
          credits: []
        });
      }
      const g = map.get(nom)!;
      g.nbCredits++;
      g.totalCredit += c.montantTotal || 0;
      g.totalVerse += c.montantVerse || 0;
      g.totalRestant += c.montantRestant || 0;
      if ((c.montantVerse || 0) > 0) g.nbAvecVerse++;
      g.credits.push(c);
    }
    this.reglementGroupesParClient = Array.from(map.values())
      .filter(g => g.totalVerse > 0)
      .sort((a, b) => b.totalVerse - a.totalVerse);
  }

  toggleClient(nom: string) {
    if (this.clientsExpanded.has(nom)) {
      this.clientsExpanded.delete(nom);
    } else {
      this.clientsExpanded.add(nom);
    }
  }

  applyStatutFilter() {
    if (this.statutFilter === 'EN_COURS') {
      this.credits = this.allCredits.filter(c => !c.estReglee || c.montantRestant > 0.01);
    } else if (this.statutFilter === 'EN_RETARD') {
      this.credits = this.allCredits.filter(c => c.enRetard && c.montantRestant > 0.01);
    } else if (this.statutFilter === 'REGLES') {
      this.credits = this.allCredits.filter(c => c.estReglee && c.montantRestant <= 0.01);
    } else {
      this.credits = [...this.allCredits];
    }
    this.applyFilter();
  }

  get clientsUniques(): string[] {
    const noms = new Set<string>();
    for (const c of this.allCredits) {
      const nom = (c.clientNom || '').trim();
      if (nom) noms.add(nom);
    }
    return Array.from(noms).sort((a, b) => a.localeCompare(b, 'fr'));
  }

  get versementsFiltres(): OperationCaisse[] {
    const t = this.rechercheVersement.toLowerCase().trim();
    if (!t) return this.versementsSimples;
    return this.versementsSimples.filter(v =>
      String(v.montant || '').includes(t) ||
      (v.modePaiement || '').toLowerCase().includes(t) ||
      (v.referencePaiement || '').toLowerCase().includes(t) ||
      (v.dateOperation || '').toLowerCase().includes(t) ||
      (v.utilisateurNom || '').toLowerCase().includes(t) ||
      (v.motif || '').toLowerCase().includes(t)
    );
  }

  applyFilter() {
    const t = this.searchTerm.toLowerCase().trim();
    let result = this.credits;

    // Filtre texte
    if (t) {
      result = result.filter(c =>
        (c.clientNom || '').toLowerCase().includes(t) ||
        (c.clientTelephone || '').includes(t) ||
        (c.numeroVente || '').toLowerCase().includes(t)
      );
    }

    // Filtre client dropdown
    if (this.clientSelectionne) {
      result = result.filter(c =>
        (c.clientNom || '').trim() === this.clientSelectionne
      );
    }

    // Filtre date
    if (this.dateDebut) {
      const debut = new Date(this.dateDebut);
      debut.setHours(0, 0, 0, 0);
      result = result.filter(c => {
        if (!c.dateOperation) return false;
        return new Date(c.dateOperation) >= debut;
      });
    }
    if (this.dateFin) {
      const fin = new Date(this.dateFin);
      fin.setHours(23, 59, 59, 999);
      result = result.filter(c => {
        if (!c.dateOperation) return false;
        return new Date(c.dateOperation) <= fin;
      });
    }

    this.creditsFiltres = result;
    this.creditsCurrentPage = 1;
    this.buildGroupesParClient();
  }

  effacerFiltresDates() {
    this.dateDebut = '';
    this.dateFin = '';
    this.applyFilter();
  }

  buildGroupesParClient() {
    const map = new Map<string, GroupeClient>();
    for (const c of this.credits) {
      const nom = (c.clientNom || 'Inconnu').trim();
      if (!map.has(nom)) {
        map.set(nom, { nom, telephone: c.clientTelephone || '', count: 0, total: 0 });
      }
      const g = map.get(nom)!;
      g.count++;
      g.total += c.montantRestant || 0;
    }
    this.creditsGroupesParClient = Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  // ── Pagination ─────────────────────────────────────────────────

  get paginatedCredits(): CreditInfo[] {
    const start = (this.creditsCurrentPage - 1) * this.creditsItemsPerPage;
    return this.creditsFiltres.slice(start, start + this.creditsItemsPerPage);
  }

  get creditsTotalPages(): number {
    return Math.ceil(this.creditsFiltres.length / this.creditsItemsPerPage);
  }

  get creditsPageNumbers(): number[] {
    const total = this.creditsTotalPages;
    const cur = this.creditsCurrentPage;
    const pages: number[] = [];
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  changeCreditsPage(page: number) {
    if (page < 1 || page > this.creditsTotalPages) return;
    this.creditsCurrentPage = page;
  }

  // ── Stats ──────────────────────────────────────────────────────

  get totalMontantRestant(): number {
    return this.allCredits.filter(c => !c.estReglee).reduce((s, c) => s + (c.montantRestant || 0), 0);
  }

  get montantTotalCreditsOrigine(): number {
    return this.credits.reduce((s, c) => s + (c.montantTotal || 0), 0);
  }

  get montantTotalVerseOrigine(): number {
    return this.credits.reduce((s, c) => s + (c.montantVerse || 0), 0);
  }

  get nbEnRetard(): number {
    return this.allCredits.filter(c => c.enRetard).length;
  }

  get nbCreditsEnCours(): number {
    return this.allCredits.filter(c => !c.estReglee).length;
  }

  get totalVerseParClient(): number {
    return this.reglementGroupesParClient.reduce((s, g) => s + g.totalVerse, 0);
  }
  get totalCreditParClient(): number {
    return this.reglementGroupesParClient.reduce((s, g) => s + g.totalCredit, 0);
  }
  get totalRestantParClient(): number {
    return this.reglementGroupesParClient.reduce((s, g) => s + g.totalRestant, 0);
  }

  get nbCreditsRegles(): number {
    return this.allCredits.filter(c => c.estReglee).length;
  }

  // ── Modal détails crédit ────────────────────────────────────────

  openDetailsCreditModal(credit: CreditInfo) {
    this.selectedCredit = credit;
    this.detailsLignes = [];
    this.versements = [];
    this.versementsSimples = [];
    this.paiementsGroupesDetail = new Map();
    this.rechercheVersement = '';
    this.showDetailsCreditModal = true;
    if (credit.venteId) {
      this.detailsLignesLoading = true;
      this.versementsLoading = true;
      forkJoin({
        vente: this.venteService.getVenteById(credit.venteId),
        vers: this.caisseService.getHistoriqueReglementsCredit(credit.venteId)
      }).subscribe({
        next: ({ vente, vers }) => {
          this.detailsLignes = vente.lignes || vente.produits || [];
          this.versements = vers;
          this.calculerGroupesVersements(vers);
          this.detailsLignesLoading = false;
          this.versementsLoading = false;
        },
        error: () => {
          this.detailsLignesLoading = false;
          this.versementsLoading = false;
        }
      });
    }
  }

  private calculerGroupesVersements(vers: OperationCaisse[]) {
    this.versementsSimples = [];
    this.paiementsGroupesDetail = new Map();
    for (const op of vers) {
      const ref = op.referenceGroupe;
      if (ref && ref.trim() !== '') {
        if (!this.paiementsGroupesDetail.has(ref)) {
          this.paiementsGroupesDetail.set(ref, []);
        }
        this.paiementsGroupesDetail.get(ref)!.push(op);
      } else {
        this.versementsSimples.push(op);
      }
    }
  }

  montantTotalGroupe(ops: OperationCaisse[]): number {
    return ops.reduce((s, o) => s + (o.montant || 0), 0);
  }

  premiereDateGroupe(ops: OperationCaisse[]): string {
    if (!ops.length) return '';
    return ops[0].dateOperation || '';
  }

  referenceGroupeCourte(ref: string): string {
    return ref ? ref.substring(0, 8).toUpperCase() : '';
  }

  // ── Modal crédits par client ────────────────────────────────────

  openCreditsClientModal(nom: string) {
    this.selectedClientCreditsNom = nom;
    this.selectedClientCreditsList = this.credits.filter(c =>
      (c.clientNom || '').trim() === nom
    );
    this.showCreditsClientModal = true;
  }

  closeCreditsClientModal() {
    this.showCreditsClientModal = false;
    this.showPaiementGroupeModal = false;
    this.selectedClientCreditsList = [];
    this.repartitionGroupe = [];
  }

  totalSelectedClientCredits(field: 'montantTotal' | 'montantVerse' | 'montantRestant'): number {
    return this.selectedClientCreditsList.reduce((s, c) => s + (c[field] || 0), 0);
  }

  // ── Modal paiement groupé ───────────────────────────────────────

  openPaiementGroupeModal() {
    if (this.selectedClientCreditsList.length === 0) return;
    this.montantPaiementGroupe = 0;
    this.modePaiementGroupe = ModePaiementCaisse.ESPECES;
    this.referenceGroupePaiement = '';
    this.repartitionGroupe = [];
    this.showPaiementGroupeModal = true;
  }

  calculerRepartitionGroupe() {
    const credits = this.selectedClientCreditsList.filter(c => !c.estReglee && c.montantRestant > 0);
    const totalRestant = credits.reduce((s, c) => s + c.montantRestant, 0);
    const montant = this.montantPaiementGroupe;
    if (montant <= 0 || credits.length === 0) {
      this.repartitionGroupe = [];
      return;
    }
    let reste = montant;
    this.repartitionGroupe = credits.map((credit, index) => {
      const isLast = index === credits.length - 1;
      let part = isLast
        ? reste
        : Math.min(Math.round((credit.montantRestant / totalRestant) * montant), credit.montantRestant);
      part = Math.min(part, credit.montantRestant);
      reste -= part;
      return { credit, montantAPayer: part };
    });
  }

  confirmerPaiementGroupe() {
    if (!this.montantPaiementGroupe || this.montantPaiementGroupe <= 0) return;
    if (this.modePaiementGroupe !== ModePaiementCaisse.ESPECES && !this.referenceGroupePaiement) {
      Swal.fire('Erreur', 'Référence requise pour ce mode de paiement', 'error');
      return;
    }
    const valides = this.repartitionGroupe.filter(r => r.montantAPayer > 0);
    if (valides.length === 0) {
      Swal.fire('Erreur', 'Aucun crédit à régler', 'error');
      return;
    }
    const user = this.authService.getUser();
    const totalAPayer = valides.reduce((s, r) => s + r.montantAPayer, 0);

    Swal.fire({
      title: 'Confirmation paiement groupé',
      html: `Voulez-vous effectuer ce paiement groupé ?<br><br>
             <strong>Client :</strong> ${this.selectedClientCreditsNom}<br>
             <strong>Montant total :</strong> ${this.formatPrice(totalAPayer)}<br>
             <strong>Crédits concernés :</strong> ${valides.length}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoadingPaiementGroupe = true;
      const refGroupe = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      from(valides).pipe(
        concatMap(r => this.caisseService.reglementCredit({
          venteCreditId: r.credit.venteId,
          montantRegle: r.montantAPayer,
          utilisateurId: user?.id,
          modePaiement: this.modePaiementGroupe,
          referencePaiement: this.referenceGroupePaiement || '',
          motif: `Paiement groupé | Total apporté: ${this.montantPaiementGroupe}`,
          referenceGroupe: refGroupe
        })),
        toArray()
      ).subscribe({
        next: () => {
          this.isLoadingPaiementGroupe = false;
          this.showPaiementGroupeModal = false;
          this.showCreditsClientModal = false;
          this.repartitionGroupe = [];
          Swal.fire({ icon: 'success', title: 'Paiement groupé enregistré !', timer: 2000, showConfirmButton: false });
          this.loadCredits();
        },
        error: err => {
          this.isLoadingPaiementGroupe = false;
          Swal.fire('Erreur', err.message || 'Problème lors du paiement groupé', 'error');
        }
      });
    });
  }

  // ── Modal règlement individuel ─────────────────────────────────

  ouvrirModal(credit: CreditInfo) {
    if (!credit.venteId || credit.venteId === 0) {
      Swal.fire('Erreur', 'ID de vente manquant pour ce crédit', 'error');
      return;
    }
    this.selectedCredit = credit;
    this.reglementForm = {
      montantRegle: credit.montantRestant,
      modePaiement: ModePaiementCaisse.ESPECES,
      referencePaiement: ''
    };
    this.showDetailsCreditModal = false;
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
    this.isLoadingReglement = false;
  }

  closeAllModals() {
    this.showDetailsCreditModal = false;
    this.showCreditsClientModal = false;
    this.showPaiementGroupeModal = false;
    this.showModal = false;
  }

  enregistrerReglement() {
    if (!this.selectedCredit) return;
    if (!this.reglementForm.montantRegle || this.reglementForm.montantRegle <= 0) {
      Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'error');
      return;
    }
    if (this.reglementForm.montantRegle > this.selectedCredit.montantRestant) {
      Swal.fire('Erreur', `Le montant ne peut pas dépasser ${this.formatPrice(this.selectedCredit.montantRestant)}`, 'error');
      return;
    }
    if (this.reglementForm.modePaiement !== ModePaiementCaisse.ESPECES && !this.reglementForm.referencePaiement.trim()) {
      Swal.fire('Erreur', 'La référence de paiement est requise', 'error');
      return;
    }

    this.isLoadingReglement = true;
    const user = this.authService.getUser();
    const request: ReglementCreditRequest = {
      venteCreditId: this.selectedCredit.venteId,
      montantRegle: this.reglementForm.montantRegle,
      utilisateurId: user?.id,
      modePaiement: this.reglementForm.modePaiement,
      referencePaiement: this.reglementForm.referencePaiement.trim() || undefined
    };

    this.caisseService.reglementCredit(request).subscribe({
      next: () => {
        this.isLoadingReglement = false;
        this.fermerModal();
        Swal.fire({ icon: 'success', title: 'Règlement enregistré !', timer: 2000, showConfirmButton: false });
        this.loadCredits();
      },
      error: err => {
        this.isLoadingReglement = false;
        Swal.fire('Erreur', err.message || 'Impossible d\'enregistrer le règlement', 'error');
      }
    });
  }

  // ── PDF versements crédit ──────────────────────────────────────

  private async fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  }

  async imprimerVersementsCredit(): Promise<void> {
    if (!this.selectedCredit) return;
    const credit = this.selectedCredit;
    const vers = this.versements;

    const qrData = encodeURIComponent(`CREDIT_N${credit.numeroVente}_CLIENT_${credit.clientNom}_VERSE_${credit.montantVerse}`);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const qrBase64 = await this.fetchImageAsBase64(qrApiUrl);
    const qrImgSrc = qrBase64 || '';

    // Grouper les versements par referenceGroupe
    const groupesMap = new Map<string, OperationCaisse[]>();
    const simplesVers: OperationCaisse[] = [];
    for (const op of vers) {
      const ref = op.referenceGroupe;
      if (ref && ref.trim() !== '') {
        if (!groupesMap.has(ref)) groupesMap.set(ref, []);
        groupesMap.get(ref)!.push(op);
      } else {
        simplesVers.push(op);
      }
    }

    const versToDisplay = simplesVers.length > 0 ? simplesVers : (groupesMap.size === 0 ? vers : []);
    const versRows = versToDisplay.length ? versToDisplay.map((v, i) =>
      `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td>${this.formatDateLong(v.dateOperation)}</td>
        <td style="text-align:right;font-weight:700;color:#166534">${this.formatPrice(v.montant)}</td>
        <td>${v.modePaiement || 'ESPECES'}</td>
        <td>${v.referencePaiement || '—'}</td>
        <td>${v.utilisateurNom || '—'}</td>
        <td>${v.motif || '—'}</td>
      </tr>`
    ).join('') : `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:16px">${groupesMap.size > 0 ? 'Tous les versements font partie de paiements groupés (voir section ci-dessous)' : 'Aucun versement'}</td></tr>`;

    const isGrouped = groupesMap.size > 0;
    const groupBadge = isGrouped ? `
  <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:800;color:#92400e;margin-bottom:4px">INCLUT DES PAIEMENTS GROUPES</div>
    <div style="font-size:11px;color:#92400e;margin-top:3px">Certains versements font partie de paiements groupés — voir section ci-dessous</div>
  </div>` : '';

    // Section paiements groupés PDF
    let groupesPdfSection = '';
    if (groupesMap.size > 0) {
      let groupesHtml = '';
      groupesMap.forEach((ops, ref) => {
        const totalGroupe = ops.reduce((s, o) => s + (o.montant || 0), 0);
        const dateGroupe = ops[0]?.dateOperation ? new Date(ops[0].dateOperation).toLocaleDateString('fr-FR') : '—';
        const refCourte = ref.substring(0, 8).toUpperCase();
        const lignesGroupe = ops.map((o, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
          <td>${o.dateOperation ? new Date(o.dateOperation).toLocaleDateString('fr-FR') : '—'}</td>
          <td style="text-align:right;font-weight:700;color:#166534">${this.formatPrice(o.montant)}</td>
          <td>${o.modePaiement || 'ESPECES'}</td>
          <td>${o.referencePaiement || '—'}</td>
          <td>${o.utilisateurNom || '—'}</td>
          <td>${o.motif || '—'}</td>
        </tr>`).join('');
        groupesHtml += `
        <div style="border:1px solid #e0e0e0;border-radius:8px;margin-bottom:12px;overflow:hidden">
          <div style="background:#e3f2fd;padding:10px 14px;font-weight:600;color:#0d47a1">
            Référence: ${refCourte} &bull; ${dateGroupe} &bull; Montant apporté: ${this.formatPrice(totalGroupe)}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead><tr style="background:#bbdefb">
              <th style="padding:6px 8px;text-align:left">Date</th>
              <th style="padding:6px 8px;text-align:right">Montant</th>
              <th style="padding:6px 8px;text-align:left">Mode</th>
              <th style="padding:6px 8px;text-align:left">Référence</th>
              <th style="padding:6px 8px;text-align:left">Enregistré par</th>
              <th style="padding:6px 8px;text-align:left">Motif</th>
            </tr></thead>
            <tbody>${lignesGroupe}</tbody>
          </table>
        </div>`;
      });
      groupesPdfSection = `
      <div style="margin-top:24px">
        <h3 style="color:#1565c0;border-bottom:2px solid #1565c0;padding-bottom:4px;margin-bottom:12px;font-size:14px">Paiements groupés (${groupesMap.size} session(s))</h3>
        ${groupesHtml}
      </div>`;
    }

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Versements crédit — ${credit.clientNom}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:820px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:linear-gradient(135deg,#0f3460,#1a56db);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}
.hdr-title{font-size:22px;font-weight:900}.hdr-sub{font-size:12px;opacity:.7;margin-top:4px}
.body{padding:24px 28px}
.kpi-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.kpi{flex:1;min-width:120px;background:#eff6ff;border-radius:10px;padding:12px 14px;text-align:center}
.kpi.green{background:#f0fdf4}.kpi.red{background:#fef2f2}
.kpi-val{font-size:1rem;font-weight:900;color:#1a56db}
.kpi.green .kpi-val{color:#166534}.kpi.red .kpi-val{color:#dc2626}
.kpi-lbl{font-size:0.7rem;color:#64748b;margin-top:3px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;margin-top:16px}
table{width:100%;border-collapse:collapse;font-size:0.82rem}
th{background:#eff6ff;padding:8px 10px;text-align:left;font-weight:700;color:#1e40af;border-bottom:2px solid #bfdbfe}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:#1a56db;color:#fff}.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#0f3460,#1a56db);color:rgba(255,255,255,.6);text-align:center;padding:12px;font-size:11px}
.info-table td{padding:5px 10px;border-bottom:1px solid #f1f5f9}
.info-table td:first-child{font-weight:700;color:#475569;width:160px}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">Historique des versements</div>
      <div class="hdr-sub">Crédit N° ${credit.numeroVente} &mdash; ${credit.clientNom}${credit.clientPrenom ? ' ' + credit.clientPrenom : ''}</div>
    </div>
    ${qrImgSrc ? `<img src="${qrImgSrc}" width="72" height="72" style="border-radius:8px;background:#fff;padding:3px" alt="QR">` : ''}
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">
    <div class="section-title">Informations du crédit</div>
    <table class="info-table" style="margin-bottom:16px">
      <tr><td>Client</td><td><strong>${credit.clientNom}${credit.clientPrenom ? ' ' + credit.clientPrenom : ''}</strong>${credit.clientTelephone ? ` &mdash; ${credit.clientTelephone}` : ''}</td></tr>
      <tr><td>N° Vente</td><td>${credit.numeroVente}</td></tr>
      <tr><td>Statut</td><td>${credit.estReglee ? '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:6px;font-weight:700">✓ Réglé</span>' : '<span style="background:#fef9c3;color:#854d0e;padding:2px 8px;border-radius:6px;font-weight:700">En cours</span>'}</td></tr>
    </table>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-val">${this.formatPrice(credit.montantTotal)}</div><div class="kpi-lbl">Montant total</div></div>
      <div class="kpi green"><div class="kpi-val">${this.formatPrice(credit.montantVerse)}</div><div class="kpi-lbl">Total versé</div></div>
      ${!credit.estReglee ? `<div class="kpi red"><div class="kpi-val">${this.formatPrice(credit.montantRestant)}</div><div class="kpi-lbl">Reste à payer</div></div>` : ''}
      <div class="kpi"><div class="kpi-val">${credit.progression ? credit.progression.toFixed(0) + '%' : '—'}</div><div class="kpi-lbl">Progression</div></div>
    </div>
    ${groupBadge}
    <div class="section-title">Versements simples (${versToDisplay.length})</div>
    <table>
      <thead><tr><th>Date</th><th style="text-align:right">Montant versé</th><th>Mode</th><th>Référence</th><th>Enregistré par</th><th>Motif</th></tr></thead>
      <tbody>${versRows}</tbody>
      <tfoot><tr style="background:#eff6ff"><td colspan="1" style="font-weight:700">Total versé</td><td style="text-align:right;font-weight:900;color:#166534">${this.formatPrice(credit.montantVerse)}</td><td colspan="4"></td></tr></tfoot>
    </table>
    ${!credit.estReglee ? `<div style="margin-top:12px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px;text-align:center"><span style="color:#dc2626;font-weight:700;font-size:14px">Reste à payer : ${this.formatPrice(credit.montantRestant)}</span></div>` : ''}
    ${groupesPdfSection}
  </div>
  <div class="ftr">Ges Boutique &middot; Historique versements crédit &middot; ${new Date().toLocaleDateString('fr-FR')}</div>
</div></body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }

  // ── Reçu PDF ───────────────────────────────────────────────────

  imprimerRecuCredit(credit: CreditInfo): void {
    if (!credit.venteId) return;
    this.caisseService.getHistoriqueReglementsCredit(credit.venteId).subscribe({
      next: async (vers) => {
        const totalVerse = vers.reduce((s, v) => s + (v.montant || 0), 0);
        const publicUrl = `${window.location.origin}/api/public/ventes/${credit.venteId}/facture`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(publicUrl)}`;
        const qrBase64 = await this.fetchImageAsBase64(qrApiUrl);
        const qrImgSrc = qrBase64 || '';

        const versRows = vers.map((v, i) => `
          <tr>
            <td style="text-align:center;color:#64748b">${i + 1}</td>
            <td>${this.formatDateShort(v.dateOperation)}</td>
            <td style="text-align:right;font-weight:700;color:#16a34a">${this.formatPrice(v.montant)}</td>
            <td>${(v.modePaiement || '').replace(/_/g, ' ') || '—'}</td>
            <td>${v.referencePaiement || '—'}</td>
            <td>${v.utilisateurNom || '—'}</td>
          </tr>`).join('') || '<tr><td colspan="6" style="color:#94a3b8;text-align:center">Aucun versement</td></tr>';

        const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Reçu crédit — ${credit.numeroVente}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:20px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:700px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:linear-gradient(135deg,#0f3460,#1a56db);color:#fff;padding:22px 28px;display:flex;justify-content:space-between;align-items:flex-start}
.hdr-title{font-size:19px;font-weight:900}
.hdr-sub{font-size:11px;opacity:.75;margin-top:3px}
.body{padding:22px 28px}
.section{margin-bottom:18px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
.kpi-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.kpi{flex:1;min-width:110px;background:#eff6ff;border-radius:10px;padding:11px;text-align:center}
.kpi.green{background:#f0fdf4}.kpi.red{background:#fef2f2}
.kpi-val{font-size:.95rem;font-weight:900;color:#1a56db}
.kpi.green .kpi-val{color:#16a34a}.kpi.red .kpi-val{color:#dc2626}
.kpi-lbl{font-size:.68rem;color:#64748b;margin-top:2px}
.info-row{display:flex;gap:8px;margin-bottom:5px;font-size:.84rem}
.info-label{color:#94a3b8;font-size:.73rem;min-width:95px}
.info-val{font-weight:600;color:#1e293b}
table{width:100%;border-collapse:collapse;font-size:.76rem}
th{background:#f8fafc;padding:6px 8px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;font-size:.7rem}
td{padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#374151}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:10px;background:#f8fafc}
.btn{border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer}
.btn-p{background:#1a56db;color:#fff}.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#0f3460,#1a56db);color:rgba(255,255,255,.6);text-align:center;padding:11px;font-size:11px}
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;max-width:100%}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">Reçu de Crédit</div>
      <div class="hdr-sub">N° ${credit.numeroVente || 'VT-' + credit.venteId}</div>
      <div class="hdr-sub">Date crédit : ${this.formatDateShort(credit.dateOperation)}</div>
      <div class="hdr-sub" style="color:${credit.estReglee ? '#86efac' : '#fde68a'}">
        Statut : ${credit.estReglee ? '✓ RÉGLÉ' : 'EN COURS'}
      </div>
    </div>
    ${qrImgSrc ? `<img src="${qrImgSrc}" width="70" height="70" style="border-radius:8px;background:#fff;padding:2px" alt="QR">` : ''}
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Client</div>
      <div class="info-row"><span class="info-label">Nom</span><span class="info-val">${credit.clientNom || '—'}${credit.clientPrenom ? ' ' + credit.clientPrenom : ''}</span></div>
      <div class="info-row"><span class="info-label">Téléphone</span><span class="info-val">${credit.clientTelephone || '—'}</span></div>
      ${credit.regleParNom ? `<div class="info-row"><span class="info-label">Réglé par</span><span class="info-val">${credit.regleParNom}</span></div>` : ''}
      ${credit.vendeurNom ? `<div class="info-row"><span class="info-label">Vendeur</span><span class="info-val">${credit.vendeurNom}</span></div>` : ''}
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-val">${this.formatPrice(credit.montantTotal)}</div><div class="kpi-lbl">Montant crédit</div></div>
      <div class="kpi green"><div class="kpi-val">${this.formatPrice(totalVerse)}</div><div class="kpi-lbl">Total versé</div></div>
      <div class="kpi ${credit.montantRestant > 0.01 ? 'red' : 'green'}"><div class="kpi-val">${this.formatPrice(credit.montantRestant)}</div><div class="kpi-lbl">Reste à payer</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#6366f1">${vers.length}</div><div class="kpi-lbl">Versement(s)</div></div>
    </div>
    <div class="section">
      <div class="section-title">Historique des versements</div>
      <table>
        <thead><tr><th>#</th><th>Date</th><th style="text-align:right">Montant</th><th>Mode</th><th>Référence</th><th>Enregistré par</th></tr></thead>
        <tbody>${versRows}</tbody>
      </table>
    </div>
    ${credit.estReglee
      ? '<div style="text-align:center;margin-top:12px"><span style="background:#dcfce7;color:#166534;padding:4px 16px;border-radius:20px;font-weight:700;font-size:0.8rem">✓ CRÉDIT ENTIÈREMENT RÉGLÉ</span></div>'
      : `<div style="margin-top:12px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px;text-align:center"><span style="color:#dc2626;font-weight:700">Reste à payer : ${this.formatPrice(credit.montantRestant)}</span></div>`}
  </div>
  <div class="ftr">Ges Boutique &middot; Reçu généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</div></body></html>`;

        this.factureService.ouvrirHtmlPersonnalise(html);
      },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les versements.', timer: 2000, showConfirmButton: false })
    });
  }

  // ── Impression liste crédits ───────────────────────────────────

  async imprimerListeCredits(): Promise<void> {
    const liste = this.creditsFiltres;
    if (!liste.length) {
      Swal.fire({ icon: 'info', title: 'Aucun crédit', text: 'Aucun crédit à imprimer avec ce filtre.', timer: 2000, showConfirmButton: false }); return;
    }
    const statutLabels: { [k: string]: string } = { EN_COURS: 'En cours', EN_RETARD: 'En retard', REGLES: 'Réglés', TOUS: 'Tous' };
    const titre = `Crédits — ${statutLabels[this.statutFilter] || 'Tous'}`;
    const qrData = encodeURIComponent(`CREDITS_${this.statutFilter}_${new Date().toISOString().split('T')[0]}`);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const qrBase64 = await this.fetchImageAsBase64(qrApiUrl);
    const qrImgSrc = qrBase64 || '';
    const total = liste.reduce((s, c) => s + (c.montantRestant || 0), 0);
    const totalInitial = liste.reduce((s, c) => s + (c.montantTotal || 0), 0);
    const totalVerse = liste.reduce((s, c) => s + (c.montantVerse || 0), 0);

    const rows = liste.map(c => `<tr>
      <td>${c.clientNom || '—'}</td>
      <td>${c.clientTelephone || '—'}</td>
      <td>${this.formatDateShort(c.dateOperation || '')}</td>
      <td style="text-align:right">${this.formatPrice(c.montantTotal || 0)}</td>
      <td style="text-align:right;color:#16a34a">${this.formatPrice(c.montantVerse || 0)}</td>
      <td style="text-align:right;color:${(c.montantRestant || 0) > 0 ? '#dc2626' : '#16a34a'};font-weight:700">${this.formatPrice(c.montantRestant || 0)}</td>
      <td style="text-align:center"><span style="background:${c.enRetard ? '#fee2e2' : c.estReglee ? '#dcfce7' : '#fef9c3'};color:${c.enRetard ? '#991b1b' : c.estReglee ? '#166534' : '#854d0e'};padding:2px 8px;border-radius:12px;font-size:0.75rem">${c.enRetard ? 'En retard' : c.estReglee ? 'Réglé' : 'En cours'}</span></td>
    </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${titre}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}.sheet{background:#fff;max-width:800px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}.hdr{background:linear-gradient(135deg,#0f172a,#1e40af);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}.hdr-title{font-size:22px;font-weight:900}.hdr-sub{font-size:12px;opacity:.7;margin-top:4px}.body{padding:24px 28px}.kpi-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}.kpi{flex:1;min-width:130px;background:#f8fafc;border-radius:10px;padding:14px 16px;text-align:center;border:1px solid #e2e8f0}.kpi-val{font-size:1.1rem;font-weight:900;color:#1e293b}.kpi-lbl{font-size:0.7rem;color:#64748b;margin-top:3px}table{width:100%;border-collapse:collapse;font-size:0.82rem}th{background:#f8fafc;padding:8px 10px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0}td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151}tr:last-child td{border-bottom:none}.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}.btn-p{background:#1e40af;color:#fff}.btn-c{background:#ef4444;color:#fff}.ftr{background:linear-gradient(135deg,#0f172a,#1e40af);color:rgba(255,255,255,.6);text-align:center;padding:12px;font-size:11px}@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}</style></head><body>
<div class="sheet">
  <div class="hdr"><div><div class="hdr-title">${titre}</div><div class="hdr-sub">${liste.length} crédit(s)</div><div class="hdr-sub">Généré le ${new Date().toLocaleDateString('fr-FR')}</div></div>${qrImgSrc ? `<img src="${qrImgSrc}" width="72" height="72" style="border-radius:8px;background:#fff;padding:3px" alt="QR">` : ''}</div>
  <div class="btn-bar"><button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button><button class="btn btn-c" onclick="window.close()">Fermer</button></div>
  <div class="body">
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-val">${this.formatPrice(totalInitial)}</div><div class="kpi-lbl">Total crédits</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#16a34a">${this.formatPrice(totalVerse)}</div><div class="kpi-lbl">Total versé</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#dc2626">${this.formatPrice(total)}</div><div class="kpi-lbl">Reste à payer</div></div>
    </div>
    <table>
      <thead><tr><th>Client</th><th>Tél</th><th>Date</th><th style="text-align:right">Montant initial</th><th style="text-align:right">Versé</th><th style="text-align:right">Restant</th><th style="text-align:center">Statut</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="ftr">Ges Boutique &middot; Rapport crédits</div>
</div></body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }

  // ── Helpers ────────────────────────────────────────────────────

  formatPrice(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  }

  formatDateShort(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  formatDateLong(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getModePaiementLabel(mode: string): string {
    const labels: { [k: string]: string } = {
      ESPECES: 'Espèces', ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money',
      WAVE_MONEY: 'Wave Money', CARTE_BANCAIRE: 'Carte bancaire', VIREMENT: 'Virement', CHEQUE: 'Chèque'
    };
    return labels[mode] || mode;
  }

  getCreditStatusClass(c: CreditInfo): string {
    if (c.enRetard) return 'badge bg-danger';
    if (c.progression > 0) return 'badge bg-warning text-dark';
    return 'badge bg-primary';
  }

  getCreditStatusText(c: CreditInfo): string {
    if (c.enRetard) return `Retard ${c.joursRetard}j`;
    if (c.progression > 0) return `Payé ${c.progression.toFixed(0)}%`;
    return 'En cours';
  }
}
