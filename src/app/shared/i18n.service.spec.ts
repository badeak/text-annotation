import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    service = TestBed.inject(I18nService);
  });

  it('should default to Russian', () => {
    expect(service.lang()).toBe('ru');
  });

  it('should switch language', () => {
    service.setLang('en');
    expect(service.lang()).toBe('en');
  });

  it('should translate Russian keys', () => {
    service.setLang('ru');
    expect(service.t('btn.back')).toBe('Назад');
    expect(service.t('btn.create')).toBe('Создать');
  });

  it('should translate English keys', () => {
    service.setLang('en');
    expect(service.t('btn.back')).toBe('Back');
    expect(service.t('btn.create')).toBe('Create');
  });

  it('should return key for unknown translations', () => {
    expect(service.t('unknown.key')).toBe('unknown.key');
  });

  it('should interpolate params', () => {
    service.setLang('en');
    const result = service.t('msg.confirmDeleteArticles', { count: 3 });
    expect(result).toBe('Delete 3 article(s) and all their annotations?');
  });

  it('should interpolate params in Russian', () => {
    service.setLang('ru');
    const result = service.t('msg.confirmDeleteArticles', { count: 5 });
    expect(result).toBe('Удалить 5 статью(и) и все аннотации?');
  });
});
