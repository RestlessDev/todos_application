class ErstwhileComponent {

  args = {}

  ejs = false;

  containerFlag = false;

  constructor() {
    //do nothing
  }

  getRequires() {
    return [];
  }

  static getCSS(appRoot, workingDirectory, themeConfig) {
    return '';
  }

  setEjs(ejs) {
    this.ejs = ejs;
  }

  getHtml(args) {
    if(this.ejs) {
      let html = ejs.render(this.ejs, {args: args});
      return html;
    } else {
      throw Error("EJS not initialized!")
    }
  }

  initialize( id ) {
    console.log(`Initializing ${id}`)
  }

  receiveUpdate(key, value) {
    console.log(`Receiving update: ${key} = `, value)
  }

  unload() {
    return true;
  }
}

module.exports = ErstwhileComponent;