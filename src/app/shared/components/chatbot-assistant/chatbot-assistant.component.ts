import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-chatbot-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-assistant.component.html',
  styleUrls: ['./chatbot-assistant.component.scss']
})
export class ChatbotAssistantComponent {
  isOpen = false;
  userMessage = '';

  quickQuestions = [
    'Vente normale',
    'Vente a credit',
    'Paiement groupe credit',
    'Perte et benefice',
    'Caisse cloturee',
    'Vente annulee caisse',
    'Facture et caisse',
    'Rapport dynamique'
  ];

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Bonjour. Je peux aider sur les ventes normales, ventes a credit, clients, produits, categories, inventaire, caisse, factures, remises et benefices.'
    }
  ];

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(message?: string): void {
    const text = (message || this.userMessage).trim();
    if (!text) return;

    this.messages.push({ sender: 'user', text });
    this.messages.push({ sender: 'bot', text: this.getAnswer(text) });
    this.userMessage = '';
  }

  private getAnswer(question: string): string {
    const text = this.normalize(question);

    if ((text.includes('facture') && text.includes('caisse')) || this.matches(text, ['encaissement facture'])) {
      return 'Facture: apres la vente, utilisez le bouton Facture pour telecharger le PDF. Caisse: les ventes comptant sont encaissees directement, les ventes a credit sont suivies comme credit et entrent en caisse quand un reglement est enregistre.';
    }

    if (this.matches(text, ['modifier', 'annuler', 'annulation', 'detail', 'details', 'afficher'])) {
      return 'Dans Ventes, utilisez les boutons Details, Modifier ou Annuler sur la ligne de vente. Pour annuler, indiquez un motif puis confirmez. Une vente annulee remet les produits en stock. Un credit deja regle ne peut plus etre modifie ou annule.';
    }

    if (this.matches(text, ['credit', 'creance', 'echeance', 'acompte', 'reste', 'reglement'])) {
      return 'Pour une vente a credit, ouvrez Ventes puis Vente a Credit. Selectionnez ou creez le client, ajoutez les produits, indiquez la date d echeance et le montant verse si le client paie une partie. Le systeme affiche le total, le montant verse et le reste a payer.';
    }

    if (this.matches(text, ['benefice', 'perte', 'prix achat', 'prix vente', 'marge'])) {
      return 'Le benefice est calcule avec le prix unitaire saisi moins le prix d achat, multiplie par la quantite. Si le prix saisi est inferieur au prix d achat, la ligne affiche une perte.';
    }

    if (this.matches(text, ['client', 'amadou', 'historique', 'details', 'suivi'])) {
      return 'Dans Clients, cliquez sur Voir ventes. La fenetre affiche l historique complet et une section separee avec uniquement les ventes a credit, le total des credits, le montant verse et le reste a payer.';
    }

    if (this.matches(text, ['vente normale', 'vente', 'vendre', 'panier', 'comptant'])) {
      return 'Pour une vente normale, ouvrez Ventes puis Nouvelle vente. Ajoutez les produits au panier, ajustez la quantite ou le prix unitaire, choisissez le mode de paiement, renseignez la reference si ce n est pas en especes, puis enregistrez.';
    }

    if (this.matches(text, ['produit', 'article', 'categorie', 'fournisseur'])) {
      return 'Pour ajouter un produit, ouvrez Produits, cliquez sur Ajouter, renseignez nom, categorie, prix achat, prix vente, stock et fournisseur si besoin. Les categories se gerent depuis la meme page Produits, dans la zone Categories.';
    }

    if (this.matches(text, ['inventaire', 'stock', 'quantite', 'entree', 'sortie', 'ajustement'])) {
      return 'Dans Inventaire, vous suivez les entrees, sorties et ajustements de stock. Les ventes retirent automatiquement les quantites vendues. Une annulation remet les produits en stock.';
    }

    if (this.matches(text, ['facture', 'pdf', 'export'])) {
      return 'Apres une vente, cliquez sur Facture dans les actions pour telecharger ou imprimer le PDF. Les exports PDF de ventes sont disponibles dans le menu Export de la page Ventes.';
    }

    if (this.matches(text, ['caisse', 'encaissement', 'depense', 'session', 'revenu'])) {
      return 'Dans Caisse, vous suivez les ventes encaisses, les reglements de credits, les sorties et les revenus. Les ventes comptant entrent directement en caisse, les credits entrent lors des reglements.';
    }

    if (this.matches(text, ['paiement', 'orange', 'moov', 'virement', 'carte', 'reference'])) {
      return 'Pour les paiements autres qu especes, renseignez la reference de paiement avant d enregistrer la vente.';
    }

    if (this.matches(text, ['remise', 'reduction'])) {
      return 'Vous pouvez ajouter une remise par ligne ou une remise globale. Le total, le benefice ou la perte se recalculent automatiquement apres remise.';
    }

    if (this.matches(text, ['paiement groupe', 'groupe', 'plusieurs credit', 'global', 'repartition', 'reglement multiple'])) {
      return 'Dans Caisse, ouvrez la section Credits par client, cliquez sur Voir details d un client, puis sur le bouton Payer en groupe. Saisissez le montant global paye. Le systeme le repartit proportionnellement sur chaque credit selon le montant restant. Ex: si le client doit 10000 sur deux achats de 6000 et 4000 et paie 5000, il recoit 3000 sur le premier et 2000 sur le second.';
    }

    if (this.matches(text, ['perte', 'benefice net', 'bilan jour', 'solde net', 'entrees sorties', 'bilan caisse'])) {
      return 'Le bilan du jour se calcule automatiquement : Entrees - Sorties. Si les entrees depassent les sorties c est un benefice net (vert). Si les sorties depassent les entrees c est une perte nette (rouge). La carte Benefice/Perte du jour en haut de la caisse affiche ce bilan en temps reel. Les sorties sont les seules pertes : ex. benefice 5000 et sortie 10000 = perte 5000.';
    }

    if (this.matches(text, ['caisse cloturee', 'cloture', 'historique caisse', 'session caisse', 'ancienne caisse', 'archive'])) {
      return 'Quand vous fermez la caisse, la session est automatiquement sauvegardee dans le tableau Historique des caisses cloturees en bas de la page. Chaque session garde : date ouverture, fermeture, solde initial, solde final, entrees, sorties et toutes les operations. Cliquez sur Voir details pour consulter, ou PDF pour telecharger. A l ouverture d une nouvelle caisse le compteur repart de zero mais les sessions precedentes restent visibles.';
    }

    if (this.matches(text, ['annulee', 'annulation caisse', 'tracabilite', 'vente annulee'])) {
      return 'Les ventes annulees restent visibles dans l historique de la caisse pour assurer la tracabilite. Elles apparaissent en grise avec un badge ANNULEE et le texte barre. Elles ne comptent pas dans les totaux ni dans le bilan du jour. Cela vous permet de voir toutes les operations y compris les annulations.';
    }

    if (this.matches(text, ['rapport', 'dynamique', 'pdf rapport', 'telecharger rapport', 'resume periode'])) {
      return 'Les rapports de caisse sont disponibles dans le bouton Rapport en haut. Vous pouvez telecharger : rapport journalier, hebdomadaire, mensuel, annuel ou personnalise (par plage de dates). Chaque rapport contient le bilan, les entrees, les sorties, les reglements de credits et le benefice ou la perte de la periode.';
    }

    if (this.matches(text, ['fonctionnement', 'systeme', 'comment fonctionne', 'guide', 'aide', 'tout'])) {
      return 'Ce systeme gere : 1) Ventes comptant et a credit avec factures PDF. 2) Clients avec historique complet des paiements. 3) Caisse : ouverture, entrees, sorties, reglements credits, fermeture. 4) Paiement groupe : un client paye plusieurs credits d un coup avec repartition automatique. 5) Bilan dynamique : perte si sorties > entrees, benefice sinon. 6) Historique des caisses cloturees avec telechargement PDF. 7) Tracabilite : les ventes annulees restent visibles en grise. 8) Rapports PDF par periode.';
    }

    return 'Je n ai pas trouve une reponse precise. Essayez avec des mots comme vente normale, credit, paiement groupe, perte, benefice, caisse cloturee, annulee, rapport, modifier ou annuler.';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private matches(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}
