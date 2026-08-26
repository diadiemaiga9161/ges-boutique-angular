import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, Subscription, of } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { startWith, debounceTime, map, catchError } from 'rxjs/operators';
import { SharedAnimations } from '../../animations/shared-animations';
import { SearchService } from '../../services/search.service';
import { BoutiqueService } from '../../services/boutique.service';
import { ProductService, Produit } from '../../services/product.service';
import { ClientService } from '../../services/client.service';

interface ResultatRecherche {
  type: 'produit' | 'client';
  icon: string;
  titre: string;
  sousTitre: string;
  route: string;
}

// Recherche globale (Ctrl+K / icône loupe de la topbar) sur les vraies
// données de la boutique (produits + clients) — remplace l'ancienne
// recherche du template Gull d'origine, câblée sur un faux endpoint
// "api/products" jamais réellement branché sur le projet.
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    animations: [SharedAnimations],
    standalone: false
})
export class SearchComponent implements OnInit, OnDestroy {
  results$: Observable<ResultatRecherche[]>;
  searchCtrl: UntypedFormControl = new UntypedFormControl('');

  logoPath: string = '';
  private sub: Subscription | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private clientService: ClientService,
    public searchService: SearchService,
    private boutiqueService: BoutiqueService
  ) { }

  ngOnInit() {
    this.logoPath = this.boutiqueService.getLogoPath() || '';
    this.sub = this.boutiqueService.info$.subscribe(i => this.logoPath = i.logoPath || '');

    const produits$ = this.productService.getProducts().pipe(catchError(() => of([] as Produit[])));
    const clients$ = this.clientService.getAll().pipe(catchError(() => of([])));

    this.results$ = combineLatest([
      produits$,
      clients$,
      this.searchCtrl.valueChanges.pipe(startWith(''), debounceTime(200)),
    ]).pipe(
      map(([produits, clients, terme]) => {
        const t = (terme || '').trim().toLowerCase();
        if (!t) return [];

        const resultatsProduits: ResultatRecherche[] = produits
          .filter(p => p.nom?.toLowerCase().includes(t) || p.codeBarre?.toLowerCase().includes(t))
          .slice(0, 8)
          .map(p => ({
            type: 'produit' as const,
            icon: 'i-Clothing-Store',
            titre: p.nom,
            sousTitre: `${p.quantite ?? 0} ${p.uniteMesure || 'unité(s)'} en stock · ${this.formatPrice(p.prixVente)}`,
            route: '/produit',
          }));

        const resultatsClients: ResultatRecherche[] = clients
          .filter((c: any) => c.nom?.toLowerCase().includes(t) || c.prenom?.toLowerCase().includes(t) || c.numeroTelephone?.includes(t))
          .slice(0, 8)
          .map((c: any) => ({
            type: 'client' as const,
            icon: 'i-Business-ManWoman',
            titre: `${c.nom || ''} ${c.prenom || ''}`.trim(),
            sousTitre: c.numeroTelephone || c.email || '',
            route: '/client',
          }));

        return [...resultatsProduits, ...resultatsClients];
      })
    );
  }

  private formatPrice(v: number | undefined): string {
    return `${(v ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F CFA`;
  }

  ouvrirResultat(item: ResultatRecherche) {
    this.searchService.searchOpen = false;
    this.router.navigate([item.route]);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

}
