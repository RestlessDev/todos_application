const jquery = require("jquery");
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const ejs = require('ejs');

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

  renderDom(ermlDom) {
    let retval = "";
    for(let tag in ermlDom) {

    }
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
        attributeNamePrefix : "@_"
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

        if(_this.newLayoutFlag) {
          let tempMarkup = ejs.render(_this.ejs.layouts[_this.layout], templateVars);
          let layoutDom = parser.parse(layoutMarkup);

          let layoutMarkup = _this.renderDom(layoutDom)
        }

        let thisTemplate = _this.ejs.controllers[found["controller"]][found["action"]];
        // if(thisTemplate) {
          let templateMarkup = ejs.render(thisTemplate, templateVars)
          let templateDom = parser.parse(templateMarkup);
        // }

        console.log(layoutDom["MainLayout"], templateDom)
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