import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { DateTime } from 'luxon';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { combineLatest } from 'rxjs/observable/combineLatest';

import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/shareReplay';

import { NavbarService } from '../navbar/navbar.service';
import { Article, ArticleService } from '../article.service';
import { WikimetricsService, WikimetricsRevision } from '../wikimetrics.service';
import { NewVisualizationComponent } from '../new-visualization/new-visualization.component';
import { Visualization, VisualizationService } from '../visualization.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ArticleDetailComponent implements OnInit, OnDestroy {
  article$: Observable<Article>;
  revisions$: Observable<WikimetricsRevision[]>;
  count$: Observable<number>;
  refresh$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  loading$: Observable<boolean>;
  onclick$: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navbarSvc: NavbarService,
    private articleSvc: ArticleService,
    private wikimetricsSvc: WikimetricsService,
    private visSvc: VisualizationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // listen title from url
    this.article$ = combineLatest(this.route.paramMap, this.refresh$).switchMap(([params]) => {
      return this.articleSvc.get({title: params.get('title'), locale: params.get('locale')} as Article);
    }).shareReplay();

    this.article$.subscribe(art => {
      // setting navbar
      this.navbarSvc.config$.next({title: art.title, button: 'Nueva Visualización', showUser: true});
    });

    this.revisions$ = this.article$.switchMap(art =>
      this.wikimetricsSvc.revisions({locale: art.locale, title: art.title,  page_size: 20, sort: 'desc'})
    ).shareReplay();

    this.count$ = this.article$.switchMap(art =>
      this.wikimetricsSvc.count({locale: art.locale, title: art.title})
    ).shareReplay();

    this.loading$ = this.revisions$.combineLatest(this.count$, (r, c) => !!r && !!c);

    // subscribe to onclick of navbar button
    this.onclick$ = this.navbarSvc.onClick().subscribe(() => {
      this.openDialog();
    });
  }

  ngOnDestroy() {
    this.onclick$.unsubscribe();
    this.refresh$.unsubscribe();
  }

  delete(article: Article, vis: Visualization) {
    this.visSvc.delete(article, vis).subscribe(() => {
      this.refresh$.next(undefined);
    });
  }

  showPreview(article: Article, vis: Visualization, value: MatSlideToggleChange) {
    this.visSvc.update(article, {... vis, preview: value.checked }).subscribe();
  }

  openDialog() {
    const dialogRef = this.dialog.open(NewVisualizationComponent, { data: this.article$, width: '50%' });

    dialogRef.afterClosed().subscribe((vis: Visualization) => {
      if (vis) { this.goToEdit(vis.title); }
    });
  }

  timestamps(revs: WikimetricsRevision[]) {
    return revs.map(rev => rev.timestamp);
  }

  sizes(revs: WikimetricsRevision[]) {
    return revs.map(rev => rev.size);
  }

  lastTimestamp(rev: WikimetricsRevision) {
    return DateTime.fromISO(rev.timestamp).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
  }

  lastAuthor(rev: WikimetricsRevision) { return rev.user; }

  size(rev: WikimetricsRevision) { return rev.size; }

  getLink(art: Article) { return `https://${art.locale}.wikipedia.org/wiki/${art.title}`; }

  goToEdit(visTitle: string) {
    this.router.navigate(['visualizations', visTitle, 'edit'], { relativeTo: this.route });
  }

  goToHistoryFlow() {
    this.router.navigate(['visualizations', 'history-flow'], { relativeTo: this.route });
  }
}
