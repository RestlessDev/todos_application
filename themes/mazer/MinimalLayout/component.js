
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout')
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');

class MinimalLayout extends ErstwhileLayout {
  getRequires() {
    return [
      'jquery'
    ]
  }
}

module.exports = MinimalLayout;