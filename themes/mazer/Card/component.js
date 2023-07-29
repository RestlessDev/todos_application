
const { ErstwhileComponent } = require('erstwhile')
const ejs = require('ejs');
const jquery = require("jquery")

class Card extends ErstwhileComponent {
  isContainer() {
    return true;
  };

}

module.exports = Card;