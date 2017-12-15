import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';

import { includes } from 'lodash';

declare let Plotly: any;

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})

export class VisualizationComponent implements AfterViewInit {

  @Input() chartType: 'pie' | 'bar' | 'scatter' | 'scattergl';
  @Input() chartLabels: string[];
  @Input() chartValues: number[];
  @Input() chartX: string[] | number[];
  @Input() chartY: string[] | number[];
  @Input() chartXTitle = '';
  @Input() chartYTitle = '';
  @Input() chartTitle = '';
  @Input() chartFixed = true;

  gd;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.gd = Plotly.d3.select(this.elementRef.nativeElement).style({width: '100%'}).node();
    let data;

    if (this.chartType === 'pie' && (!this.chartValues || !this.chartLabels)) {
      throw new Error('Attributes chart-type and chart-labels are required');
    }

    if (includes(['bar', 'scatter', 'scattergl'], this.chartType) && (!this.chartX || !this.chartY)) {
      throw new Error('Attributes chart-x and chart-y are required');
    }

    const layout = {
      title: this.chartTitle,
      xaxis: { title: this.chartXTitle, fixedrange: this.chartFixed},
      yaxis: { title: this.chartYTitle, fixedrange: true}
    };

    switch (this.chartType) {
      case 'pie':
        data = [{
          values: this.chartValues,
          labels: this.chartLabels,
          type: this.chartType
        }];
        break;
      case 'bar':
      case 'scatter':
      case 'scattergl':
      default:
        data = [{
          x: this.chartX,
          y: this.chartY,
          type: this.chartType
        }];
    }

    Plotly.plot(this.gd, data, layout, {displayModeBar: false});

    window.onresize = () => { Plotly.Plots.resize(this.gd); };
  }

}
