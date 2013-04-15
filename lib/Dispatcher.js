/**
 * Dispatcher to dispatch an array of controllers whenever the reactive data source (e.g a router) changes.
 *
 * Dispatching is done in three steps:
 * - Find first controller willing to dispatch
 * - Dispatch the new controller
 * - Inform the old controller to destruct resources
 *
 * Dispatching is a independent reactive computation. It does not cancel if run within another computation.
 * Adding controllers or when the `matchingSource` changes will trigger a new dispatch.
 *
 * The callbacks `noController` and `controllerException` can be used for error handling on an application level.
 *
 * The defaultController is used when no controller is willing to dispatch. If the default controller is used,
 * the `noController` callbacks are not invoked.
 *
 * @param {Function} matchingSource
 * @param {Object[]} controllers
 * @param {Object} [defaultController]
 * @constructor
 */
InnoAccel.Controller.Dispatcher = function (matchingSource, controllers, defaultController) {
    "use strict";

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

    /**
     *
     * @param controller
     */
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
