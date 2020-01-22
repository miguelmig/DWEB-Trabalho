const tagify = require('../../node_modules/@yaireo/tagify/src/tagify');

// The DOM element you wish to replace with Tagify
var input = document.querySelector('input[name=tags]');

// init Tagify script on the above inputs
tagify.Tagify(input)