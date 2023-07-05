const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class TodosController extends ErstwhileController {
  preAction(next) {
    if(!window.localStorage.erstwhileSessionKey) {
      App.redirect('/login')
    } else {
      next();
    }
  }

  listAction(args) {
    console.log("list!")
  }

  todoAction(args) {
    console.log("todo!")
  }

  createTodoModal(args) {

  }

  editTodoModal(args) {
    
  }
}

module.exports = TodosController;