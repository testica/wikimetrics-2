import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';

import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { WikimetricsService } from './wikimetrics.service';
import { ArticleService, Article } from './article.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})


export class ArticlesComponent {

  articles$: Observable<Article[]>;

  constructor(
    private router: Router,
    private wikimetricsSvc: WikimetricsService,
    private articleSvc: ArticleService,
    public dialog: MatDialog
  ) {
    this.articles$ = this.articleSvc.getAll();
  }

  gotoDetail(title: string): void {
    this.router.navigate(['/articles', title]);
  }

  openDialog() {
    const dialogRef = this.dialog.open(SearchSuggestComponent, { width: '50%' });

    dialogRef.afterClosed()
    .filter<Article>( (res: Article | null) => !!res)
    .switchMap(res => this.articleSvc.add(res))
    .switchMap(article => {
      return this.articleSvc.updateStatus(article);
    }).subscribe(article  => {
      this.articles$ = this.articleSvc.getAll();
    });
  }
}
