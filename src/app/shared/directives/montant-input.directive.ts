import { Directive, ElementRef, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Directive à appliquer sur un <input type="text" inputmode="numeric" appMontantInput>
 * pour la saisie de montants FCFA (toujours des entiers, jamais de décimales).
 *
 * Pourquoi : un <input type="number"> natif ne comprend qu'UN SEUL point comme séparateur
 * décimal. Dès que l'utilisateur tape un 2e point (ex: en écrivant "1.000.000"), le champ
 * devient invalide côté navigateur, sa valeur DOM devient "" et Angular (NumberValueAccessor)
 * met silencieusement le modèle à null — alors que l'écran continue d'afficher "1.000.000".
 * L'utilisateur croit avoir saisi 1 000 000 alors que l'appli utilise 0/null.
 *
 * Ce que fait cette directive :
 * - Affiche la valeur avec des points comme séparateurs de milliers PENDANT la saisie
 *   (ex: en tapant "1000000" on voit progressivement s'afficher "1.000.000").
 * - Nettoie l'entrée (retire tout sauf les chiffres) avant de reformater, donc tolère que
 *   l'utilisateur tape déjà ses propres points ou colle un montant déjà formaté.
 * - Mais met à jour le ngModel/FormControl sous-jacent avec la valeur NUMÉRIQUE PURE
 *   (sans points), donc 100% compatible avec les bindings existants tels quels
 *   (ex: [(ngModel)]="montantPaiementGroupe") sans rien renommer côté component.ts.
 *
 * Important : cette directive s'applique à un <input type="text">, PAS type="number".
 * Les attributs HTML natifs min/max ne fonctionnent que sur type="number" — s'ils étaient
 * utilisés sur le champ d'origine, la validation correspondante doit être reportée dans le
 * component.ts (vérification avant soumission / message d'erreur), cette directive ne s'en
 * occupe pas.
 */
@Directive({
  selector: 'input[appMontantInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MontantInputDirective),
      multi: true
    }
  ],
  host: {
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()'
  }
})
export class MontantInputDirective implements ControlValueAccessor {

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private disabled = false;

  constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) {}

  writeValue(value: unknown): void {
    const num = this.toPureNumber(value);
    const digits = num === null ? '' : String(num);
    this.setDomValue(this.groupDigits(digits));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  onInput(event: Event): void {
    if (this.disabled) return;
    const input = event.target as HTMLInputElement;
    const rawValue = input.value || '';
    const caretPos = input.selectionStart ?? rawValue.length;

    // Nombre de chiffres avant le curseur, pour pouvoir replacer le curseur
    // au bon endroit après reformatage (compatible clavier ET copier-coller).
    const digitsBeforeCaret = rawValue.slice(0, caretPos).replace(/\D/g, '').length;

    const digitsOnly = rawValue.replace(/\D/g, '');
    // Retire les zéros de tête superflus (mais garde un seul "0" si c'est tout ce qui a été tapé)
    const cleanedDigits = digitsOnly.replace(/^0+(?=\d)/, '');
    const numericValue = cleanedDigits === '' ? null : parseInt(cleanedDigits, 10);

    const formatted = this.groupDigits(cleanedDigits);
    this.setDomValue(formatted);

    const newCaretPos = this.caretPositionForDigitCount(formatted, digitsBeforeCaret);
    input.setSelectionRange(newCaretPos, newCaretPos);

    this.onChange(numericValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  /** Ajoute des points comme séparateurs de milliers sur une chaîne de chiffres. */
  private groupDigits(digits: string): string {
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private setDomValue(value: string): void {
    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }

  /** Retrouve la position de curseur dans `formatted` correspondant à N chiffres saisis. */
  private caretPositionForDigitCount(formatted: string, digitCount: number): number {
    if (digitCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === digitCount) return i + 1;
      }
    }
    return formatted.length;
  }

  /** Convertit n'importe quelle valeur (number, string déjà formatée, null…) en entier pur. */
  private toPureNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return isNaN(value) ? null : Math.trunc(value);
    const digits = String(value).replace(/\D/g, '');
    if (digits === '') return null;
    return parseInt(digits, 10);
  }
}
