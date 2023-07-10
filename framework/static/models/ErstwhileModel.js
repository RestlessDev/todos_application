const axios = require('axios');
let App = require("../../base/App");

class ErstwhileModel {
  constructor(params) {
    //do nothing
  }


  static populateParams(path, params) {
    const pathParts = path.split('/');
    let output = '/';
    for(let i in pathParts) {
      if(pathParts[i].trim() != '') {
        if(pathParts[i].substring(0, 1) == ':') {
          if(params.hasOwnProperty(pathParts[i].substring(1))) {
            output += `${params[pathParts[i].substring(1)].toString()}${(i < pathParts.length - 1 ? '/' : '')}`;  
          }
        } else {
          output += `${pathParts[i]}${(i < pathParts.length - 1 ? '/' : '')}`;
        }
      }
    }

    return output;
  }

  static async makeRequest(path, params, method = 'get', data, headers) {
    try {
      let axiosConfig = {
        url: window.App.getConfig('baseUrl') + this.populateParams(path, params),
        method
      }
      if(headers) {
        axiosConfig.headers = headers;
      }
      if(data) {
        axiosConfig.data = data;
      }
      return await axios(axiosConfig);
    } catch(e) {
      throw e;
    }
  }
}

module.exports = ErstwhileModel;