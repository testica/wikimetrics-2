import { WikimetricsQueryResponse } from './wikimetrics.service';
import { isObject, has, sortBy, isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import { isNull } from 'util';

export interface QueryResponse {
  x_values: any[];
  y_values: any[];
  x_label: any[];
  y_label: any[];
}

/**
 * Returns a boolean that means if the query string is valid
 * @param query query string
 */
export function isValidQuery(query: string | undefined) {
  return !!query && !isEmpty(query) && query.length > 0 && !!IsJSONString(query);
}

function IsJSONString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

/**
 * Receive a QueryResponse and transform it to visualization support object
 * @param res query string of wikimetrics response
 */
export function completeQueryToVisualization(res: WikimetricsQueryResponse[]) {
  if (isObject(res[0].x_value) && has(res[0].x_value, 'day') && has(res[0].x_value, 'month') && has(res[0].x_value, 'year')) {
    res = sortBy(res, i => {
      return DateTime.utc().set({year: i.x_value.year, month: i.x_value.month, day: i.x_value.day});
     });
  }
  const x_values: any[] = [];
  const y_values: any[] = [];
  res.forEach(item => {

    if (isObject(item.x_value) && (has(item.x_value, 'day') || has(item.x_value, 'month') || has(item.x_value, 'year'))) {
      // check if handle a date unit
      if (has(item.x_value, 'day') && has(item.x_value, 'month') && has(item.x_value, 'year')) {
        item.x_value = DateTime.utc()
                      .set({year: item.x_value.year, month: item.x_value.month, day: item.x_value.day})
                      .toLocaleString();
      } else if (has(item.x_value, 'month') && has(item.x_value, 'year')) {
        item.x_value = DateTime.utc()
                      .set({year: item.x_value.year, month: item.x_value.month})
                      .toFormat('MMMM, yyyy');
      } else if (has(item.x_value, 'year')) {
        item.x_value = DateTime.utc()
                      .set({year: item.x_value.year})
                      .toLocaleString({year: 'numeric'});
      } else if (has(item.x_value, 'month')) {
        item.x_value = DateTime.utc()
                      .set({month: item.x_value.month})
                      .toLocaleString({month: 'long'});
      }
    } else if (item.x_label === 'Edición Anónima') {
      // check if handle anonymous edit
      item.x_value = isNull(item.x_value) ? 'No anónima' : 'Anónima';
    } else if (item.x_label === 'Edición menor') {
      // check if handle a minor edit
      item.x_value = isNull(item.x_value) ? 'No menor' : 'Menor';
    }
    x_values.push(item.x_value);
    y_values.push(item.y_value);
  });
  return { x_values, y_values, x_label: res[0].x_label, y_label: res[0].y_label };
}
