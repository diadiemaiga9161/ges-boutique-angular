import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RapportService, VenteParVendeurJour } from '../../../shared/services/rapport.service';

interface VendeurResume {
  vendeurId: number;
  vendeurNom: string;
  nbVentesComptant: number;
  nbVentesCredit: number;
  caComptant: number;
  caCredit: number;
  caTotal: number;
  nbVentesTotal: number;
  jours: VenteParVendeurJour[];
}

@Component({
  selector: 'app-historique-vendeur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique-vendeur.component.html',
  styleUrls: ['./historique-vendeur.component.scss']
})
export class HistoriqueVendeurComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  dateDebut = '';
  dateFin = '';

  lignes: VenteParVendeurJour[] = [];
  vendeurs: VendeurResume[] = [];
  vendeurSelectionne: VendeurResume | null = null;

  constructor(private rapportService: RapportService) {}

  ngOnInit(): void {
    const fin = new Date();
    const debut = new Date();
    debut.setDate(debut.getDate() - 29);
    this.dateFin = this.toIso(fin);
    this.dateDebut = this.toIso(debut);
    this.charger();
  }

  private toIso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  charger(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.rapportService.getVentesParVendeur(this.dateDebut, this.dateFin).subscribe({
      next: (data) => {
        this.lignes = data || [];
        this.construireResumes();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger l\'historique des ventes par vendeur.';
        this.isLoading = false;
      }
    });
  }

  private construireResumes(): void {
    const parVendeur = new Map<number, VendeurResume>();

    for (const ligne of this.lignes) {
      let resume = parVendeur.get(ligne.vendeurId);
      if (!resume) {
        resume = {
          vendeurId: ligne.vendeurId,
          vendeurNom: ligne.vendeurNom,
          nbVentesComptant: 0,
          nbVentesCredit: 0,
          caComptant: 0,
          caCredit: 0,
          caTotal: 0,
          nbVentesTotal: 0,
          jours: []
        };
        parVendeur.set(ligne.vendeurId, resume);
      }
      resume.nbVentesComptant += ligne.nbVentesComptant;
      resume.nbVentesCredit += ligne.nbVentesCredit;
      resume.caComptant += ligne.caComptant;
      resume.caCredit += ligne.caCredit;
      resume.caTotal += ligne.caTotal;
      resume.nbVentesTotal += ligne.nbVentesTotal;
      resume.jours.push(ligne);
    }

    this.vendeurs = Array.from(parVendeur.values()).sort((a, b) => b.caTotal - a.caTotal);

    // Conserver la sélection si elle existe encore, sinon prendre le premier
    if (this.vendeurSelectionne) {
      const memeVendeur = this.vendeurs.find(v => v.vendeurId === this.vendeurSelectionne!.vendeurId);
      this.vendeurSelectionne = memeVendeur || this.vendeurs[0] || null;
    } else {
      this.vendeurSelectionne = this.vendeurs[0] || null;
    }
  }

  selectionnerVendeur(v: VendeurResume): void {
    this.vendeurSelectionne = v;
  }

  formatPrice(n: number): string {
    return (n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' F CFA';
  }

  formatDate(iso: string): string {
    const [annee, mois, jour] = iso.split('-');
    return `${jour}/${mois}/${annee}`;
  }
}
