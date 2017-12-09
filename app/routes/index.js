'use strict'
var UrlHandler = require(
        process.cwd() + '/app/controllers/urlHandler.server.js'
    );

module.exports = function(app, db) {
    // note: some google chrome extensions cause GET requests to be sent twice!

    var urlHandler = new UrlHandler(db)
    
    app.route('/').get((req, res) => {
        res.sendFile(process.cwd() + '/public/index.html')
    })
    
    app.route('/new/:url_to_shorten(*)')
        .get(urlHandler.urlServiceGet)
        .post(urlHandler.urlServicePost)
}
