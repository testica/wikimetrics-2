import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Article, ArticleService } from '../article.service';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})

export class ArticleCardComponent implements OnInit {
  @Input() article = <Article> {};
  @Output() refresh = new EventEmitter<void>();

  refreshStatus$: BehaviorSubject<Article>;

  statusChanged = false;

  constructor(
    private router: Router,
    private articleSvc: ArticleService
  ) {}

  ngOnInit() {
    this.refreshStatus$ = new BehaviorSubject(this.article);

    this.refreshStatus$
    .do((art) => {
      if (this.statusChanged && art.extract!.status === 'success') {
        this.refresh.emit();
      }
    })
    .filter(art => art.extract!.status === 'pending' || art.extract!.status === 'in progress')
    .switchMap(art => this.articleSvc.updateStatus(art))
    .subscribe((art) => {
      this.statusChanged = true;
      setTimeout(() => { this.refreshStatus$.next(art); }, 10000);
    });


  }

  get title() { return this.article.title; }
  get language() { return this.article.locale; }
  get status() { return this.article.extract!.status; }

  isPending() { return this.status === 'pending' || this.status === 'in progress'; }

  isReady() { return this.status === 'success'; }

  isFailure() { return this.status === 'failure'; }

  delete() {
    this.articleSvc.delete(this.article).subscribe(() => {
      this.refresh.emit();
    });
  }

  gotoDetail() {
    if (this.isReady()) {
      this.router.navigate(['/articles', this.title, this.language]);
    }
  }

}


