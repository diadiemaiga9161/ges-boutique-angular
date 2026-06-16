import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoutiqueService } from '../../services/boutique.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent implements OnInit, OnDestroy {
  
  year: number | string = '' ;

  boutiqueName: string = '';
  logoPath: string = '';
  private sub: Subscription | null = null;

  constructor(private boutiqueService: BoutiqueService) { }

  ngOnInit() {
    this.year = (new Date()).getFullYear();
    const info = this.boutiqueService.getInfo();
    this.boutiqueName = info.nom || '';
    this.logoPath = info.logoPath || 'assets/images/logo.png';
    this.sub = this.boutiqueService.info$.subscribe(i => {
      this.boutiqueName = i.nom || '';
      this.logoPath = i.logoPath || 'assets/images/logo.png';
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
