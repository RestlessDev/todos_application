
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

/**
 * This is simple div with a background color. Used
 * to show the color of the todo.
 */
class ColorBox extends ErstwhileComponent {
  initialize() {
  }
  static getCSS(a,b,c) {
    return `
      .todos-color-box {
        border: 1px solid #000;
      }`
  }
}

module.exports = ColorBox;