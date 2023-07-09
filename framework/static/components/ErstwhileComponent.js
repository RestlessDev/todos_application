const { XMLParser } = require("fast-xml-parser");
const resolvePath = require('object-resolve-path');

class ErstwhileComponent {

  args = {}

  static ejs = false;

  id = false; 

  constructor(id, args) {
    this.id = id;
    this.args = args;
  }

  getRequires() {
    return [];
  }

  prepareAttributes() {
    let attributes = {...this.args};
    this.inlineScopedFunctions(attributes)
    return attributes;
  }

  inlineScopedFunctions(attributes) {
    for(let attribute in attributes) {
      let value = attributes[attribute];
      if(value.startsWith("@.")) {
        let obj = resolvePath(window.App.scopesStore, value.substring(2));
        if(typeof obj == 'function') {
          attributes[attribute] = `(${(obj.toString())})(); return false;`
        }
      }
    }
    return attributes;
  }

  isContainer() {
    return false;
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
      
      if(this.isContainer()) {
        // not ideal
        html = html.replace(/<innerContent \/>/ig, '<div class="erstwhile-container-inner"></div>')
      }
      function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      let attributeString = "";
      let attributes = this.prepareAttributes();
      for(let attribute in attributes) {
        attributeString += ` ${attribute}="${htmlEntities(attributes[attribute])}"`;
      }
      return `<${this.getTag() ? this.getTag() : 'div'} id=${this.id}${attributeString}>${html}</${this.getTag() ? this.getTag() : 'div'}>`;
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

  getTag() {
    return false;
  }
}

module.exports = ErstwhileComponent;