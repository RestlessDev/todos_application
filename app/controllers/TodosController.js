const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");
const jquery = require('jquery')

class TodosController extends ErstwhileController {
  preAction(next) {
    if(!window.localStorage.erstwhileSessionKey) {
      // $App.redirect(`/login?redirect=${window.location.pathname}`)
      document.location = `/login?redirect=${window.location.pathname}`;
    } else {
      if(!$App.scopes.session.user) {
        let model = $App.getModel('Authentication');
        model.currentUser().then(function(response) {
          $App.scopes.session.user = response.data;
        }).catch(e => {
          // App.redirect(`/login?redirect=${window.location.pathname}`)
          document.location = `/login?redirect=${window.location.pathname}`;
        })
      }
      if(!$App.scopes.session.sidebarMenu) {
        $App.scopes.session.sidebarMenu = $App.getSidebarMenu();
      }
      $App.setLayout('interior');
      next()
    }
  }

  listAction(args) {
    // set active tab
    $App.scopes.page.sidebarMenuActive = "list-todos";
    $App.scopes.page.breadcrumbs = [
      {
        label: "List Todos"
      }
    ]
    $App.scopes.page.title = "List Page";
    $App.scopes.page.intro = "A listing of all of your Todos.";
    
    // figure out the filters
    $App.scopes.page.updateFilter = (component) => {
      let values = $App.getComponent("list-filter").getValues();
      let queryStrings = [];
      for(let key in values) {
        queryStrings.push(`${key}=${encodeURIComponent(values[key])}`)
      }
      $App.redirect(`/todos/list?${queryStrings.join('&')}`, true, false)
    }
    let queryParams = new URLSearchParams(location.search);;
    if(queryParams.get('search') || queryParams.get('status')) {
      $App.scopes.page.filterSearch = queryParams.get('search');
      $App.scopes.page.filterStatus = queryParams.get('status');
      $App.defer(function() {
        $App.getComponent('todo-list-table').redraw();
      }, 100)  
    }

    // add some actions for the buttons
    $App.scopes.page.createTodo = (component) => {
      $App.openModal("todos", "createTodo", {})
    }
    $App.scopes.page.markDone = (component) => {
      $App.openModal("todos", "markDone", {id: component.getProperty('data-id')})
    }
    $App.scopes.page.editTodo = (component) => {
      $App.redirect(`/todos/edit/${component.getProperty('data-id')}`);
    }
  }

  calendarAction(args) {
    // set active tab
    $App.scopes.page.sidebarMenuActive = "calendar-todos";
    $App.scopes.page.breadcrumbs = [
      {
        label: "Calendar"
      }
    ];
    $App.scopes.page.title = "Calendar Page";
    $App.scopes.page.intro = "Your Todos, but on a calendar.";
    console.log("calendar!")
  }

  editAction(args) {
    // set active tab
    $App.scopes.page.sidebarMenuActive = "list-todos";
    $App.scopes.page.breadcrumbs = [
      {
        label: "List Todos",
        link: "/todos/list"
      },
      {
        label: "Edit Todo"
      }
    ]
    $App.scopes.page.title = "Edit Page";
    $App.scopes.page.intro = "Edit your Todo.";

    let model = $App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      $App.scopes.page.todo = todoResponse.data;
      $App.scopes.page.title = `Edit ${todoResponse.data.title}`;

    }).catch(function(e) {
      console.log("error", e)
    });

    $App.scopes.page.saveTodo = function() {
      let formValues = $App.getComponent("edit-todo").getValues();
      model.update(formValues, {todoID: args.id}).then(function(response) {
        if(response.data.success === false) {
          $App.scopes.modal.message = "There were errors in your form";
          $App.getComponent('edit-todo').showErrors(response.data);
          $App.getComponent("edit-todo-alert").show();
        } else {
          $App.getComponent("edit-todo-alert").hide();
          $App.getComponent('edit-todo').clearErrors();
          jquery('#edit-success').removeClass('d-none');
          setTimeout(function() {
            $App.redirect('/todos/list')
          }, 3000)
        }
      }).catch(function(e) {
        console.log("error", e)
      });
    }
  }

  createTodoModal(args) {
    let createTodo = () => {
      let formValues = $App.getComponent("create-todo").getValues();
      let model = $App.getModel('Todo');
      model.create(formValues).then(function(response) {
        console.log(response.data)
        if(response.data.success === false) {
          $App.scopes.modal.message = "There were errors in your form";
          $App.getComponent('create-todo').showErrors(response.data);
          $App.getComponent("create-todo-alert").show();
        } else {
          $App.getComponent("create-todo-alert").hide();
          $App.getComponent('create-todo').clearErrors();
          $App.closeModal();
          $App.getComponent('todo-list-table').redraw();
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      
    }
    $App.setModalAttributes({title: "Create Todo", theme: "primary", centered: true, buttons: [{
      label: "Create",
      func: createTodo,
      color: 'primary'
    }]})
  }

  markDoneModal(args) {
    let model = $App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      // set the properties
      $App.scopes.modal.todo = todoResponse.data;
      // $App.getComponent('mark-todo').getControl('done_flag').setValue(todoResponse.data.done_flag);
      // $App.getComponent('mark-todo').getControl('completion_notes').setValue(todoResponse.data.completion_notes);

    }).catch(function(e) {
      console.log("error", e)
    });

    let markTodo = () => {
      let formValues = $App.getComponent("mark-todo").getValues();
      model.update(formValues, {todoID: args.id}).then(function(response) {
        if(response.data.success === false) {
          $App.scopes.modal.message = "There were errors in your form";
          $App.getComponent('mark-todo').showErrors(response.data);
          $App.getComponent("mark-todo-alert").show();
        } else {
          $App.getComponent("mark-todo-alert").hide();
          $App.getComponent('mark-todo').clearErrors();
          $App.closeModal();
          setTimeout(function () {  
            $App.getComponent('todo-list-table').redraw();
          }, 100);         
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      
    }

    $App.setModalAttributes({title: "Mark Todo", theme: "primary", centered: true, buttons: [{
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