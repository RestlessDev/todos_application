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
    window.App.scopes.page.breadcrumbs = [
      {
        label: "List Todos"
      }
    ]
    window.App.scopes.page.title = "List Page";
    window.App.scopes.page.intro = "A listing of all of your Todos.";
    console.log("list!")
  }

  calendarAction(args) {
    // set active tab
    window.App.scopes.page.sidebarMenuActive = "calendar-todos";
    window.App.scopes.page.breadcrumbs = [
      {
        label: "Calendar"
      }
    ];
    window.App.scopes.page.title = "Calendar Page";
    window.App.scopes.page.intro = "Your Todos, but on a calendar.";
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