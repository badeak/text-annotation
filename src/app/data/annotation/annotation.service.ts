import { Injectable } from '@angular/core';
import { Observable, Subject, map, startWith } from 'rxjs';
import { Annotation } from './annotation.model';

const STORAGE_KEY = 'annotations';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly changed$ = new Subject<void>();

  /** Returns an observable of annotations for a specific article, re-emitting on changes. */
  getByArticle$(articleId: string): Observable<Annotation[]> {
    return this.changed$.pipe(
      startWith(undefined),
      map(() => this.load().filter((annotation) => annotation.articleId === articleId)),
    );
  }

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
    this.saveAndNotify(annotations);
    return annotation;
  }

  update(id: string, data: Partial<Pick<Annotation, 'note' | 'color'>>): void {
    const annotations = this.load();
    const index = annotations.findIndex((annotation) => annotation.id === id);
    if (index !== -1) {
      annotations[index] = { ...annotations[index], ...data };
      this.saveAndNotify(annotations);
    }
  }

  remove(id: string): void {
    this.saveAndNotify(this.load().filter((annotation) => annotation.id !== id));
  }

  removeByArticle(articleId: string): void {
    this.saveAndNotify(this.load().filter((annotation) => annotation.articleId !== articleId));
  }

  private saveAndNotify(annotations: Annotation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    this.changed$.next();
  }

  private load(): Annotation[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
