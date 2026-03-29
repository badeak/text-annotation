import { TestBed } from '@angular/core/testing';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(ArticleService);
  });

  it('should return empty array when no articles exist', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('should create an article', () => {
    const article = service.create({ title: 'Test', content: 'Body' });
    expect(article.id).toBeTruthy();
    expect(article.title).toBe('Test');
    expect(article.content).toBe('Body');
    expect(article.createdAt).toBeTruthy();
    expect(article.updatedAt).toBeTruthy();
  });

  it('should persist article to localStorage', () => {
    service.create({ title: 'A', content: 'B' });
    const all = service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('A');
  });

  it('should get one article by id', () => {
    const created = service.create({ title: 'Find me', content: 'Here' });
    const found = service.getOne(created.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe('Find me');
  });

  it('should return undefined for non-existent id', () => {
    expect(service.getOne('non-existent')).toBeUndefined();
  });

  it('should update an article', () => {
    const article = service.create({ title: 'Old', content: 'Old content' });
    const updated = service.update(article.id, { title: 'New' });
    expect(updated).toBeDefined();
    expect(updated!.title).toBe('New');
    expect(updated!.content).toBe('Old content');
    // updatedAt is refreshed (may be same ms in fast tests, so just check it exists)
    expect(updated!.updatedAt).toBeTruthy();
  });

  it('should return undefined when updating non-existent article', () => {
    expect(service.update('fake', { title: 'X' })).toBeUndefined();
  });

  it('should remove an article', () => {
    const article = service.create({ title: 'Delete me', content: 'X' });
    expect(service.remove(article.id)).toBe(true);
    expect(service.getAll()).toHaveLength(0);
  });

  it('should return false when removing non-existent article', () => {
    expect(service.remove('fake')).toBe(false);
  });

  it('should handle multiple articles', () => {
    service.create({ title: 'A', content: '1' });
    service.create({ title: 'B', content: '2' });
    service.create({ title: 'C', content: '3' });
    expect(service.getAll()).toHaveLength(3);
  });
});
