const ErstwhileComponent = require("./ErstwhileComponent");

class ErstwhileForm extends ErstwhileComponent {

  controls = [];

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