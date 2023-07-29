
const { ErstwhileComponent } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class ChangeableDiv extends ErstwhileComponent {
  receiveUpdate(key, value) {
    jquery(`#${this.id}`).html(value);
  }
}

module.exports = ChangeableDiv;