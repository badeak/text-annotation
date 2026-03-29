import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleList } from './article-list';
import { ArticleService } from '../../data/article/article.service';

describe('ArticleList', () => {
  let component: ArticleList;
  let fixture: ComponentFixture<ArticleList>;
  let articleService: ArticleService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ArticleList],
      providers: [provideRouter([])],
    }).compileComponents();

    articleService = TestBed.inject(ArticleService);
    fixture = TestBed.createComponent(ArticleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty message when no articles', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Статей пока нет');
  });

  it('should load articles on init', () => {
    articleService.create({ title: 'First', content: 'Content 1' });
    articleService.create({ title: 'Second', content: 'Content 2' });

    // Re-create component so it picks up articles on init
    fixture = TestBed.createComponent(ArticleList);
    component = fixture.componentInstance;

    expect(component.articles).toHaveLength(2);
    expect(component.articles[0].title).toBe('First');
    expect(component.articles[1].title).toBe('Second');
  });

  it('should toggle selection', () => {
    const article = articleService.create({ title: 'Test', content: 'X' });
    component.articles = articleService.getAll();

    component.toggleSelection(article.id);
    expect(component.selectedIds.has(article.id)).toBe(true);

    component.toggleSelection(article.id);
    expect(component.selectedIds.has(article.id)).toBe(false);
  });

  it('should toggle all', () => {
    articleService.create({ title: 'A', content: '1' });
    articleService.create({ title: 'B', content: '2' });
    component.articles = articleService.getAll();

    component.toggleAll();
    expect(component.selectedIds.size).toBe(2);
    expect(component.allSelected).toBe(true);

    component.toggleAll();
    expect(component.selectedIds.size).toBe(0);
    expect(component.allSelected).toBe(false);
  });

  it('should delete selected articles', () => {
    const a1 = articleService.create({ title: 'A', content: '1' });
    articleService.create({ title: 'B', content: '2' });
    component.articles = articleService.getAll();
    component.selectedIds.add(a1.id);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deleteSelected();

    expect(component.articles).toHaveLength(1);
    expect(component.articles[0].title).toBe('B');
    expect(component.selectedIds.size).toBe(0);
  });

  it('should not delete when confirm is cancelled', () => {
    const a1 = articleService.create({ title: 'A', content: '1' });
    component.articles = articleService.getAll();
    component.selectedIds.add(a1.id);

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteSelected();

    expect(component.articles).toHaveLength(1);
  });
});
