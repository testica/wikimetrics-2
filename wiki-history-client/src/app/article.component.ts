import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { NavbarService } from './navbar/navbar.service';
import { Article, ArticleService } from './article.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit {
  article$: Observable<Article>;

  constructor(
    private route: ActivatedRoute,
    private navbarSvc: NavbarService,
    private articleSvc: ArticleService
  ) {}

  ngOnInit(): void {
    // listen title from url
    this.article$ = this.route.paramMap.switchMap(params => {
      return this.articleSvc.get({title: params.get('title'), locale: params.get('locale')} as Article);
    });

    this.article$.subscribe(art => {
      // setting navbar
      this.navbarSvc.config$.next({title: art.title, button: 'Nueva Visualización', showUser: true});
    });
  }
}
