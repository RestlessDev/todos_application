
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout');

class FullLayout extends ErstwhileLayout {
  getRequires() {
    return [
      'jquery'
    ]
  }
}

module.exports = FullLayout;