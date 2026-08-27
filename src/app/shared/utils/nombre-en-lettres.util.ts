/**
 * Conversion d'un entier en toutes lettres françaises (0 à 999 999 999 999).
 *
 * Fonction pure : aucune dépendance externe, aucun appel réseau.
 * Utilisée notamment pour l'annonce vocale du montant total d'une vente
 * (voir `confirmation-vocale.util.ts`), mais réutilisable partout ailleurs.
 *
 * Règles orthographiques respectées :
 * - "quatre-vingts" perd son "s" final s'il est suivi d'un autre nombre
 *   (ex: 81 => "quatre-vingt-un", 80 => "quatre-vingts").
 * - "cent" prend un "s" uniquement s'il est multiplié par un nombre exact
 *   (aucun reste dans son groupe de trois chiffres) ET n'est suivi d'aucun
 *   autre adjectif numéral. "mille" bloque ce pluriel (ex: 200 => "deux
 *   cents", 201 => "deux cent un", 200 000 => "deux cent mille"), mais pas
 *   "million"/"milliard" qui sont des noms (ex: 200 000 000 => "deux cents
 *   millions").
 * - "mille" est invariable (jamais de "s"), et jamais précédé de "un"
 *   (1000 => "mille", pas "un mille").
 * - "vingt et un", "trente et un"... utilisent "et" (ainsi que
 *   "soixante et onze" pour 71), mais jamais "quatre-vingt-un" ni
 *   "quatre-vingt-onze".
 *
 * Limite gérée : entiers de 0 à 999 999 999 999 (999 milliards). Au-delà,
 * ou pour une entrée invalide (NaN, Infinity), la fonction retourne une
 * chaîne vide plutôt que de lever une exception.
 */

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre',
  'cinq', 'six', 'sept', 'huit', 'neuf'
];

// index 0 => 10, index 9 => 19
const DIX_A_DIX_NEUF = [
  'dix', 'onze', 'douze', 'treize', 'quatorze',
  'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const DIZAINES: { [chiffre: number]: string } = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
  8: 'quatre-vingt'
};

const LIMITE_MAX = 999_999_999_999;

/** Convertit un nombre de 0 à 99. `pluralisationAutorisee` indique si rien
 *  (dans le nombre complet) ne suit ce segment — condition nécessaire pour
 *  que "quatre-vingts" garde son "s". */
function convertirDizaine(n: number, pluralisationAutorisee: boolean): string {
  if (n < 10) return UNITES[n];
  if (n < 20) return DIX_A_DIX_NEUF[n - 10];

  const chiffreDizaine = Math.floor(n / 10);
  const unite = n % 10;

  // Familles composées : soixante-dix (70-79) et quatre-vingt-dix (90-99)
  if (chiffreDizaine === 7 || chiffreDizaine === 9) {
    const base = chiffreDizaine === 7 ? 'soixante' : 'quatre-vingt';
    const motTeens = DIX_A_DIX_NEUF[unite];
    // Seul 71 utilise "et" ("soixante et onze") ; 91 => "quatre-vingt-onze" (sans "et")
    if (chiffreDizaine === 7 && unite === 1) {
      return `${base} et ${motTeens}`;
    }
    return `${base}-${motTeens}`;
  }

  const motDizaine = DIZAINES[chiffreDizaine];

  if (unite === 0) {
    // Seul "quatre-vingts" (80) peut prendre un "s", et seulement si rien ne suit
    if (chiffreDizaine === 8) {
      return pluralisationAutorisee ? `${motDizaine}s` : motDizaine;
    }
    return motDizaine;
  }

  if (unite === 1 && chiffreDizaine !== 8) {
    // vingt et un, trente et un, quarante et un, cinquante et un, soixante et un
    return `${motDizaine} et un`;
  }

  // quatre-vingt-un, quatre-vingt-deux..., vingt-deux, trente-trois...
  return `${motDizaine}-${UNITES[unite]}`;
}

/** Convertit un nombre de 1 à 999. `pluralisationAutorisee` indique si rien
 *  ne suit ce groupe dans le nombre complet (condition pour le "s" de
 *  "cents" et de "quatre-vingts"). */
function convertirGroupeDeTrois(n: number, pluralisationAutorisee: boolean): string {
  const chiffreCentaine = Math.floor(n / 100);
  const reste = n % 100;

  let resultat = '';

  if (chiffreCentaine === 1) {
    resultat = 'cent';
  } else if (chiffreCentaine > 1) {
    resultat = `${UNITES[chiffreCentaine]} cent`;
    // "cents" seulement si multiple exact (reste=0) ET rien ne suit ensuite
    if (reste === 0 && pluralisationAutorisee) {
      resultat += 's';
    }
  }

  if (reste > 0) {
    const partieDizaine = convertirDizaine(reste, pluralisationAutorisee);
    resultat = resultat ? `${resultat} ${partieDizaine}` : partieDizaine;
  }

  return resultat;
}

/**
 * Convertit un entier en toutes lettres françaises.
 * @param valeur entier à convertir (les décimales éventuelles sont tronquées)
 * @returns le nombre en toutes lettres, ou '' si `valeur` est invalide ou hors limite
 */
export function nombreEnLettres(valeur: number): string {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return '';

  let n = Math.trunc(valeur);
  if (Math.abs(n) > LIMITE_MAX) return '';

  if (n === 0) return 'zéro';

  const negatif = n < 0;
  n = Math.abs(n);

  // Échelles avec leur seuil, leur mot (singulier/pluriel) et si elles bloquent
  // le pluriel du groupe qui les précède ("mille" le bloque, pas "million"/"milliard").
  const echelles: { seuil: number; singulier: string; pluriel: string; precedeDeUn: boolean }[] = [
    { seuil: 1_000_000_000, singulier: 'milliard', pluriel: 'milliards', precedeDeUn: true },
    { seuil: 1_000_000, singulier: 'million', pluriel: 'millions', precedeDeUn: true },
    { seuil: 1_000, singulier: 'mille', pluriel: 'mille', precedeDeUn: false }
  ];

  const segments: string[] = [];
  let reste = n;

  for (const echelle of echelles) {
    const compte = Math.floor(reste / echelle.seuil);
    if (compte <= 0) continue;
    reste -= compte * echelle.seuil;

    // "mille" est un adjectif numéral : il bloque le "s" de cent/quatre-vingts qui le précède.
    // "million"/"milliard" sont des noms : ils ne le bloquent pas.
    const pluralisationAutorisee = echelle.singulier !== 'mille';
    const texteCompte = convertirGroupeDeTrois(compte, pluralisationAutorisee);

    if (!echelle.precedeDeUn) {
      // "mille" : jamais "un mille"
      segments.push(compte === 1 ? echelle.singulier : `${texteCompte} ${echelle.singulier}`);
    } else {
      const mot = compte > 1 ? echelle.pluriel : echelle.singulier;
      segments.push(`${texteCompte} ${mot}`);
    }
  }

  if (reste > 0) {
    // Dernier groupe (unités) : rien ne suit, le pluriel de "cents"/"quatre-vingts" est autorisé
    segments.push(convertirGroupeDeTrois(reste, true));
  }

  const resultat = segments.join(' ');
  return negatif ? `moins ${resultat}` : resultat;
}
