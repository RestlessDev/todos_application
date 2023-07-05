let config = require("./config/app");
let ErstwhileApp = require("../framework/static/ErstwhileApp")

const { Authentication, Todo } = require('./models/models')

class TodosApp extends ErstwhileApp {

}

module.exports = TodosApp;
/*
if(!window.localStorage.erstwhileSessionKey) {
  Authentication.login({
    "username": "mikearace",
    "password": "AbC&^30Uy"
  }).then(function(response) {
    Authentication.currentUser().then(function(response) {
      console.log(response)
    }).catch(function(e) {
      console.log("error", e)
    });
  }).catch(function(e) {
    console.log("error", e)
  });
} else {
  Authentication.currentUser().then(function(response) {
    console.log(response)
  }).catch(function(e) {
    console.log("error", e)
  });
}
*/