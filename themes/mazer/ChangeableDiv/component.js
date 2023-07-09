
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout')
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class ChangeableDiv extends ErstwhileLayout {
  receiveUpdate(key, value) {
    jquery(`#${this.id}`).html(value);
  }
}

module.exports = ChangeableDiv;