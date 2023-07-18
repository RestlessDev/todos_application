const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");


class TodosController extends ErstwhileController {
  preAction(next) {
    if(!window.localStorage.erstwhileSessionKey) {
      // window.App.redirect(`/login?redirect=${window.location.pathname}`)
      document.location = `/login?redirect=${window.location.pathname}`;
    } else {
      if(!window.App.scopes.session.user) {
        let model = window.App.getModel('Authentication');
        model.currentUser().then(function(response) {
          window.App.scopes.session.user = response.data;
        }).catch(e => {
          // App.redirect(`/login?redirect=${window.location.pathname}`)
          document.location = `/login?redirect=${window.location.pathname}`;
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
    
    // figure out the filters
    window.App.scopes.page.updateFilter = (component) => {
      let values = window.App.getComponent("list-filter").getValues();
      let queryStrings = [];
      for(let key in values) {
        queryStrings.push(`${key}=${encodeURIComponent(values[key])}`)
      }
      window.App.redirect(`/todos/list?${queryStrings.join('&')}`)
    }
    let queryParams = new URLSearchParams(location.search);;
    if(queryParams.get('search')) {
      window.App.scopes.page.filterSearch = queryParams.get('search');
    }
    if(queryParams.get('status')) {
      window.App.scopes.page.filterStatus = queryParams.get('status');
    }

    // add some actions for the buttons
    window.App.scopes.page.createTodo = (component) => {
      window.App.openModal("todos", "createTodo", {})
    }
    window.App.scopes.page.markDone = (component) => {
      window.App.openModal("todos", "markDone", {id: component.getProperty('data-id')})
    }
    window.App.scopes.page.editTodo = (component) => {
      window.App.redirect(`/todos/edit/${component.getProperty('data-id')}`);
    }
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

  editAction(args) {
    // set active tab
    window.App.scopes.page.sidebarMenuActive = "list-todos";
    window.App.scopes.page.breadcrumbs = [
      {
        label: "List Todos",
        link: "/todos/list"
      },
      {
        label: "Edit Todo"
      }
    ]
    window.App.scopes.page.title = "Edit Page";
    window.App.scopes.page.intro = "Edit your Todo.";

    let model = window.App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      window.App.scopes.page.todo = todoResponse.data;
      window.App.scopes.page.title = `Edit ${todoResponse.data.title}`;

    }).catch(function(e) {
      console.log("error", e)
    });
  }

  createTodoModal(args) {
    let createTodo = () => {
      let formValues = window.App.getComponent("create-todo").getValues();
      let model = window.App.getModel('Todo');
      model.create(formValues).then(function(response) {
        console.log(response.data)
        if(response.data.success === false) {
          window.App.scopes.modal.message = "There were errors in your form";
          window.App.getComponent('create-todo').showErrors(response.data);
          window.App.getComponent("create-todo-alert").show();
        } else {
          window.App.getComponent("create-todo-alert").hide();
          window.App.getComponent('create-todo').clearErrors();
          window.App.closeModal();
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      
    }
    window.App.setModalAttributes({title: "Create Todo", theme: "primary", centered: true, buttons: [{
      label: "Create",
      func: createTodo,
      color: 'primary'
    }]})
  }

  markDoneModal(args) {
    let model = window.App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      // set the properties
      window.App.getComponent('mark-todo').getControl('done_flag').setValue(todoResponse.data.done_flag);
      window.App.getComponent('mark-todo').getControl('completion_notes').setValue(todoResponse.data.completion_notes);

    }).catch(function(e) {
      console.log("error", e)
    });

    let markTodo = () => {
      let formValues = window.App.getComponent("mark-todo").getValues();
      model.update(formValues, {todoID: args.id}).then(function(response) {
        if(response.data.success === false) {
          window.App.scopes.modal.message = "There were errors in your form";
          window.App.getComponent('mark-todo').showErrors(response.data);
          window.App.getComponent("mark-todo-alert").show();
        } else {
          window.App.getComponent("mark-todo-alert").hide();
          window.App.getComponent('mark-todo').clearErrors();
          window.App.closeModal();
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      
    }

    window.App.setModalAttributes({title: "Mark Todo", theme: "primary", centered: true, buttons: [{
      label: "Update",
      func: markTodo,
      color: 'primary'
    }]})
  }

  /**
   * Non action methods
   */
  
}

module.exports = TodosController;