const axios = require('axios');
const ErstwhileModel = require('../../framework/static/models/ErstwhileModel')
const AuthenticationError = require('../../framework/static/errors/AuthenticationError')


/**
 * Authentication - v0.5
 */

class Authentication extends ErstwhileModel {
  
    static async signup(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        headers['Content-Type'] = "application/json";
        
        
        let response = await this.makeRequest('/authentication/signup', params, 'post', data, headers);
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async login(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        headers['Content-Type'] = "application/json";
        
        
        let response = await this.makeRequest('/authentication/login', params, 'post', data, headers);
        

        
        if(typeof response.data == 'object' && !Array.isArray(response.data)) {
          for(let responseKey in response.data) {
            if(responseKey == 'sessionKey') {
              window.localStorage.erstwhileSessionKey = response.data['sessionKey'];
            }
          }
        }
        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async forgotPassword(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        headers['Content-Type'] = "application/json";
        
        
        let response = await this.makeRequest('/authentication/forgotPassword', params, 'post', data, headers);
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async currentUser(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        
        let response = await this.makeRequest('/authentication/currentUser', params, 'get', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
}


/**
 * Todo - v0.5
 */

class Todo extends ErstwhileModel {
  
    static async list(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        
        let response = await this.makeRequest('/todo/list', params, 'get', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async get(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        
        let response = await this.makeRequest('/todo/:todoID', params, 'get', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async create(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        headers['Content-Type'] = "application/json";
        
        
        let response = await this.makeRequest('/todo/create', params, 'post', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async update(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        headers['Content-Type'] = "application/json";
        
        
        let response = await this.makeRequest('/todo/:todoID/update', params, 'post', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
    static async delete(data, params) {
      try {
        let headers = {};
        
        if(window.localStorage.erstwhileSessionKey) {
          headers['Erstwhile-Session'] = window.localStorage.erstwhileSessionKey;
        }
        
        
        
        let response = await this.makeRequest('/todo/:todoID/delete', params, 'post', data, headers);
        
          if(response.data.authenticated === false) {
            throw new AuthenticationError("This endpoint requires authentication.");
          } 
        

        
        return response;
      } catch(e) {
        throw e;
      }
    }
  
}


/**
 * User - v0.5
 */

class User extends ErstwhileModel {
  
}




module.exports = {
  
  Authentication,
  Todo,
  User,
}
