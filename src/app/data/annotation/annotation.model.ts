export interface Annotation {
  id: string;
  articleId: string;
  start: number;
  end: number;
  note: string;
  color: string;
}

export const DEFAULT_ANNOTATION_COLOR = '#ffeb3b';
