const { ErstwhileController } = require("erstwhile");
const jquery = require('jquery')

class TodosController extends ErstwhileController {
  /**
   * All of the endpoints under the /todos controller require an account.
   * For this reason, we add a pre action to check that the user is logged in,
   * and if not redirect them to the login page with a redirect back after
   * success.
   * 
   * We also set the sidebar menu if it isn't already set.
   * 
   * @param {*} next 
   */
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

  /**
   * This action presents the user with a list of all of their todos
   * in a data table. They can filter the list, resort it, and paginate through
   * it.
   * 
   * There is a button to add a new todo, and buttons on each line item
   * in the datatable to mark the individual todos as complete or edit them.
   * 
   * @param {*} args 
   */
  listAction(args) {
    // set active tab, as well as some other page parameters.
    $App.scopes.page.sidebarMenuActive = "list-todos";
    $App.scopes.page.breadcrumbs = [
      {
        label: "List Todos"
      }
    ]
    $App.scopes.page.title = "List Page";
    $App.scopes.page.intro = "A listing of all of your Todos.";
    $App.scopes.page.meta = {
      "og:description": $App.scopes.page.intro
    };
    
    // the handler to update the filters
    $App.scopes.page.updateFilter = (component) => {
      let values = $App.getComponent("list-filter").getValues();
      let queryStrings = [];
      for(let key in values) {
        queryStrings.push(`${key}=${encodeURIComponent(values[key])}`)
      }
      $App.redirect(`/todos/list?${queryStrings.join('&')}`, true, false)
    }

    /**
     * Look to the query parameters to update the selected filters.
     * 
     * Because the table must render before it can be redraw, we need
     * to defer the execution of the redraw until after the page is
     * done rendering.
     */
    let queryParams = new URLSearchParams(location.search);;
    if(queryParams.get('search') || queryParams.get('status')) {
      $App.scopes.page.filterSearch = queryParams.get('search');
      $App.scopes.page.filterStatus = queryParams.get('status');
      $App.defer(function() {
        $App.getComponent('todo-list-table').redraw();
      }, 100)  
    }

    // add some handlers for the buttons
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

  /**
   * This action presents the user with a calendar view of their todos,
   * with the ability to page back and forth between months.
   * 
   * @param {*} args 
   */
  calendarAction(args) {
    // set active tab, as well as some other page parameters.
    $App.scopes.page.sidebarMenuActive = "calendar-todos";
    $App.scopes.page.breadcrumbs = [
      {
        label: "Calendar"
      }
    ];
    $App.scopes.page.title = "Calendar Page";
    $App.scopes.page.intro = "Your Todos, but on a calendar.";
    $App.scopes.page.meta = {
      "og:description": $App.scopes.page.intro
    };

    /** 
     * Set the default month/year to this one.
     * 
     * The separate year is required to anchor the year dropdown
     * to this year +/- 10 years.
     */
    $App.scopes.page.year = new Date().getFullYear();
    $App.scopes.page.calendarYear = new Date().getFullYear();
    $App.scopes.page.calendarMonth = new Date().getMonth() + 1;

    // update the month based on the query string.
    let queryParams = new URLSearchParams(location.search);;
    if(queryParams.get('month') || queryParams.get('year')) {
      $App.scopes.page.calendarMonth = queryParams.get('month');
      $App.scopes.page.calendarYear = queryParams.get('year');
    }

    // the function to grab the month's todos from the server
    let fetchData = () => {
      let model = $App.getModel('Todo');
      model.calendar({month:  $App.scopes.page.calendarMonth, year:  $App.scopes.page.calendarYear}).then(function(todoResponse) {
        $App.scopes.page.todos = todoResponse.data.todos;
      }).catch(function(e) {
        console.log("error", e)
      });
    }
    // do the initial fetch
    fetchData();

    // handle the changes on the month/year filter
    $App.scopes.page.updateFilter = function() {
      let values = $App.getComponent("calendar-control").getValues();
      if(values.month && values.year && (values.month != $App.scopes.page.calendarMonth || values.year != $App.scopes.page.calendarYear)) {
        let queryStrings = [];
        for(let key in values) {
          queryStrings.push(`${key}=${encodeURIComponent(values[key])}`)
        }
        $App.redirect(`/todos/calendar?${queryStrings.join('&')}`, true, false)
      }
      return true;
    }
    
    // handle the forward and back arrows
    $App.scopes.page.prevMonth = function() {
      if($App.scopes.page.calendarMonth > 1) {
        $App.scopes.page.calendarMonth--;
      } else {
        $App.scopes.page.calendarMonth = 12;
        $App.scopes.page.calendarYear--;
      }
      fetchData();
    }
    $App.scopes.page.nextMonth = function() {
      if($App.scopes.page.calendarMonth == 12) {
        $App.scopes.page.calendarMonth = 1;
        $App.scopes.page.calendarYear++;
      } else {
        $App.scopes.page.calendarMonth++;
      }
      fetchData();
    }
    
  }

  /**
   * This action presents a form for the user to edit their
   * todo.
   * 
   * The args object passed in will have one key (id) that is the
   * ID of the todo to be edited.
   * 
   * @param {*} args 
   */
  editAction(args) {
    // set active tab and other page properties
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
    $App.scopes.page.meta = {
      "og:description": $App.scopes.page.intro
    };

    // grab the details of the todo from the server
    let model = $App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      $App.scopes.page.todo = todoResponse.data;
      $App.scopes.page.title = `Edit ${todoResponse.data.title}`;

    }).catch(function(e) {
      console.log("error", e)
    });

    // the save handler
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

    // the delete handler
    $App.scopes.page.deleteTodo = function() {
      let formValues = $App.getComponent("edit-todo").getValues();
      model.delete({}, {todoID: args.id}).then(function(response) {
        $App.redirect('/todos/list')
      }).catch(function(e) {
        console.log("error", e)
      });
    }
  }

  /**
   * This modal presents the user with a form to create a new todo.
   * 
   * @param {*} args 
   */
  createTodoModal(args) {
    // the create handler
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

    // update the modal chrome with some new data
    $App.setModalAttributes({
      title: "Create Todo", 
      theme: "primary", 
      centered: true, 
      buttons: [{
        label: "Create",
        func: createTodo,
        color: 'primary'
      }]
    })
  }

  /**
   * This modal presents the user with a form allowing them to complete
   * a todo, and add notes if needed.
   * 
   * @param {*} args 
   */
  markDoneModal(args) {
    // look up the todo data
    let model = $App.getModel('Todo');
    model.get({}, {todoID: args.id}).then(function(todoResponse) {
      $App.scopes.modal.todo = todoResponse.data;
    }).catch(function(e) {
      console.log("error", e)
    });

    // the mark handler
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

    // update the modal chrome with some new data
    $App.setModalAttributes({
      title: "Mark Todo", 
      theme: "primary", 
      centered: true, 
      buttons: [{
        label: "Update",
        func: markTodo,
        color: 'primary'
      }]
    })
  } 
}

module.exports = TodosController;