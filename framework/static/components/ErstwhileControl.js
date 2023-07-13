const jquery = require("jquery");
const ErstwhileComponent = require("./ErstwhileComponent");

class ErstwhileControl extends ErstwhileComponent {

  formId = null;

  getKey() {
    return this.args.name;
  }

  getValue() {
    let retval = {};
    retval[this.getKey()] = false;
    return retval;
  }

  setValue(value) {
    return true;
  }
  
  initialize() {
    this.formId = jquery("body").find(`#${this.id}`).closest("form").attr("id");

    let formComponent = window.App.getComponent(this.formId);
    if(formComponent) {
      formComponent.registerControl(this.id)
    }
  }

  unload() {
    let formComponent = window.App.getComponent(this.formId);
    if(formComponent) {
      formComponent.deregisterControl(this.id)
    }
  }
}

module.exports = ErstwhileControl;