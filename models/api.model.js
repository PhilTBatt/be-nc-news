const fs = require('fs/promises')

exports.fetchEndpoints = () => {
    return fs.readFile('./endpoints.json', 'utf-8')
    .then(data => JSON.parse(data))
}