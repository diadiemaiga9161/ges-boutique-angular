/**
 * Utilitaire partagé pour l'envoi de documents (factures, reçus, PDF) par WhatsApp
 * directement au numéro déjà enregistré sur la fiche client/fournisseur.
 *
 * Utilisé par tous les endroits du système qui affichent un document imprimable
 * (facture.service.ts, vente.service.ts, caisse.service.ts, commandes.component.ts)
 * pour éviter de dupliquer 4 fois la même logique de bouton/lien WhatsApp.
 */

/** Nettoie un numéro de téléphone pour l'URL wa.me (chiffres uniquement, même règle que côté backend Promotions). */
export function nettoyerTelephone(telephone?: string | null): string {
  return (telephone || '').replace(/[^0-9]/g, '');
}

/** Ouvre WhatsApp directement sur le numéro donné avec le message pré-rempli — pour les boutons
 *  d'envoi rapide placés directement dans une liste (pas besoin d'ouvrir l'aperçu du document avant).
 *  Retourne false si aucun numéro n'est enregistré (le composant appelant peut alors prévenir l'utilisateur). */
export function envoyerWhatsAppDirect(telephone: string | null | undefined, message: string): boolean {
  const telPropre = nettoyerTelephone(telephone);
  if (!telPropre) return false;
  window.open(`https://wa.me/${telPropre}?text=${encodeURIComponent(message)}`, '_blank');
  return true;
}

/** Construit un bouton "Envoyer par WhatsApp" prêt à être ajouté à une barre d'actions de document.
 *  Si aucun numéro n'est enregistré, retourne un bouton désactivé avec une explication claire
 *  plutôt que de simplement masquer la fonctionnalité. */
export function creerBoutonWhatsApp(telephone: string | null | undefined, message: string): HTMLButtonElement {
  const btn = document.createElement('button');
  const telPropre = nettoyerTelephone(telephone);

  if (telPropre) {
    btn.innerHTML = '💬 Envoyer par WhatsApp';
    btn.style.cssText = 'background:#25D366;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer';
    btn.addEventListener('click', () => {
      window.open(`https://wa.me/${telPropre}?text=${encodeURIComponent(message)}`, '_blank');
    });
  } else {
    btn.innerHTML = '💬 Aucun numéro enregistré';
    btn.disabled = true;
    btn.title = 'Ajoutez un numéro de téléphone sur la fiche pour activer l\'envoi WhatsApp';
    btn.style.cssText = 'background:#94a3b8;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:not-allowed;opacity:.75';
  }
  return btn;
}

/** Construit un message WhatsApp complet et lisible pour un document (facture, reçu, situation...).
 *  Toujours inclure : boutique, type de document, personne concernée, date, détail (si dispo), totaux. */
export function formaterMessageWhatsApp(params: {
  boutiqueNom: string;
  boutiqueTelephone?: string;
  titreDocument: string;      // ex: "Facture de vente N°FAC-00123"
  personneLabel: string;      // "Client" ou "Fournisseur"
  personneNom: string;
  date: string;
  lignes?: string[];          // détail des produits/lignes déjà formaté, ex: "Riz 25kg ×2 — 10 000 FCFA"
  totaux: { label: string; valeur: string }[];
  notePied?: string;          // ex: référence, mode de paiement...
}): string {
  const p: string[] = [];
  p.push(`*${params.boutiqueNom}*`);
  p.push(params.titreDocument);
  p.push(`${params.personneLabel} : ${params.personneNom}`);
  p.push(`Date : ${params.date}`);

  if (params.lignes?.length) {
    p.push('');
    p.push('Détail :');
    params.lignes.forEach(l => p.push(`• ${l}`));
  }

  p.push('');
  params.totaux.forEach(t => p.push(`${t.label} : ${t.valeur}`));

  if (params.notePied) {
    p.push('');
    p.push(params.notePied);
  }

  p.push('');
  p.push('Merci de votre confiance.');
  if (params.boutiqueTelephone) p.push(`${params.boutiqueNom} — ${params.boutiqueTelephone}`);

  return p.join('\n');
}
