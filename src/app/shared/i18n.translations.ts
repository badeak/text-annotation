import { Lang } from './i18n.service';

export const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  // Buttons
  'btn.back': { ru: 'Назад', en: 'Back' },
  'btn.backToList': { ru: 'Назад к списку', en: 'Back to list' },
  'btn.create': { ru: 'Создать', en: 'Create' },
  'btn.save': { ru: 'Сохранить', en: 'Save' },
  'btn.delete': { ru: 'Удалить', en: 'Delete' },
  'btn.edit': { ru: 'Редактировать', en: 'Edit' },
  'btn.cancel': { ru: 'Отмена', en: 'Cancel' },
  'btn.annotate': { ru: 'Аннотация', en: 'Annotate' },

  // Table headers
  'table.title': { ru: 'Название', en: 'Title' },
  'table.created': { ru: 'Создано', en: 'Created' },
  'table.updated': { ru: 'Обновлено', en: 'Updated' },

  // Page titles
  'page.createArticle': { ru: 'Создание статьи', en: 'Create Article' },
  'page.editArticle': { ru: 'Редактирование статьи', en: 'Edit Article' },
  'page.addAnnotation': { ru: 'Добавить аннотацию', en: 'Add Annotation' },
  'page.editAnnotation': { ru: 'Редактировать аннотацию', en: 'Edit Annotation' },

  // Form labels
  'label.title': { ru: 'Название', en: 'Title' },
  'label.content': { ru: 'Содержание', en: 'Content' },
  'label.note': { ru: 'Заметка', en: 'Note' },
  'label.color': { ru: 'Цвет', en: 'Color' },

  // Placeholders
  'placeholder.note': { ru: 'Введите аннотацию...', en: 'Enter annotation...' },

  // Errors
  'error.titleRequired': { ru: 'Название обязательно', en: 'Title is required' },
  'error.contentRequired': { ru: 'Содержание обязательно', en: 'Content is required' },
  'error.noteRequired': { ru: 'Заметка обязательна', en: 'Note is required' },

  // Messages
  'msg.noArticles': { ru: 'Статей пока нет.', en: 'No articles yet.' },
  'msg.articleNotFound': { ru: 'Статья не найдена.', en: 'Article not found.' },
  'msg.confirmDeleteArticles': {
    ru: 'Удалить {{count}} статью(и) и все аннотации?',
    en: 'Delete {{count}} article(s) and all their annotations?',
  },
  'msg.confirmDeleteArticle': {
    ru: 'Удалить эту статью и все её аннотации?',
    en: 'Are you sure you want to delete this article and all its annotations?',
  },
  'msg.confirmRemoveAnnotation': {
    ru: 'Удалить эту аннотацию?',
    en: 'Remove this annotation?',
  },
};
