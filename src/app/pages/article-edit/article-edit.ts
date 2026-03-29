import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';
import { Annotation } from '../../data/annotation/annotation.model';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';

interface ContentSegment {
  text: string;
  annotationId?: string;
  color?: string;
  note?: string;
}

@Component({
  selector: 'app-article-edit',
  imports: [FormsModule, Icon],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss',
})
export class ArticleEdit {
  protected readonly i18n = inject(I18nService);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('contentEl') contentEl!: ElementRef<HTMLElement>;

  private readonly id = this.route.snapshot.paramMap.get('id')!;
  private readonly returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl') || `/article/${this.id}`;
  title = '';
  segments: ContentSegment[] = [];
  found = false;
  submitted = false;
  private annotations: Annotation[] = [];

  get contentEmpty(): boolean {
    return !this.contentEl?.nativeElement.textContent?.trim();
  }

  constructor() {
    const article = this.articleService.getOne(this.id);
    if (article) {
      this.title = article.title;
      this.found = true;
      this.annotations = this.annotationService.getByArticle(this.id);
      this.buildSegments(article.content);
    }
  }

  save(): void {
    this.submitted = true;
    const container = this.contentEl.nativeElement;
    const newContent = container.textContent || '';

    if (!this.title.trim() || !newContent.trim()) {
      return;
    }

    // Walk annotated spans to recalculate offsets
    const spans = container.querySelectorAll<HTMLElement>('[data-annotation-id]');
    let cursor = 0;
    const updatedAnnotations: {
      id: string;
      start: number;
      end: number;
      note: string;
      color: string;
    }[] = [];

    for (const span of Array.from(spans)) {
      const id = span.dataset['annotationId']!;
      const text = span.textContent || '';
      if (!text) {
        continue;
      }
      const start = newContent.indexOf(text, cursor);
      if (start === -1) {
        continue;
      }
      const existing = this.annotations.find((a) => a.id === id);
      updatedAnnotations.push({
        id,
        start,
        end: start + text.length,
        note: existing?.note || '',
        color: existing?.color || '#ffeb3b',
      });
      cursor = start + text.length;
    }

    // Remove old annotations and create updated ones
    this.annotationService.removeByArticle(this.id);
    for (const ann of updatedAnnotations) {
      this.annotationService.create({
        articleId: this.id,
        start: ann.start,
        end: ann.end,
        note: ann.note,
        color: ann.color,
      });
    }

    this.articleService.update(this.id, { title: this.title, content: newContent });
    this.router.navigateByUrl(this.returnUrl);
  }

  cancel(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  private buildSegments(content: string): void {
    const sorted = [...this.annotations].sort((a, b) => a.start - b.start);
    const segments: ContentSegment[] = [];
    let cursor = 0;

    for (const ann of sorted) {
      if (ann.start > cursor) {
        segments.push({ text: content.slice(cursor, ann.start) });
      }
      segments.push({
        text: content.slice(ann.start, ann.end),
        annotationId: ann.id,
        color: ann.color,
        note: ann.note,
      });
      cursor = ann.end;
    }

    if (cursor < content.length) {
      segments.push({ text: content.slice(cursor) });
    }

    this.segments = segments;
  }
}
