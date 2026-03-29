import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ArticleEdit } from './article-edit';
import { ArticleService } from '../../data/article/article.service';

function mockActivatedRoute(id: string, returnUrl?: string) {
  return {
    snapshot: {
      paramMap: { get: (key: string) => (key === 'id' ? id : null) },
      queryParamMap: { get: (key: string) => (key === 'returnUrl' ? returnUrl : null) },
    },
  };
}

describe('ArticleEdit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function setup(articleId: string) {
    TestBed.configureTestingModule({
      imports: [ArticleEdit],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute(articleId) },
      ],
    });
    return TestBed.inject(ArticleService);
  }

  it('should create and load article', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'Edit me', content: 'Content here' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleEdit);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.found).toBe(true);
    expect(component.title).toBe('Edit me');
  });

  it('should set found to false for non-existent article', () => {
    setup('fake-id');
    const fixture = TestBed.createComponent(ArticleEdit);
    const component = fixture.componentInstance;

    expect(component.found).toBe(false);
  });

  it('should build segments from content', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello world' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleEdit);
    const component = fixture.componentInstance;

    expect(component.segments.length).toBeGreaterThan(0);
    expect(component.segments.map((s) => s.text).join('')).toBe('Hello world');
  });

  it('should not save with empty title', async () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'Original', content: 'Content' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleEdit);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.title = '';
    component.save();

    expect(component.submitted).toBe(true);
    expect(svc.getOne(article.id)!.title).toBe('Original');
  });
});
