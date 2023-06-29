#!/usr/bin/env node
const { exit } = require('process');
require('dotenv').config();
const ejs = require('ejs');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { theme } = require('../../app/config/app');

/**
 * This is the command matrix for Erstwhile
 */
const arguments = process.argv.slice(2);
const argumentMatrix = {
    "build": {
        "subcommands": {
            "models": {
              "requiresSubcommands": false,
              "description": "This subcommand attempts to connect to an Erstwhile-compatible server and build out the Models."
            },
            "workingDirectory": {
              "requiresSubcommands": false,
              "description": "This subcommand creates the working directory needed for compilation of the application."
            }
        },
        "description": `This command outputs files into the project structure.`,
        "requiresSubcommands": true
    }
}

let primaryCommand = false;
let subCommand = false;

console.log("\n" +chalk.green("Erstwhile CLI"))
if(arguments.length == 0) {
    console.log("Like any good function, we need some arguments!\n\nUsage:");
    for(let command in argumentMatrix) {
        console.log(`${command}: ${argumentMatrix[command].description}`)
    }
    console.log('')
    process.exit()
} else {
  primaryCommand = arguments[0];
  if(arguments.length == 1 && argumentMatrix[primaryCommand].requiresSubcommands) {
    console.log(`The "${primaryCommand}" command needs a little more.\n\nUsage:`);
    for(let command in argumentMatrix[primaryCommand].subcommands) {
      console.log(`${primaryCommand} ${command}: ${argumentMatrix[primaryCommand].subcommands[command].description}`)
    }
    console.log('');
    process.exit()
  } else if(arguments.length >1) {
    subCommand = arguments[1];
  } 
}

/**
 * Let's get going!
 */
if(primaryCommand == 'build') {
  if(subCommand == "models") {
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
  } else if(subCommand == "workingDirectory") {
    // get the config
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
        } else {
          let files = fs.readdirSync(`${process.cwd()}/dist`);
          for (const file of files) {
            fs.rmSync(path.join(`${process.cwd()}/dist`, file), {recursive: true, force: true});
          }
        }
        fs.mkdirSync(`${process.cwd()}/dist/assets`);
        fs.mkdirSync(`${process.cwd()}/dist/assets/css`);
        fs.mkdirSync(`${process.cwd()}/dist/assets/js`);
        
        fs.writeFileSync(`${process.cwd()}/dist/assets/css/style.css`, cssFile);

        // render index.html
        let indexFile = ejs.render(fs.readFileSync(`${process.cwd()}/framework/base/public/index.html`, 'utf8'), {title: config.title || "Erstwhile Test App"});
        fs.writeFileSync(`${process.cwd()}/dist/index.html`, indexFile);
      }
    }
    

  }
}