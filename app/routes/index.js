'use strict'

module.exports = function(app, db) {
    app.route('/').get((req, res) => {
        res.sendFile(process.cwd() + '/public/index.html')
    })
    
    // Create the database entry (asterix: accept whole string 
    // regardless of chars.)
    app.route('/new/:url_to_shorten(*)').get( (req, res) => {
        var { url_to_shorten } = req.params;

        // validation of url (parameters not allowed)
        // var protocol = new RegExp('^(https?:\/\/)?(www\.)?[a-zA-Z0-9]{1}([a-zA-Z0-9.]){0,256}\.(com|org|net|edu|gov|int|mil|arpa|[a-z]{2})$')
       
        // validation of url (parameters allowed)
        var protocol = new RegExp('^(https?:\/\/)');
        
        // prepend the protocol if not present       
        if (!protocol.test(url_to_shorten)) {
            url_to_shorten = 'http://' + url_to_shorten
        }

        var url_syntax = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]{1}([a-zA-Z0-9.]){0,256}\.(com|org|net|edu|gov|int|mil|arpa|[a-z]{2})$/
        // var url_syntax = new RegExp('^(https?:\/\/)?(www\.)?[a-zA-Z0-9]{1}([a-zA-Z0-9.]){0,256}\.(com|org|net|edu|gov|int|mil|arpa|[a-z]{2})$')
     // var whole_url = new RegExp('^(https?:\/\/)?(www\.)?[a-zA-Z0-9]{1}([a-zA-Z0-9.]){0,256}\.(com|org|net|edu|gov|int|mil|arpa|[a-z]{2})(\?.+){0,256}$')
        
        var adjacent_dots = /\.\./
        if (!url_to_shorten.match(adjacent_dots) && 
            url_syntax.test(url_to_shorten) ) {
            // no adjacents dots and syntax ok
            
            res.send(url_to_shorten + ' est valide' )
        } else {
            res.send(url_to_shorten + ' n\'est PAS valide')
        }



        console.log(url_to_shorten);


        // creation and update of database

        /*
        db.collection('usedURL').save(url_to_shorten,  (err, result) => {
            if (err) return console.log(err)
        })
        */

        
    })
}
