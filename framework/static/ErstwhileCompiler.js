const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const ErstwhileController = require('./controllers/ErstwhileController');

function validateRoute (route, definition, controllers = []) {
  if(route.match(/^(\/:?([a-zA-Z0-9]+))+\/?$/) != null) {
  } else {
    return false;
  }
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
            if(!components[componentDirectories[i].toLowerCase()].hasOwnProperty('getCSS')) {
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
              if(!components[componentDirectories[i].toLowerCase()].hasOwnProperty('getCSS')) {
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
        if(!fs.existsSync(`${process.cwd()}/dist/assets`)) {
          fs.mkdirSync(`${process.cwd()}/dist/assets`);
        }
        if(!fs.existsSync(`${process.cwd()}/dist/assets/css`)) {
          fs.mkdirSync(`${process.cwd()}/dist/assets/css`);
        }
        fs.writeFileSync(`${process.cwd()}/dist/assets/css/style.css`, cssFile);
      }
    }
  },
  buildApplication: function() {
    console.log("Building application...");
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
        } else {
          let files = fs.readdirSync(`${process.cwd()}/build`);
          for (const file of files) {
            fs.rmSync(path.join(`${process.cwd()}/build`, file), {recursive: true, force: true});
          }
        }

        // grab each theme component
        let componentDirectories = fs.readdirSync(`${process.cwd()}/themes/${config.theme}`);
        for(let i in componentDirectories) {
          if(
            fs.lstatSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}`).isDirectory() &&
            fs.existsSync(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component.js`)) {
            components[componentDirectories[i].toLowerCase()] = require(`${process.cwd()}/themes/${config.theme}/${componentDirectories[i]}/component`);
            if(!components[componentDirectories[i].toLowerCase()].hasOwnProperty('getCSS')) {
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
              if(!components[componentDirectories[i].toLowerCase()].hasOwnProperty('getCSS')) {
                console.log(`Notice: Component ${componentDirectories[i]} in app does not seem to be valid. Skipped.`)
                delete components[componentDirectories[i].toLowerCase()];
              } 
            } 
          }
        }

        // set up the dist directory
        if(!fs.existsSync(`${process.cwd()}/dist`)) {
          fs.mkdirSync(`${process.cwd()}/dist`);
        }
        
        // render index.html
        let indexFile = ejs.render(fs.readFileSync(`${process.cwd()}/framework/base/public/index.html`, 'utf8'), {title: config.title || "Erstwhile Test App"});
        fs.writeFileSync(`${process.cwd()}/dist/index.html`, indexFile);

        // get the controllers
        let controllers = {};
        let controllerRoutes = {};
        if(fs.existsSync(`${process.cwd()}/app/controllers`) && fs.lstatSync(`${process.cwd()}/app/controllers`).isDirectory()) {
          let controllerFiles = fs.readdirSync(`${process.cwd()}/app/controllers`);
          for(let i in controllerFiles) {
            if(!controllerFiles[i].substring(0, controllerFiles[i].indexOf('.')).endsWith("Controller")) {
              console.log(`Notice: By convention, all controller files should end with "Controller" and ${controllerFiles[i].substring(0, controllerFiles[i].indexOf('.'))} does not. Skipping.`);
            } else {
              let controllerName = controllerFiles[i].substring(0, controllerFiles[i].indexOf('.');
              controllers[controllerName] = require(`${process.cwd()}/app/controllers/${controllerName}`);
              try {
                let temp = new controllers[controllerName]();
                if(temp instanceof ErstwhileController) {
                  controllerRoutes[controllerName] = {
                    base: "",
                    routes: []
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
                  if(temp.getRoutes() === false) {
                    // bummer. now we have to iterate over the methods and pull out the actions
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

        

        // collect the routes
        if(fs.existsSync(`${process.cwd()}/app/config/routes.js`)) {
          let tempRoutes = require(`${process.cwd()}/app/config/routes`);

        }
      }
    }
  }
}