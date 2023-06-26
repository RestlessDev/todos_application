let App = require("../../base/App");
let ErstwhileComponent = require('./ErstwhileComponent')

class ErstwhileLayout extends ErstwhileComponent {

  args = {}

  constructor() {
    //do nothing
  }

  getRequires() {
    return [];
  }

  getSCSS() {
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

module.exports = ErstwhileLayout;