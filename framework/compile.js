const fs = require('fs');
const path = require('path');


const __baseDir = `${__dirname}/..`;


/*
  This stores the app configuration
  */
let appConfig = false;

/*
This stores the theme configuration
  */
let themeConfig = false;

/*
  This stores the Component JSON.
  */
let components = {};

/*
  The JS Library List
*/
let jsLibraries = [];

/*
  The SASS File List
*/
let cssFiles = [];

/* 
  The component SCSS and JS files
*/
let componentSCSS = [], componentJS = [];

// clear out the build directory
console.log("Clearing build directory...")
let buildFiles = fs.readdirSync(`${__baseDir}/build`);
for(let i = 0; i < buildFiles.length; i++) {
  fs.unlinkSync(path.join(`${__baseDir}/build`, buildFiles[i]));
};

try {
  appConfig = JSON.parse(fs.readFileSync(`${__baseDir}/app/config/app.json`));
} catch(e) {
  console.log(`Cannot open configuration file at "${__baseDir}/app/config/app.json"`);
}


let breakOut = false;
if(appConfig) {
  appConfig.theme = appConfig.theme || 'neat'; 

  /* 
    Step 1: Load the Theme Components
  */
  if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/theme.json`)) {
    // load the theme configuration
    themeConfig = JSON.parse(fs.readFileSync(`${__baseDir}/themes/${appConfig.theme}/theme.json`));
    if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components`)) {
      // load all of the theme components
      let themeComponents = fs.readdirSync(`${__baseDir}/themes/${appConfig.theme}/components`);
      for(let i = 0 ; i < themeComponents.length; i++) {
        // get the component config
        try {
          let componentConfig = JSON.parse(fs.readFileSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.json`));
          // get the libary JS files
          if(componentConfig.hasOwnProperty('libraries') && Array.isArray(componentConfig.libraries)) {
            for(let j = 0; j < componentConfig.libraries; j++) {
              if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/libraries/js/${componentConfig.libraries[j]}`)) {
                jsLibraries.push({
                  source: `${__baseDir}/themes/${appConfig.theme}/libraries/js/${componentConfig.libraries[j]}`,
                  target: `${__baseDir}/build/js/${componentConfig.libraries[j]}`
                })
              } else {
                breakOut = true;
                console.log(`Cannot find library "${__baseDir}/themes/${appConfig.theme}/libraries/js/${componentConfig.libraries[j]}" for component ${themeComponents[i]}`);
              }
            }
            if(!breakOut) {
              // get the library CSS files
              if(componentConfig.hasOwnProperty('cssFiles') && Array.isArray(componentConfig.cssFiles)) {
                for(let j = 0; j < componentConfig.cssFiles; j++) {
                  if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/libraries/css/${componentConfig.cssFiles[j]}`)) {
                    cssFiles.push({
                      source: `${__baseDir}/themes/${appConfig.theme}/libraries/css/${componentConfig.cssFiles[j]}`,
                      target: `${__baseDir}/build/css/${componentConfig.cssFiles[j]}`
                    })
                  } else {
                    breakOut = true;
                    console.log(`Cannot find library "${__baseDir}/themes/${appConfig.theme}/libraries/css/${componentConfig.libraries[j]}" for component ${themeComponents[i]}`);
                  }
                }
                if(!breakOut) {
                  // copy in the component SASS
                  if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.scss`)) {
                    componentSCSS.push({
                      source: `${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.scss}`,
                      target: `${__baseDir}/build/css/components/${themeComponents[i]}.scss`
                    })
                  }

                  // copy in the component JS
                  if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.js`)) {
                    componentJS.push({
                      source: `${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.js}`,
                      target: `${__baseDir}/build/css/components/${themeComponents[i]}.js`
                    })
                  }
                }
              }
            }
          }

          let component = require(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.js`);
          if(componentConfig.hasOwnProperty('render') && componentConfig.render == 'ejs') {
            if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.ejs`)) {
              component.template = fs.readFileSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.ejs`)
            }
          }

          // add the new component to the component list
          components[themeComponents[i]] = component; 

        } catch(e) {
          console.log(`Cannot open component file at "${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.json"`);
        }
      }

    } else {
      console.log(`Theme components not found at "${__baseDir}/themes/${appConfig.theme}/components"`);
    }
  } else {
    console.log(`Theme config not found at "${__baseDir}/themes/${appConfig.theme}/theme.json"`);
  }

  /* 
    Step 2: Copy in the Overridden Components
  */
  if(fs.existsSync(`${__baseDir}/app/components`)) {
    // load all of the app components
    let appComponents = fs.readdirSync(`${__baseDir}/app/components`);
    for(let i = 0 ; i < appComponents.length; i++) {
      // get the component config
      try {
        let componentConfig = JSON.parse(fs.readFileSync(`${__baseDir}/app/components/${appComponents[i]}/component.json`));
        // get the libary JS files
        if(componentConfig.hasOwnProperty('libraries') && Array.isArray(componentConfig.libraries)) {
          for(let j = 0; j < componentConfig.libraries; j++) {
            if(fs.existsSync(`${__baseDir}/app/libraries/js/${componentConfig.libraries[j]}`)) {
              jsLibraries.push({
                source: `${__baseDir}/app/libraries/js/${componentConfig.libraries[j]}`,
                target: `${__baseDir}/build/js/${componentConfig.libraries[j]}`
              })
            } else {
              breakOut = true;
              console.log(`Cannot find library "${__baseDir}/app/libraries/js/${componentConfig.libraries[j]}" for component ${appComponents[i]}`);
            }
          }
          if(!breakOut) {
            // get the library CSS files
            if(componentConfig.hasOwnProperty('cssFiles') && Array.isArray(componentConfig.cssFiles)) {
              for(let j = 0; j < componentConfig.cssFiles; j++) {
                if(fs.existsSync(`${__baseDir}/app/libraries/css/${componentConfig.cssFiles[j]}`)) {
                  cssFiles.push({
                    source: `${__baseDir}/app/libraries/css/${componentConfig.cssFiles[j]}`,
                    target: `${__baseDir}/build/css/${componentConfig.cssFiles[j]}`
                  })
                } else {
                  breakOut = true;
                  console.log(`Cannot find library "${__baseDir}/app/libraries/css/${componentConfig.libraries[j]}" for component ${appComponents[i]}`);
                }
              }
              if(!breakOut) {
                // copy in the component SASS
                if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.scss`)) {
                  componentSCSS.push({
                    source: `${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.scss}`,
                    target: `${__baseDir}/build/css/components/${themeComponents[i]}.scss`
                  })
                }

                // copy in the component JS
                if(fs.existsSync(`${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.js`)) {
                  componentJS.push({
                    source: `${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.js}`,
                    target: `${__baseDir}/build/css/components/${themeComponents[i]}.js`
                  })
                }
              }
            }
          }
        }
      } catch(e) {
        console.log(`Cannot open component file at "${__baseDir}/themes/${appConfig.theme}/components/${themeComponents[i]}/component.json"`);
      }
    }

  } else {
    console.log(`Theme components not found at "${__baseDir}/themes/${appConfig.theme}/components"`);
  }
}