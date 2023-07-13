
const ErstwhileForm = require('../../../framework/static/components/ErstwhileForm')
const ejs = require('ejs');
const jquery = require("jquery")

class Form extends ErstwhileForm {
  isContainer() {
    return true;
  };
  getTag() {
    return "form";
  }
  prepareAttributes() {
    let attributes = {...this.args};
    this.prepareGlobalAttributes(attributes);
    
    attributes.onsubmit = "return false;"
    return attributes;
  }
  getClassName() {
    return "mazer-form";
  }
  static getCSS(a, b, c ) {
    return `.mazer-form { margin-bottom: 0px; }`
  }
}

module.exports = Form;