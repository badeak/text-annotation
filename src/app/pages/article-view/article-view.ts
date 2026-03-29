import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';
import { Article } from '../../data/article/article.model';
import { Annotation } from '../../data/annotation/annotation.model';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';

interface ContentSegment {
  text: string;
  annotation?: Annotation;
  pending?: boolean;
}

@Component({
  selector: 'app-article-view',
  imports: [RouterLink, FormsModule, Icon],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
})
export class ArticleView {
  protected readonly i18n = inject(I18nService);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('contentEl') contentEl!: ElementRef<HTMLElement>;

  article?: Article;
  annotations: Annotation[] = [];
  segments: ContentSegment[] = [];

  hasSelection = false;
  panelOpen = false;
  editingAnnotation: Annotation | null = null;
  newNote = '';
  newColor = '#ffeb3b';
  annotationSubmitted = false;
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
    this.newNote = annotation.note;
    this.newColor = annotation.color;
    this.panelOpen = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const panel = target.closest('.annotation-panel');
    const toolbar = target.closest('.toolbar');
    const content = target.closest('.article-content');

    if (this.panelOpen) {
      const annotated = target.closest('.annotated');
      if (!panel && !annotated && !toolbar) {
        this.cancelAnnotation();
      }
      return;
    }

    // Clear selection when clicking outside content area
    const isAnnotateBtn = !!target.closest('[data-annotate]');
    if (!content && !isAnnotateBtn && this.hasSelection) {
      this.hasSelection = false;
    }
  }

  onTextSelected(): void {
    if (this.panelOpen) {
      this.cancelAnnotation();
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !this.contentEl) {
      this.hasSelection = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const container = this.contentEl.nativeElement;

    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
      this.hasSelection = false;
      return;
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
    this.newNote = '';
    this.newColor = '#ffeb3b';
    this.panelOpen = true;
    window.getSelection()?.removeAllRanges();
    this.buildSegments();
  }

  saveAnnotation(): void {
    this.annotationSubmitted = true;
    if (!this.article || !this.newNote.trim()) {
      return;
    }

    if (this.editingAnnotation) {
      // Update existing annotation
      this.annotationService.remove(this.editingAnnotation.id);
      this.annotationService.create({
        articleId: this.article.id,
        start: this.editingAnnotation.start,
        end: this.editingAnnotation.end,
        note: this.newNote.trim(),
        color: this.newColor,
      });
    } else {
      // Create new — handle overlaps
      const overlapping = this.annotations.filter(
        (a) => a.start < this.pendingEnd && a.end > this.pendingStart,
      );
      for (const a of overlapping) {
        this.annotationService.remove(a.id);

        if (a.start < this.pendingStart) {
          this.annotationService.create({
            articleId: this.article.id,
            start: a.start,
            end: this.pendingStart,
            note: a.note,
            color: a.color,
          });
        }

        if (a.end > this.pendingEnd) {
          this.annotationService.create({
            articleId: this.article.id,
            start: this.pendingEnd,
            end: a.end,
            note: a.note,
            color: a.color,
          });
        }
      }

      this.annotationService.create({
        articleId: this.article.id,
        start: this.pendingStart,
        end: this.pendingEnd,
        note: this.newNote.trim(),
        color: this.newColor,
      });
    }

    this.closePanel();
    this.loadAnnotations();
  }

  cancelAnnotation(): void {
    this.closePanel();
    this.buildSegments();
  }

  removeAnnotation(): void {
    if (!this.editingAnnotation || !confirm(this.i18n.t('msg.confirmRemoveAnnotation'))) {
      return;
    }
    this.annotationService.remove(this.editingAnnotation.id);
    this.closePanel();
    this.loadAnnotations();
  }

  private closePanel(): void {
    this.panelOpen = false;
    this.editingAnnotation = null;
    this.hasSelection = false;
    this.newNote = '';
    this.newColor = '#ffeb3b';
    this.annotationSubmitted = false;
    window.getSelection()?.removeAllRanges();
  }

  deleteArticle(): void {
    if (!confirm(this.i18n.t('msg.confirmDeleteArticle'))) {
      return;
    }
    this.articleService.remove(this.article!.id);
    this.annotationService.removeByArticle(this.article!.id);
    this.router.navigate(['/']);
  }

  back(): void {
    this.router.navigate(['/']);
  }

  private loadAnnotations(): void {
    this.annotations = this.annotationService.getByArticle(this.article!.id);
    this.buildSegments();
  }

  private buildSegments(): void {
    const content = this.article!.content;
    const sorted = [...this.annotations].sort((a, b) => a.start - b.start);
    let segments: ContentSegment[] = [];
    let cursor = 0;

    for (const ann of sorted) {
      if (ann.start > cursor) {
        segments.push({ text: content.slice(cursor, ann.start) });
      }
      segments.push({ text: content.slice(ann.start, ann.end), annotation: ann });
      cursor = ann.end;
    }

    if (cursor < content.length) {
      segments.push({ text: content.slice(cursor) });
    }

    // Mark the pending selection range
    if (this.panelOpen && !this.editingAnnotation) {
      segments = this.applyPendingHighlight(segments);
    }

    this.segments = segments;
  }

  private applyPendingHighlight(segments: ContentSegment[]): ContentSegment[] {
    const result: ContentSegment[] = [];
    let cursor = 0;

    for (const seg of segments) {
      const segStart = cursor;
      const segEnd = cursor + seg.text.length;
      cursor = segEnd;

      // No overlap with pending range
      if (segEnd <= this.pendingStart || segStart >= this.pendingEnd) {
        result.push(seg);
        continue;
      }

      // Fully inside pending range
      if (segStart >= this.pendingStart && segEnd <= this.pendingEnd) {
        result.push({ ...seg, pending: true });
        continue;
      }

      const overlapStart = Math.max(segStart, this.pendingStart);
      const overlapEnd = Math.min(segEnd, this.pendingEnd);

      if (overlapStart > segStart) {
        result.push({ ...seg, text: seg.text.slice(0, overlapStart - segStart), pending: false });
      }
      result.push({
        ...seg,
        text: seg.text.slice(overlapStart - segStart, overlapEnd - segStart),
        pending: true,
      });
      if (overlapEnd < segEnd) {
        result.push({ ...seg, text: seg.text.slice(overlapEnd - segStart), pending: false });
      }
    }

    return result;
  }

  private getSelectionOffsets(
    container: HTMLElement,
    range: Range,
  ): { start: number; end: number } {
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;

    preRange.setEnd(range.endContainer, range.endOffset);
    const end = preRange.toString().length;

    return { start, end };
  }
}
