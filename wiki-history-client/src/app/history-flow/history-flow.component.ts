import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { WikimetricsService, WikimetricsRevision } from '../wikimetrics.service';
import { Article } from '../article.service';
import { NavbarService } from '../navbar/navbar.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { DateTime } from 'luxon';


@Component({
  selector: 'app-history-flow',
  templateUrl: './history-flow.component.html',
  styleUrls: ['./history-flow.component.css']
})

export class HistoryFlowComponent implements OnInit {
  revisions$ = new ReplaySubject<WikimetricsRevision[]>(1);
  article: Article;

  visualizationLoaded$ = new BehaviorSubject<boolean>(false);

  destroy = false;
  fromDate;
  toDate;

  constructor(
    private wikimetricsSvc: WikimetricsService,
    private route: ActivatedRoute,
    private navbarSvc: NavbarService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.article = {
      locale: this.route.snapshot.params.locale,
      title: this.route.snapshot.params.title
    };

    this.wikimetricsSvc.revisions({
      locale: this.article.locale,
      title: this.article.title,
      page_size: 200, sort: 'asc'
    })
    .subscribe(revs => {
      this.fromDate = DateTime.fromJSDate(new Date(revs[0].timestamp)).toISODate();
      this.toDate = DateTime.fromJSDate(new Date(revs[revs.length - 1].timestamp)).toISODate();
      this.revisions$.next(revs);
    });

    // setting navbar
    this.navbarSvc.config$.next({ title: 'Wiki History Flow', showUser: true });
  }

  apply() {
    this.loading(false);
    this.destroy = true;
    this.wikimetricsSvc.customQuery(this.article, [
      {
        '$match': {
          'timestamp': {
            '$gt' : DateTime.fromJSDate(new Date(this.fromDate)).toISODate(),
            '$lt' : DateTime.fromJSDate(new Date(this.toDate)).toISODate()
          }
        }
      },
      {
        '$project': { '*': 1, 'timestamp': 1, 'user': 1, 'size': 1 }
      }
    ])
    .subscribe((revs: any[]) => {
      revs.map(rev => rev.timestamp = DateTime.fromJSDate(new Date(rev.timestamp.$date)).toISODate());
      this.revisions$.next(revs);
      this.destroy = false;
    });
  }

  loading(loaded: boolean) {
    this.visualizationLoaded$.next(loaded);
    this.cdr.detectChanges();
  }
}
