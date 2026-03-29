import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Article } from './article.model';

const STORAGE_KEY = 'articles';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly articles$ = new BehaviorSubject<Article[]>(this.load());

  getAll(): Observable<Article[]> {
    return this.articles$.asObservable();
  }

  getOne(id: string): Article | undefined {
    return this.articles$.value.find((article) => article.id === id);
  }

  create(data: Pick<Article, 'title' | 'content'>): Article {
    const articles = this.articles$.value;
    const now = new Date().toISOString();
    const article: Article = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };
    this.saveAndEmit([...articles, article]);
    return article;
  }

  update(id: string, data: Partial<Pick<Article, 'title' | 'content'>>): Article | undefined {
    const articles = this.articles$.value;
    const index = articles.findIndex((article) => article.id === id);
    if (index === -1) {
      return undefined;
    }
    const updated = [...articles];
    updated[index] = {
      ...updated[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveAndEmit(updated);
    return updated[index];
  }

  remove(id: string): boolean {
    const articles = this.articles$.value;
    const remaining = articles.filter((article) => article.id !== id);
    if (remaining.length === articles.length) {
      return false;
    }
    this.saveAndEmit(remaining);
    return true;
  }

  private saveAndEmit(articles: Article[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    this.articles$.next(articles);
  }

  private load(): Article[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
