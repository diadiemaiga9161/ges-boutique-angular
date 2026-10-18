/**
 * Identifiant unique d'une opération, envoyé au serveur dans l'en-tête X-Client-Request-ID :
 * si la même opération est renvoyée (réseau coupé, double clic), le serveur ne l'enregistre
 * qu'une fois. crypto.randomUUID n'existe qu'en HTTPS ou sur localhost : sinon on fabrique un
 * identifiant au même format avec crypto.getRandomValues (disponible partout).
 */
export function nouvelIdentifiantDemande(): string {
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  const octets = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(octets);
  } else {
    for (let i = 0; i < 16; i++) octets[i] = Math.floor(Math.random() * 256);
  }
  octets[6] = (octets[6] & 0x0f) | 0x40; // version 4
  octets[8] = (octets[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = Array.from(octets, o => o.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
