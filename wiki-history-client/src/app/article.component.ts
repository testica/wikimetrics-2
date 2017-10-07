import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit {
  article$: Observable<string>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.article$ = this.route.paramMap.switchMap(params => params.getAll('title'));
  }
}
