
const { ErstwhileControl } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class EmailInput extends ErstwhileControl {
  getValue() {
    let retval = {};
    retval[this.args.name ? this.args.name : this.id] = jquery(`#${this.id}-field`).val();
    return retval;
  }

}

module.exports = EmailInput;