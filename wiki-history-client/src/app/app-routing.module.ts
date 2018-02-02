import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticlesComponent } from './articles.component';
import { ArticleComponent } from './article.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { EditVisualizationComponent } from './edit-visualization/edit-visualization.component';
import { AuthGuard } from './auth-guard.service';

const routes: Routes = [
  { path: '', component: ArticlesComponent, canActivate: [AuthGuard]},
  { path: 'sign-in', component: SignInComponent},
  { path: 'sign-up', component: SignUpComponent},
  { path: 'articles/:title/:locale', component: ArticleComponent, canActivate: [AuthGuard]},
  { path: 'articles/:title/:locale/edit/:vtitle', component: EditVisualizationComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
