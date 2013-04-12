(function (Controller, Deps, _) {
    "use strict";

    Controller.Dispatcher = function (matchingSource, controllers, defaultController) {
        var self = this,
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
                    currentController.dispatch(match);
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
    };
} (InnoAccel.Controller, Deps, _));
