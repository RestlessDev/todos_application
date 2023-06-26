let config = require("./app/config");
let App = require("./framework/base/App");

const { Authentication, Todo } = require('./app/models/models')

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