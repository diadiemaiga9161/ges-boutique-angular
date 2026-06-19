import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  name: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français',    flag: '🇫🇷' },
  { code: 'en', name: 'English',     flag: '🇬🇧' },
  { code: 'ar', name: 'العربية',     flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Español',     flag: '🇪🇸' },
  { code: 'pt', name: 'Português',   flag: '🇵🇹' },
  { code: 'ha', name: 'Hausa',       flag: '🇳🇬' },
  { code: 'wo', name: 'Wolof',       flag: '🇸🇳' },
  { code: 'bm', name: 'Bamanakan',   flag: '🇲🇱' },
];

const STORAGE_KEY = 'app_language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages = LANGUAGES;

  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY) || 'fr';
    this.translate.addLangs(LANGUAGES.map(l => l.code));
    this.translate.setDefaultLang('fr');
    this.applyLang(saved);
  }

  setLanguage(code: string): void {
    localStorage.setItem(STORAGE_KEY, code);
    this.applyLang(code);
  }

  getCurrentCode(): string {
    return localStorage.getItem(STORAGE_KEY) || 'fr';
  }

  getCurrentLanguage(): Language {
    const code = this.getCurrentCode();
    return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
  }

  private applyLang(code: string): void {
    this.translate.use(code);
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.lang = code;
    document.documentElement.dir = lang?.dir || 'ltr';
  }
}
