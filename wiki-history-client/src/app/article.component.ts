import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { NavbarService } from './navbar/navbar.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit {
  article$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private navbarSvc: NavbarService
  ) {}

  ngOnInit(): void {
    // listen title from url
    this.article$ = this.route.paramMap.switchMap(params => params.getAll('title'));

    this.article$.subscribe(title => {
      // setting navbar
      this.navbarSvc.config$.next({title, button: 'Nueva Visualización', showUser: true});
    });
  }
}
