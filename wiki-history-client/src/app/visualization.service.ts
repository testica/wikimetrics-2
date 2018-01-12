import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';

import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { Article } from './article.service';

export interface Visualization {
  title: string;
  description?: string;
  query?: string;
}

@Injectable()
export class VisualizationService {
  constructor(
    private http: Http,
    private authSvc: AuthService
  ) {}

  add(article: Article, vis: Visualization) {
    const path = `${environment.API_URL}/article/${article.title}/${article.locale}/visualization`;

    return this.http.post(path, vis, {headers: this.authSvc.authHeader})
    .map((response) => (response.json() as Visualization));
  }
}
