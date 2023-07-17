
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class Button extends ErstwhileComponent {
  isContainer() {
    return true;
  }
  getValue() {
    return {
      key: this.args.name ? this.args.name : this.id,
      value: jquery(`#${this.id}-field`).val() 
    }
  }
  getTag() {
    return 'button';
  }
  prepareAttributes() {
    let attributes = {...this.args};
    this.prepareGlobalAttributes(attributes);
    
    if(!attributes.class) {
      attributes.class = "";
    }
    attributes.class += " btn";
    if(attributes.outline == "true" && attributes.color) {
      attributes.class += ` btn-outline-${attributes.color}`;
    } else if(attributes.color) {
      attributes.class += ` btn-${attributes.color}`;
    }
    if(attributes.size) {
      attributes.class += ` btn-${attributes.size}`;
    }
    if(attributes.rounded == "true") {
      attributes.class += ` rounded-pill`;
    }
    delete attributes.color;
    delete attributes.size;
    delete attributes.outline;
    delete attributes.rounded;
    return attributes;
  }
}

module.exports = Button;