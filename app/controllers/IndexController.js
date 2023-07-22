const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class IndexController extends ErstwhileController {
  loginAction(args) {
    $App.scopes.page.submitForm = function() {
      $App.getComponent("login-alert").hide();
      let formValues = $App.getComponent("login-form").getValues();
      let model = $App.getModel('Authentication');
      model.login(formValues).then(function(response) {
        if(response.data.success) {
          model.currentUser().then(function(response) {
            $App.scopes.session.user = response.data;
            let queryParams = new URLSearchParams(location.search);;
            if(queryParams.get('redirect')) {
              $App.redirect(queryParams.get('redirect'))
            } else {
              $App.redirect("/todos/list")
            }
          }).catch(function(e) {
            console.log(e)
          });
        } else {
          
          $App.getComponent("create-todo-alert").show();
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      return false;
    }
  }

  signupAction(args) {
    console.log("signup!")
  }

  indexAction(args) {
    if(window.localStorage.erstwhileSessionKey) {
      $App.redirect("/todos/list")
    } else {
      $App.redirect("/login")
    }
  }
}

module.exports = IndexController;