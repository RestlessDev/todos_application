const { XMLParser } = require("fast-xml-parser");
const resolvePath = require('object-resolve-path');
const jquery = require("jquery");

class ErstwhileComponent {
  static events = ['blur','change','focus','focusin','select','submit','keydown','keypress','keyup','focusout','click','dblclick','focusout','hover','mousedown','mouseenter','mouseleave','mousemove','mouseout','mouseover','mouseup'];
  args = {};

  argsToFilter = [];

  eventsToBind = {

  }

  static ejs = false;

  id = false; 

  hidden = false;

  bindEventsTest = true;

  constructor(id, args) {
    this.id = id;
    let params = {};
    
    for(let key in args) {
      if(args[key].startsWith("@.")) {
        params[key] = resolvePath(window.$App.scopesStore, args[key].substring(2)) || '';
        this.argsToFilter.push(key)
        if(key.startsWith('on')) {
          if(this.constructor.events.indexOf(key.substring(2).toLowerCase()) >= 0) {
            this.eventsToBind[key.substring(2).toLowerCase()] = params[key];
          }
        }
      } else {
        params[key] = args[key];
      }
      
    }
    this.args = params || {};

    if(this.args.hidden) {
      this.hidden = args.hidden;
    }
    if(this.args.bindEvents) {
      this.bindEventsTest = args.bindEvents;
    }
  }

  innerDom = false;

  getRequires() {
    return [];
  }

  isHidden() {
    return this.hidden;
  }

  hide() {
    this.hidden = true;
    jquery(`#${this.id}`).addClass("d-none");
  }

  show() {
    this.hidden = false;
    jquery(`#${this.id}`).removeClass("d-none");
  }

  willBindEvents() {
    return this.bindEventsTest;
  }

  setProperty(property, value) {
    this.args[property] = value;
  }

  getProperty(property) {
    return this.args[property];
  }

  /**
   * Occasionally, components may need to dynamically create other components,
   * and occasionally they will need to use placeholders for attributes.
   * 
   * This method uses the standard (standard?) convention of those placeholders 
   * appearing like "{{variable}}"
   * 
   * @param {*} templateKey 
   * @param {*} value 
   */
  updateTemplatizedProperties(templateKey, value) {
    for(let key in this.args) {
      if(typeof this.args[key] == 'string') {
        const re = new RegExp(`\\{\\{${templateKey}\\}\\}`, 'g')
        this.setProperty(key, this.args[key].replace(re, value))
      }
    } 
  }

  prepareAttributes() {
    let attributes = {...this.args};
    this.prepareGlobalAttributes(attributes);
    return attributes;
  }

  prepareGlobalAttributes(attributes) {
    this.inlineScopedFunctions(attributes);
    if(this.isHidden()) {
      if(!attributes.class) {
        attributes.class = "d-none";
      } 
    } else {
      if(attributes.class && attributes.class.indexOf('d-none') >= 0) {
        attributes.class = attributes.class.replace(/d-none/, '');
      }
    }
    delete attributes.hidden;
    return attributes
  }

  inlineScopedFunctions(attributes) {
    /*
    for(let attribute in attributes) {
      let value = attributes[attribute];
      if(value.startsWith("@.")) {
        let obj = resolvePath(window.$App.scopesStore, value.substring(2));
        if(typeof obj == 'function') {
          attributes[attribute] = `(${(obj.toString())})(); return false;`
        } else {
          this.setProperty(attribute, obj)
          delete attributes[attribute];
        }
      }
    }
    */
    for(let i in this.argsToFilter) {
      if(attributes[this.argsToFilter[i]]) {
        delete attributes[this.argsToFilter[i]];
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
    this.innerDom = innerDom;
    if(this.constructor.ejs) {
      return this.render(false);
    } else {
      return "";
    }
  }

  render(replace = true) {
    if(this.constructor.ejs) {
      let html = ejs.render(this.constructor.ejs, {args: this.args});
      
      if(this.isContainer()) {
        // not ideal
        html = html.replace(/<innerContent \/>/ig, '<div class="erstwhile-container-inner"></div>')
      }
      /**
       * Here we're trying to figure out if this object is a Layout, so
       * we know to look for the <pagecontent /> tag. it's a little
       * hacky and won't work more than one subclass deep.
       */
      let protoClass = null;
      try{
        protoClass = this.__proto__.__proto__.constructor.name; 
      } catch(e) {
        // don't sweat it
      }
      if(protoClass == "ErstwhileLayout") {
        html = html.replace(/<pagecontent \/>/ig, '<div id="page-content"></div>')
      }
      /* /end hackiness */
      function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      let attributeString = "";
      let attributes = this.prepareAttributes();
      for(let attribute in attributes) {
        if(attribute != 'id') {
          attributeString += ` ${attribute}="${htmlEntities(attributes[attribute])}"`;
        }
      }
      let returnVal = `<${this.getTag() ? this.getTag() : 'div'} ${this.getClassName() ? `class="${this.getClassName()}"` : ''} id="${this.id}" ${attributeString}>${html}</${this.getTag() ? this.getTag() : 'div'}>`;
      if(replace) {
        jquery(`#${this.id}`).replaceWith(returnVal);
        return true;
      } else {
        return returnVal
      } 
    } else {
      return true;
    }
  }

  initialize( ) {
    // console.log(`Initializing ${this.id}`) 
  }

  receiveUpdate(key, value) {
    this.receiveGlobalUpdates(key, value);
  }

  receiveGlobalUpdates(key, value) {
    if(key == "hidden") {
      if(value) {
        this.hide()
      } else {
        this.show()
      }
    }
    if(key.toLowerCase() == "bindevents") {
      if(value) {
        this.bindEventsTest = true;
      } else {
        this.bindEventsTest = false;
      }
    }
    if(window.$App.getDebug()) {
      console.log(`Notice: Receiving global update: ${key} = ${JSON.stringify(value)} `)
    }
  }

  unload() {
    jquery(`#${this.id}`).remove();
    return true;
  }

  getTag() {
    return false;
  }

  getClassName() {
    return false;
  }

  bindEvents() {
    let _this = this;
    for(let event in this.eventsToBind) {
      // to help out with controls
      if(jquery(`#${this.id}-field`).length > 0) {
        jquery(`#${this.id}-field`).on(event, function() {
          _this.eventsToBind[event](_this)
        })
      } else {
        jquery(`#${this.id}`).on(event, function() {
          _this.eventsToBind[event](_this)
        })
      }
    }
  }
}

module.exports = ErstwhileComponent;