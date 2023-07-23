
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require("jquery")

class Icon extends ErstwhileComponent {
  getTag() {
    return 'i';
  }
  prepareAttributes() {
    let attributes = {...this.args};
    this.prepareGlobalAttributes(attributes);
    
    if(!attributes.class) {
      attributes.class = "";
    }
    if(!attributes.lib) {
      attributes.class += ` bi bi-${(attributes.icon || 'emoji-wink')}`;
    } else {
      switch(attributes.lib) {
        case 'fa':
        case 'fa-regular':
          attributes.class += ` fa-regular fa-${(attributes.icon || 'face-smile-wink')}`
          break;  
        case 'fa-solid':
          attributes.class += ` fa-solid fa-${(attributes.icon || 'face-smile-wink')}`
          break;
        case 'bi':
        default:
          attributes.class += ` bi bi-${(attributes.icon || 'emoji-wink')}`;
      }
    }

    let style = "";

    if(attributes.size) {
      style += `font-size: ${attributes.size}; `;
    }
    if(attributes.color) {
      style += `color: text-${attributes.color}; `;
    }
    if(attributes.clickable) {
      style += `cursor: pointer; `;
    }
    if(attributes.style) {
      attributes.style = style + attributes.style; 
    } else {
      attributes.style = style;
    }



    delete attributes.color;
    delete attributes.size;
    delete attributes.icon;
    delete attributes.lib;
    return attributes;
  }
}

module.exports = Icon;