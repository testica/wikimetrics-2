import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import { split, last, head } from 'lodash';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';

@Injectable()
export class WikimetricsService {

  constructor(private http: Http) {}

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
}
