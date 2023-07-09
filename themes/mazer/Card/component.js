
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout')
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class Card extends ErstwhileLayout {
  isContainer() {
    return true;
  };

}

module.exports = Card;