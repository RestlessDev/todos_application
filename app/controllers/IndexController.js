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
  }
}

module.exports = IndexController;