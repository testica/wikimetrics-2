import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import { split, last, head, keys, has } from 'lodash';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';

import { Article } from './article.service';

export interface WikimetricsFiltes {
  title: string;
  locale: string;
  sort?: 'desc' | 'asc';
  page_size?: number;
}

export interface WikimetricsRevision {
  size: number;
  locale: string;
  timestamp: string;
  minor?: string;
  revid?: number;
  userid: number;
  user: string;
  title: string;
  '*': string;
}

export interface WikimetricsQuery {
  '$match'?: { [column: string]: { [operator: string]: string | number | boolean } };
  '$group'?: { [column: string]: any };
  '$sort'?: { [column: string]: number };
  '$project'?: { [column: string]: any };
  '$skip'?: number;
  '$limit'?: number;
}

export interface WikimetricsQueryResponse {
  '_id': any;
  result?: any;
  x_value?: any;
  x_label?: any;
  y_label?: any;
  y_value?: any;
}

@Injectable()
export class WikimetricsService {

  constructor(private http: Http) {}

  getFilters(f?: WikimetricsFiltes) {
    const filters = f ? f : {};
    return keys(filters).map((key) => `${key}=${filters[key]}`).join('&');
  }

  extract(title: string, locale: string) {
    const path = `${environment.WIKIMETRICS_API}/extract`;
    return this.http.get(path, { params: { title, locale } }).map(res => {
      const statusPath = res.json().Location as string;
      const lastPath = last(split(statusPath , '/'));
      if (lastPath) {
        const status = head(split(lastPath, '?'));
        if (status) {
          return status;
        }
      }
      return null;
    });
  }

  status(statusId: string) {
    const path = `${environment.WIKIMETRICS_API}/status/${statusId}?name=extract_article`;
    return this.http.get(path)
    .map(res => (res.json().state as string).toLowerCase());
  }

  count(filters: WikimetricsFiltes) {
    const path = `${environment.WIKIMETRICS_API}/count?${this.getFilters(filters)}`;
    return this.http.get(path)
    .map(res => +(res.json().count as string));
  }

  revisions(filters?: WikimetricsFiltes) {
    const path = `${environment.WIKIMETRICS_API}/revisions?${this.getFilters(filters)}`;
    return this.http.get(path)
    .map(res => res.json() as WikimetricsRevision[]);
  }

  customQuery(article: Article, query: WikimetricsQuery[]) {
    const path = `${environment.WIKIMETRICS_API}/query?date_format=%Y-%m-%d`;
    const processQuery =  query.map(
      q => has(q, '$match') ? { $match: { title: article.title, locale: article.locale, ...q.$match } } : q
    );
    return this.http.post(path, processQuery)
    .map(res => res.json() as WikimetricsQueryResponse[] );
  }
}
