import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticlesComponent } from './articles.component';
import { ArticleComponent } from './article.component';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  { path: '', component: ArticlesComponent},
  { path: 'sign-in', component: SignInComponent},
  { path: 'articles/:title', component: ArticleComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
