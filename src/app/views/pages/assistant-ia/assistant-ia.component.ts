import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService, QuestionPredefinie } from '../../../shared/services/ia.service';

interface Message {
  role: 'user' | 'assistant';
  texte: string;
  heure: string;
}

interface SuggestionContextuelle {
  label: string;
  icone: string;
  question?: string;
  periode?: boolean;
}

const ICONES_EMOJI: Record<string, string> = {
  'cart-outline': '🛒',
  'stats-chart-outline': '📊',
  'phone-portrait-outline': '📱',
  'people-outline': '👥',
  'warning-outline': '⚠️',
  'bulb-outline': '💡',
  'rocket-outline': '🚀',
  'ribbon-outline': '🏆',
  'calendar-outline': '📅',
  'trending-up-outline': '📈',
  'arrow-up-circle-outline': '📤',
  'close-circle-outline': '🚫',
  'cube-outline': '📦',
  'document-text-outline': '📋',
  'help-circle-outline': '❓',
  'person-outline': '🧑‍💼',
};

// Suggestions affichées dynamiquement selon le mot-clé tapé par l'utilisateur.
const SUGGESTIONS_CONTEXTUELLES: Record<string, SuggestionContextuelle[]> = {
  vente: [
    { label: 'Ventes du jour', icone: '🛒', question: "J'ai vendu combien aujourd'hui ?" },
    { label: 'Ventes de la semaine', icone: '📅', question: 'Quel est mon bilan pour cette semaine ?' },
    { label: 'Ventes du mois', icone: '📈', question: 'Quel est mon bilan pour ce mois ?' },
    { label: 'Ventes personnalisées', icone: '🗓️', periode: true },
    { label: 'Qui a fait les ventes', icone: '🧑‍💼', question: 'Qui a fait les ventes ?' },
    { label: 'Ventes annulées', icone: '🚫', question: 'Combien de ventes annulées ce mois-ci ?' },
  ],
  stock: [
    { label: 'État du stock', icone: '📦', question: "Montre-moi l'état de mon stock de produits." },
    { label: 'Produits en alerte', icone: '⚠️', question: 'Quels produits sont en alerte de stock ?' },
    { label: 'Sorties de stock', icone: '📤', question: 'Combien de sorties de stock ce mois-ci ?' },
  ],
  credit: [
    { label: 'Clients avec des dettes', icone: '👥', question: 'Quels clients ont encore des dettes non réglées ?' },
  ],
  dette: [
    { label: 'Clients avec des dettes', icone: '👥', question: 'Quels clients ont encore des dettes non réglées ?' },
  ],
  benefice: [
    { label: 'Augmenter mes bénéfices', icone: '🚀', question: 'Fais-moi des propositions concrètes pour augmenter mes bénéfices.' },
    { label: 'Produits les plus rentables', icone: '🏆', question: 'Quels sont mes produits les plus rentables ce mois-ci ?' },
  ],
};

@Component({
  selector: 'app-assistant-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-ia.component.html',
  styleUrls: ['./assistant-ia.component.scss'],
})
export class AssistantIaComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  questions: QuestionPredefinie[] = [];
  texteLibre = '';
  loading = false;
  afficherQuestions = true;

  suggestionsContextuelles: SuggestionContextuelle[] | null = null;
  modePeriode = false;
  periodeDebut = '';
  periodeFin = '';

  constructor(private ia: IaService) {}

  ngOnInit(): void {
    this.chargerQuestions();
    this.messages.push({
      role: 'assistant',
      texte: "Bonjour ! Je suis votre assistant de gestion. Posez-moi une question sur votre boutique ou choisissez parmi les suggestions ci-dessous. 😊",
      heure: this.heureActuelle(),
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  icone(id: string): string {
    return ICONES_EMOJI[id] || '💬';
  }

  chargerQuestions(): void {
    this.ia.getQuestionsPredefinies().subscribe({
      next: (q) => (this.questions = q),
      error: () => (this.questions = []),
    });
  }

  onTexteLibreChange(): void {
    const texte = this.texteLibre.trim().toLowerCase();
    this.modePeriode = false;

    if (!texte) {
      this.suggestionsContextuelles = null;
      return;
    }

    for (const motCle of Object.keys(SUGGESTIONS_CONTEXTUELLES)) {
      if (texte.includes(motCle)) {
        this.suggestionsContextuelles = SUGGESTIONS_CONTEXTUELLES[motCle];
        return;
      }
    }
    this.suggestionsContextuelles = null;
  }

  poserQuestionPredefinie(q: QuestionPredefinie): void {
    this.envoyerQuestion(q.label);
  }

  poserSuggestionContextuelle(s: SuggestionContextuelle): void {
    if (s.periode) {
      this.modePeriode = true;
      return;
    }
    if (s.question) {
      this.texteLibre = '';
      this.suggestionsContextuelles = null;
      this.envoyerQuestion(s.question);
    }
  }

  validerPeriodePersonnalisee(): void {
    if (!this.periodeDebut || !this.periodeFin) return;
    const debut = this.formaterDateFr(this.periodeDebut);
    const fin = this.formaterDateFr(this.periodeFin);
    this.modePeriode = false;
    this.suggestionsContextuelles = null;
    this.texteLibre = '';
    this.envoyerQuestion(`Quel est mon bilan du ${debut} au ${fin} ?`);
  }

  private formaterDateFr(dateISO: string): string {
    const [annee, mois, jour] = dateISO.split('-');
    return `${jour}/${mois}/${annee}`;
  }

  envoyerTexteLibre(): void {
    const question = this.texteLibre.trim();
    if (!question) return;
    this.texteLibre = '';
    this.suggestionsContextuelles = null;
    this.envoyerQuestion(question);
  }

  private envoyerQuestion(question: string): void {
    this.afficherQuestions = false;
    this.messages.push({ role: 'user', texte: question, heure: this.heureActuelle() });
    this.loading = true;

    this.ia.poserQuestion(question).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', texte: res.reponse, heure: this.heureActuelle() });
        this.loading = false;
        this.afficherQuestions = true;
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          texte: "Désolé, une erreur s'est produite. Vérifie ta connexion et réessaie.",
          heure: this.heureActuelle(),
        });
        this.loading = false;
        this.afficherQuestions = true;
      },
    });
  }

  nouvelleConversation(): void {
    this.messages = [
      {
        role: 'assistant',
        texte: "Nouvelle conversation. Que puis-je faire pour vous aujourd'hui ? 😊",
        heure: this.heureActuelle(),
      },
    ];
    this.afficherQuestions = true;
    this.suggestionsContextuelles = null;
    this.modePeriode = false;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  private heureActuelle(): string {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
