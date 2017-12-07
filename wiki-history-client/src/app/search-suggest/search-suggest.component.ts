import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilChanged';


import { WikipediaService } from '../wikipedia.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-search-suggest',
  templateUrl: './search-suggest.component.html',
  styleUrls: ['./search-suggest.component.css']
})

export class SearchSuggestComponent implements OnInit {

  suggests$: Observable<string[]>;

  searchTitle = new Subject<string>();
  suggestSelected = '';
  isSuggestSelected = false;
  locales = environment.LOCALES;
  localeSelected = this.locales[0];

  constructor(
    private wikipediaSvc: WikipediaService,
    public dialogRef: MatDialogRef<SearchSuggestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.suggests$ = this.searchTitle
    .debounceTime(300)
    .distinctUntilChanged()
    .switchMap((title) => this.wikipediaSvc.searchArticle(title, this.localeSelected));
  }

  searchSuggest(title: string): void {
    this.isSuggestSelected = false;
    this.searchTitle.next(title);
  }

  selectSuggest(title: string) {
    this.suggestSelected = title;
    this.isSuggestSelected = true;
    // reset
    this.searchTitle.next('');
  }

  changeLocale() {
    this.isSuggestSelected = false;
    this.searchTitle.next('');
  }

  addArticle() {
    this.dialogRef.close({ title: this.suggestSelected, locale: this.localeSelected });
  }


}
