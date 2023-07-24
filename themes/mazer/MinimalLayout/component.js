
const ErstwhileLayout = require('../../../framework/static/components/ErstwhileLayout')
const ErstwhileComponent = require('../../../framework/static/components/ErstwhileComponent')
const ejs = require('ejs');
const jquery = require('jquery')

class MinimalLayout extends ErstwhileLayout {
  getRequires() {
    return [
      'jquery'
    ]
  }
  receiveUpdate(key, value) {
    this.args[key] = value;
    console.log("received update", key, value)
    if(key.toLowerCase() == 'pagetitle') {
      console.log("setting page title")
      jquery('title').html(`${value}${(this.args.appName ? ` - ${this.args.appName}` : "")}`)
    } else if(key.toLowerCase() == "meta") {
      for(let param in value) {
        if(jquery(`meta[property="${param}"]`).length == 0) {
          jquery(`head`).append(`<meta property="${param}" content="${value[param]}" />`);
        } else {
          jquery(`meta[property="${param}"]`).attr('content', value[param])
        }
      }
    }

    this.receiveGlobalUpdates(key, value);
  }
}

module.exports = MinimalLayout;