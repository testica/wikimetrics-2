import { Component } from '@angular/core';
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
    private authSvc: AuthService
  ) {
    this.config$ = this.navbarSvc.config$;
  }

  clickButton() {
    this.navbarSvc.click$.next();
  }

  signOut() {
    this.authSvc.signOut();
  }
}
