import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ressources',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './ressources.component.html',
  styleUrls: ['./ressources.component.scss']
})
export class RessourcesComponent {

  readonly version = '1.0.0';
  readonly developer = 'Maiga Consulting';
  readonly copyright = '2024-2026';

  readonly whatsappUrl = 'https://wa.me/22379999999';
  readonly email = 'contact@mg-consulting.site';
  readonly website = 'https://diadiemaiga9161.github.io/Portfolio-Maiga-/';
  readonly founder = 'Amadou Maiga';
  readonly vision = 'Digitaliser la gestion des boutiques en Afrique avec des outils simples, puissants et accessibles offline';
  readonly sector = 'FinTech / Commerce';

  readonly features = [
    {
      icon: 'i-Money-2',
      titleKey: 'RESSOURCES.FEAT_SALES_TITLE',
      descKey: 'RESSOURCES.FEAT_SALES_DESC',
      color: '#1a56db'
    },
    {
      icon: 'i-Box2',
      titleKey: 'RESSOURCES.FEAT_STOCK_TITLE',
      descKey: 'RESSOURCES.FEAT_STOCK_DESC',
      color: '#0ea5e9'
    },
    {
      icon: 'i-Business-ManWoman',
      titleKey: 'RESSOURCES.FEAT_CLIENTS_TITLE',
      descKey: 'RESSOURCES.FEAT_CLIENTS_DESC',
      color: '#7c3aed'
    },
    {
      icon: 'i-Bar-Chart',
      titleKey: 'RESSOURCES.FEAT_REPORTS_TITLE',
      descKey: 'RESSOURCES.FEAT_REPORTS_DESC',
      color: '#16a34a'
    },
    {
      icon: 'i-Idea-5',
      titleKey: 'RESSOURCES.FEAT_AI_TITLE',
      descKey: 'RESSOURCES.FEAT_AI_DESC',
      color: '#d97706'
    },
    {
      icon: 'i-Arrow-Right',
      titleKey: 'RESSOURCES.FEAT_TRANSFERS_TITLE',
      descKey: 'RESSOURCES.FEAT_TRANSFERS_DESC',
      color: '#0891b2'
    },
    {
      icon: 'i-File-Clipboard-File--Text',
      titleKey: 'RESSOURCES.FEAT_ORDERS_TITLE',
      descKey: 'RESSOURCES.FEAT_ORDERS_DESC',
      color: '#dc2626'
    },
    {
      icon: 'i-Business-Man',
      titleKey: 'RESSOURCES.FEAT_SUPPLIERS_TITLE',
      descKey: 'RESSOURCES.FEAT_SUPPLIERS_DESC',
      color: '#be185d'
    }
  ];

  openLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openEmail(): void {
    window.location.href = 'mailto:' + this.email;
  }
}
