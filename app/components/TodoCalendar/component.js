
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class TodoCalendar extends ErstwhileComponent {
  initialize() {
    if(!this.args.todos) {
      console.log(`Notice: No todos were specified.`)
    }
    if(!this.args.month) {
      this.args.month = new Date().getMonth() + 1;
    }
    if(!this.args.year) {
      this.args.year = new Date().getYear();
    }
    
  }
  receiveUpdate(key, value) {
    this.args[key] = value;
    this.render()

    this.receiveGlobalUpdates(key, value);
  }
  static getCSS(a,b,c) {
    return `
      .todo-calendar-table tr th {
        width: calc(100% * (1/7));
      }
      .todo-calendar-table .inactive {
        color: #dcdcdc;
      }
      .todo-calendar-table td {
        height: 150px;
        position: relative;
      }
      .todo-calendar-table td .day {
        position: absolute;
        top: 5px;
      }
      .todo-calendar-table td .todo-list {
        margin-top: 30px;
        height: 120px;
      }
      `
  }
}

module.exports = TodoCalendar;