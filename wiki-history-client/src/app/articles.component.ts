import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

// Observable operators
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

interface IArticles {
  title: string;
  id: number;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})


export class ArticlesComponent implements OnInit {

  fakeArticles: IArticles[] = [
    { id: 1, title: 'El precio de la historia'},
    { id: 2, title: 'La primera batalla'},
    { id: 3, title: 'Programación funcional'},
    { id: 4, title: 'Algoritmos genéticos'},
    { id: 6, title: 'Venezuela'}
  ];

  articles = this.fakeArticles;

  private searchTerms = new Subject<string>();

  constructor() {}

  ngOnInit(): void {
    this.searchTerms
    .debounceTime(300)
    .distinctUntilChanged()
    .subscribe((terms) => {
      this.articles = this.fakeArticles.filter(ar => ar.title.toLowerCase().search(terms) > -1);
    });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }


}
