import { Annotation } from '../../data/annotation/annotation.model';

export interface ContentSegment {
  text: string;
  annotation?: Annotation;
  pending?: boolean;
}
