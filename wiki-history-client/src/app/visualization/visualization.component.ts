import {
  Component, Input, ElementRef,
  ChangeDetectionStrategy, OnChanges,
  NgZone, SimpleChanges
} from '@angular/core';

import { includes } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { ResizeService } from '../resize.service';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';


declare let Plotly: any;

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VisualizationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() chartType: 'pie' | 'bar' | 'scatter' | 'scattergl' | 'line' | 'area';
  @Input() chartX: string[] | number[];
  @Input() chartY: string[] | number[];
  @Input() chartXTitle = '';
  @Input() chartYTitle = '';
  @Input() chartTitle = '';
  @Input() chartZoom = false;

  gd;

  resizeSubscription: Subscription;

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
    private resizeService: ResizeService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ( changes.chartType && changes.chartType.currentValue !== changes.chartType.previousValue ||
        changes.chartX && changes.chartX.currentValue !== changes.chartX.previousValue ||
        changes.chartY && changes.chartY.currentValue !== changes.chartY.previousValue) {
      this.onInit();
    }
  }

  ngOnInit() {
    this.resizeSubscription = this.resizeService.onResize$.subscribe(() => Plotly.Plots.resize(this.gd));
    this.onInit();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  onInit() {
    this.zone.runOutsideAngular( () => {
      if (this.gd) { Plotly.purge(this.gd); }
      this.gd = Plotly.d3.select(this.elementRef.nativeElement).style({width: '100%'}).node();
      let data;

      if (includes(['bar', 'scatter', 'scattergl', 'pie'], this.chartType) && (!this.chartX || !this.chartY)) {
        throw new Error('Attributes chart-x and chart-y are required');
      }

      const layout = {
        title: this.chartTitle,
        xaxis: { title: this.chartXTitle, fixedrange: !this.chartZoom},
        yaxis: { title: this.chartYTitle, fixedrange: true},
        margin: { b: 120 }
      };

      switch (this.chartType) {
        case 'pie':
          data = [{
            values: this.chartY,
            labels: this.chartX,
            type: this.chartType
          }];
          break;
        case 'line':
          data = [{
            x: this.chartX,
            y: this.chartY,
            type: 'scatter',
            mode: 'lines'
          }];
          break;
        case 'area':
          data = [{
            x: this.chartX,
            y: this.chartY,
            fill: 'tozeroy',
            type: 'scatter'
          }];
          break;
        case 'bar':
          data = [{
            x: this.chartX,
            y: this.chartY,
            type:  this.chartType
          }];
          break;
        case 'scatter':
        case 'scattergl':
        default:
          data = [{
            x: this.chartX,
            y: this.chartY,
            type: this.chartType,
            mode: 'markers'
          }];
      }

      Plotly.plot(this.gd, data, layout, {displayModeBar: false});
    });
  }

}
