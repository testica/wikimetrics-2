import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/shareReplay';

import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { ArticleService, Article } from './article.service';
import { NavbarService } from './navbar/navbar.service';


@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})

export class ArticlesComponent implements OnDestroy {

  articles$: Observable<Article[]>;
  onclick$: Subscription;

  loading$: Observable<boolean>;

  constructor(
    private articleSvc: ArticleService,
    public dialog: MatDialog,
    private navbarSvc: NavbarService
  ) {
    // fetching articles
    this.articles$ = this.articleSvc.getAll().shareReplay();

    this.loading$ = this.articles$.map(arts => !!arts);

    // setting navbar
    this.navbarSvc.config$.next({title: 'Artículos', button: 'Nuevo Artículo', showUser: true});

    // subscribe to onclick of navbar button
    this.onclick$ = this.navbarSvc.onClick().subscribe(() => {
      this.openDialog();
    });
  }

  ngOnDestroy(): void {
    this.onclick$.unsubscribe();
  }

  refreshArticles() {
    this.articles$ = this.articleSvc.getAll().shareReplay();
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
