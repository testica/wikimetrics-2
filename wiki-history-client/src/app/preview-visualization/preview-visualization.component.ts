import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Visualization } from '../visualization.service';
import { Article } from '../article.service';
import { QueryResponse, isValidQuery, completeQueryToVisualization } from '../helpers';
import { Observable } from 'rxjs/Observable';
import { WikimetricsService } from '../wikimetrics.service';

@Component({
  selector: 'app-preview-visualization',
  templateUrl: './preview-visualization.component.html',
  styleUrls: ['./preview-visualization.component.css']
})

export class PreviewVisualizationComponent implements OnChanges {
  @Input() data: { article: Article, visualization: Visualization };

  queryResponse$: Observable<QueryResponse>;
  loading = true;

  constructor(private wikimetricsSvc: WikimetricsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.isFirstChange) {
      if (this.validQuery) {
        this.queryResponse$ = this.wikimetricsSvc.customQuery(this.data.article, JSON.parse(this.data.visualization.query!))
        .filter(res => res.length > 0)
        .map(res => completeQueryToVisualization(res))
        .do(() => this.loading = false);
      }
    }
  }
  get validQuery() { return isValidQuery(this.data.visualization.query); }

  get isNumber() { return this.data.visualization.type === 'number'; }
}
