import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { ArticleView } from './article-view';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';

function mockActivatedRoute(id: string) {
  return {
    snapshot: {
      paramMap: { get: (key: string) => (key === 'id' ? id : null) },
      queryParamMap: { get: () => null },
    },
  };
}

describe('ArticleView', () => {
  let articleService: ArticleService;

  beforeEach(() => {
    localStorage.clear();
  });

  function setup(articleId: string) {
    TestBed.configureTestingModule({
      imports: [ArticleView],
      providers: [
        provideRouter(routes),
        { provide: ActivatedRoute, useValue: mockActivatedRoute(articleId) },
      ],
    });
    articleService = TestBed.inject(ArticleService);
  }

  it('should create and load article', () => {
    const article = (() => {
      // Pre-create before TestBed setup
      localStorage.clear();
      const svc = new ArticleService();
      return svc.create({ title: 'Test', content: 'Hello world' });
    })();

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.article).toBeDefined();
    expect(component.article!.title).toBe('Test');
  });

  it('should handle non-existent article', () => {
    setup('non-existent');
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    expect(component.article).toBeUndefined();
  });

  it('should build segments from content and annotations', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello world test' });
    const annotationService = new AnnotationService();
    annotationService.create({
      articleId: article.id,
      start: 6,
      end: 11,
      note: 'A note',
      color: '#ff0000',
    });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    expect(component.segments.length).toBe(3);
    expect(component.segments[0].text).toBe('Hello ');
    expect(component.segments[1].text).toBe('world');
    expect(component.segments[1].annotation).toBeDefined();
    expect(component.segments[2].text).toBe(' test');
  });

  it('should open and close annotation panel', async () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.openAnnotationInput();
    expect(component.panelOpen).toBe(true);

    component.cancelAnnotation();
    expect(component.panelOpen).toBe(false);
  });

  it('should reset panel state when closing', async () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.openAnnotationInput();
    component.cancelAnnotation();

    expect(component.panelOpen).toBe(false);
    expect(component.editingAnnotation).toBeNull();
    expect(component.hasSelection).toBe(false);
  });

  it('should delete article with confirmation', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deleteArticle();

    expect(articleService.getOne(article.id)).toBeUndefined();
  });

  it('should not delete article when confirm is cancelled', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteArticle();

    expect(articleService.getOne(article.id)).toBeDefined();
  });
});
