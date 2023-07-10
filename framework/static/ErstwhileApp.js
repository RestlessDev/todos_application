const jquery = require("jquery");
const { XMLParser } = require("fast-xml-parser");
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const ObservableSlim = require('observable-slim');
const resolvePath = require('object-resolve-path');

class ErstwhileApp {

  routes = false;

  modals = false;

  controllers = false;

  ejs = false;

  config = false;

  componentClasses = false;

  layout = "default";

  template = false;

  newLayoutFlag = true;
  
  debug = false;

  scopesStore = {
    "session": {},
    "page": {},
    "modal": {}
  }

  pageIDs = [];

  listeners = {};

  idsToListeners = {};

  models = {};

  components = {
    "layout" :{},
    "page": {}
  };

  constructor() {
    /**
     * Set up the scope proxy object
     */
    let _this = this;
    this.scopes = ObservableSlim.create(this.scopesStore, true, function(changes) {
      for(let i = 0; i < changes.length; i++) {
        if(_this.listeners[changes[i].currentPath]) {
          for(let id in _this.listeners[changes[i].currentPath]) {
            if(_this.components.layout[id] || _this.components.page[id]) {
              let component = _this.components.layout[id] ? _this.components.layout[id] : _this.components.page[id]
              for(let j in _this.listeners[changes[i].currentPath][id]) {
                component.receiveUpdate(_this.listeners[changes[i].currentPath][id][j], changes[i].newValue)
              }
            }
          }
        }
      }
      // console.log(JSON.stringify(changes), _this.template);
    });
  }

  registerListener(id, property, key) {
    console.log("registering listener", id, property, key)
    let keys = property.split(".")
    if(keys[0] == "") {
      keys.shift()
    }
    if(keys[0] == 'session' || keys[0] == "page" || keys[0] == "modal") { 
      if(!this.listeners.hasOwnProperty(property)) {
        this.listeners[property] = {}
      }
      if(!this.listeners[property].hasOwnProperty(id)) {
        this.listeners[property][id] = []
      }
      this.listeners[property][id].push(key);
      if(!this.idsToListeners.hasOwnProperty(id)) {
        this.idsToListeners[id] = [];
      }
      this.idsToListeners[id].push(property);

      try {
        return resolvePath(this.scopes, property)
      } catch(e) {
        return undefined;
      }

    } else {
      throw new Error(`Properties must be session, page, or modal.`)
    }
  }
  
  removeListeners(id) {
    for(let i in this.idsToListeners[id]) {
      delete this.listeners[this.idsToListeners[i]][id];
    }
    delete this.idsToListeners[id];
  }

  setLayout(layout) {
    if(this.layout == layout) {
      // do nothing
    } else if(this.ejs.layouts[layout]) {
      this.layout = layout;
      this.newLayoutFlag = true;
    } else {
      if(this.getDebug()) {
        console.log(`Notice: Invalid layout "${layout}"`)
      }
    }
  }

  setComponentClasses(componentClasses) {
    this.componentClasses = componentClasses;
  }

  setModels(models) {
    this.models = models;
  }

  setConfig(config) {
    this.config = config;
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

  getDebug() {
    return this.getConfig("debug") == true;
  }
  getComponentClass(componentName) {
    if(this.componentClasses[componentName.toLowerCase()]) {
      this.componentClasses[componentName.toLowerCase()].setEjs(this.ejs.components[componentName.toLowerCase()]);
      return this.componentClasses[componentName.toLowerCase()];
    } else {
      return false;
    }
  }

  getComponent(id) {
    if(this.components.layout[id]) {
      return this.components.layout[id];
    } else if(this.components.page[id]) {
      return this.components.page[id];
    } else {
      return false;
    }
  }

  getConfig(property) {
    if(this.config[property]) {
      return this.config[property];
    } 
    return null;
  }

  getModel(model) {
    if(this.models[model]) {
      return this.models[model];
    } else {  c
      console.log(`Notice: Model "${model}" not found.`)
      return false;
    }
  }

  getScopedAttributes(attributes) {
    let scopedAttributes = [];
    
    for( let attribute in attributes) {
      if(attributes[attribute].startsWith("@.session.") || attributes[attribute].startsWith("@.page.") || attributes[attribute].startsWith("@.modal.")) {
        let initialValue = undefined;
        try {
          initialValue = resolvePath(this.scopes, attributes[attribute].substring(2))
        } catch(e) {
          // ok
        }

        scopedAttributes.push({
          id: attributes.id,
          key: attribute,
          property: attributes[attribute].substring(2),
          initialValue
        })
      } 
    }
    return scopedAttributes;
  }

  renderDom(ermlDom ) {
    let retval = {
      html: "",
      scripts: [],
      scopedAttributes: [],
      components: {}
    };
    // if thisTag is null, this is a top level item. There shouldn't be any attributes.
    for(let j in ermlDom) {
      if(j != ":@") {
        let element = ermlDom;
        if(Number.isInteger(parseInt(j))) {
          element = ermlDom[j];
        }
        if(Array.isArray(element)) {
          for(let k in element) {
            let temp = this.renderDom(element[k]);
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
                let componentClass = this.getComponentClass(part);
                if(componentClass) {
                  if(!attributes.id) {
                    attributes.id = `${part.toLowerCase()}-${uuidv4()}`;
                  }
                  let component = new componentClass(attributes.id, {...attributes})
                  /**
                   * This section needs a lot of thinking through.
                   * 
                   * When we have a custom component, we have to keep digging down til we get its custom
                   * children and get them added to the page dom.
                   * 
                   */
                  const theseScopedAttributes = this.getScopedAttributes(attributes);
                  if(theseScopedAttributes.length > 0) {
                    for(let k = 0; k < theseScopedAttributes.length; k++) {
                      attributes[theseScopedAttributes[k]["key"]] = theseScopedAttributes[k]["initialValue"];
                    }
                    // retval.scopedAttributes = [...retval.scopedAttributes, ...theseScopedAttributes]
                    for(let j in theseScopedAttributes) {
                      retval.scopedAttributes.push(theseScopedAttributes[j])
                    }
                  }
                  console.log("scoped attributes", retval.scopedAttributes)
                  retval.html += component.getHtml(element[part]);
                  
                  retval.components[attributes.id] = component;

                  if(!component.isContainer()) {
                    retval.scripts.push({ id: component.id });
                  } else { 
                    let innerItem = this.renderDom(element[part]);
                    retval.components = {...retval.components, ...innerItem.components}
                    for(let j in innerItem.scopedAttributes) {
                      retval.scopedAttributes.push(innerItem.scopedAttributes[j])
                    }
                    // retval.scopedAttributes = [...retval.scopedAttributes, innerItem.scopedAttributes]
                    retval.scripts.push({func: function() {
                      jquery(`#${attributes.id} .erstwhile-container-inner`).replaceWith(innerItem.html);
                    }})
                    retval.scripts = [...retval.scripts, ...innerItem.scripts];
                    retval.scripts.push({ id: component.id });
                  } 
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
                      for(let j in temp.scopedAttributes) {
                        retval.scopedAttributes.push(temp.scopedAttributes[j])
                      }
                      // retval.scopedAttributes = [...retval.scopedAttributes, ...temp.scopedAttributes]; 
                      retval.components = {...retval.components, ...temp.components}
                    }
                  }
                  retval.html += `${(element[part].length > 0 ? `</${part}>` : "")}`;
                }
              }
            }
          }
        }
      }
    } 
    // console.log("before return", retval.scopedAttributes)
    return retval;
  }

  openPath(path) {
    let found = false;
    for(let i in this.routes) {
      const re = new RegExp(i);
      let matches = path.match(re);
      if(matches) {
        found = this.routes[i];
      }
    }
    if(!found) {
      jquery("#root").html("<h1>Route Not Found</h1>");
    } else {
      // f_ck callbacks
      let _this = this;

      let newComponents = {};

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
          scopes: _this.scopesStore
        }

        let initsToRun = [];
        let scopedAttributes = [];
        let newLayoutComponents = false;
        let newPageComponents = false;
        if(_this.newLayoutFlag) {
          let tempMarkup = ejs.render(_this.ejs.layouts[_this.layout], templateVars);
          let layoutDom = parser.parse(tempMarkup);

          let layoutMarkup = _this.renderDom(layoutDom)
          jquery("#root").html(layoutMarkup.html)
          initsToRun = [...initsToRun, ...layoutMarkup.scripts];
          scopedAttributes = [...scopedAttributes, ...layoutMarkup.scopedAttributes]
          newLayoutComponents = layoutMarkup.components;
        }

        let thisTemplate = _this.ejs.controllers[found["controller"]][found["action"]];
        
        if(thisTemplate) {
          let tempMarkup = ejs.render(thisTemplate, templateVars)
          let templateDom = parser.parse(tempMarkup);
          let templateMarkup = _this.renderDom(templateDom)
          jquery("#page-content").html(templateMarkup.html)
          initsToRun = [...initsToRun, ...templateMarkup.scripts]
          scopedAttributes = [...scopedAttributes, ...templateMarkup.scopedAttributes]
          newPageComponents = templateMarkup.components;
        }

        // remove the old components if needed 
        if(newLayoutComponents) {
          for(let id in _this.components.layout) {
            _this.removeListeners(id);
            this.components.layout[id].unload();
          }
          _this.components.layout = newLayoutComponents;
        }
        if(newPageComponents) {
          for(let id in _this.components.page) {
            _this.removeListeners(id);
            _this.components.page[id].unload();
          }
          _this.components.page = newPageComponents;
        }

        if(initsToRun.length > 0) {
          for(let i in initsToRun) {
            if(initsToRun[i].func) {
              initsToRun[i].func();
            } else {
              let component = _this.getComponent(initsToRun[i].id);
              if(component) {
                component.initialize();
              }
            }
          }
        }
        if(scopedAttributes.length > 0) {
          for(let i in scopedAttributes) {
            if(scopedAttributes[i].id && scopedAttributes[i].property && scopedAttributes[i].key) 
              _this.registerListener(scopedAttributes[i].id,scopedAttributes[i].property,scopedAttributes[i].key)
          }
        }
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

  redirect(path, updateHistory = true) {
    if(path !== window.location.pathname) {
      if(updateHistory) {
        // History.pushState({}, '', path);
      }
      document.location = path;
    }
  }
}

module.exports = ErstwhileApp;