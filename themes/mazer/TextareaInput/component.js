
const { ErstwhileControl } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class TextareaInput extends ErstwhileControl {
  getValue() {
    let retval = {};
    retval[this.args.name ? this.args.name : this.id] = jquery(`#${this.id}-field`).val();
    return retval;
  }
  
}

module.exports = TextareaInput;