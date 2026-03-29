import { Injectable } from '@angular/core';
import { Article } from './article.model';

const STORAGE_KEY = 'articles';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  getAll(): Article[] {
    return this.load();
  }

  getOne(id: string): Article | undefined {
    return this.load().find((article) => article.id === id);
  }

  create(data: Pick<Article, 'title' | 'content'>): Article {
    const articles = this.load();
    const now = new Date().toISOString();
    const article: Article = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };
    articles.push(article);
    this.save(articles);
    return article;
  }

  update(id: string, data: Partial<Pick<Article, 'title' | 'content'>>): Article | undefined {
    const articles = this.load();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return undefined;
    }
    articles[index] = {
      ...articles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.save(articles);
    return articles[index];
  }

  remove(id: string): boolean {
    const articles = this.load();
    const filtered = articles.filter((a) => a.id !== id);
    if (filtered.length === articles.length) {
      return false;
    }
    this.save(filtered);
    return true;
  }

  private load(): Article[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save(articles: Article[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  }
}
