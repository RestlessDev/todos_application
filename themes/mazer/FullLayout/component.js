
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout');

class FullLayout extends ErstwhileLayout {
  getRequires() {
    return [
      'jquery'
    ]
  }
  getHtml(args, ejsTemplate, innerDom) {
    return ejs.render(ejsTemplate, {args: args})
  }
}

module.exports = FullLayout;