import { Component, Input, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Article, ArticleService } from '../article.service';
import { Router } from '@angular/router';

import 'rxjs/add/operator/do';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})

export class ArticleCardComponent implements OnInit, OnDestroy {
  @Input() article: Article;
  @Output() refresh = new EventEmitter<void>();

  statusChanged = false;

  destroy = false;

  constructor(
    private router: Router,
    private articleSvc: ArticleService
  ) {}

  ngOnInit() {
    this.destroy = false;
    this.refreshStatus(this.article);
  }

  refreshStatus(art: Article) {
    if (!this.destroy) {
      if (art.extract!.status === 'pending' || art.extract!.status === 'in progress') {
        this.articleSvc.updateStatus(art).subscribe(article => {
          setTimeout(() => {
            this.statusChanged = true;
            this.refreshStatus(article);
          }, 10000);
        });
      } else if (this.statusChanged) {
        this.refresh.emit();
      }
    }
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

  ngOnDestroy() {
    this.destroy = true;
  }

  gotoDetail() {
    if (this.isReady()) {
      this.router.navigate(['/articles', this.language, this.title]);
    }
  }

}


