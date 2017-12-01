import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

// Observable operators
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { SearchSuggestComponent } from './search-suggest/search-suggest.component';

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

  constructor(
    private router: Router,
    public dialog: MatDialog
  ) {}

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

  gotoDetail(title: string): void {
    this.router.navigate(['/articles', title]);
  }

  openDialog() {
    const dialogRef = this.dialog.open(SearchSuggestComponent, { width: '50%' });

    dialogRef.afterClosed().subscribe( (res: { title: string, locale: string } | undefined) => {
      // extract article when res is not undefined using res.title and res.locale
    });
  }


}
