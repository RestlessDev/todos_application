
const { ErstwhileControl } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class SwitchInput extends ErstwhileControl {
  options = [];

  getValue() {
    if(jquery(`#${this.id}-field`).is(":checked")) {
      let temp = {};
      temp[`${(this.getKey())}`] = true;
      return temp;
    } else {
      let temp = {};
      temp[`${(this.getKey())}`] = false;
      return temp;
    }
  }

  setValue(value) {
    jquery(`#${this.id}-field`).prop('checked', value)
  }

  receiveUpdate(key, value) {
    this.args[value] = value;
    if(jquery(`#${this.id}-field`).length > 0) {
      jquery(`#${this.id}-field`).prop('checked', value)
    }
    this.receiveGlobalUpdates(key, value);
  }
  
  isContainer() {
    return false;
  }
}

module.exports = SwitchInput;