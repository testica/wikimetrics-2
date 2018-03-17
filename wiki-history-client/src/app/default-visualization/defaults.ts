import { Visualization } from '../visualization.service';

export let Visualizations: Visualization[] = [
  {
    title: 'Ediciones menores',
    description: 'Gráfica torta: número de ediciones menores vs no menores',
    type: 'pie',
    query: `[
      {
        "$match": {}
      },
      {
        "$group": {
          "_id": "$minor",
          "result": {
            "$sum": 1
          }
        }
      },
      {
        "$project": {
          "_id": "$_id",
          "x_value": "$_id",
          "x_label": "Edición menor",
          "y_value": "$result",
          "y_label": "Cuenta"
        }
      }
    ]`
  },
  {
    title: 'Usuarios anónimos',
    description: 'Gráfica torta: número de usuarios anónimos vs no anónimos',
    type: 'pie',
    query: `[
      {
        "$match": {}
      },
      {
        "$group": {
          "_id": "$anon",
          "result": {
            "$sum": 1
          }
        }
      },
      {
        "$project": {
          "_id": "$_id",
          "x_value": "$_id",
          "x_label": "Edición Anónima",
          "y_value": "$result",
          "y_label": "Cuenta"
        }
      }
    ]`
  },
  {
    title: 'Top 10 editores',
    description: 'Gráfica torta: 10 primeros usuarios con mas ediciones',
    type: 'pie',
    query: `[
      {
        "$match": {}
      },
      {
        "$group": {
          "_id": "$user",
          "result": {
            "$sum": 1
          }
        }
      },
      {
        "$sort": {
          "result": -1
        }
      },
      {
        "$limit": 10
      },
      {
        "$project": {
          "_id": "$_id",
          "x_value": "$_id",
          "x_label": "Nombre de usuario",
          "y_value": "$result",
          "y_label": "Cuenta"
        }
      }
    ]`
  },
  {
    title: 'Número de ediciones por mes y año',
    type: 'bar',
    query: `[
      {
        "$match": {}
      },
      {
        "$group": {
          "_id": {
            "month": {
              "$month": "$timestamp"
            },
            "year": {
              "$year": "$timestamp"
            }
          },
          "result": {
            "$sum": 1
          }
        }
      },
      {
        "$sort": {
          "_id": 1
        }
      },
      {
        "$project": {
          "_id": "$_id",
          "x_value": "$_id",
          "x_label": "Fecha (mes y año)",
          "y_value": "$result",
          "y_label": "Cuenta"
        }
      }
    ]`
  }
];
