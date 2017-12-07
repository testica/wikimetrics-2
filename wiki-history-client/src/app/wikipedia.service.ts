import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { pullAt, flatten } from 'lodash';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

const DEFAULT_LIMIT = 5;


@Injectable()
export class WikipediaService {

  constructor(private jsonp: Jsonp) {}

  searchArticle(title: string, locale: string) {
    if (!title.trim() || !locale) {
      return Observable.of<string[]>([]);
    }

    // Replacing locale and concat title and limit
    const path = `${environment.WIKIPEDIA_API.replace('{locale}', locale)}&search=${title}&limit=${DEFAULT_LIMIT}`;
    return this.jsonp.get(path).map(res => flatten(pullAt<string[]>(res.json(), [1])));
  }
}
