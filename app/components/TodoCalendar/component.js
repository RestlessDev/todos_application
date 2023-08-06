
const { ErstwhileComponent } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

/**
 * This slightly more advanced component displays a calendar that shows each
 * of the month's todos on the date they are due to be done.
 * 
 * Most of the logic for building out the calendar is in the ejs template; when either
 * the month or date change via the scoped parameters "month" or "year" the component
 * just re-renders itself.
 * 
 * It's responsive, so if viewed on a smaller viewport it switches to a list view.
 */
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
        color: white;
      }
      .todo-calendar-table .inactive {
        color: #dcdcdc;
      }
      .todo-calendar-table .today {
        background-color: #ced4da;
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