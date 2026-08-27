import { nombreEnLettres } from './nombre-en-lettres.util';

/**
 * Confirmation vocale du montant d'une vente.
 *
 * Utilise UNIQUEMENT l'API native du navigateur `window.speechSynthesis` +
 * `SpeechSynthesisUtterance` (aucun service payant, aucune dépendance
 * internet). Fonctionnalité optionnelle, activée par défaut, réglable dans
 * les Paramètres de la boutique (voir `boutique-settings.component.ts`).
 *
 * Conçue pour être "fire and forget" : ne doit jamais bloquer ni ralentir la
 * validation d'une vente. Toute erreur (API absente, exception du moteur de
 * synthèse vocale...) est absorbée silencieusement — la vente doit toujours
 * continuer normalement.
 */

/** Clé localStorage du réglage utilisateur (activé par défaut si absente). */
export const CONFIRMATION_VOCALE_STORAGE_KEY = 'feat_confirmationVocale';

/** Le réglage est activé par défaut : une clé absente en localStorage vaut "activé". */
export function isConfirmationVocaleActive(): boolean {
  try {
    const valeur = localStorage.getItem(CONFIRMATION_VOCALE_STORAGE_KEY);
    return valeur === null ? true : valeur === 'true';
  } catch {
    return true;
  }
}

export function setConfirmationVocaleActive(actif: boolean): void {
  try {
    localStorage.setItem(CONFIRMATION_VOCALE_STORAGE_KEY, String(actif));
  } catch {
    // localStorage indisponible (navigation privée, quota...) : on ignore silencieusement.
  }
}

/**
 * Annonce à voix haute "Total : [montant en lettres] francs" en français,
 * si le réglage utilisateur est activé et que la synthèse vocale est
 * disponible. Ne lève jamais d'exception visible pour l'utilisateur.
 */
export function annoncerMontantVente(montant: number): void {
  try {
    if (!isConfirmationVocaleActive()) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const montantEntier = Math.round(Number(montant) || 0);
    const montantEnLettres = nombreEnLettres(montantEntier);
    if (!montantEnLettres) return;

    const texte = `Total : ${montantEnLettres} francs`;
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Fire-and-forget : la confirmation vocale ne doit jamais impacter la vente.
    console.warn('Confirmation vocale indisponible :', e);
  }
}
