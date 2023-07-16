const jquery = require("jquery");
const { XMLParser } = require("fast-xml-parser");
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const ObservableSlim = require('observable-slim');
const resolvePath = require('object-resolve-path');
const bootstrap = require('bootstrap');

class ErstwhileApp {

  routes = false;

  modal = false;

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
    "page": {},
    "modal": {}
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
            let component = window.App.getComponent(id);
            for(let j in _this.listeners[changes[i].currentPath][id]) {
              component.receiveUpdate(_this.listeners[changes[i].currentPath][id][j], changes[i].newValue)
            }
          }
        }
      }
      // console.log(JSON.stringify(changes), _this.template);
    });

    // fix anchors
    jquery('body').on('click', 'a', function(e) {
      if(!jquery(this).hasClass('external')) {
        let href = jquery(this).attr('href');
        if(href &&
          !href.startsWith('#') &&
          !href.startsWith('http://') &&
          !href.startsWith('https://') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') 
          ) {
            e.preventDefault();
            e.stopPropagation()
            window.App.redirect(href);
          }
      }
    })

    // add popstate handler
    window.addEventListener("popstate", (event) => {
      // console.log(window.location)
      window.App.openPath(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    });
  }

  registerListener(id, property, key) {
    if(this.getDebug()) {
      console.log("registering listener", id, property, key)
    }
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
      if(this.listeners[this.idsToListeners[id][i]] && this.listeners[this.idsToListeners[id][i]][id]) {
        delete this.listeners[this.idsToListeners[id][i]][id];
      }
    }
    delete this.idsToListeners[id];
  }

  setLayout(layout) {
    if(this.layout == layout) {
      this.newLayoutFlag = false;
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

  getModal() {
    if(this.modal) {
      return this.modal;
    } else {
      this.modal = new bootstrap.Modal("#modal");
      return this.modal;
    }
  }
  getComponent(id) {
    if(this.components.layout[id]) {
      return this.components.layout[id];
    } else if(this.components.page[id]) {
      return this.components.page[id];
    } else if(this.components.modal[id]) {
      return this.components.modal[id];
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
    } else {  
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
          page: _this.scopesStore.page,
          session: _this.scopesStore.session,
          modal: _this.scopesStore.modal,
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
            if(!newLayoutComponents[id]) {
              _this.removeListeners(id);
              _this.components.layout[id].unload();
            }
          }
          _this.components.layout = newLayoutComponents;
        }
        if(newPageComponents) {
          for(let id in _this.components.page) {
            if(!newPageComponents[id]) {
              _this.removeListeners(id);
              _this.components.page[id].unload();
            }
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
                if(component.willBindEvents()) {
                  component.bindEvents();
                }
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
        history.pushState({}, '', path);
      }
      this.openPath(path)
    }
  }

  openModal(controller, modal, args) {
    let _this = this;
    // normalize the controller/modal names
    if(!controller.endsWith("Controller")) {
      controller += "Controller";
    }
    if(!modal.endsWith("Modal")) {
      modal += "Modal";
    }
    controller = controller.substring(0, 1).toUpperCase() + controller.substring(1);
    // modal = modal.substring(0, 1).toUpperCase() + modal.substring(1);

    if(!_this.controllers[controller]) {
      if(_this.getDebug()) {
        console.log(`Notice: Controller "${controller}" not found.`);
      }
    } else if(!_this.controllers[controller][modal]) {
      if(_this.getDebug()) {
        console.log(`Notice: Modal "${controller}.${modal}" not found.`);
      }
    } else {
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix : "@_",
        alwaysCreateTextNode: true,
        preserveOrder: true
      });

      _this.controllers[controller][modal]( args || {});

      let templateVars = {
        page: _this.scopesStore.page,
        session: _this.scopesStore.session,
        modal: _this.scopesStore.modal,
      }

      let initsToRun = [];
      let scopedAttributes = [];
      let newModalComponents = false;
      
      let thisTemplate = _this.ejs.controllers[controller][modal];

      if(thisTemplate) {
        _this.createModal();
        let tempMarkup = ejs.render(thisTemplate, templateVars)
        let templateDom = parser.parse(tempMarkup);
        let templateMarkup = _this.renderDom(templateDom)
        jquery("#modal .modal-body").html(templateMarkup.html)
        initsToRun = [...initsToRun, ...templateMarkup.scripts]
        scopedAttributes = [...scopedAttributes, ...templateMarkup.scopedAttributes]
        newModalComponents = templateMarkup.components;
      }

      if(newModalComponents) {
        for(let id in _this.components.modal) {
          if(!newModalComponents[id]) {
            _this.removeListeners(id);
            _this.components.modal[id].unload();
          }
        }
        _this.components.modal = newModalComponents;
      }
      
      if(initsToRun.length > 0) {
        for(let i in initsToRun) {
          if(initsToRun[i].func) {
            initsToRun[i].func();
          } else {
            let component = _this.getComponent(initsToRun[i].id);
            if(component) {
              component.initialize();
              if(component.willBindEvents()) {
                component.bindEvents();
              }
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

      // actually open it
      this.getModal().show()
    }
  }

  closeModal() {
    window.App.getModal().hide()
  }

  createModal() {
    if(jquery('#modal').length == 0) {
      let html = 
      `<div class="modal fade" id="modal" tabindex="-1" aria-labelledby="erstwhile-modal-title" aria-modal="true" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="erstwhile-modal-title">
                Modal
              </h5>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="modal-body">
              
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light-secondary" data-bs-dismiss="modal">
                <i class="bx bx-x d-block d-sm-none"></i>
                <span class="d-none d-sm-block">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
      jquery('body').append(html);
    }
  }
  /**
   * This updates the modal with the following options:
   * 
   * title
   * size
   * centered
   * buttons
   * theme
   * 
   * @param {*} args 
   */
  setModalAttributes(args) {
    this.createModal();
    for(let attr in args) {
      switch(attr) {
        case "title":
          jquery("#erstwhile-modal-title").html(args[attr]);
          break;
        case "size":
          jquery("#modal .modal-dialog").removeClass(`modal-sm`).removeClass(`modal-lg`).removeClass(`modal-xl`);
          jquery("#modal .modal-dialog").addClass(`modal-${args[attr]}`)
          break;
        case "centered":
          if(args[attr]) {
            jquery("#modal .modal-dialog").addClass(`modal-dialog-centered`);
          } else {
            jquery("#modal .modal-dialog").removeClass(`modal-dialog-centered`);
          }
          break;
        case "scroll":
          if(args[attr]) {
            jquery("#modal .modal-dialog").addClass(`modal-dialog-scrollable`);
          } else {
            jquery("#modal .modal-dialog").removeClass(`modal-dialog-scrollable`);
          }
          break;
        case "theme":
          jquery("#modal .modal-header").removeClass(`bg-primary`).removeClass(`bg-secondary`).removeClass(`bg-danger`).removeClass(`bg-success`).removeClass(`bg-warning`).removeClass(`bg-info`).removeClass(`bg-dark`);
          jquery("#modal .modal-header h5").removeClass("white")
          jquery("#modal .modal-header").addClass(`bg-${args[attr]}`);
          if(args[attr] == 'primary' || args[attr] == 'success' || args[attr] == 'danger' || args[attr] == 'dark' || args[attr] == 'info' ) {
            jquery("#modal .modal-header h5").addClass("white")
          }
          break;
        case "buttons":
          jquery("#modal .modal-footer").empty();
          jquery("#modal .modal-footer").append(`
          <button type="button" class="btn btn-light-secondary" data-bs-dismiss="modal">
            <i class="bx bx-x d-block d-sm-none"></i>
            <span class="d-none d-sm-block">Close</span>
          </button>
          `);
          for(let i in args[attr]) {
            if(!args[attr][i].label) {
              if(this.getDebug()) {
                console.log("Notice: Modal button missing label. Skipped.")
              }
            } else if(!args[attr][i].func || typeof args[attr][i].func != 'function') {
              if(this.getDebug()) {
                console.log("Notice: Modal button missing function. Skipped.")
              }
            } else {
              jquery("#modal .modal-footer").append(`
              <button type="button" class="btn ${(args[attr][i].color ? `btn-${args[attr][i].color}` : "")} ms-1" id="modal-button-${i}">
                <span class="d-block">${args[attr][i].label}</span>
              </button>
              `)
              jquery(`#modal-button-${i}`).on('click', () => {
                args[attr][i].func(args[attr][i].data || {});
              })
            }
          }
          break;
      }
    }
  }
}

module.exports = ErstwhileApp;