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

  getHtml(args, ejs, innerDom) {
    return "not implemented";
  }

  initialize( id ) {
    this.args = args;
  }

  receiveUpdate(args) {
    this.args = {...this.args, args}
  }

  unload() {
    return true;
  }
}

module.exports = ErstwhileComponent;