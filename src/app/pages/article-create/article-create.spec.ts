import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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

  it('should not save with empty fields', async () => {
    const spy = vi.spyOn(router, 'navigate');
    component.save();

    expect(component.submitted).toBe(true);
    expect(spy).not.toHaveBeenCalled();
    const articles = await firstValueFrom(articleService.getAll());
    expect(articles).toHaveLength(0);
  });

  it('should not save with only title', async () => {
    component.title = 'Title';
    component.save();

    const articles = await firstValueFrom(articleService.getAll());
    expect(articles).toHaveLength(0);
  });

  it('should not save with only content', async () => {
    component.content = 'Content';
    component.save();

    const articles = await firstValueFrom(articleService.getAll());
    expect(articles).toHaveLength(0);
  });

  it('should save with valid data and navigate home', async () => {
    const spy = vi.spyOn(router, 'navigate');
    component.title = 'My Article';
    component.content = 'Some content';
    component.save();

    const articles = await firstValueFrom(articleService.getAll());
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('My Article');
    expect(spy).toHaveBeenCalledWith(['/', 'ru']);
  });

  it('should navigate home on cancel', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.cancel();
    expect(spy).toHaveBeenCalledWith(['/', 'ru']);
  });

  it('should trim whitespace-only fields as invalid', async () => {
    component.title = '   ';
    component.content = '  ';
    component.save();

    const articles = await firstValueFrom(articleService.getAll());
    expect(articles).toHaveLength(0);
  });
});
