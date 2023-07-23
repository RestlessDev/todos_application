const jquery = require("jquery");
const ErstwhileComponent = require("./ErstwhileComponent");

class ErstwhileControl extends ErstwhileComponent {

  formId = null;

  valid = true;

  getKey() {
    return this.args.name;
  }

  getValue() {
    let retval = {};
    retval[this.getKey()] = false;
    return retval;
  }

  setValue(value) {
    this.value = value;
    this.receiveUpdate('value', value[this.getKey()])
    return true;
  }

  setValid(valid, message = '') {
    if(valid) {
      jquery(`#${this.id}-field`).removeClass('is-invalid');
    } else {
      jquery(`#${this.id}-field`).addClass('is-invalid');
    }
    if(jquery(`#${this.id} .invalid-feedback`).length > 0) {
      if(!valid) {
        jquery(`#${this.id} .invalid-feedback`).addClass('d-none')
      }
      if(message) {
        jquery(`#${this.id} .invalid-feedback`).html(message);
        jquery(`#${this.id} .invalid-feedback`).removeClass('d-none')
      } else {
        jquery(`#${this.id} .invalid-feedback`).addClass('d-none')
      }    
    }
    this.valid = valid;
  }
  
  initialize() {
    this.formId = jquery("body").find(`#${this.id}`).closest("form").attr("id");

    let formComponent = window.$App.getComponent(this.formId);
    if(formComponent) {
      formComponent.registerControl(this.id)
    }
  }

  receiveUpdate(key, value) {
    this.args[value] = value;
    if(key == 'value') {
      if(jquery(`#${this.id}-field`).length > 0) {
        jquery(`#${this.id}-field`).val(value)
      }
    }
    this.receiveGlobalUpdates(key, value);
  }

  unload() {
    let formComponent = window.$App.getComponent(this.formId);
    if(formComponent) {
      formComponent.deregisterControl(this.id)
    }
  }
}

module.exports = ErstwhileControl;