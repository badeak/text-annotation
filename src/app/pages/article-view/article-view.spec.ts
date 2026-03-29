import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
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
  let annotationService: AnnotationService;

  beforeEach(() => {
    localStorage.clear();
  });

  function setup(articleId: string) {
    TestBed.configureTestingModule({
      imports: [ArticleView],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute(articleId) },
      ],
    });
    articleService = TestBed.inject(ArticleService);
    annotationService = TestBed.inject(AnnotationService);
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
    const annSvc = new AnnotationService();
    annSvc.create({
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

  it('should not save annotation with empty note', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    component.newNote = '';
    component.saveAnnotation();

    expect(component.annotationSubmitted).toBe(true);
    expect(annotationService.getByArticle(article.id)).toHaveLength(0);
  });

  it('should open and close annotation panel', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    component.openAnnotationInput();
    expect(component.panelOpen).toBe(true);

    component.cancelAnnotation();
    expect(component.panelOpen).toBe(false);
  });

  it('should reset state when closing panel', () => {
    const svc = new ArticleService();
    const article = svc.create({ title: 'T', content: 'Hello' });

    setup(article.id);
    const fixture = TestBed.createComponent(ArticleView);
    const component = fixture.componentInstance;

    component.newNote = 'something';
    component.newColor = '#000000';
    component.annotationSubmitted = true;
    component.cancelAnnotation();

    expect(component.newNote).toBe('');
    expect(component.newColor).toBe('#ffeb3b');
    expect(component.annotationSubmitted).toBe(false);
    expect(component.panelOpen).toBe(false);
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
