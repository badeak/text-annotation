import { Annotation } from '../../data/annotation/annotation.model';
import { ContentSegment } from './content-segment.model';

/**
 * Converts article content and its annotations into an ordered array of segments.
 * Each segment is either plain text or text linked to an annotation.
 *
 * Annotations are sorted by start offset, then the content string is sliced
 * into alternating plain-text gaps and annotated spans.
 */
export function buildContentSegments(content: string, annotations: Annotation[]): ContentSegment[] {
  const sortedAnnotations = [...annotations].sort((first, second) => first.start - second.start);
  const segments: ContentSegment[] = [];
  let cursor = 0;

  for (const annotation of sortedAnnotations) {
    if (annotation.start > cursor) {
      segments.push({ text: content.slice(cursor, annotation.start) });
    }
    segments.push({
      text: content.slice(annotation.start, annotation.end),
      annotation,
    });
    cursor = annotation.end;
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor) });
  }

  return segments;
}
