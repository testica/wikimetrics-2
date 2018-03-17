import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UrlSerializer } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialComponentsModule } from './material-components.module';
import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SearchSuggestComponent } from './search-suggest/search-suggest.component';
import { ArticleCardComponent } from './article-card/article-card.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { HistoryFlowComponent } from './history-flow/history-flow.component';
import { HistoryFlowVisualizationComponent } from './history-flow/history-flow-visualization.component';
import { LoadingComponent } from './loading/loading.component';
import { NewVisualizationComponent } from './new-visualization/new-visualization.component';
import { EditVisualizationComponent } from './edit-visualization/edit-visualization.component';
import { QuerySelectorComponent } from './query-selector/query-selector.component';
import { PreviewVisualizationComponent } from './preview-visualization/preview-visualization.component';
import { DefaultVisualizationComponent } from './default-visualization/default-visualization.component';

import { AuthService } from './auth.service';
import { WikipediaService } from './wikipedia.service';
import { WikimetricsService } from './wikimetrics.service';
import { ArticleService } from './article.service';
import { AuthGuard } from './auth-guard.service';
import { NavbarService } from './navbar/navbar.service';
import { VisualizationService } from './visualization.service';
import CustomUrlSerializer from './custom-url-serializer';
import { ResizeService } from './resize.service';

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
    ArticleListComponent,
    ArticleDetailComponent,
    SignInComponent,
    SignUpComponent,
    SearchSuggestComponent,
    ArticleCardComponent,
    NavbarComponent,
    VisualizationComponent,
    HistoryFlowComponent,
    HistoryFlowVisualizationComponent,
    LoadingComponent,
    EditVisualizationComponent,
    NewVisualizationComponent,
    QuerySelectorComponent,
    PreviewVisualizationComponent,
    DefaultVisualizationComponent
  ],
  entryComponents: [
    SearchSuggestComponent,
    NewVisualizationComponent
  ],
  providers: [
    AuthGuard,
    AuthService,
    WikipediaService,
    WikimetricsService,
    ArticleService,
    NavbarService,
    VisualizationService,
    ResizeService,
    { provide: UrlSerializer, useClass: CustomUrlSerializer }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
