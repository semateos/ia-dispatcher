(function (Controller, Deps, _) {
    "use strict";

    Controller.Dispatcher = function (matchingSource, controllers, defaultController) {
        var self = this,
            controllerExceptionCallbacks = [],
            noControllerCallbacks = [],
            availableControllers = controllers || [],
            controllerDependants = new Deps.Dependency(),
            currentController,
            doDispatch = function () {
                var match = matchingSource(),
                    oldController = currentController;

                controllerDependants.depend();
                currentController = _.find(availableControllers, function (controller) {
                    return controller.canDispatch(match);
                }) || defaultController;

                if (undefined !== currentController) {
                    try {
                        currentController.dispatch(match);
                    } catch (error) {
                        _.each(controllerExceptionCallbacks, function (callback) {
                            callback(currentController, error, match)
                        });
                    }
                } else {
                    _.each(noControllerCallbacks, function (callback) {
                        callback(match);
                    });
                }

                if (oldController !== currentController && undefined !== oldController) {
                    oldController.destroy();
                }
            },
            computation;

        this.addController = function (controller) {
            availableControllers.push(controller);
            controllerDependants.changed();
        };

        this.setDefaultController = function (controller) {
            defaultController = controller;
            controllerDependants.changed();
        };

        this.start = function () {
            Deps.nonreactive(function () {
                computation = Deps.autorun(doDispatch);
            });
        };

        this.dispatch = function () {
            if (undefined === computation) {
                self.start();
                return;
            }
            computation.invalidate();
        };

        this.addControllerExceptionCallback = function (callback) {
            controllerExceptionCallbacks.push(callback);
        };

        this.addNoControllerCallback = function (callback) {
            noControllerCallbacks.push(callback);
        };
    };
} (InnoAccel.Controller, Deps, _));
