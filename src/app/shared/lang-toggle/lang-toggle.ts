import { Component, inject } from '@angular/core';
import { I18nService } from '../i18n.service';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  template: `
    <button type="button" class="lang-toggle" (click)="toggle()">
      {{ i18n.lang() === 'ru' ? 'EN' : 'RU' }}
    </button>
  `,
  styles: [
    `
      .lang-toggle {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 6px;
        cursor: pointer;
        min-width: 32px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--primary-dark);
        border: none;
        border-radius: 4px;
      }
      .lang-toggle:hover {
        background: white;
      }
    `,
  ],
})
export class LangToggle {
  protected readonly i18n = inject(I18nService);

  toggle(): void {
    this.i18n.setLang(this.i18n.lang() === 'ru' ? 'en' : 'ru');
  }
}
