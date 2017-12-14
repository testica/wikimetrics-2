import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import { split, last, head, keys } from 'lodash';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';

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
  userid: number;
  user: string;
  title: string;
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
}
