
const ErstwhileTheme = require('../framework/static/models/ErstwhileModel')
const ejs = require('ejs')
const path = require('path');
const fs = require('fs');

class SneatTheme extends ErstwhileTheme {
  static getRequires() {
    return [
      'jquery',
      'sass',
      'bootstrap',
      'fs',
      'path'
    ]
  }

  static getCSS(appRoot, workingDirectory) {
    const sass = require('sass');

    // copy all of the theme files into the working directory, replacing the appRoot when necessary
    fs.readdir('./theme/scss', function (err, files) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      //listing all files using forEach
      files.forEach(function (file) {
          // Do whatever you want to do with the file
          console.log(file); 
      });
  });
  }
}