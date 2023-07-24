const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class IndexController extends ErstwhileController {
  preAction(next) {
    $App.setLayout('default');
    next();
  }
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
          
          $App.getComponent("login-alert").show();
        }
      }).catch(function(e) {
        console.log("error", e)
      });
      return false;
    }
  }

  signupAction(args) {
    $App.scopes.page.submitForm = function() {
      $App.getComponent("signup-alert").hide();
      let formValues = $App.getComponent("signup-form").getValues();
      let model = $App.getModel('Authentication');
      if(formValues.password && formValues.password == formValues.password_2 ) {
        model.signup(formValues).then(function(response) {
          if(response.data.success) {
            jQuery('#initial-signup-form').addClass("d-none");
            jQuery('#signup-success').removeClass("d-none");
          } else {
            $App.scopes.page.errorMessage = "There were errors in your form";
            $App.getComponent('signup-form').showErrors(response.data);
            $App.getComponent("signup-alert").show();
          }
        }).catch(function(e) {
          console.log("error", e)
        });
      } else {
        $App.scopes.page.errorMessage = "The passwords need to match.";
        $App.getComponent("signup-alert").show();
      }
      return false;
    }
  }

  logoutAction(args) {
    let model = $App.getModel('Authentication');
    model.logout({}).then(function(response) {
      if(response.data.success) {
        delete window.localStorage.erstwhileSessionKey;
      }
    });
    $App.scopes.page.login = () => {
      $App.redirect('/login')
    }
    console.log("here")
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