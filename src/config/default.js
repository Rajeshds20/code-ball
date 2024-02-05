export const defaults = {
    'index.html': {
        name: 'Index.html',
        language: 'html',
        value: '<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <script src="script.js"></script>\n  </body>\n</html>',
    },
    'style.css': {
        name: 'Style.css',
        language: 'css',
        value: 'body { background-color: #282c34; color: white; }',
    },
    'script.js': {
        name: 'Script.js',
        language: 'javascript',
        value: 'console.log(\'Hello, world!\');',
    },
};