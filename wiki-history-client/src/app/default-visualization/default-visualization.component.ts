import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Visualization } from '../visualization.service';
import { ArticleService } from '../article.service';
import { QueryResponse, completeQueryToVisualization } from '../helpers';
import { WikimetricsService } from '../wikimetrics.service';
import { Visualizations } from './defaults';
import { NavbarService } from '../navbar/navbar.service';

@Component({
  selector: 'app-default-visualization',
  templateUrl: './default-visualization.component.html',
  styleUrls: ['./default-visualization.component.css']
})

export class DefaultVisualizationComponent {

  queryResponse$: Observable<QueryResponse>;
  visualization: Visualization | undefined;
  constructor(
    private wikimetricsSvc: WikimetricsService,
    private route: ActivatedRoute,
    private articleSvc: ArticleService,
    private navbarSvc: NavbarService
  ) {
    const article = {
      title: this.route.snapshot.params.title,
      locale: this.route.snapshot.params.locale
    };

    const visTitle = this.route.snapshot.params.vtitle;

    // setting navbar
    this.navbarSvc.config$.next({
      title: `Editar Visualización: ${visTitle}`, subtitle: article.title, showUser: true
    });

    // listen title from url
    this.queryResponse$ = this.articleSvc.get(article)
    .switchMap(() => {
      this.visualization = Visualizations.find(i => i.title === visTitle);
      return this.visualization ? this.wikimetricsSvc.customQuery(article, JSON.parse(this.visualization.query!))
      : of([]);
    })
    .filter(res => res.length > 0)
    .map(res => completeQueryToVisualization(res));
  }

  get isNumber() { return this.visualization!.type === 'number'; }
}
