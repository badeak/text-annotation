import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ArticleCreate } from './article-create';
import { ArticleService } from '../../data/article/article.service';

describe('ArticleCreate', () => {
  let component: ArticleCreate;
  let fixture: ComponentFixture<ArticleCreate>;
  let articleService: ArticleService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ArticleCreate],
      providers: [provideRouter([])],
    }).compileComponents();

    articleService = TestBed.inject(ArticleService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ArticleCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not save with empty fields', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.save();

    expect(component.submitted).toBe(true);
    expect(spy).not.toHaveBeenCalled();
    expect(articleService.getAll()).toHaveLength(0);
  });

  it('should not save with only title', () => {
    component.title = 'Title';
    component.save();

    expect(articleService.getAll()).toHaveLength(0);
  });

  it('should not save with only content', () => {
    component.content = 'Content';
    component.save();

    expect(articleService.getAll()).toHaveLength(0);
  });

  it('should save with valid data and navigate home', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.title = 'My Article';
    component.content = 'Some content';
    component.save();

    expect(articleService.getAll()).toHaveLength(1);
    expect(articleService.getAll()[0].title).toBe('My Article');
    expect(spy).toHaveBeenCalledWith(['/']);
  });

  it('should navigate home on cancel', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(spy).toHaveBeenCalledWith(['/']);
  });

  it('should trim whitespace-only fields as invalid', () => {
    component.title = '   ';
    component.content = '  ';
    component.save();

    expect(articleService.getAll()).toHaveLength(0);
  });
});
