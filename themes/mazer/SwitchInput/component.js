
const ErstwhileControl = require('../../../framework/static/components/ErstwhileControl')
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
  
  isContainer() {
    return false;
  }
}

module.exports = SwitchInput;