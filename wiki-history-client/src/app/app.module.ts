import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialComponentsModule } from './material-components.module';
import { ArticlesComponent } from './articles.component';
import { ArticleComponent } from './article.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { ArticleCardComponent } from './article-card/article-card.component';
import { NavbarComponent } from './navbar/navbar.component';

import { AuthService } from './auth.service';
import { WikipediaService } from './wikipedia.service';
import { WikimetricsService } from './wikimetrics.service';
import { ArticleService } from './article.service';
import { AuthGuard } from './auth-guard.service';
import { NavbarService } from './navbar/navbar.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FlexLayoutModule,
    MaterialComponentsModule,
    HttpModule,
    JsonpModule
  ],
  declarations: [
    AppComponent,
    ArticlesComponent,
    ArticleComponent,
    SignInComponent,
    SignUpComponent,
    SearchSuggestComponent,
    ArticleCardComponent,
    NavbarComponent
  ],
  entryComponents: [
    SearchSuggestComponent
  ],
  providers: [
    AuthGuard,
    AuthService,
    WikipediaService,
    WikimetricsService,
    ArticleService,
    NavbarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
