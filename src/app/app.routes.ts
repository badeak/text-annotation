import { Routes } from '@angular/router';
import { ArticleList } from './pages/article-list/article-list';
import { ArticleCreate } from './pages/article-create/article-create';
import { ArticleView } from './pages/article-view/article-view';
import { ArticleEdit } from './pages/article-edit/article-edit';

export const routes: Routes = [
  {
    path: '',
    component: ArticleList,
  },
  {
    path: 'create',
    component: ArticleCreate,
  },
  {
    path: 'article/:id',
    component: ArticleView,
  },
  {
    path: 'article/:id/edit',
    component: ArticleEdit,
  },
];
