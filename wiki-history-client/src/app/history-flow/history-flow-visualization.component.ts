import { Component, Input, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

import * as d3 from 'd3';
import * as Diff from 'text-diff';

import { WikimetricsRevision } from '../wikimetrics.service';

@Component({
  selector: 'app-history-flow-visualization',
  templateUrl: './history-flow-visualization.component.html',
  styleUrls: ['./history-flow-visualization.component.css']
})

export class HistoryFlowVisualizationComponent implements AfterViewInit {

  @Input() revisions: WikimetricsRevision[] = [];
  @Output() loaded = new EventEmitter<boolean>(false);

  constructor(
    private elemRef: ElementRef
  ) {}

  ngAfterViewInit() {
    const totalRev = this.revisions.length;
    let maxSize = 0;

    const diff = new Diff();

    const distanceRevs: number[] = [];

    let lastContent = '';

    this.revisions.forEach(rev => {
      // storing max size
      if (rev.size > maxSize) {
        maxSize = rev.size;
      }
      // calculating levenshtein distance
      distanceRevs.push(diff.levenshtein(diff.main(lastContent, rev['*'])));
      lastContent = rev['*'];
    });

    this.loaded.emit(true);

    // first revison always has 0 distance beacause doesn't exists the previous rev
    distanceRevs[0] = 0;

    const div = d3.select(this.elemRef.nativeElement).append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute');

    d3.select(this.elemRef.nativeElement)
    .selectAll('div.bar')
    .data(this.revisions)
    .enter().append('div').attr('class', 'bar')
    .style('width', (_, i) => `calc(${((1 / totalRev) * 100)}% + ${distanceRevs[i]}px)`)
    .style('height', rev => `${(rev.size / maxSize) * 100}%`)
    .style('background', rev => `${this.stringToColour(rev.user)}`)
    .on('mouseover', (d) => {
      div.transition()
          .duration(200)
          .style('opacity', .9);
      div	.html(`<span><strong>Usuario: </strong>${d.user}</span><br>
                 <span><strong>Tamaño: </strong>${d.size}</span><br>
                 <span><strong>Fecha: </strong>${d.timestamp}</span>`)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
    .on('mouseout', () => {
        div.transition()
            .duration(500)
            .style('opacity', 0);
    });
  }

  /**
   * Returns a string representing a hash color for the @param string
   * @param str string
   */
  stringToColour(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i ++) {
      // tslint:disable-next-line:no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i ++) {
      // tslint:disable-next-line:no-bitwise
      const value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

}
