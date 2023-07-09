class ErstwhileComponent {

  args = {}

  static ejs = false;

  containerFlag = false;

  id = false; 

  constructor(id, args) {
    this.id = id;
    if(args.id) {
      delete args.id;
    }
    this.args = args;
  }

  getRequires() {
    return [];
  }

  static getCSS(appRoot, workingDirectory, themeConfig) {
    return '';
  }

  static setEjs(ejs) {
    this.ejs = ejs;
  }

  getHtml(innerDom) {
    if(this.constructor.ejs) {
      let html = ejs.render(this.constructor.ejs, {args: this.args});
      
      function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      let attributeString = "";
      for(let attribute in this.args) {
        attributeString += ` ${attribute}="${htmlEntities(this.args[attribute])}"`;
      }
      return `<div id=${this.id}${attributeString}>${html}</div>`;
    } else {
      throw Error("EJS not initialized!")
    }
  }

  initialize( ) {
    console.log(`Initializing ${this.id}`) 
  }

  receiveUpdate(key, value) {
    console.log(`Receiving update: ${key} = `, value)
  }

  unload() {
    return true;
  }
}

module.exports = ErstwhileComponent;