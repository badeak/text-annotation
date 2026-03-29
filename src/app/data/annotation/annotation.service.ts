import { Injectable } from '@angular/core';
import { Annotation } from './annotation.model';

const STORAGE_KEY = 'annotations';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  getByArticle(articleId: string): Annotation[] {
    return this.load().filter((annotation) => annotation.articleId === articleId);
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

  update(id: string, data: Partial<Pick<Annotation, 'note' | 'color'>>): void {
    const annotations = this.load();
    const index = annotations.findIndex((annotation) => annotation.id === id);
    if (index !== -1) {
      annotations[index] = { ...annotations[index], ...data };
      this.save(annotations);
    }
  }

  remove(id: string): void {
    this.save(this.load().filter((annotation) => annotation.id !== id));
  }

  removeByArticle(articleId: string): void {
    this.save(this.load().filter((annotation) => annotation.articleId !== articleId));
  }

  private load(): Annotation[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save(annotations: Annotation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }
}
