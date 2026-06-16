import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataLayerService } from '../../services/data-layer.service';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { startWith, debounceTime, switchMap, map } from 'rxjs/operators';
import { SharedAnimations } from '../../animations/shared-animations';
import { SearchService } from '../../services/search.service';
import { BoutiqueService } from '../../services/boutique.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    animations: [SharedAnimations],
    standalone: false
})
export class SearchComponent implements OnInit, OnDestroy {
  page = 1;
  pageSize = 6;

  results$: Observable<any[]>;
  searchCtrl: UntypedFormControl = new UntypedFormControl('');

  logoPath: string = '';
  private sub: Subscription | null = null;

  constructor(
    private dl: DataLayerService,
    public searchService: SearchService,
    private boutiqueService: BoutiqueService
  ) { }

  ngOnInit() {
    this.logoPath = this.boutiqueService.getLogoPath() || '';
    this.sub = this.boutiqueService.info$.subscribe(i => this.logoPath = i.logoPath || '');

    this.results$ = combineLatest(
      this.dl.getProducts(),
      this.searchCtrl.valueChanges
      .pipe(startWith(''), debounceTime(200))
    )
    .pipe(map(([products, searchTerm]) => {
      return products.filter(p => {
        return p.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      });
    }));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

}
