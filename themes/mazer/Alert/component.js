
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class Alert extends ErstwhileComponent {
  message = "";

  isContainer() {
    return true;
  }
  getValue() {
    return {
      key: this.args.name ? this.args.name : this.id,
      value: jquery(`#${this.id}-field`).val() 
    }
  }
  prepareAttributes() {
    let attributes = {...this.args};
    this.prepareGlobalAttributes(attributes);
    if(!attributes.class) {
      attributes.class = "";
    }
    attributes.class += " alert";
    if(attributes.light == "true" && attributes.color) {
      attributes.class += ` alert-light-${attributes.color}`;
    } else if(attributes.color) {
      attributes.class += ` alert-${attributes.color}`;
    }
    if(attributes.dismissable == "true") {
      attributes.class += ` alert-dismissable fade show`;
    }
    delete attributes.color;
    delete attributes.light;
    delete attributes.dismissable;
    return attributes;
  }
}

module.exports = Alert;