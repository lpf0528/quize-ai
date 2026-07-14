const config = require('../../config'),
    hljs = require('./highlight');
// config.highlight.forEach(item => {
//     hljs.registerLanguage(item, require(`./languages/${item}`).default);
// });
hljs.registerLanguage('bash', require('./languages/bash').default);hljs.registerLanguage('dart', require('./languages/dart').default);hljs.registerLanguage('go', require('./languages/go').default);hljs.registerLanguage('java', require('./languages/java').default);hljs.registerLanguage('javascript', require('./languages/javascript').default);hljs.registerLanguage('json', require('./languages/json').default);hljs.registerLanguage('shell', require('./languages/shell').default);hljs.registerLanguage('xml', require('./languages/xml').default);hljs.registerLanguage('nginx', require('./languages/nginx').default);hljs.registerLanguage('python', require('./languages/python').default);hljs.registerLanguage('python-repl', require('./languages/python-repl').default);hljs.registerLanguage('typescript', require('./languages/typescript').default);

module.exports = hljs;