import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'themeMode';
const LEGACY_STORAGE_KEY = 'darkMode';

/**
 * Service central de gestion du thème (clair / sombre / auto).
 * - "auto" suit le système via prefers-color-scheme.
 * - "dark" force le mode sombre (classe body.dark-mode).
 * - "light" force le mode clair même si le système est en sombre.
 *
 * Toute la logique CSS repose uniquement sur la classe `body.dark-mode`
 * (voir src/styles.css) : ce service se charge de poser/enlever cette
 * classe, y compris en réagissant aux changements système en mode "auto".
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private mode: ThemeMode = 'auto';
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener = () => this.apply();

  constructor() {
    this.mode = this.loadMode();

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Compat anciens navigateurs (Safari < 14) / API moderne
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.mediaListener);
      } else if ((this.mediaQuery as any).addListener) {
        (this.mediaQuery as any).addListener(this.mediaListener);
      }
    }

    this.apply();
  }

  private loadMode(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }

    // Migration depuis l'ancien booléen 'darkMode'
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === 'true') return 'dark';
    if (legacy === 'false') return 'light';

    return 'auto';
  }

  getMode(): ThemeMode {
    return this.mode;
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    // On garde l'ancienne clé synchronisée pour compat avec du code existant
    localStorage.setItem(LEGACY_STORAGE_KEY, (mode === 'dark').toString());
    this.apply();
  }

  /** true si le mode sombre est effectivement actif (dark, ou auto + système sombre) */
  isDarkActive(): boolean {
    if (this.mode === 'dark') return true;
    if (this.mode === 'light') return false;
    return !!this.mediaQuery?.matches;
  }

  private apply(): void {
    const body = document?.body;
    if (!body) return;

    if (this.isDarkActive()) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
}
