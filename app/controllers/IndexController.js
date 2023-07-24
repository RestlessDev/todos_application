const ErstwhileController = require("../../framework/static/controllers/ErstwhileController");

class IndexController extends ErstwhileController {
  preAction(next) {
    // set the layout to default
    $App.setLayout('default');
    next();
  }
  /**
   * This action presents the login form and, on successful submission,
   * redirects the user to the correct place in the application.
   * 
   * @param {*} args 
   */
  loginAction(args) {
    // set the page title and meta tags
    $App.scopes.page.title = "Login";
    $App.scopes.page.meta = {
      "og:description": "Log in to Todos."
    };

    // the login form submit handler
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

  /**
   * This action presents the sign up form. On successfull submission,
   * it invites the user to go to the login form and user their newly-
   * created login there.
   * 
   * @param {*} args 
   */
  signupAction(args) {
    // set the page title and meta tags
    $App.scopes.page.title = "Sign Up";
    $App.scopes.page.meta = {
      "og:description": "Sign up for Todos."
    };

    // the signup submit handler
    $App.scopes.page.submitForm = function() {
      $App.getComponent("signup-alert").hide();
      let formValues = $App.getComponent("signup-form").getValues();
      let model = $App.getModel('Authentication');
      if(formValues.password && formValues.password == formValues.password_2 ) {
        model.signup(formValues).then(function(response) {
          if(response.data.success) {
            jquery('#initial-signup-form').addClass("d-none");
            jquery('#signup-success').removeClass("d-none");
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

  /**
   * This action logs out the user on the server if they are logged in
   * and presents a friendly message.
   * 
   * @param {*} args 
   */
  logoutAction(args) {
    // set the page title and meta tags
    $App.scopes.page.title = "Log out";
    $App.scopes.page.meta = {
      "og:description": "Thank you for using Todos!"
    };

    // do the logout if needed
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

  /**
   * This default action redirects the user to the login page if they are
   * not logged in, or the todo list if they are.
   * 
   * @param {*} args 
   */
  indexAction(args) {
    if(window.localStorage.erstwhileSessionKey) {
      $App.redirect("/todos/list")
    } else {
      $App.redirect("/login")
    }
  }
}

module.exports = IndexController;