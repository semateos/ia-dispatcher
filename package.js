Package.describe({
    summary: 'A reactive dispatcher for meteor'
});

Package.on_use(function (api, where) {
    api.use(['ia', 'underscore', 'deps'], 'client');

    api.add_files([
        'lib/namespace.js',
        'lib/Dispatcher.js'
    ], 'client');
});
