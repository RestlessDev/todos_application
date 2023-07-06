const jquery = require("jquery");
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');

class ErstwhileApp {

  routes = false;

  modals = false;

  controllers = false;

  ejs = false;

  components = false;

  layout = "default";

  template = false;

  newLayoutFlag = true;

  debug = false;

  scopes = {
    "session": {},
    "page": {},
    "modal": {}
  }

  listeners = {

  }

  documentObjectModel = {};

  setLayout(layout) {
    if(this.layout == layout) {
      // do nothing
    } else if(this.ejs.layouts[layout]) {
      this.layout = layout;
      this.newLayoutFlag = true;
    } else {
      if(this.debug) {
        console.log(`Notice: Invalid layout "${layout}"`)
      }
    }
  }

  setComponents(components) {
    this.components = components;
  }

  setRoutes(routes) {
    this.routes = routes;
  }

  setModals(modals) {
    this.modals = modals;
  }

  setControllers(controllers) {
    this.controllers = controllers;
  }

  setEJS(ejs) {
    this.ejs = ejs;
  }

  openModal(controller, modal, args) {
    
  } 

  renderDom(ermlDom ) {
    let retval = {
      html: "",
      scripts: []
    };
    // if thisTag is null, this is a top level item. There shouldn't be any attributes.
    for(let j in ermlDom) {
      let element = ermlDom;
      if(Number.isInteger(parseInt(j))) {
        element = ermlDom[j];
      }
      if(Array.isArray(element)) {
        for(let k in element) {
          let temp = this.renderDom(element[k]);
          console.log("temp", temp)
          retval.html += temp.html;
          retval.scripts = [...retval.scripts, ...temp.scripts];
        }
      } else if(typeof element == 'string') {
        retval.html += element;
      } else {
        if(element["#text"]) {
          retval.html += `${element["#text"]} `; 
        } else {
          let attributes = {};
          if(element[":@"]) {
            for( let attribute in element[":@"]) {
              attributes[attribute.substring(2)] = element[":@"][attribute];  
            }
          }
          for(let part in element) {
            if(part != ':@') {
              if(this.components[part.toLowerCase()]) {
                if(!attributes.id) {
                  attributes.id = `${part.toLowerCase()}-${uuidv4()}`;
                }
                retval.html += this.components[part.toLowerCase()].getHtml(attributes, this.ejs.components[part.toLowerCase()], element[part]);
                retval.scripts.push({ callback: this.components[part.toLowerCase()].initialize, id: attributes.id });
              } else {
                function htmlEntities(str) {
                  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                }
                let attributeString = "";
                for(let attribute in attributes) {
                  attributeString += ` ${attribute}="${htmlEntities(attributes[attribute])}"`;
                }
                retval.html += `<${part}${attributeString} ${(element[part].length == 0 ? "/" : "")}>`;
                if(Array.isArray(element[part])) {
                  for(let i = 0; i< element[part].length; i++) {
                    let temp = this.renderDom(element[part][i]);
                    retval.html += temp.html;
                    retval.scripts = [...retval.scripts, ...temp.scripts];
                  }
                }
                retval.html += `${(element[part].length > 0 ? `</${part}>` : "")}`;
              }
            }
          }
        }
      }
    } 
    return retval;
  }

  openPath(path) {
    let found = false;
    for(let i in this.routes) {
      const re = new RegExp(i);
      let matches = path.match(re);
      if(matches) {
        console.log("found!")
        found = this.routes[i];
      }
    }
    if(!found) {
      jquery("#root").html("<h1>Route Not Found</h1>");
    } else {
      // f_ck callbacks
      let _this = this;

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix : "@_",
        alwaysCreateTextNode: true,
        preserveOrder: true
      });

      // 1. set the expected template
      this.template = `${(found['controller'].substring(0, found['controller'].length - "Controller".length))}${(found['action'].substring(0, found['action'].length - "Action".length))}`;

      let postController = function() {
        /**
         * So at this point we should have all of the variables set, as well as the template
         * and the layout. We need to start rendering.
         */
        // 5. Set the variables to be used at the ejs layer
        let templateVars = {
          scopes: _this.scopes
        }

        let initsToRun = [];
        console.log(_this.layout)
        if(_this.newLayoutFlag) {
          let tempMarkup = ejs.render(_this.ejs.layouts[_this.layout], templateVars);
          let layoutDom = parser.parse(tempMarkup);

          let layoutMarkup = _this.renderDom(layoutDom)
          jquery("#root").html(layoutMarkup.html)
          initsToRun = [...initsToRun, ...layoutMarkup.scripts]
        }

        let thisTemplate = _this.ejs.controllers[found["controller"]][found["action"]];

        console.log("this template", thisTemplate, _this.ejs.controllers, found["controller"], found["action"])
        if(thisTemplate) {
          let tempMarkup = ejs.render(thisTemplate, templateVars)
          let templateDom = parser.parse(tempMarkup);
          let templateMarkup = _this.renderDom(templateDom)
          console.log("template markup", templateMarkup.html);
          jquery("#page-content").html(templateMarkup.html)
          initsToRun = [...initsToRun, ...templateMarkup.scripts]
        }

        console.log(initsToRun)
      }
      let postPre = function() {
        // 3. Perform the controller action
        _this.controllers[found['controller']][found['action']]();
        
        // 4. Perform the postAction on the controller
        _this.controllers[found['controller']].postAction(postController);
      }
      
      // 2. Start the preAction on the controller
      this.controllers[found['controller']].preAction(postPre);
      

      
    }
  }

}

module.exports = ErstwhileApp;