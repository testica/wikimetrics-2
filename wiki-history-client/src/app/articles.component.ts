import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

// Observable operators
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { WikimetricsService } from './wikimetrics.service';
import { ArticleService, Article } from './article.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})


export class ArticlesComponent implements OnInit {


  articles: Article[] = [];

  private searchTerms = new Subject<string>();

  constructor(
    private router: Router,
    private wikimetricsSvc: WikimetricsService,
    private articleSvc: ArticleService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchTerms
    .debounceTime(300)
    .distinctUntilChanged()
    .subscribe((terms) => {
      this.articles = this.articles.filter(ar => ar.title.toLowerCase().search(terms) > -1);
    });
  }

  search(term: string): void {
    this.searchTerms.next(term);
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
      this.articles.push(article);
      return this.articleSvc.updateStatus(article);
    }).subscribe(article  => {
      this.articles.pop();
      this.articles.push(article);
    });
  }
}
