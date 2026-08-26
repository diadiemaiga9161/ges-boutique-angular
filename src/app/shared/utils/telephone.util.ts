/**
 * Indicatifs pays partagés pour les numéros de téléphone (vendeurs, employés...).
 *
 * `digits` = nombre exact de chiffres attendu APRÈS l'indicatif pour les pays où la règle
 * est connue avec certitude (ex: Mali = 8 chiffres). Pour les autres pays, la règle exacte
 * n'est pas garantie ici : on utilise une fourchette large (voir `validatePhoneForCountry`)
 * plutôt qu'un chiffre inventé, pour ne jamais rejeter à tort un numéro valide.
 */
export interface CountryPhoneCode {
  code: string;
  flag: string;
  name: string;
  digits?: number;
}

export const COUNTRY_CODES: CountryPhoneCode[] = [
  { code: '+223', flag: '🇲🇱', name: 'Mali', digits: 8 },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", digits: 10 },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', digits: 8 },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', digits: 9 },
  { code: '+227', flag: '🇳🇪', name: 'Niger', digits: 8 },
  { code: '+228', flag: '🇹🇬', name: 'Togo', digits: 8 },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', digits: 10 },
  { code: '+224', flag: '🇬🇳', name: 'Guinée', digits: 9 },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie', digits: 8 },
  { code: '+220', flag: '🇬🇲', name: 'Gambie' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+231', flag: '🇱🇷', name: 'Libéria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana', digits: 9 },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', digits: 10 },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun', digits: 9 },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo', digits: 9 },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+236', flag: '🇨🇫', name: 'Centrafrique' },
  { code: '+235', flag: '🇹🇩', name: 'Tchad' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc', digits: 9 },
  { code: '+213', flag: '🇩🇿', name: 'Algérie', digits: 9 },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie', digits: 8 },
  { code: '+20',  flag: '🇪🇬', name: 'Égypte', digits: 10 },
  { code: '+33',  flag: '🇫🇷', name: 'France', digits: 9 },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse', digits: 9 },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada', digits: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal', digits: 9 },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne', digits: 9 },
];

/** Nettoie un numéro (chiffres uniquement). */
export function nettoyerNumero(phone: string | null | undefined): string {
  return (phone || '').replace(/\D/g, '');
}

/** Valide un numéro local (sans l'indicatif) selon la règle du pays sélectionné.
 *  Si la longueur exacte du pays n'est pas connue, accepte une fourchette large (6 à 12
 *  chiffres) plutôt que de rejeter à tort un numéro correct. */
export function validatePhoneForCountry(phone: string, countryCode: string): boolean {
  const clean = nettoyerNumero(phone);
  if (!clean) return false;
  const pays = COUNTRY_CODES.find(c => c.code === countryCode);
  if (pays?.digits) return clean.length === pays.digits;
  return clean.length >= 6 && clean.length <= 12;
}

/** Construit le numéro complet (indicatif + numéro local, sans zéro initial) prêt pour l'enregistrement / WhatsApp. */
export function construireNumeroComplet(countryCode: string, telephoneLocal: string): string {
  return countryCode + (telephoneLocal || '').replace(/^0+/, '');
}

/** Sépare un numéro complet déjà enregistré (ex: "+22370010203") en indicatif détecté + reste local,
 *  pour pré-remplir un formulaire d'édition. Retourne l'indicatif par défaut (Mali) si non reconnu. */
export function separerIndicatif(telephoneComplet: string | null | undefined, defautCode = '+223'): { code: string; local: string } {
  const tel = telephoneComplet || '';
  const trouve = COUNTRY_CODES.find(c => tel.startsWith(c.code));
  if (trouve) return { code: trouve.code, local: tel.slice(trouve.code.length).trim() };
  return { code: defautCode, local: tel };
}
