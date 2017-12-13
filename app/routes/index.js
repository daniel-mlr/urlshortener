'use strict'
var UrlHandler = require(
        process.cwd() + '/app/controllers/urlHandler.server.js'
    );

module.exports = function(app, db) {
    // note: some google chrome extensions cause GET requests to be sent twice!

    var urlHandler = new UrlHandler(db)
   
    // group url handlers middlewares in a list
    var {validate, shortenURL, createNewShort} = urlHandler
    var processURL = [validate, shortenURL, createNewShort]

    app.route('/').get((req, res) => {
        res.sendFile(process.cwd() + '/public/index.html')
    }).post(processURL)
    
    // app.route('/new/:url_to_shorten(*)').get(urlHandler.urlServiceGet, [processURL])
    app.route('/new/:url_to_shorten(*)').get(urlHandler.urlServiceGet, processURL)
    app.route('/:shorturl').get(urlHandler.useShort)
    app.route('*').get((req, res) => {res.status(404).end('404 - page not found')})
}
