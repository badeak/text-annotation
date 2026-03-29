import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationPanel } from './annotation-panel';
import { DEFAULT_ANNOTATION_COLOR } from '../../data/annotation/annotation.model';

describe('AnnotationPanel', () => {
  let component: AnnotationPanel;
  let fixture: ComponentFixture<AnnotationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnotationPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.note).toBe('');
    expect(component.color).toBe(DEFAULT_ANNOTATION_COLOR);
    expect(component.submitted).toBe(false);
  });

  it('should populate fields when opened with an annotation', () => {
    const annotation = {
      id: '1',
      articleId: 'a1',
      start: 0,
      end: 5,
      note: 'Test note',
      color: '#ff0000',
    };
    component.open(annotation);

    expect(component.note).toBe('Test note');
    expect(component.color).toBe('#ff0000');
    expect(component.submitted).toBe(false);
  });

  it('should reset fields when opened with null', () => {
    component.note = 'leftover';
    component.color = '#000000';
    component.submitted = true;
    component.open(null);

    expect(component.note).toBe('');
    expect(component.color).toBe(DEFAULT_ANNOTATION_COLOR);
    expect(component.submitted).toBe(false);
  });

  it('should not emit saved when note is empty', () => {
    const spy = vi.fn();
    component.saved.subscribe(spy);
    component.note = '';
    component.onSave();

    expect(component.submitted).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit saved when note is whitespace only', () => {
    const spy = vi.fn();
    component.saved.subscribe(spy);
    component.note = '   ';
    component.onSave();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit saved with trimmed note and color', () => {
    const spy = vi.fn();
    component.saved.subscribe(spy);
    component.note = '  My note  ';
    component.color = '#00ff00';
    component.onSave();

    expect(spy).toHaveBeenCalledWith({ note: 'My note', color: '#00ff00' });
  });

  it('should emit cancelled', () => {
    const spy = vi.fn();
    component.cancelled.subscribe(spy);
    component.onCancel();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit removed', () => {
    const spy = vi.fn();
    component.removed.subscribe(spy);
    component.onRemove();

    expect(spy).toHaveBeenCalled();
  });
});
