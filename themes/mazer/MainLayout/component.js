
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')

class MainLayout extends ErstwhileComponent {
  getRequires() {
    return [
      'jquery'
    ]
  }
}

module.exports = MainLayout;