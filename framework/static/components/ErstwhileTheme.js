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

  getScript() {
    return '';
  }
}

module.exports = ErstwhileTheme;