
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

/**
 * This is the filter that appears on the list page.
 */
class FilterContainer extends ErstwhileComponent {
  isContainer() {
    return true;
  }
  initialize() {
  }
  getClassName() {
    return "todos-filtercontainer";
  }
  static getCSS(a,b,c) {
    return `
      .todos-filtercontainer {
        background-color: #fffdd8;
        color: #8c8630;
        border: 0px solid #eaca4a;
        border-width: 0 1px 1px 0;
        padding: 15px 15px 5px;
        margin-bottom: 20px;
      }`
  }
}

module.exports = FilterContainer;