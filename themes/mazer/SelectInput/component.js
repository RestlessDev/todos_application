
const ErstwhileControl = require('../../../framework/static/components/ErstwhileControl')
const ejs = require('ejs');
const jquery = require("jquery")

class SelectInput extends ErstwhileControl {
  options = [];

  getValue() {
    let retval = {};
    retval[this.args.name ? this.args.name : this.id] = jquery(`#${this.id}-field`).val();
    return retval;
  }
  getHtml(innerDom) {
    this.innerDom = innerDom;
    for( let i in innerDom) {
      let option = {}
      if(innerDom[i][":@"] && innerDom[i][":@"]["@_value"]) {
        option.value = innerDom[i][":@"]["@_value"];
      }
      if(innerDom[i]["option"] && innerDom[i]["option"][0] &&  innerDom[i]["option"][0]['#text']) {
        if(!option.value ) {
          option.value = innerDom[i]["option"][0]['#text'];
        }
        option.text = innerDom[i]["option"][0]['#text'];
      }
      this.options.push(option);
    }
    this.args.options = this.options;
    if(this.constructor.ejs) {
      return this.render(false);
    } else {
      return "";
    }
  }
  isContainer() {
    return false;
  }
}

module.exports = SelectInput;