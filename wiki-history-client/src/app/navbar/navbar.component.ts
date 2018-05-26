import { Component } from '@angular/core';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Observable';

import { NavbarService, NavbarConfig } from './navbar.service';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  config$: Observable<NavbarConfig>;
  click$: Observable<void>;

  constructor(
    private navbarSvc: NavbarService,
    private authSvc: AuthService,
    private localion: Location
  ) {
    this.config$ = this.navbarSvc.config$;
  }

  clickButton() {
    this.navbarSvc.click$.next();
  }

  goBack() {
    this.localion.back();
  }

  signOut() {
    this.authSvc.signOut();
  }
}
