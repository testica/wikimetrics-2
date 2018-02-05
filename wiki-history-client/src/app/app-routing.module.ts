import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { EditVisualizationComponent } from './edit-visualization/edit-visualization.component';
import { AuthGuard } from './auth-guard.service';
import { HistoryFlowComponent } from './history-flow/history-flow.component';

const routes: Routes = [
  { path: '', component: ArticleListComponent, canActivate: [AuthGuard]},
  { path: 'sign-in', component: SignInComponent},
  { path: 'sign-up', component: SignUpComponent},
  { path: 'articles/:locale/:title', component: ArticleDetailComponent, canActivate: [AuthGuard]},
  { path: 'articles/:locale/:title/visualizations/history-flow', component: HistoryFlowComponent, canActivate: [AuthGuard]},
  { path: 'articles/:locale/:title/visualizations/:vtitle/edit', component: EditVisualizationComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
