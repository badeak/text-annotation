import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';
import { Article } from '../../data/article/article.model';
import { Annotation } from '../../data/annotation/annotation.model';
import { ContentSegment } from '../../shared/content-segment/content-segment.model';
import { buildContentSegments } from '../../shared/content-segment/content-segment.utils';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';
import { AnnotationPanel, AnnotationSaveEvent } from '../annotation-panel/annotation-panel';

@Component({
  selector: 'app-article-view',
  imports: [RouterLink, Icon, AnnotationPanel],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ArticleView {
  protected readonly i18n = inject(I18nService);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly contentEl = viewChild.required<ElementRef<HTMLElement>>('contentEl');
  readonly annotationPanel = viewChild.required(AnnotationPanel);

  article?: Article;
  annotations: Annotation[] = [];
  segments: ContentSegment[] = [];

  hasSelection = false;
  panelOpen = false;
  editingAnnotation: Annotation | null = null;
  private pendingStart = 0;
  private pendingEnd = 0;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.article = this.articleService.getOne(id);
    if (this.article) {
      this.loadAnnotations();
    }
  }

  selectAnnotation(annotation: Annotation, event: MouseEvent): void {
    event.stopPropagation();
    this.editingAnnotation = annotation;
    this.panelOpen = true;
    this.annotationPanel().open(annotation);
  }

  /**
   * Handles clicks outside the annotation panel/content to close the panel
   * or clear the text selection.
   */
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsidePanel = !!target.closest('.annotation-panel');
    const isInsideToolbar = !!target.closest('.toolbar');
    const isInsideContent = !!target.closest('.article-content');

    // When panel is open, close it if clicking outside panel/annotated spans/toolbar
    if (this.panelOpen) {
      const isInsideAnnotatedSpan = !!target.closest('.annotated');
      if (!isInsidePanel && !isInsideAnnotatedSpan && !isInsideToolbar) {
        this.cancelAnnotation();
      }
      return;
    }

    // When panel is closed, clear text selection if clicking outside content/annotate button
    const isAnnotateButton = !!target.closest('[data-annotate]');
    if (!isInsideContent && !isAnnotateButton && this.hasSelection) {
      this.hasSelection = false;
    }
  }

  /**
   * Detects user text selection within the article content and converts the
   * browser Selection/Range into character offsets relative to the plain text.
   */
  onTextSelected(): void {
    if (this.panelOpen) {
      this.cancelAnnotation();
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !this.contentEl()) {
      this.hasSelection = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const container = this.contentEl().nativeElement;

    const startInside = container.contains(range.startContainer);
    const endInside = container.contains(range.endContainer);

    if (!startInside && !endInside) {
      this.hasSelection = false;
      return;
    }

    // Triple-click may extend the range end outside the container — clamp it
    if (!endInside) {
      range.setEndAfter(container.lastChild!);
    }

    const offsets = this.getSelectionOffsets(container, range);
    if (offsets.start === offsets.end) {
      this.hasSelection = false;
      return;
    }

    this.pendingStart = offsets.start;
    this.pendingEnd = offsets.end;
    this.hasSelection = true;
  }

  openAnnotationInput(): void {
    this.editingAnnotation = null;
    this.panelOpen = true;
    this.annotationPanel().open(null);
    window.getSelection()?.removeAllRanges();
    this.rebuildContentSegments();
  }

  onAnnotationSaved(event: AnnotationSaveEvent): void {
    if (!this.article) {
      return;
    }

    if (this.editingAnnotation) {
      // Update the existing annotation's note and color in place
      this.annotationService.update(this.editingAnnotation.id, {
        note: event.note,
        color: event.color,
      });
    } else {
      // Creating a new annotation — resolve overlaps with existing annotations.
      // Any annotation that overlaps the new selection range is removed and
      // re-created as trimmed fragments (before and/or after the new range),
      // preserving the non-overlapping portions.
      const overlappingAnnotations = this.annotations.filter(
        (annotation) => annotation.start < this.pendingEnd && annotation.end > this.pendingStart,
      );
      for (const overlapping of overlappingAnnotations) {
        this.annotationService.remove(overlapping.id);

        // Keep the portion before the new annotation
        if (overlapping.start < this.pendingStart) {
          this.annotationService.create({
            articleId: this.article.id,
            start: overlapping.start,
            end: this.pendingStart,
            note: overlapping.note,
            color: overlapping.color,
          });
        }

        // Keep the portion after the new annotation
        if (overlapping.end > this.pendingEnd) {
          this.annotationService.create({
            articleId: this.article.id,
            start: this.pendingEnd,
            end: overlapping.end,
            note: overlapping.note,
            color: overlapping.color,
          });
        }
      }

      this.annotationService.create({
        articleId: this.article.id,
        start: this.pendingStart,
        end: this.pendingEnd,
        note: event.note,
        color: event.color,
      });
    }

    this.closePanel();
    this.loadAnnotations();
  }

  cancelAnnotation(): void {
    this.closePanel();
    this.rebuildContentSegments();
  }

  removeAnnotation(): void {
    if (!this.editingAnnotation || !confirm(this.i18n.t('msg.confirmRemoveAnnotation'))) {
      return;
    }
    this.annotationService.remove(this.editingAnnotation.id);
    this.closePanel();
    this.loadAnnotations();
  }

  deleteArticle(): void {
    if (!confirm(this.i18n.t('msg.confirmDeleteArticle'))) {
      return;
    }
    this.articleService.remove(this.article!.id);
    this.annotationService.removeByArticle(this.article!.id);
    this.router.navigate(this.i18n.path());
  }

  back(): void {
    this.router.navigate(this.i18n.path());
  }

  private closePanel(): void {
    this.panelOpen = false;
    this.editingAnnotation = null;
    this.hasSelection = false;
    window.getSelection()?.removeAllRanges();
  }

  private loadAnnotations(): void {
    this.annotations = this.annotationService.getByArticle(this.article!.id);
    this.rebuildContentSegments();
  }

  private rebuildContentSegments(): void {
    let segments = buildContentSegments(this.article!.content, this.annotations);

    // Overlay pending highlight when adding a new annotation
    if (this.panelOpen && !this.editingAnnotation) {
      segments = this.applyPendingHighlight(segments);
    }

    this.segments = segments;
  }

  /**
   * Splits existing segments to overlay a "pending" highlight on the selected range.
   * Each segment is tested against the pending range and handled in three cases:
   * 1. No overlap — segment passes through unchanged
   * 2. Fully inside pending range — marked as pending
   * 3. Partial overlap — split into up to 3 parts (before, pending, after)
   */
  private applyPendingHighlight(segments: ContentSegment[]): ContentSegment[] {
    const result: ContentSegment[] = [];
    let cursor = 0;

    for (const segment of segments) {
      const segmentStart = cursor;
      const segmentEnd = cursor + segment.text.length;
      cursor = segmentEnd;

      // Case 1: No overlap with pending range
      if (segmentEnd <= this.pendingStart || segmentStart >= this.pendingEnd) {
        result.push(segment);
        continue;
      }

      // Case 2: Fully inside pending range
      if (segmentStart >= this.pendingStart && segmentEnd <= this.pendingEnd) {
        result.push({ ...segment, pending: true });
        continue;
      }

      // Case 3: Partial overlap — split the segment
      const overlapStart = Math.max(segmentStart, this.pendingStart);
      const overlapEnd = Math.min(segmentEnd, this.pendingEnd);

      if (overlapStart > segmentStart) {
        result.push({
          ...segment,
          text: segment.text.slice(0, overlapStart - segmentStart),
          pending: false,
        });
      }
      result.push({
        ...segment,
        text: segment.text.slice(overlapStart - segmentStart, overlapEnd - segmentStart),
        pending: true,
      });
      if (overlapEnd < segmentEnd) {
        result.push({
          ...segment,
          text: segment.text.slice(overlapEnd - segmentStart),
          pending: false,
        });
      }
    }

    return result;
  }

  /**
   * Converts a DOM Range into plain-text character offsets relative to the container.
   * Works by creating a temporary range from the container start to each selection
   * boundary, then measuring the resulting text length.
   */
  private getSelectionOffsets(
    container: HTMLElement,
    range: Range,
  ): { start: number; end: number } {
    const measureRange = document.createRange();
    measureRange.selectNodeContents(container);
    measureRange.setEnd(range.startContainer, range.startOffset);
    const start = measureRange.toString().length;

    measureRange.setEnd(range.endContainer, range.endOffset);
    const end = measureRange.toString().length;

    return { start, end };
  }
}
