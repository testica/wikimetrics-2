import { Component, Input, OnInit } from '@angular/core';
import { Article, ArticleService } from '../article.service';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})

export class ArticleCardComponent implements OnInit {
  @Input() article = <Article> {};
  refreshStatus$: BehaviorSubject<Article>;
  constructor(
    private router: Router,
    private articleSvc: ArticleService
  ) {}

  ngOnInit() {
    this.refreshStatus$ = new BehaviorSubject(this.article);

    this.refreshStatus$
    .filter(art => art.extract!.status === 'pending' || art.extract!.status === 'in progress')
    .switchMap(art => this.articleSvc.updateStatus(art))
    .subscribe((art) => {
      setTimeout(() => { this.refreshStatus$.next(art); }, 10000);
    });


  }

  get title() { return this.article.title; }
  get language() { return this.article.locale; }
  get status() { return this.article.extract!.status; }

  isPending() { return this.status === 'pending' || this.status === 'in progress'; }

  isReady() { return this.status === 'success'; }

  isFailure() { return this.status === 'failure'; }

  gotoDetail() {
    if (this.isReady()) {
      this.router.navigate(['/articles', this.title, this.language]);
    }
  }

}


