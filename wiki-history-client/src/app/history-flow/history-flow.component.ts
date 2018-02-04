import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { WikimetricsService, WikimetricsRevision } from '../wikimetrics.service';
import { ArticleService, Article } from '../article.service';
import { NavbarService } from '../navbar/navbar.service';


@Component({
  selector: 'app-history-flow',
  templateUrl: './history-flow.component.html',
  styleUrls: ['./history-flow.component.css']
})

export class HistoryFlowComponent implements OnInit {
  revisions$: Observable<WikimetricsRevision[]>;
  article$: Observable<Article>;

  visualizationLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private wikimetricsSvc: WikimetricsService,
    private articleSvc: ArticleService,
    private route: ActivatedRoute,
    private navbarSvc: NavbarService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // listen title from url
    this.article$ = this.route.paramMap.switchMap(params => {
      return this.articleSvc.get({ title: params.get('title'), locale: params.get('locale') } as Article);
    }).shareReplay();

    this.revisions$ = this.article$.switchMap(art =>
      this.wikimetricsSvc.count({ locale: art.locale, title: art.title }).switchMap(count =>
        this.wikimetricsSvc.revisions({ locale: art.locale, title: art.title, page_size: count, sort: 'asc' })
      )
    ).shareReplay();

    // setting navbar
    this.navbarSvc.config$.next({ title: 'Wiki History Flow', showUser: true });
  }

  loading(loaded: boolean) {
    this.visualizationLoaded$.next(loaded);
    this.cdr.detectChanges();
  }
}
