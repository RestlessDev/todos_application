const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");


class TodosController extends ErstwhileController {
  preAction(next) {
    if(!window.localStorage.erstwhileSessionKey) {
      window.App.redirect(`/login?redirect=${window.location.pathname}`)
    } else {
      if(!window.App.scopes.session.user) {
        let model = window.App.getModel('Authentication');
        model.currentUser().then(function(response) {
          window.App.scopes.session.user = response.data;
        }).catch(e => {
          App.redirect(`/login?redirect=${window.location.pathname}`)
        })
      }
      if(!window.App.scopes.session.sidebarMenu) {
        window.App.scopes.session.sidebarMenu = window.App.getSidebarMenu();
      }
      window.App.setLayout('interior');
      next()
    }
  }

  listAction(args) {
    // set active tab
    window.App.scopes.page.sidebarMenuActive = "list-todos";
    console.log("list!")
  }

  calendarAction(args) {
    // set active tab
    window.App.scopes.page.sidebarMenuActive = "calendar-todos";
    console.log("calendar!")
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