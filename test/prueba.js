const { mdLinks} = require('./index.js');

mdLinks('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/yallist/README.md')
.then(links => {
    return links
}) 