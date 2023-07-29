let config = require("./config/app");
let { ErstwhileApp } = require("erstwhile")

const { Authentication, Todo } = require('./models/models')

class TodosApp extends ErstwhileApp {
  getSidebarMenu() {
    return [{ 
        label: "Menu",
        items: [
          {
            id: "list-todos",
            label: "List",
            link: "/todos/list",
            biIcon: "card-list",
          },
          {
            id: "calendar-todos",
            label: "Calendar",
            link: "/todos/calendar",
            biIcon: "calendar-day"
          },
          {
            id: "logout",
            label: "Logout",
            link: "/logout",
            biIcon: "arrow-bar-right"
          }
        ]
      }]
  }
} 

module.exports = TodosApp;
