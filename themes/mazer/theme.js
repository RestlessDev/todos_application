
const { ErstwhileTheme } = require('erstwhile')
const ejs = require('ejs')
const path = require('path');
const fs = require('fs');

class MazerTheme extends ErstwhileTheme {
  static getRequires() {
    return [
      'jquery',
      'sass',
      'fs',
      'path'
    ]
  }

  static getFontFolder(appRoot) {
    return appRoot +'/themes/mazer/theme/fonts';
  }

  static getCSSFolder(appRoot) {
    return appRoot +'/themes/mazer/theme/css';
  }

  static getJSFolder(appRoot) {
    return appRoot +'/themes/mazer/theme/js';
  }

  static getScripts(rootDir) {
    return `<script defer src="${rootDir}/jquery.min.js"></script><script defer src="${rootDir}/jquery.dataTables.min.js"></script>`
  }
  
  static getCSSLinks(rootDir) {
    return `<link rel="stylesheet" href="${rootDir}/jquery.dataTables.min.css"><link rel="stylesheet" href="${rootDir}/all.min.css">`;
  }

  static getCSS(appRoot, workingDirectory, themeConfig) {
    const absolutePath = appRoot +'/themes/mazer/theme/scss';
    workingDirectory += '/themeSCSS';

    // create the working directory if it does not exist, empty it if it does
    if(!fs.existsSync(workingDirectory)) {
      fs.mkdirSync(workingDirectory);
    } else {
      let files = fs.readdirSync(workingDirectory);
      for (const file of files) {
        fs.rmSync(path.join(workingDirectory, file), {recursive: true, force: true});
      }
    }

    function renderDirectory(file, relativePath) {
      relativePath+=`/${file}`;
      if(!fs.existsSync(workingDirectory + relativePath)) {
        fs.mkdirSync(workingDirectory + relativePath);
      }
      let files = fs.readdirSync(absolutePath + relativePath);
      for(let i in files) {
        if(fs.lstatSync(absolutePath + relativePath + '/' + files[i]).isDirectory()) {
          renderDirectory(files[i], relativePath);
        } else {
          renderFile(files[i], relativePath)
        }
      }
    }
    function renderFile(file, relativePath) {
      // console.log("reading " + `${absolutePath}${relativePath}/${file}`);
      let fileText = fs.readFileSync(`${absolutePath}${relativePath}/${file}`, 'utf8');
      let rendered = ejs.render(fileText, { appRoot: appRoot, themeConfig: themeConfig || {}});
      fs.writeFileSync(`${workingDirectory}${relativePath}/${file}`, rendered )
    }
    
    const sass = require('sass');

    let relativePath = "";

    // copy all of the theme files into the working directory, replacing the appRoot when necessary
    let files = fs.readdirSync(`${absolutePath}${relativePath}`);
    for(let i in files) {
      if(fs.lstatSync(absolutePath + relativePath + '/' + files[i]).isDirectory()) {
        renderDirectory(files[i], relativePath);
      } else {
        renderFile(files[i], relativePath)
      }
    }

    function cleanup(workingDirectory) {
      fs.rmSync(`${workingDirectory}`, {recursive: true, force: true});
    } 

    // use sass to compile
    try {
      const styles = sass.compile(`${workingDirectory}/app.scss`);
      // cleanup(workingDirectory);
      return styles.css;
    } catch(e) {
      // cleanup(workingDirectory);
      console.log("Theme Compilation Error", e);
      return "";
    }
  }
}

module.exports = MazerTheme;