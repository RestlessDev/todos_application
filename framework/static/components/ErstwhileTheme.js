let App = require("../../base/App");

class ErstwhileTheme {

  static getRequires() {
    return [];
  }

  static getCSS(appRoot, workingDirectory, themeConfig) {
    return '';
  }

  static getFontFolder(appRoot) {
    return false;
  }

  static getCSSFolder(appRoot) {
    return false;
  }

  static getJSFolder(appRoot) {
    return false;
  }

  static getCSSLinks(rootDir) {
    return "";
  }

  static getScripts(rootDir) {
    return "";
  }
}

module.exports = ErstwhileTheme;