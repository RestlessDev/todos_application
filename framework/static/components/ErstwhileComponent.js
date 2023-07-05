class ErstwhileComponent {

  args = {}

  ejs = false;

  constructor() {
    //do nothing
  }

  getRequires() {
    return [];
  }

  static getCSS(appRoot, workingDirectory, themeConfig) {
    return '';
  }

  setEJS(ejs) {
    this.ejs = ejs;
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