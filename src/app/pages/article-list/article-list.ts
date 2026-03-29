import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../data/article/article.service';
import { AnnotationService } from '../../data/annotation/annotation.service';
import { Article } from '../../data/article/article.model';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';
import { LangToggle } from '../../shared/lang-toggle/lang-toggle';

@Component({
  selector: 'app-article-list',
  imports: [RouterLink, DatePipe, Icon, LangToggle],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss',
})
export class ArticleList {
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);

  articles: Article[] = this.articleService.getAll();
  selectedIds = new Set<string>();

  get allSelected(): boolean {
    return this.articles.length > 0 && this.selectedIds.size === this.articles.length;
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      for (const article of this.articles) {
        this.selectedIds.add(article.id);
      }
    }
  }

  openArticle(id: string): void {
    this.router.navigate(this.i18n.path('article', id));
  }

  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  deleteSelected(): void {
    const count = this.selectedIds.size;
    if (!confirm(this.i18n.t('msg.confirmDeleteArticles', { count }))) {
      return;
    }
    for (const id of this.selectedIds) {
      this.articleService.remove(id);
      this.annotationService.removeByArticle(id);
    }
    this.selectedIds.clear();
    this.articles = this.articleService.getAll();
  }
}
