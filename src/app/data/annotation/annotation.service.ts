import { Injectable } from '@angular/core';
import { Annotation } from './annotation.model';

const STORAGE_KEY = 'annotations';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  getByArticle(articleId: string): Annotation[] {
    return this.load().filter((a) => a.articleId === articleId);
  }

  create(data: Pick<Annotation, 'articleId' | 'start' | 'end' | 'note' | 'color'>): Annotation {
    const annotations = this.load();
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      ...data,
    };
    annotations.push(annotation);
    this.save(annotations);
    return annotation;
  }

  remove(id: string): void {
    this.save(this.load().filter((a) => a.id !== id));
  }

  removeByArticle(articleId: string): void {
    this.save(this.load().filter((a) => a.articleId !== articleId));
  }

  private load(): Annotation[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save(annotations: Annotation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }
}
