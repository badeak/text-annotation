import { TestBed } from '@angular/core/testing';
import { AnnotationService } from './annotation.service';

describe('AnnotationService', () => {
  let service: AnnotationService;
  const articleId = 'article-1';

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(AnnotationService);
  });

  it('should return empty array when no annotations exist', () => {
    expect(service.getByArticle(articleId)).toEqual([]);
  });

  it('should create an annotation', () => {
    const ann = service.create({
      articleId,
      start: 0,
      end: 5,
      note: 'Test note',
      color: '#ff0000',
    });
    expect(ann.id).toBeTruthy();
    expect(ann.articleId).toBe(articleId);
    expect(ann.start).toBe(0);
    expect(ann.end).toBe(5);
    expect(ann.note).toBe('Test note');
    expect(ann.color).toBe('#ff0000');
  });

  it('should filter annotations by article id', () => {
    service.create({ articleId: 'a1', start: 0, end: 5, note: 'A', color: '#000' });
    service.create({ articleId: 'a2', start: 0, end: 3, note: 'B', color: '#000' });
    service.create({ articleId: 'a1', start: 10, end: 15, note: 'C', color: '#000' });

    expect(service.getByArticle('a1')).toHaveLength(2);
    expect(service.getByArticle('a2')).toHaveLength(1);
    expect(service.getByArticle('a3')).toHaveLength(0);
  });

  it('should remove an annotation by id', () => {
    const ann = service.create({ articleId, start: 0, end: 5, note: 'X', color: '#000' });
    service.remove(ann.id);
    expect(service.getByArticle(articleId)).toHaveLength(0);
  });

  it('should remove all annotations for an article', () => {
    service.create({ articleId, start: 0, end: 5, note: 'A', color: '#000' });
    service.create({ articleId, start: 10, end: 15, note: 'B', color: '#000' });
    service.create({ articleId: 'other', start: 0, end: 3, note: 'C', color: '#000' });

    service.removeByArticle(articleId);

    expect(service.getByArticle(articleId)).toHaveLength(0);
    expect(service.getByArticle('other')).toHaveLength(1);
  });
});
