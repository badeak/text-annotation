import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS } from './i18n.translations';

export type Lang = 'ru' | 'en';

export const DEFAULT_LANG: Lang = 'ru';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSignal = signal<Lang>(DEFAULT_LANG);

  readonly lang = this.langSignal.asReadonly();

  setLang(lang: Lang): void {
    this.langSignal.set(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const entry = TRANSLATIONS[key];
    if (!entry) {
      return key;
    }
    let text = entry[this.langSignal()];
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{{${param}}}`, String(value));
      }
    }
    return text;
  }

  path(...segments: string[]): string[] {
    return ['/', this.langSignal(), ...segments];
  }
}
