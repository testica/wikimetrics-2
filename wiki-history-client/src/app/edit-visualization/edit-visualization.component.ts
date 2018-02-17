import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { find, isObject, has, sortBy, isNull, isEmpty } from 'lodash';

import { DateTime } from 'luxon';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';

import { Article, ArticleService } from '../article.service';
import { Visualization, VisualizationService } from '../visualization.service';
import { WikimetricsQuery, WikimetricsService } from '../wikimetrics.service';
import { NavbarService } from '../navbar/navbar.service';


@Component({
  selector: 'app-edit-visualization',
  templateUrl: './edit-visualization.component.html',
  styleUrls: ['./edit-visualization.component.css']
})

export class EditVisualizationComponent implements OnInit, OnDestroy {
  visualization$: Observable<Visualization>;
  article$: Observable<Article>;

  query$: ReplaySubject<WikimetricsQuery[]> = new ReplaySubject(1);
  queryResponse$: ReplaySubject<{ x_values: any[], y_values: any[], x_label: any[], y_label: any[] }> = new ReplaySubject(1);

  onclick$: Subscription;

  visType = [
    {name: 'Número', value: 'number', requireGroup: false},
    {name: 'Linea', value: 'line', requireGroup: true},
    {name: 'Barra', value: 'bar', requireGroup: true},
    {name: 'Área', value: 'area', requireGroup: true},
    {name: 'Torta', value: 'pie', requireGroup: true},
    {name: 'Dispersion', value: 'scatter', requireGroup: true},
  ];

  selectedTypeVis;

  constructor(
    private wikimetricsSvc: WikimetricsService,
    private articleSvc: ArticleService,
    private visSvc: VisualizationService,
    private route: ActivatedRoute,
    private navbarSvc: NavbarService
  ) {}

  ngOnInit() {
    // listen title from url
    this.article$ = this.route.paramMap.switchMap(params => {
      return this.articleSvc.get({title: params.get('title'), locale: params.get('locale')} as Article);
    }).shareReplay();

    this.visualization$ = combineLatest(this.article$, this.route.paramMap)
    .switchMap(([art, params]) => {
      const vis: Visualization | undefined = find(art.visualizations, o => o.title ===  params.get('vtitle'));
      if (vis) {
        // setting navbar
        this.navbarSvc.config$.next({
          title: `Editar Visualización: ${vis.title}`, subtitle: art.title, button: 'Guardar cambios', showUser: true
        });
        return of(vis);
      }
      return _throw('No se encuenta la visualización');
    });

    this.visualization$.filter(vis =>
      !!vis.query && !isEmpty(vis.query) && vis.query.length > 0 && this.IsJSONString(vis.query))
    .subscribe(vis => {
      this.selectedTypeVis = vis.type;
      this.query$.next(JSON.parse(vis.query!));
      this.doQuery();
    });

    // subscribe to onclick of navbar button
    this.onclick$ = this.navbarSvc.onClick()
    .withLatestFrom(this.article$, this.visualization$, this.query$)
    .switchMap(([_, art, vis, query]) => {
      if (query) {
        vis.query = JSON.stringify(query);
      }
      if (this.selectedTypeVis) {
        vis.type = this.selectedTypeVis;
      }
      return this.visSvc.update(art, vis);
    }).subscribe();
  }

  ngOnDestroy() {
    this.query$.unsubscribe();
    this.onclick$.unsubscribe();
  }

  refreshQuery(query: WikimetricsQuery[]) {
    this.query$.next(query);
  }

  doQuery() {
    return combineLatest(this.article$, this.query$)
    .take(1)
    .switchMap(([art, query]) => this.wikimetricsSvc.customQuery(art, query))
    .filter(res => res.length > 0)
    .map(res => {
      if (isObject(res[0].x_value) && has(res[0].x_value, 'day') && has(res[0].x_value, 'month') && has(res[0].x_value, 'year')) {
        res = sortBy(res, i => {
          return DateTime.utc().set({year: i.x_value.year, month: i.x_value.month, day: i.x_value.day});
         });
      }
      const x_values: any[] = [];
      const y_values: any[] = [];
      res.forEach(item => {

        if (isObject(item.x_value) && (has(item.x_value, 'day') || has(item.x_value, 'month') || has(item.x_value, 'year'))) {
          // check if handle a date unit
          if (has(item.x_value, 'day') && has(item.x_value, 'month') && has(item.x_value, 'year')) {
            item.x_value = DateTime.utc()
                          .set({year: item.x_value.year, month: item.x_value.month, day: item.x_value.day})
                          .toLocaleString();
          } else if (has(item.x_value, 'month') && has(item.x_value, 'year')) {
            item.x_value = DateTime.utc()
                          .set({year: item.x_value.year, month: item.x_value.month})
                          .toFormat('MMMM, yyyy');
          } else if (has(item.x_value, 'year')) {
            item.x_value = DateTime.utc()
                          .set({year: item.x_value.year})
                          .toLocaleString({year: 'numeric'});
          } else if (has(item.x_value, 'month')) {
            item.x_value = DateTime.utc()
                          .set({month: item.x_value.month})
                          .toLocaleString({month: 'long'});
          }
        } else if (item.x_label === 'Edición Anónima') {
          // check if handle anonymous edit
          item.x_value = isNull(item.x_value) ? 'No anónima' : 'Anónima';
        } else if (item.x_label === 'Edición menor') {
          // check if handle a minor edit
          item.x_value = isNull(item.x_value) ? 'No menor' : 'Menor';
        }
        x_values.push(item.x_value);
        y_values.push(item.y_value);
      });
      return { x_values, y_values, x_label: res[0].x_label, y_label: res[0].y_label };
    })
    .subscribe(res => {
      console.log(res);
      this.queryResponse$.next(res);
     });
  }

  hasGroupResult(query: WikimetricsQuery[]) {
    const obj: WikimetricsQuery | undefined = find(query, item => item.$group);
    return !!obj && !!obj.$group && !!obj.$group._id;
  }

  get isNumber() { return this.selectedTypeVis === 'number'; }

  IsJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }
}
