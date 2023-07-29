
const { ErstwhileComponent } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class Alert extends ErstwhileComponent {
  isContainer() {
    return true;
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
  receiveUpdate(key, value) {
    if(key.toLowerCase() == "message") {
      jquery(`#${this.id} .alert-message`).html(value);
    }
    this.receiveGlobalUpdates(key, value);
  }
}

module.exports = Alert;