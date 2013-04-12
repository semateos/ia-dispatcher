(function (Controller, Deps, _) {
    "use strict";

    Controller.Dispatcher = function (matchingSource, controllers, defaultController) {
        var availableControllers = controllers || [],
            controllerDependants = new Deps.Dependency(),
            currentController;

        this.addController = function (controller) {
            availableControllers.push(controller);
            controllerDependants.changed();
        };

        this.setDefaultController = function (controller) {
            defaultController = controller;
            controllerDependants.changed();
        };

        Deps.autorun(function () {
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
        });
    };
} (Controller, Deps, _));
