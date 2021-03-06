import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';


import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { WikimetricsService } from './wikimetrics.service';
import { Visualization } from './visualization.service';
import { has, forIn, set } from 'lodash';

export interface Article {
  title: string;
  locale: string;
  extract?: { id?: string, status?: string };
  visualizations?: Visualization[];
}

@Injectable()
export class ArticleService {

  constructor(
    private http: Http,
    private authSvc: AuthService,
    private wikimetricsSvc: WikimetricsService
  ) {}

  add(article: Article) {
    const path = `${environment.API_URL}/articles`;

    // extracting from wikimetrics
    return this.wikimetricsSvc.extract(article.title, article.locale)
    .filter(wm => !!wm)
    .switchMap((state: string) => this.http.post(path, {...article, ...{ extract: {id: state}}}, {headers: this.authSvc.authHeader}))
    .map((response) => (response.json() as Article));
  }

  get(article: Article) {
    const path = `${environment.API_URL}/articles/${article.locale}/${article.title}`;

    return this.http.get(path, { headers: this.authSvc.authHeader })
    .map(response => {
     const res = response.json();
      if (has(res, 'visualizations')) {
        const vis: Visualization[] = [];
        forIn(res.visualizations, (value , key: string) => {
          vis.push({ title: key, description: value.description, query: value.query, type: value.type, preview: value.preview });
        });
        set(res, 'visualizations', vis);
      }
      return res;
    });
  }

  updateStatus(article: Article) {
    if (article.extract && article.extract.id && article.extract.status) {
      const path = `${environment.API_URL}/articles/${article.locale}/${article.title}/status`;
      return this.wikimetricsSvc.status(article.extract.id)
      .switchMap((status) => this.http.patch(`${path}/${status.toLocaleLowerCase()}`, {}, {headers: this.authSvc.authHeader}))
      .map(response => (response.json() as Article));
    } else {
      throw Observable.throw(null);
    }
  }

  getAll() {
    const path = `${environment.API_URL}/articles`;
    return this.http.get(path, { headers: this.authSvc.authHeader })
    .map(response => response.json() as Article[]);
  }

  delete(article: Article) {
    const path = `${environment.API_URL}/articles/${article.locale}/${article.title}`;
    return this.http.delete(path, { headers: this.authSvc.authHeader });
  }
}
