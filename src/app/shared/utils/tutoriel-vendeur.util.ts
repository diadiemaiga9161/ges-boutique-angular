/**
 * Tutoriel d'accueil pour un nouveau vendeur.
 *
 * Affiché une seule fois, automatiquement, la première fois qu'un utilisateur
 * avec le rôle VENDEUR se connecte sur un appareil donné. Une fois fermé
 * (bouton "Compris, commencer" ou croix de fermeture), il ne doit plus jamais
 * réapparaître automatiquement pour cet utilisateur sur cet appareil — sauf
 * effacement des données du navigateur, ou demande manuelle de le revoir
 * depuis le Profil.
 *
 * Convention de clé calquée sur `confirmation-vocale.util.ts` : wrapper
 * try/catch autour de localStorage.getItem/setItem, valeur par défaut si
 * absente ou en cas d'erreur (navigation privée, quota dépassé...).
 */

/** Préfixe de la clé localStorage, complété par l'id numérique de l'utilisateur. */
const TUTORIEL_VENDEUR_STORAGE_PREFIX = 'tutoriel_vendeur_vu_';

/** Construit la clé localStorage propre à un utilisateur donné. */
export function getTutorielVendeurStorageKey(userId: number): string {
  return `${TUTORIEL_VENDEUR_STORAGE_PREFIX}${userId}`;
}

/**
 * Le tutoriel est considéré comme "jamais vu" tant que la clé est absente.
 * En cas d'erreur d'accès au localStorage, on considère par prudence qu'il a
 * déjà été vu (on évite ainsi d'imposer l'overlay en boucle si le stockage
 * est indisponible).
 */
export function isTutorielVendeurVu(userId: number): boolean {
  try {
    if (!userId) return true;
    const valeur = localStorage.getItem(getTutorielVendeurStorageKey(userId));
    return valeur === 'true';
  } catch {
    return true;
  }
}

export function marquerTutorielVendeurVu(userId: number): void {
  try {
    if (!userId) return;
    localStorage.setItem(getTutorielVendeurStorageKey(userId), 'true');
  } catch {
    // localStorage indisponible (navigation privée, quota...) : on ignore silencieusement.
  }
}
