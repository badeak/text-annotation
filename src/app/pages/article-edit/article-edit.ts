import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';
import { DEFAULT_ANNOTATION_COLOR } from '../../data/annotation/annotation.model';
import { ContentSegment } from '../../shared/content-segment/content-segment.model';
import { buildContentSegments } from '../../shared/content-segment/content-segment.utils';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';

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

  readonly contentEl = viewChild.required<ElementRef<HTMLElement>>('contentEl');

  private readonly articleId = this.route.snapshot.paramMap.get('id')!;
  private readonly returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl') ||
    `/${this.i18n.lang()}/article/${this.articleId}`;
  title = '';
  segments: ContentSegment[] = [];
  found = false;
  submitted = false;

  get contentEmpty(): boolean {
    return !this.contentEl()?.nativeElement.textContent?.trim();
  }

  constructor() {
    const article = this.articleService.getOne(this.articleId);
    if (article) {
      this.title = article.title;
      this.found = true;
      const annotations = this.annotationService.getByArticle(this.articleId);
      this.segments = buildContentSegments(article.content, annotations);
    }
  }

  save(): void {
    this.submitted = true;
    const container = this.contentEl().nativeElement;
    const newContent = container.textContent || '';

    if (!this.title.trim() || !newContent.trim()) {
      return;
    }

    // After contenteditable editing, annotation spans may have shifted positions.
    // Walk each annotated span in DOM order, find its text in the new content
    // (using a forward-advancing cursor to handle duplicate substrings),
    // and record the updated character offsets.
    const annotatedSpans = container.querySelectorAll<HTMLElement>('[data-annotation-id]');
    let searchCursor = 0;
    const recalculatedAnnotations: {
      annotationId: string;
      start: number;
      end: number;
      note: string;
      color: string;
    }[] = [];

    for (const span of Array.from(annotatedSpans)) {
      const annotationId = span.dataset['annotationId']!;
      const spanText = span.textContent || '';
      if (!spanText) {
        continue;
      }
      const startOffset = newContent.indexOf(spanText, searchCursor);
      if (startOffset === -1) {
        continue;
      }
      const originalAnnotation = this.segments.find(
        (segment) => segment.annotation?.id === annotationId,
      )?.annotation;
      recalculatedAnnotations.push({
        annotationId,
        start: startOffset,
        end: startOffset + spanText.length,
        note: originalAnnotation?.note || '',
        color: originalAnnotation?.color || DEFAULT_ANNOTATION_COLOR,
      });
      searchCursor = startOffset + spanText.length;
    }

    // Replace all old annotations with the recalculated ones
    this.annotationService.removeByArticle(this.articleId);
    for (const annotation of recalculatedAnnotations) {
      this.annotationService.create({
        articleId: this.articleId,
        start: annotation.start,
        end: annotation.end,
        note: annotation.note,
        color: annotation.color,
      });
    }

    this.articleService.update(this.articleId, { title: this.title, content: newContent });
    this.router.navigateByUrl(this.returnUrl);
  }

  cancel(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
