import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import JsBarcode from 'jsbarcode';
import { environment } from '../../../../environments/environment';
import { Produit, ProductService } from '../../../shared/services/product.service';

interface LigneEtiquette {
  produit: Produit;
  choisi: boolean;
  nombre: number;
}

/** Facteur des produits vendus à la mesure (prix stocké par g / ml / cm). */
const MESURES: Record<string, { facteur: number; unite: string }> = {
  KG: { facteur: 1000, unite: 'kg' },
  L: { facteur: 1000, unite: 'L' },
  M: { facteur: 100, unite: 'm' }
};

/**
 * Étiquettes de prix sur feuille A4 (3 × 8 = 24 étiquettes de 70 × 37 mm, imprimante normale),
 * avec le code-barres du produit. Les produits sans code peuvent en recevoir un (EAN-13 interne).
 */
@Component({
  selector: 'app-etiquettes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etiquettes.component.html',
  styleUrls: ['./etiquettes.component.scss']
})
export class EtiquettesComponent implements OnInit {
  lignes: LigneEtiquette[] = [];
  recherche = '';
  categorie = '';
  chargement = false;
  generation = false;
  message = '';
  erreur = '';

  constructor(private productService: ProductService, private http: HttpClient) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.productService.getProducts().subscribe({
      next: produits => {
        const avant = new Map(this.lignes.map(l => [l.produit.id, l]));
        this.lignes = produits
          .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))
          .map(p => ({ produit: p, choisi: avant.get(p.id)?.choisi ?? false, nombre: avant.get(p.id)?.nombre ?? 1 }));
        this.chargement = false;
      },
      error: () => { this.erreur = 'Impossible de charger les produits.'; this.chargement = false; }
    });
  }

  get categories(): string[] {
    return [...new Set(this.lignes.map(l => l.produit.categorie?.nom).filter((n): n is string => !!n))].sort();
  }

  get visibles(): LigneEtiquette[] {
    const r = this.recherche.trim().toLowerCase();
    return this.lignes.filter(l =>
      (!this.categorie || l.produit.categorie?.nom === this.categorie)
      && (!r || (l.produit.nom || '').toLowerCase().includes(r) || (l.produit.codeBarre || '').includes(r)));
  }

  get sansCode(): LigneEtiquette[] {
    return this.lignes.filter(l => !l.produit.codeBarre || !l.produit.codeBarre.trim());
  }

  get totalEtiquettes(): number {
    return this.lignes.filter(l => l.choisi).reduce((s, l) => s + Math.max(0, Math.min(200, l.nombre || 0)), 0);
  }

  get toutVisibleCoche(): boolean {
    const v = this.visibles;
    return v.length > 0 && v.every(l => l.choisi);
  }

  basculerTout(): void {
    const cocher = !this.toutVisibleCoche;
    this.visibles.forEach(l => (l.choisi = cocher));
  }

  creerCodesManquants(): void {
    const ids = this.sansCode.map(l => l.produit.id);
    if (!ids.length) return;
    this.generation = true;
    this.message = '';
    this.erreur = '';
    this.http.post<{ nombreCrees: number }>(`${environment.apiUrl}/produits/codes-barres/generer`, { produitIds: ids }).subscribe({
      next: r => {
        this.message = `${r.nombreCrees} code(s)-barres créé(s).`;
        this.generation = false;
        this.charger();
      },
      error: () => { this.erreur = 'Création des codes-barres impossible.'; this.generation = false; }
    });
  }

  prixAffiche(p: Produit): string {
    const m = p.modeMesure ? MESURES[p.modeMesure] : undefined;
    const prix = (p.prixVente || 0) * (m ? m.facteur : 1);
    return Math.round(prix).toLocaleString('fr-FR') + ' F' + (m ? ' / ' + m.unite : '');
  }

  imprimer(): void {
    const choisis = this.lignes.filter(l => l.choisi && l.nombre > 0);
    if (!choisis.length) return;
    const etiquettes: string[] = [];
    for (const l of choisis) {
      const html = this.etiquette(l.produit);
      for (let i = 0; i < Math.min(200, l.nombre); i++) etiquettes.push(html);
    }
    const fenetre = window.open('', '_blank');
    if (!fenetre) {
      this.erreur = 'Le navigateur a bloqué la fenêtre d\'impression. Autorisez les fenêtres pour ce site.';
      return;
    }
    fenetre.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Étiquettes</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #000; }
  .feuille { display: grid; grid-template-columns: repeat(3, 70mm); grid-auto-rows: 37.125mm; width: 210mm; }
  .et { padding: 2.5mm 3mm; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
  .nom { font-size: 9.5pt; font-weight: bold; line-height: 1.15; max-height: 2.3em; overflow: hidden; }
  .prix { font-size: 15pt; font-weight: bold; }
  .code svg { width: 100%; height: 15mm; display: block; }
  .sans-code { font-size: 8pt; color: #555; }
  @media screen { body { background: #e5e7eb; } .feuille { background: #fff; margin: 10mm auto; } .et { outline: 1px dashed #cbd5e1; } }
</style></head><body><div class="feuille">${etiquettes.join('')}</div>
<script>window.onload = function () { setTimeout(function () { window.print(); }, 300); };<\/script></body></html>`);
    fenetre.document.close();
  }

  private etiquette(p: Produit): string {
    const code = (p.codeBarre || '').trim();
    return `<div class="et"><div class="nom">${this.echapper(p.nom || '')}</div>`
      + `<div class="prix">${this.prixAffiche(p)}</div>`
      + (code ? `<div class="code">${this.svgCode(code)}</div>` : '<div class="sans-code">Pas de code-barres</div>')
      + '</div>';
  }

  /** EAN-13 / EAN-8 si le code s'y prête (contrôle compris), sinon Code 128 (tout autre code). */
  private svgCode(code: string): string {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const options = { displayValue: true, height: 40, width: 1.6, fontSize: 13, margin: 0, textMargin: 1 };
    const essais = /^\d{13}$/.test(code) ? ['EAN13', 'CODE128'] : /^\d{8}$/.test(code) ? ['EAN8', 'CODE128'] : ['CODE128'];
    for (const format of essais) {
      try {
        JsBarcode(svg, code, { ...options, format });
        return svg.outerHTML;
      } catch { /* code non valide pour ce format : essai suivant */ }
    }
    return `<div class="sans-code">${this.echapper(code)}</div>`;
  }

  private echapper(t: string): string {
    return t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }
}
