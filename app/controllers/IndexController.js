const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class IndexController extends ErstwhileController {
  loginAction(args) {
    window.App.scopes.page.submitForm = function() {
      window.App.getComponent("login-alert").hide();
      let formValues = window.App.getComponent("login-form").getValues();
      let model = window.App.getModel('Authentication');
      model.login(formValues).then(function(response) {
        if(response.data.success) {
          model.currentUser().then(function(response) {
            window.App.scopes.session.user = response.data;
            let queryParams = new URLSearchParams(location.search);;
            if(queryParams.get('redirect')) {
              window.App.redirect(queryParams.get('redirect'))
            } else {
              window.App.redirect("/todos/list")
            }
          }).catch(function(e) {
            console.log(e)
          });
        } else {
          window.App.getComponent("login-alert").show();
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
      window.App.redirect("/todos/list")
    } else {
      window.App.redirect("/login")
    }
  }
}

module.exports = IndexController;