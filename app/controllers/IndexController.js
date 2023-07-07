const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class IndexController extends ErstwhileController {
  loginAction(args) {
    console.log("login!")
  }

  signupAction(args) {
    console.log("signup!")
  }

  indexAction(args) {
    console.log("index!")
    let phrases = [
      "Is this thing on?",
      "Waiting for the end of the world.",
      "Less than zero.",
      "Romeo is restless",
      "Sneaky feelings",
      "This modern world.",
      "Blame it on Cain.",
      "Welcome to the weinerschitzel.",
      "Welcome to the working week",
      "Radio, Radio.",
      "Watching the detectives."
    ]
    window.App.scopes.page.phrase = phrases[0];
    setInterval(function() {
      window.App.scopes.page.phrase = phrases[Math.floor(Math.random() * 11)]; 
    }, 5000)
  }
}

module.exports = IndexController;