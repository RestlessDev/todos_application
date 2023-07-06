
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');

class MainLayout extends ErstwhileComponent {
  getRequires() {
    return [
      'jquery'
    ]
  }
  getHtml(args, ejsTemplate, innerDom) {
    return ejs.render(ejsTemplate, {args: args})
  }
}

module.exports = MainLayout;