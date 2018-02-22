import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

import { DateTime } from 'luxon';
import { merge, forIn, includes, keys, has, isEqual, isEmpty } from 'lodash';

import { WikimetricsQuery } from '../wikimetrics.service';

interface Options {
  name: string;
  value: any;
}

@Component({
  selector: 'app-query-selector',
  templateUrl: './query-selector.component.html',
  styleUrls: ['./query-selector.component.css']
})

export class QuerySelectorComponent implements OnChanges {

  @Input() query: WikimetricsQuery[] = [];
  @Output() queryChange = new EventEmitter<WikimetricsQuery[]>();

  openFilterSelector = false;
  openViewSelector = false;
  openGroupSelector= false;

  selectedGroup: Options | null = null;
  selectedFilter: Options | null = null;
  selectedSubFilter: Options | null = null;
  selectedFilters: { filterName: string, subFilterName: string, value: any, input?: any }[] = [];
  inputSubFilter: string | null = null;
  selectedView: Options | null;

  filterColumn = {
    anon: 'Edición Anónima',
    size: 'Tamaño de la Edición',
    userid: 'ID del usuario',
    user: 'Nombre del usuario',
    minor: 'Edición menor',
    timestamp: 'Fecha de Edición'
  };

  filterOptions: Options[] = [
    { name: 'Edición Anónima' , value: { inputType: null,
      subOptions: [
        { name: 'Si', value: { 'anon': { '$exists': true } } },
        { name: 'No', value: { 'anon': { '$exists': false } } }
      ]
    } },
    { name: 'Tamaño de la Edición', value: { inputType: 'number',
      subOptions: [
        { name: 'Igual que', value: (val) => ({ 'size': { '$eq': val} }) },
        { name: 'Distinto que', value: (val) => ({ 'size': { '$ne': val } }) },
        { name: 'Mayor que', value: (val) => ({ 'size': { '$gt': val } }) },
        { name: 'Menor que', value: (val) => ({ 'size': { '$lt': val } }) },
      ]
    } },
    { name: 'ID de usuario', value: { inputType: 'number',
     subOptions: [
        { name: 'Igual que', value: (val) => ({ 'userid': { '$eq': val} }) },
        { name: 'Distinto que', value: (val) => ({ 'userid': { '$ne': val } }) },
        { name: 'Mayor que', value: (val) => ({ 'userid': { '$gt': val } }) },
        { name: 'Menor que', value: (val) => ({ 'userid': { '$lt': val } }) },
      ]
    } },
    { name: 'Nombre de usuario', value: { inputType: 'text',
      subOptions: [
        { name: 'Igual que', value: (val) => ({ 'user': { '$eq': val} }) },
        { name: 'Distinto que', value: (val) => ({ 'user': { '$ne': val } }) }
      ]
    } },
    { name: 'Edición menor', value: { inputType: null,
      subOptions: [
        { name: 'Si', value: { 'minor': { '$exists': true } } },
        { name: 'No', value: { 'minor': { '$exists': false } } }
      ]
    } },
    { name: 'Fecha de Edición', value: { inputType: 'date',
      subOptions: [
        { name: 'Igual que', value: (val) => ({ 'timestamp': {
          '$gt': DateTime.fromJSDate(new Date(val)).toISODate(),
          '$lt': DateTime.fromJSDate(new Date(val)).plus({days: 1}).toISODate()
        } } ) },
        { name: 'Mayor que', value: (val) => ({ 'timestamp': { '$gt': DateTime.fromJSDate(new Date(val)).toISODate() } }) },
        { name: 'Menor que', value: (val) => ({ 'timestamp': { '$lt': DateTime.fromJSDate(new Date(val)).toISODate() } }) },
      ]
    } }
  ];

  viewOptions: Options[] = [
    {name: 'Cuenta', value: { '$sum': 1 } },
    {name: 'Suma de tamaño de edición', value: { '$sum': '$size' } },
    {name: 'Promedio de tamaño de edición', value: { '$avg': '$size' } },
    {name: 'Máximo tamaño de edición', value: { '$max': '$size' } },
    {name: 'Mínimo tamaño de edición', value: { '$min': '$size' } },
  ];

  groupOptions: Options[] = [
    {name: 'Edición Anónima', value: '$anon'},
    {name: 'ID de edición', value: '$revid'},
    {name: 'Tamaño de edición', value: '$size'},
    {name: 'ID de usuario', value: '$userid'},
    {name: 'Nombre de usuario', value: '$user'},
    {name: 'Edición menor', value: '$minor'},
    {name: 'Fecha (mes)', value: { 'month': { '$month': '$timestamp' } } },
    {name: 'Fecha (año)', value: { 'year': { '$year': '$timestamp' } } },
    {name: 'Fecha (mes y año)', value: {
      'month': { '$month': '$timestamp' },
      'year': { '$year': '$timestamp'}
    } },
    {name: 'Fecha (día, mes y año)', value: {
      'day': { '$dayOfMonth': '$timestamp' },
      'month': { '$month': '$timestamp' },
      'year': { '$year': '$timestamp'}
    } }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.query.currentValue && !isEmpty(changes.query.currentValue) &&
      !changes.query.previousValue && !isEqual(changes.query.previousValue, changes.query.currentValue)) {
      this.extractQuery();
    }
  }

  addGroup(item: Options) {
    this.selectedGroup = item;
    this.queryChange.emit(this.buildQuery());
    this.openGroupSelector = false;
  }

  removeGroup() {
    this.selectedGroup = null;
    this.queryChange.emit(this.buildQuery());
  }

  addView(item: Options) {
    this.selectedView = item;
    this.queryChange.emit(this.buildQuery());
    this.openViewSelector = false;
  }

  removeView() {
    this.selectedView = null;
    this.queryChange.emit(this.buildQuery());
  }

  addFilter() {
    this.selectedFilters.push({
      filterName: this.selectedFilter!.name,
      subFilterName: this.selectedSubFilter!.name,
      value: this.inputSubFilter ? this.selectedSubFilter!.value(this.inputSubFilter!) : this.selectedSubFilter!.value,
      input: this.isDate ? DateTime.fromJSDate(new Date(this.inputSubFilter!)).toISODate() : this.inputSubFilter
    });
    this.queryChange.emit(this.buildQuery());
    this.backToMainFilter();
    this.openFilterSelector = false;
  }

  removeFilter(index: number) {
    if (index > -1 ) {
      this.selectedFilters.splice(index, 1);
      this.queryChange.emit(this.buildQuery());
    }
  }

  get isSubFilterSet() {
    const inputType: string | null = this.selectedFilter && this.selectedFilter.value.inputType;
    return (this.selectedSubFilter && !inputType) || (this.selectedSubFilter && this.inputSubFilter);
  }

  backToMainFilter() {
    this.selectedFilter = null;
    this.selectedSubFilter = null;
    this.inputSubFilter = null;
  }

  get isDate() {
    return this.selectedFilter && this.selectedFilter.value.inputType &&  this.selectedFilter.value.inputType === 'date';
  }

  extractQuery() {
    this.query.forEach(q => {

      if (q.$match) {
        // extract filter
        forIn(q.$match, (value, key) => {
          let filterName: string, subFilterName: string, input;
          if (includes(keys(this.filterColumn), key)) {
            filterName = this.filterColumn[key];
            if (has(value, '$gt') && has(value, '$lt')) {
              subFilterName = 'Igual que';
              input = value.$gt;
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value}, input });
            } else if (has(value, '$eq')) {
              subFilterName = 'Igual que';
              input = value.$eq;
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value}, input });
            } else if (has(value, '$ne')) {
              subFilterName = 'Distinto que';
              input = value.$ne;
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value}, input });
            } else if (has(value, '$gt')) {
              subFilterName = 'Mayor que';
              input = value.$gt;
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value}, input });
            } else if (has(value, '$lt')) {
              subFilterName = 'Menor que';
              input = value.$lt;
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value}, input });
            } else if (has(value, '$exists')) {
              subFilterName = value.$exists ? 'Si' : 'No';
              this.selectedFilters.push({ filterName, subFilterName, value: {[key]: value} });
            }
          }
        });
      }

      if (q.$group) {
        // extract $group
        const group = this.groupOptions.find(v => isEqual(v.value, q.$group!._id));
        this.selectedGroup = group ? group : null;
        if (q.$group.result) {
          // extract view
          const view = this.viewOptions.find(v => isEqual(v.value, q.$group!.result));
          this.selectedView = view ? view : null;
        }
      }
    });
  }

  buildQuery(): WikimetricsQuery[] {
    // setup filters
    let obj = {};
    this.selectedFilters.forEach(i => {
      obj = merge(obj, i.value);
    });

    // build project
    const $project = { _id: '$_id' };
    if (this.selectedGroup) {
      $project['x_value'] = '$_id';
      $project['x_label'] = this.selectedGroup.name;
    }
    if (this.selectedView && this.selectedView.value) {
      $project['y_value'] = '$result';
      $project['y_label'] = this.selectedView.name;
    }

    // build query
    const newQuery = [
      {
        $match: obj
      },
      {
        $group: {
          _id: this.selectedGroup ? this.selectedGroup.value : null ,
          ... this.selectedView && this.selectedView.value ? { result: this.selectedView.value } : {}
        }
      },
      { $sort: { '_id': 1 } },
      { $project }
    ];

    return newQuery;
  }

}
