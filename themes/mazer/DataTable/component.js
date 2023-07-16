
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class DataTableComponent extends ErstwhileComponent {
  datatable = null;
  columns = []

  tableComponents = {};

  innerDom = null;

  getHtml(innerDom) {
    this.innerDom = innerDom;
    for( let i in innerDom) {
      if(innerDom[i]["columns"]) {
        for(let j in innerDom[i]["columns"]) {
          if(innerDom[i]["columns"][j]['col']) {
            let column = {}
      
            let attributes = innerDom[i]["columns"][j][':@'];
            if(attributes["@_key"]) {
              column.data = attributes["@_key"];
            }
            if(attributes["@_sortable"]) {
              column.orderable = attributes["@_sortable"] == 'true';
            }
            if(attributes["@_title"]) {
              column.title = attributes["@_title"];
            }
            if(attributes["@_type"]) {
              column.type = attributes["@_type"];
              if(column.type == "date") {
                column.render = DataTable.render.date();
              } else if(column.type == "datetime") {
                column.render = DataTable.render.datetime();
              } else if(column.type == 'time') {
                column.render = DataTable.render.time()
              } else if(column.type == "boolean") {
                delete column.type;
                column.className = "text-center"
                column.render = function(i) {
                  if(i) {
                    return `<i class="bi bi-check-lg text-success"></i>`;
                  } else {
                    return `<i class="bi bi-x-lg text-danger"></i>`;
                  }
                }
              }
            }
            
            // this is where we need to figure out the custom rendering piece
            if(innerDom[i]["columns"][j]['col'].length > 0) {
              column.render = function(data, type, row, meta) {
                let html = window.App.renderDom(innerDom[i]["columns"][j]['col']);
                console.log(html)
                return html;
              }
              //console.log("inner html", html)
              console.log("inner", innerDom[i]["columns"][j]['col']);
            }

            if(column.data) {
              this.columns.push(column);
            }

          }

        }
      }
      
    }
    this.args.columns = this.columns;
    if(this.columns.length == 0) {
      console.log(`Notice: Datatable "${this.id}" doesn't have any <col> specified.`)
    }
    if(this.constructor.ejs) {
      return this.render(false);
    } else {
      return "";
    }
  }

  initialize() {
    if(!this.args.url) {
      console.log(`Notice: Datatable "${this.id}" requires URL to be specified.`)
    } else {
      let ajax = {
        url: this.args.url,
        type: 'get',
        beforeSend: function (request) {
          request.setRequestHeader("Erstwhile-Session", window.localStorage.erstwhileSessionKey);
        }
      }
      if(this.args.filter) {
        let _this = this;
        ajax.data = function(d) {
          let form = window.App.getComponent(_this.args.filter);
          if(form) {
            let data = form.getValues();
            for(let key in data) {
              d[key] = data[key]
            }
          }
        }
      }
 

      this.datatable = new DataTable(`#${this.id}-table`,{
        serverSide: true,
        ajax: ajax,
        searching: false,
        columns: this.columns
      })
    }
    ; /*, {
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
  unload() {
    for(let i in this.tableComponents) {
      this.tableComponents[i].unload();
      jquery(`#${this.tableComponents[i].id}`).remove();
    }
  }
}

module.exports = DataTableComponent;