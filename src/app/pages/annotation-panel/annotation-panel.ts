import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Annotation, DEFAULT_ANNOTATION_COLOR } from '../../data/annotation/annotation.model';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';

export type AnnotationSaveEvent = Pick<Annotation, 'note' | 'color'>;

@Component({
  selector: 'app-annotation-panel',
  imports: [FormsModule, Icon],
  templateUrl: './annotation-panel.html',
  styleUrl: './annotation-panel.scss',
})
export class AnnotationPanel {
  protected readonly i18n = inject(I18nService);

  readonly editingAnnotation = input<Annotation | null>(null);
  readonly isOpen = input(false);

  readonly saved = output<AnnotationSaveEvent>();
  readonly cancelled = output<void>();
  readonly removed = output<void>();

  note = '';
  color = DEFAULT_ANNOTATION_COLOR;
  submitted = false;

  /** Called by the parent when the panel opens to set initial values. */
  open(annotation: Annotation | null): void {
    this.note = annotation?.note || '';
    this.color = annotation?.color || DEFAULT_ANNOTATION_COLOR;
    this.submitted = false;
  }

  onSave(): void {
    this.submitted = true;
    if (!this.note.trim()) {
      return;
    }
    this.saved.emit({ note: this.note.trim(), color: this.color });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onRemove(): void {
    this.removed.emit();
  }
}
