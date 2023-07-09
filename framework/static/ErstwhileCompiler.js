const axios = require('axios');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const ErstwhileController = require('./controllers/ErstwhileController');
const ErstwhileComponent = require('./components/ErstwhileComponent');

function validateRoute (route, definition, controllers = []) {
  if(route.match(/^(\/:?([a-zA-Z0-9]+))+\/?$/) != null) {
  } else {
    return false;
  }
}

function regexifyPath (path) {
  let retval = "";
  if(path == "/") {
    retval = '\\/';
  } else {
    let parts = path.split("/");
    for(let i in parts) {
      if(parts[i].trim() != '') {
        retval += '\\/';
        if(parts[i].substring(0,1) == ":") {
          retval += `(?<${parts[i].substring(1)}>[a-zA-Z0-9_-]+)`;
        } else {
          retval += parts[i];
        }
      }
    }
  }
  return retval;
}

function precompileActionEJS(appDirectory, controller, action) {
    
  let controllerPath = controller.substring(0, 1).toLowerCase() + controller.substring(1, controller.length - "Controller".length);
  let actionPath = action.endsWith("Action") ? action.substring(0, action.length - "Action".length ) : action.substring(0, action.length - "Modal".length );
  if(fs.existsSync(`${appDirectory}/views/${controllerPath}/${actionPath}.ejs`)) {
    return fs.readFileSync(`${appDirectory}/views/${controllerPath}/${actionPath}.ejs`, "utf8");
  } else {
    return false;
  }
}

function precompileComponentEJS(componentPath) {
  if(fs.existsSync(`${componentPath}/component.ejs`)) {
    return fs.readFileSync(`${componentPath}/component.ejs`, "utf8");
  }
  return '';
}

module.exports = {
  buildModels: function() {
    console.log("Building Models...")
    if(!process.env.ERSTWHILE_API_URL) {
      console.log("Environment variable ERSTWHILE_API_URL missing. This should point to the URL of the server.")
    } else if(!process.env.ERSTWHILE_API_DESCRIPTION_PATH) {
      console.log("Environment variable ERSTWHILE_API_DESCRIPTION_PATH missing. This is the path to the API description, typically /describe.")
    } else {
      // let's grab  the config
      axios.get(`${process.env.ERSTWHILE_API_URL}${process.env.ERSTWHILE_API_DESCRIPTION_PATH}`)
      .then(function (apiResponse) {
        // grab the template, instantiate the object
        let ejsTemplate = fs.readFileSync(`${process.cwd()}/framework/templates/model.ejs`, 'utf8');
        let ejsPayload = {
          version: apiResponse.data.version,
          application: apiResponse.data.application,
          entities: {}
        } 
        
        // authentication
        if(apiResponse.data.authentication) {
          let entity = {
            name: "Authentication",
            methods: {}
          }
          let authEndpointTypes = ['signup','login', 'forgotPassword', 'currentUser'];
          for(let i in authEndpointTypes) {
            if(apiResponse.data.authentication[authEndpointTypes[i]]) {
              if(Array.isArray(apiResponse.data.authentication[authEndpointTypes[i]])) {
                for(let j in apiResponse.data.authentication[authEndpointTypes[i]]) {
                  let endpoint = apiResponse.data.authentication[authEndpointTypes[i]][j];
                  let key = endpoint.key ? endpoint.key : authEndpointTypes[i];
                  if(authEndpointTypes[i] == 'login') {
                    endpoint.login = true;
                  }
                  entity.methods[key] = endpoint; 
                } 
              } else {
                let endpoint = apiResponse.data.authentication[authEndpointTypes[i]];
                let key = endpoint.key ? endpoint.key : authEndpointTypes[i];
                if(authEndpointTypes[i] == 'login') {
                  endpoint.login = true;
                }
                entity.methods[key] = endpoint; 
              }
            }
          }
          ejsPayload.entities["authentication"] = entity;
        }
        if(apiResponse.data.entities) {
          for(let entityKey in apiResponse.data.entities) {
            let entity = {
              name: apiResponse.data.entities[entityKey].name,
              methods: {}
            }
            if(apiResponse.data.entities[entityKey].methods) {
              for(let i in apiResponse.data.entities[entityKey].methods) {
                entity.methods[apiResponse.data.entities[entityKey].methods[i].key] = apiResponse.data.entities[entityKey].methods[i];
              }
            }
            ejsPayload.entities[entityKey] = entity;
          }
        }

        let renderedTemplate = ejs.render(ejsTemplate, ejsPayload);

        console.log(`Writing models to ${process.cwd()}/app/models/models.js`)
        fs.writeFileSync(`${process.cwd()}/app/models/models.js`, renderedTemplate);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        console.log(`Unable to connect to ${process.env.ERSTWHILE_API_URL}${process.env.ERSTWHILE_API_DESCRIPTION_PATH}`)
      })
      .finally(function () {
        // always executed
      });
    }
  },
  buildStyles: function(args = null) {
    console.log("Building styles...");
    // get the config
    console.log(`${process.cwd()}/app/config/app.js`)
    const config = require(`${process.cwd()}/app/config/app.js`);
    
    /**
     * Some Variables
     */
    let components = {};


    // build the theme CSS
    if(!fs.existsSync(`${process.cwd()}/themes/${config.theme}/theme.js`)) {
      console.log(`Theme "${config.theme}" not found in /themes`);
    } else {
      const themeClass = require(`${process.cwd()}/themes/${config.theme}/theme`);

      // ensure all of the required libraries are present
      let requires = themeClass.getRequires(), requiresSuccess = true, fontFolder = themeClass.getFontFolder(process.cwd());
      for(let i = 0; i < requires.length; i++) {
        try {
          let temp = require(requires[i]);
        } catch(r) {
          requiresSuccess = false;
          console.log(`Library "${requires[i]}" not found.`);
        } 
      } 
      if(requiresSuccess) {
        // create the working directory if it does not exist, empty it if it does
        if(!fs.existsSync(`${process.cwd()}/build`)) {
          fs.mkdirSync(`${process.cwd()}/build`);
        }
        /*
        } else {
          let files = fs.readdirSync(`${process.cwd()}/build`);
          for (const file of files) {
            fs.rmSync(path.join(`${process.cwd()}/build`, file), {recursive: true, force: true});
          }
        }
        */
       
        // get the theme CSS, save it into the working directory
        let cssFile = themeClass.getCSS(process.cwd(), `${process.cwd()}/build`, config.themeConfig || {}) + `\n\n`;

        // grab each theme component
        let componentDirectories = fs.readdirSync(`${process.cwd()}/themes/${config.theme}`);
        for(let i in componentDirectories) {
          if(
            fs.lstatSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}`).isDirectory() &&
            fs.existsSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component.js`)) {
            components[componentDirectories[i].toLowerCase()] = require(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component`);
            if(!components[componentDirectories[i].toLowerCase()].getCSS) {
              console.log(`Notice: Component ${componentDirectories[i]} in theme does not seem to be valid. Skipped.`)
              delete components[componentDirectories[i].toLowerCase()];
            } 
          } 
        }

        // grab each app component, overwriting the theme as is necessary
        if(fs.existsSync(`${process.cwd()}/app/components`) && fs.lstatSync(`${process.cwd()}/app/components`).isDirectory()) {
          componentDirectories = fs.readdirSync(`${process.cwd()}/app/components`);
          for(let i in componentDirectories) {
            if(
              fs.lstatSync(`${process.cwd()}/app/components/${componentDirectories[i]}`).isDirectory() &&
              fs.existsSync(`${process.cwd()}/app/components/${componentDirectories[i]}/component.js`)) {
              components[componentDirectories[i].toLowerCase()] = require(`${process.cwd()}/app/components/${componentDirectories[i]}/component`);
              if(!components[componentDirectories[i].toLowerCase()].getCSS) {
                console.log(`Notice: Component ${componentDirectories[i]} in app does not seem to be valid. Skipped.`)
                delete components[componentDirectories[i].toLowerCase()];
              } 
            } 
          }
        }

        // now that we have the components, get their CSS.
        for(let componentKey in components) {
          cssFile += components[componentKey].getCSS(process.cwd(), `${process.cwd()}/build`, config.themeConfig || {}) + `\n\n`;
        }

        // set up the dist directory
        if(!fs.existsSync(`${process.cwd()}/dist`)) {
          fs.mkdirSync(`${process.cwd()}/dist`);
        }
        if(fs.existsSync(`${process.cwd()}/app/public`)) {
          fse.copySync(`${process.cwd()}/app/public`, `${process.cwd()}/dist`, { overwrite: true })
        }
        if(!fs.existsSync(`${process.cwd()}/dist/assets`)) {
          fs.mkdirSync(`${process.cwd()}/dist/assets`);
        }
        if(!fs.existsSync(`${process.cwd()}/dist/assets/css`)) {
          fs.mkdirSync(`${process.cwd()}/dist/assets/css`);
        }
        if(!fs.existsSync(`${process.cwd()}/dist/assets/fonts`)) {
          fs.mkdirSync(`${process.cwd()}/dist/assets/fonts`);
        }
        fse.copySync(`${fontFolder}`, `${process.cwd()}/dist/assets/fonts`, { overwrite: true })
        fs.writeFileSync(`${process.cwd()}/dist/assets/css/style.css`, cssFile);
      }
    }
  },
  buildApplication: function() {
    console.log("Building application...");
    // get the config
    const config = require(`${process.cwd()}/app/config/app.js`);
    
    /**
     * Some Variables
     */
    let componentClasses = {};
    let properComponentNames = {};
    let controllers = {};
    let controllerRoutes = {};
    let routes = {};
    let modals = {};
    let components = {};
    let ejsObj = {
      components: {},
      controllers: {},
      layouts: {}
    }

    // clear out the build/components directory if it exists
    if(!fs.existsSync(`${process.cwd()}/build`)) {
      fs.mkdirSync(`${process.cwd()}/build`);
    }
    if(!fs.existsSync(`${process.cwd()}/build/components`)) {
      fs.mkdirSync(`${process.cwd()}/build/components`);
    } else {
      let files = fs.readdirSync(`${process.cwd()}/build/components`);
      for (const file of files) {
        fs.rmSync(path.join(`${process.cwd()}/build/components`, file), {recursive: true, force: true});
      }
    }

    // build the theme CSS
    if(!fs.existsSync(`${process.cwd()}/themes/${config.theme}/theme.js`)) {
      console.log(`Theme "${config.theme}" not found in /themes`);
    } else {
      const themeClass = require(`${process.cwd()}/themes/${config.theme}/theme`);

      // ensure all of the required libraries are present
      let requires = themeClass.getRequires(), requiresSuccess = true;
      for(let i = 0; i < requires.length; i++) {
        try {
          let temp = require(requires[i]);
        } catch(r) {
          requiresSuccess = false;
          console.log(`Library "${requires[i]}" not found.`);
        } 
      } 
      if(requiresSuccess) {
        // create the working directory if it does not exist, empty it if it does
        if(!fs.existsSync(`${process.cwd()}/build`)) {
          fs.mkdirSync(`${process.cwd()}/build`);
        } 

        // grab each theme component
        let componentDirectories = fs.readdirSync(`${process.cwd()}/themes/${config.theme}`);
        for(let i in componentDirectories) {
          if(
            fs.lstatSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}`).isDirectory() &&
            fs.existsSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component.js`)) {
            componentClasses[componentDirectories[i].toLowerCase()] = require(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component`);
            properComponentNames[componentDirectories[i].toLowerCase()] = componentDirectories[i];
            let temp = new componentClasses[componentDirectories[i].toLowerCase()]("temp", {});
            if(!(temp instanceof ErstwhileComponent)) {
              console.log(`Notice: Component ${componentDirectories[i]} in theme does not seem to be valid. Skipped.`)
              delete componentClasses[componentDirectories[i].toLowerCase()];
            } else {
              fse.copySync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}`, `${process.cwd()}/build/components/${componentDirectories[i]}`, {overwrite: true})
            }
          } 
        }

        // grab each app component, overwriting the theme as is necessary
        if(fs.existsSync(`${process.cwd()}/app/components`) && fs.lstatSync(`${process.cwd()}/app/components`).isDirectory()) {
          componentDirectories = fs.readdirSync(`${process.cwd()}/app/components`);
          for(let i in componentDirectories) {
            if(
              fs.lstatSync(`${process.cwd()}/app/components/${componentDirectories[i]}`).isDirectory() &&
              fs.existsSync(`${process.cwd()}/app/components/${componentDirectories[i]}/component.js`)) {
              componentClasses[componentDirectories[i].toLowerCase()] = require(`${process.cwd()}/app/components/${componentDirectories[i]}/component`);
              properComponentNames[componentDirectories[i].toLowerCase()] = componentDirectories[i];
              let temp = new componentClasses[componentDirectories[i].toLowerCase()]();
              if(!(temp instanceof ErstwhileComponent)) {
                console.log(`Notice: Component ${componentDirectories[i]} in app does not seem to be valid. Skipped.`)
                delete componentClasses[componentDirectories[i].toLowerCase()];
              } else {
                fse.copySync(`${process.cwd()}/app/components/${componentDirectories[i]}`, `${process.cwd()}/build/components/${componentDirectories[i]}`, {overwrite: true})
              }
            } 
          }
        }

        // populate the ejs for the components
        for(let componentName in componentClasses) {
          ejsObj.components[componentName] = precompileComponentEJS(`${process.cwd()}/themes/${config.theme}/${properComponentNames[componentName]}`);
        }

        // populate the app's layouts into the ejs object
        if(fs.existsSync(`${process.cwd()}/app/views/layouts`)) {
          let layoutFiles = fs.readdirSync(`${process.cwd()}/app/views/layouts`);
          for(let i in layoutFiles) {
            let layoutFile = layoutFiles[i];
            if(layoutFile.endsWith(".ejs")) {
              ejsObj.layouts[layoutFile.substring(0, layoutFile.length - 4)] = fs.readFileSync(`${process.cwd()}/app/views/layouts/${layoutFile}`, "utf8");
            } else {
              console.log(`Notice: The layout ${layoutFile} doesn't appear to be a .ejs file. Skipping`)
            }
          }
          
        }

        for(let componentName in componentClasses) {
          ejsObj.components[componentName] = precompileComponentEJS(`${process.cwd()}/themes/${config.theme}/${properComponentNames[componentName]}`);
        }

        // get the controllers
        if(fs.existsSync(`${process.cwd()}/app/controllers`) && fs.lstatSync(`${process.cwd()}/app/controllers`).isDirectory()) {
          let controllerFiles = fs.readdirSync(`${process.cwd()}/app/controllers`);
          for(let i in controllerFiles) {
            if(!controllerFiles[i].substring(0, controllerFiles[i].indexOf('.')).endsWith("Controller")) {
              console.log(`Notice: By convention, all controller files should end with "Controller" and ${controllerFiles[i].substring(0, controllerFiles[i].indexOf('.'))} does not. Skipping.`);
            } else {
              let controllerName = controllerFiles[i].substring(0, controllerFiles[i].indexOf('.'));
              controllers[controllerName] = require(`${process.cwd()}/app/controllers/${controllerName}`);
              try {
                let temp = new controllers[controllerName];
                if(temp instanceof ErstwhileController) {
                  controllerRoutes[controllerName] = {
                    base: "",
                    routes: [],
                    modals: []
                  }
                  // figure out if this controller uses default routing
                  if(temp.getControllerPath() === false) {
                    if(controllerName == "IndexController") {
                      controllerRoutes[controllerName].base = '/';
                    } else {
                      controllerRoutes[controllerName].base = `/${controllerName.substring(0,1).toLowerCase()}${controllerName.substring(1, controllerName.length - "Controller".length)}`;
                    }
                  } else {
                    controllerRoutes[controllerName].base = `/${temp.getControllerPath()}`;
                  }

                  // thanks stackoverflow
                  function getAllMethods(toCheck) {
                    const props = [];
                    let obj = toCheck;
                    do {
                        props.push(...Object.getOwnPropertyNames(obj));
                    } while (obj = Object.getPrototypeOf(obj));
                    
                    return props.sort().filter((e, i, arr) => { 
                      if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
                    });
                  }
                  if(temp.getRoutes() === false) {
                    // bummer. now we have to iterate over the methods and pull out the actions
                    let methods = getAllMethods(temp);
                    for(let j in methods) {
                      let tempMethod = methods[j];
                      if(tempMethod == "indexAction") {
                        controllerRoutes[controllerName].routes.push({route: "", action: tempMethod, firstWildcard: 1});
                      } else if(tempMethod != "preAction" && tempMethod != "postAction" && tempMethod.endsWith("Action")) {
                        controllerRoutes[controllerName].routes.push({route: `/${tempMethod.substring(0, tempMethod.indexOf("Action"))}`, action: tempMethod, firstWildcard: 2});
                      }
                    }
                  } else {
                    let localRoutes = temp.getControllerPath();
                    for(let key in localRoutes){
                      if(localRoutes[key].action && temp.hasOwnProperty(`${localRoutes[key].action}Action`)) {

                        let parts = key.split("/");
                        let firstWildcard = false;
                        for(let k = 0; k < parts.length; k++) {
                          if(!firstWildcard && parts[k].startsWith(":")) {
                            firstWildcard = k + 1;
                          }
                        }
                        if(!firstWildcard) {
                          if(key == '' || key == "/") {
                            firstWildcard = 1;  
                          } else {
                            firstWildcard = parts.length;
                          }
                          
                        }
                        controllerRoutes[controllerName].routes.push({route: key, action: localRoutes[key].action, firstWildcard});
                      } else {
                        console.log(`Notice: In ${controllerName} routes, "${key}" is missing its "action" key. Skipping.`)
                      }
                    }
                  }

                  // get the modals
                  let methods = getAllMethods(temp);
                  for(let j in methods) {
                    let tempMethod = methods[j];
                    if(tempMethod.endsWith("Modal")) {
                      controllerRoutes[controllerName].modals.push(tempMethod.substring(0, tempMethod.length - "Method".length + 1));
                    }
                  }

                  // get the action ejs
                  for(let j in methods) {
                    let tempMethod = methods[j];
                    if(tempMethod.endsWith("Modal") || (tempMethod.endsWith("Action") && tempMethod != "preAction" && tempMethod != "postAction")) {
                      if(!ejsObj.controllers[controllerName]) {
                        ejsObj.controllers[controllerName] = {}
                      }
                      console.log("ejs", `${process.cwd()}/app`, controllerName, tempMethod)
                      ejsObj.controllers[controllerName][tempMethod] = precompileActionEJS(`${process.cwd()}/app`, controllerName, tempMethod);
                    }
                  }

                } else {
                  console.log(`Notice: Controller ${controllerName} isn't a subclass of ErstwhileController. Skipped.`)
                  delete controllers[controllerName];
                }

              } catch(e) {
                console.log(e);
                console.log(`Notice: Controller ${controllerName} isn't a subclass of ErstwhileController. Skipped.`)
                delete controllers[controllerName];
              }
            } 
          }
        }

        // merge the controller routes into routes tree.
        // 1. Start with the IndexController
        let routeSort = (a,b) => {
          if(a.firstWildcard > b.firstWildcard) {
            return -1;
          } else if(a.firstWildcard < b.firstWildcard) {
            return 1;
          } else {
            return 0;
          }
        }
        if(controllerRoutes.hasOwnProperty("IndexController")) {
          // first move all of the items with wildcards the latest to the front
          controllerRoutes["IndexController"].routes.sort(routeSort)
          // do the routes
          for(let i in controllerRoutes["IndexController"].routes) {
            let tempRoute = `${(controllerRoutes["IndexController"].routes[i].action == "indexAction" ? '/$' : controllerRoutes["IndexController"].routes[i].route)}`;
            let regexVersion = regexifyPath(tempRoute);
            routes[regexVersion] = {controller: "IndexController", action: controllerRoutes["IndexController"].routes[i].action };
          }
          // do the modals
          for(let i in controllerRoutes["IndexController"].modals) {
            modals[`IndexController:${controllerRoutes["IndexController"].modals[i]}`] = {controller: "IndexController", action: controllerRoutes["IndexController"].modals[i] };
          }
        }
        // 2. Now do the other controllers. If they collide with those in the IndexController, they are used.
        for(let controllerKey in controllerRoutes) {
          if(controllerKey != "IndexController") {
            // first move all of the items with wildcards the latest to the front
            controllerRoutes[controllerKey].routes.sort(routeSort)
            // do the routes
            for(let i in controllerRoutes[controllerKey].routes) {
              let tempRoute = `${controllerRoutes[controllerKey].base}${(controllerRoutes[controllerKey].routes[i].route == "" ? "$" : controllerRoutes[controllerKey].routes[i].route)}`;
              let regexVersion = regexifyPath(tempRoute);
              routes[regexVersion] = {controller: controllerKey, action: controllerRoutes[controllerKey].routes[i].action };
            }
            // do the modals
            for(let i in controllerRoutes[controllerKey].modals) {
              modals[`${controllerKey}:${controllerRoutes[controllerKey].modals[i]}`] = {controller: controllerKey, action: controllerRoutes[controllerKey].modals[i] };
            }
          }
        }

        // 3. Collect the overridden routes
        if(fs.existsSync(`${process.cwd()}/app/config/routes.js`)) {
          let tempRoutes = require(`${process.cwd()}/app/config/routes`);
          for(let i in tempRoutes) {
            let tempRoute = tempRoutes[i];
            if(tempRoute.route && tempRoute.controller && tempRoute.action) {
              let regexVersion = regexifyPath(tempRoute.route);
              routes[regexVersion] = {controller: tempRoute.controller, action: tempRoute.action };
            } else {
              console.log(`Notice: routes must have keys for "route", "controller", and "action". Skipped.`)
            }
          }
        }

        // 4. Copy the filesystem changes
        // set up the dist directory
        if(!fs.existsSync(`${process.cwd()}/dist`)) {
          fs.mkdirSync(`${process.cwd()}/dist`);
        }
        
        // render index.html
        let indexFile = ejs.render(fs.readFileSync(`${process.cwd()}/framework/base/public/index.html`, 'utf8'), {title: config.title || "Erstwhile Test App"});
        fs.writeFileSync(`${process.cwd()}/dist/index.html`, indexFile);

        try {
          fse.copySync(`${process.cwd()}/app/config`, `${process.cwd()}/build/config`, { overwrite: true })
          fse.copySync(`${process.cwd()}/app/models`, `${process.cwd()}/build/models`, { overwrite: true })
          fse.copySync(`${process.cwd()}/app/controllers`, `${process.cwd()}/build/controllers`, { overwrite: true })
          fse.copySync(`${process.cwd()}/app/App.js`, `${process.cwd()}/build/App.js`, { overwrite: true })
        } catch (err) {
          console.error("Error copying controllers")
        }

        // 5. Render the bootstrap
        // render index.html
        let componentList = [];
        for(let i in properComponentNames) {
          componentList.push(properComponentNames[i]);
        }
        let bootstrapFile = ejs.render(fs.readFileSync(`${process.cwd()}/framework/templates/bootstrap.ejs`, 'utf8'), {
          ejs: JSON.stringify(ejsObj),
          routes: JSON.stringify(routes),
          modals: JSON.stringify(modals),
          controllerList: JSON.stringify(Object.keys(controllers)),
          componentList: JSON.stringify(componentList) 
        });
        fs.writeFileSync(`${process.cwd()}/build/bootstrap.js`, bootstrapFile);

        // clear up old main.js
        let regex = /^main.([a-zA-Z0-9]+).(hot-update.js|hot-update.json)$/
        fs.readdirSync(`${process.cwd()}/dist`).filter(f => regex.test(f)).map(f => fs.unlinkSync(`${process.cwd()}/dist` + '/' + f))
      }
    }
  }
}