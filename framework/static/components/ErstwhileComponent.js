let App = require("../../base/App");

class ErstwhileComponent {

  args = {}

  constructor() {
    //do nothing
  }

  getRequires() {
    return [];
  }

  getCSS() {
    return '';
  }

  initialize(args, next) {
    this.args = args;
    next()
  }

  receiveUpdate(args) {
    this.args = {...this.args, args}
  }

  unload() {
    return true;
  }
}

module.exports = ErstwhileComponent;