<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Node.js Binary Path
    |--------------------------------------------------------------------------
    | Full path to the Node.js executable. Required when the web server does
    | not inherit your shell PATH (e.g. under PHP-FPM, nginx). If empty,
    | Browsershot will use "node" from the system PATH.
    */
    'node_binary' => env('BROWSERSHOT_NODE_PATH'),

    /*
    |--------------------------------------------------------------------------
    | npm Binary Path
    |--------------------------------------------------------------------------
    | Full path to the npm executable. Required together with node_binary when
    | the web server does not have npm in PATH.
    */
    'npm_binary' => env('BROWSERSHOT_NPM_PATH'),

    /*
    |--------------------------------------------------------------------------
    | Chrome Binary Path
    |--------------------------------------------------------------------------
    */
    'chrome_path' => env('BROWSERSHOT_CHROME_PATH', '/usr/bin/google-chrome'),

];
