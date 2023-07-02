const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class TodosController extends ErstwhileController {
  preAction(next) {
    if(!window.localStorage.erstwhileSessionKey) {
      App.redirect('/login')
    } else {
      next();
    }
  }
}