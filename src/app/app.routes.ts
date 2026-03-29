import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { ArticleList } from './pages/article-list/article-list';
import { ArticleCreate } from './pages/article-create/article-create';
import { ArticleView } from './pages/article-view/article-view';
import { ArticleEdit } from './pages/article-edit/article-edit';
import { DEFAULT_LANG, I18nService } from './shared/i18n.service';

function langGuard(route: ActivatedRouteSnapshot): boolean {
  const lang = route.paramMap.get('lang');
  if (lang === 'ru' || lang === 'en') {
    inject(I18nService).setLang(lang);
    return true;
  }
  return false;
}

export const routes: Routes = [
  { path: '', redirectTo: DEFAULT_LANG, pathMatch: 'full' },
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      { path: '', component: ArticleList },
      { path: 'create', component: ArticleCreate },
      { path: 'article/:id', component: ArticleView },
      { path: 'article/:id/edit', component: ArticleEdit },
    ],
  },
];
