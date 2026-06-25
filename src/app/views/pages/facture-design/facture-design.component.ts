import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactureDesignService, DesignFacture, DESIGNS, DesignInfo } from '../../../shared/services/facture-design.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-facture-design',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './facture-design.component.html',
  styleUrls: ['./facture-design.component.scss']
})
export class FactureDesignComponent {

  designs: DesignInfo[] = DESIGNS;
  selected: DesignFacture;
  saved = false;

  constructor(private designService: FactureDesignService) {
    this.selected = this.designService.getDesign();
  }

  choisir(id: DesignFacture): void {
    this.selected = id;
    this.designService.setDesign(id);
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }
}
