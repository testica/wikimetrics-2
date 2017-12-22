import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DateTime } from 'luxon';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/shareReplay';

import { NavbarService } from './navbar/navbar.service';
import { Article, ArticleService } from './article.service';
import { WikimetricsService, WikimetricsRevision } from './wikimetrics.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit {
  article$: Observable<Article>;
  revisions$: Observable<WikimetricsRevision[]>;
  count$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private navbarSvc: NavbarService,
    private articleSvc: ArticleService,
    private wikimetricsSvc: WikimetricsService
  ) {}

  ngOnInit(): void {
    // listen title from url
    this.article$ = this.route.paramMap.switchMap(params => {
      return this.articleSvc.get({title: params.get('title'), locale: params.get('locale')} as Article);
    }).shareReplay();

    this.article$.subscribe(art => {
      // setting navbar
      this.navbarSvc.config$.next({title: art.title, button: 'Nueva Visualización', showUser: true});
    });

    this.revisions$ = this.article$.switchMap(art =>
      this.wikimetricsSvc.revisions({locale: art.locale, title: art.title,  page_size: 20, sort: 'desc'})
    );

    this.count$ = this.article$.switchMap(art =>
      this.wikimetricsSvc.count({locale: art.locale, title: art.title})
    );

  }

  timestamps(revs: WikimetricsRevision[]) {
    return revs.map(rev => rev.timestamp);
  }

  sizes(revs: WikimetricsRevision[]) {
    return revs.map(rev => rev.size);
  }

  lastTimestamp(rev: WikimetricsRevision) {
    return DateTime.fromISO(rev.timestamp).setLocale('es').toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
  }

  lastAuthor(rev: WikimetricsRevision) { return rev.user; }

  size(rev: WikimetricsRevision) { return rev.size; }

  getLink(art: Article) { return `https://${art.locale}.wikipedia.org/wiki/${art.title}`; }
}
