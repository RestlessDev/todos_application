
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class DataTableComponent extends ErstwhileComponent {
  datatable = null;

  initialize() {
    this.datatable = new DataTable(`#${this.id}-table`); /*, {
      columnDefs: [
          {
              // The `data` parameter refers to the data for the cell (defined by the
              // `data` option, which defaults to the column being worked with, in
              // this case `data: 0`.
              render: (data, type, row) => data + ' (' + row[3] + ')',
              targets: 0
          },
          { visible: false, targets: [3] }
      ]
    });
    */
    // console.log(this.datatable)
  }
}

module.exports = DataTableComponent;