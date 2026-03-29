import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../data/article/article.service';
import { Icon } from '../../shared/icon/icon';
import { I18nService } from '../../shared/i18n.service';

@Component({
  selector: 'app-article-create',
  imports: [FormsModule, Icon],
  templateUrl: './article-create.html',
  styleUrl: './article-create.scss',
})
export class ArticleCreate {
  protected readonly i18n = inject(I18nService);
  private readonly articleService = inject(ArticleService);
  private readonly router = inject(Router);

  title = '';
  content = '';
  submitted = false;

  save(): void {
    this.submitted = true;
    if (!this.title.trim() || !this.content.trim()) {
      return;
    }
    this.articleService.create({ title: this.title, content: this.content });
    this.router.navigate(['/']);
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
