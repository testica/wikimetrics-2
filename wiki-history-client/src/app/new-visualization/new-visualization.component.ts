import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Observable } from 'rxjs/Observable';

import { VisualizationService, Visualization } from '../visualization.service';
import { Article } from '../article.service';

@Component({
  selector: 'app-new-visualization',
  templateUrl: './new-visualization.component.html',
  styleUrls: ['./new-visualization.component.css']
})

export class NewVisualizationComponent {

  title: string;
  description: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Observable<Article>,
    public dialogRef: MatDialogRef<NewVisualizationComponent>,
    private visualizationSvc: VisualizationService
  ) {}

  get disable() { return !this.title || this.title.trim() === ''; }

  addVisualization() {
    this.data.switchMap(art => {
      return this.visualizationSvc.add(
        {title: art.title, locale: art.locale} as Article,
        {title: this.title, description: this.description} as Visualization);
    }).subscribe((vis) => this.dialogRef.close(vis));
  }

  close () {
    this.dialogRef.close();
  }
}
