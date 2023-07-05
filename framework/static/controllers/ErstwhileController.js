class ErstwhileController {

  preAction(next) {
    next()
  }

  postAction(next) {
    next()
  }

  getControllerPath() {
    return false;
  }

  /**
   * This method determines how the controller sets its routes.
   * 
   * Either the method returns a routes object, or the boolean false to
   * indicate that it wants the default routing behavior where the functions
   * are used as routes.
   * 
   * @returns A routes object or false for default routes
   */
  getRoutes() {
    return false;
  }

}

module.exports = ErstwhileController;