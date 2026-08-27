import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VitrineInfoDto,
  VitrineProduitDto,
  VitrineService
} from '../../../shared/services/vitrine.service';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vitrine.component.html',
  styleUrls: ['./vitrine.component.scss']
})
export class VitrineComponent implements OnInit {

  infos: VitrineInfoDto | null = null;
  produits: VitrineProduitDto[] = [];

  loadingInfos = true;
  loadingProduits = true;
  erreurInfos = false;
  erreurProduits = false;

  constructor(private vitrineService: VitrineService) {}

  ngOnInit(): void {
    this.chargerInfos();
    this.chargerProduits();
  }

  chargerInfos(): void {
    this.loadingInfos = true;
    this.erreurInfos = false;
    this.vitrineService.getInfos().subscribe({
      next: data => { this.infos = data; this.loadingInfos = false; },
      error: () => { this.loadingInfos = false; this.erreurInfos = true; }
    });
  }

  chargerProduits(): void {
    this.loadingProduits = true;
    this.erreurProduits = false;
    this.vitrineService.getProduits().subscribe({
      next: data => { this.produits = data || []; this.loadingProduits = false; },
      error: () => { this.loadingProduits = false; this.erreurProduits = true; }
    });
  }

  get chargement(): boolean {
    return this.loadingInfos || this.loadingProduits;
  }

  formatPrix(v: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' FCFA';
  }
}
