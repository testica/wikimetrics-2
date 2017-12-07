import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';

import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { ArticleService, Article } from './article.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})


export class ArticlesComponent {

  articles$: Observable<Article[]>;

  constructor(
    private articleSvc: ArticleService,
    public dialog: MatDialog
  ) {
    this.articles$ = this.articleSvc.getAll();
  }

  openDialog() {
    const dialogRef = this.dialog.open(SearchSuggestComponent, { width: '50%' });

    dialogRef.afterClosed()
    .filter<Article>( (res: Article | null) => !!res)
    .switchMap(res => this.articleSvc.add(res))
    .switchMap(article => {
      return this.articleSvc.updateStatus(article);
    }).subscribe(() => {
      this.articles$ = this.articleSvc.getAll();
    });
  }
}
