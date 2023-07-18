
const ErstwhileControl = require('../../../framework/static/components/ErstwhileControl')
const ejs = require('ejs');
const jquery = require("jquery")

class DateInput extends ErstwhileControl {
  getValue() {
    let retval = {};
    retval[this.args.name ? this.args.name : this.id] = jquery(`#${this.id}-field`).val();
    return retval;
  }
  receiveUpdate(key, value) {
    this.args[value] = value;
    if(jquery(`#${this.id}-field`).length > 0) {
      jquery(`#${this.id}-field`).val(value.substring(0, 10))
    }
    this.receiveGlobalUpdates(key, value);
  }
}

module.exports = DateInput;