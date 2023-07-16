const ErstwhileComponent = require("./ErstwhileComponent");

class ErstwhileForm extends ErstwhileComponent {

  controls = [];

  getControl(name) {
    let retval = null;
    for(let i in this.controls) {
      let tempComponent = window.App.getComponent(this.controls[i]);
      if(tempComponent && tempComponent.getKey() == name) {
        retval = tempComponent;
      }
    }
    return retval;
  }

  showErrors(response) {
    if(response.success) {
      this.clearErrors();
    } else {
      if(response.errorsObj) {
        for(let i in this.controls) {
          let tempComponent = window.App.getComponent(this.controls[i]);
          if(response.errorsObj[tempComponent.getKey()]) {
            tempComponent.setValid(false, response.errorsObj[tempComponent.getKey()]);
          } else {
            tempComponent.setValid(true);
          }
        }  
      }
    }
  }

  clearErrors() {
    for(let i in this.controls) {
      let tempComponent = window.App.getComponent(this.controls[i]);
      if(tempComponent) {
        tempComponent.setValid(true)
      }
    }
  }

  registerControl(id) {
    this.controls.push(id);
  }

  deregisterControl(id) {
    if(this.controls.indexOf(id) >=0) {
      this.controls.splice(this.controls.indexOf(id), 1)
    }
  }

  getValues() {
    let retval = {};
    for(let i =0; i< this.controls.length; i++) {
      let component = window.App.getComponent(this.controls[i]);
      let values = component.getValue();
      retval = {...retval, ...values};
    }
    return retval;
  }
  
}

module.exports = ErstwhileForm;