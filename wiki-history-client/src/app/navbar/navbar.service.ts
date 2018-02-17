import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

export interface NavbarConfig {
  title?: string;
  subtitle?: string;
  button?: string;
  showUser?: boolean;
}

export const DEFAULT_CONFIG: NavbarConfig = { title: 'WikiHistory' };

@Injectable()
export class NavbarService {
  config$: BehaviorSubject<NavbarConfig>;
  click$: Subject<void>;
  constructor() {
    this.config$ = new BehaviorSubject<NavbarConfig>(DEFAULT_CONFIG);
    this.click$ = new Subject<void>();
  }

  onClick() {
    return this.click$.asObservable();
  }

}
