'use strict';
function urlHandler(db) {
    /* jshint validthis:true */
    
    const isURL = require('validator/lib/isURL');

    var url_to_shorten;

    this.urlServiceGet = function(req, res, next){
        url_to_shorten = req.params.url_to_shorten;
       
        // url query string have been stripped by expressjs; put them back
        // (i.e. we want www.example.com?a=2 and www.example.com?a=3 to be
        // two separate entries)
        if (!isEmpty(req.query)) {
            url_to_shorten += '?' + JSON.stringify(req.query)
                .replace(/:/g, '=').replace(/["{}]/g, '').replace(/,/g, '&')
        }
        
        // pass the reconstructed url_to_shorten in body
        req.body.url_to_shorten = url_to_shorten;

        next()

    }
    
    this.validate = function(req, res, next){
        // check if url is in a valid form
        
        url_to_shorten = req.body.url_to_shorten;
        
        console.log('url_to_shorten validé: ' + url_to_shorten)

        // options for isURL: we want check only http(s) protocol
        var isurl_options = {protocols:  ['http', 'https'] }
        if (!isURL(url_to_shorten, isurl_options)) {
            res.json({"error": url_to_shorten + " is not a valid url"})
        } else {
            next()
        }

    }
       
    this.shortenURL = function(req, res, next) {
    
        // create and/or access the collection; attach it to req for further use
        req.urlcoll = db.collection('urlcoll');
        
        // prepend the http protocol if not present
        if (!url_to_shorten.startsWith('http')) {
            url_to_shorten = 'http://' + url_to_shorten
        }
    
        req.urlcoll.findOne({'longurl': url_to_shorten}, {}, (err, doc) => {
            if (err) return console.err('error in shortenURL' + err);
            
            if (doc !== null) {
                // url_to_shorten exists already in the collection
                res.send('urllong existant: ' + doc.longurl + 
                        ',  racourci: ' + doc.shorturl);
            } else { 
                // url_to_shorten doesn't exist yet. So we get the last shorturl
                // in the db, from which we will generate a new one
                next()
                
                // urlcoll.find({}, {'shorturl':1, _id:0}).limit(1)
                //     .sort({$natural: -1}).next( (err, doc) => {
                //         if (err) console.error('err in insertNewUrl ' + err);
                //         // generate a new short from the last one used
                //         var new_short = makeShortUrl(doc.shorturl);
                //             // and create a new document in the db
                //             urlcoll.insert({
                //                 'longurl': url_to_shorten, 
                //                 'shorturl': new_short
                //             }, (err, doc) => {
                //                 if (err) return console.log(err);
                //                 res.send('nouveau urllong: ' + url_to_shorten + 
                //                         ', nouveau racourci: ' + new_short);
                //             })
                //     })
            }
        })
    }

    this.createNewShort = function(req, res) {
        // var urlcoll = req.urlcoll;

        req.urlcoll.find({}, {'shorturl':1, _id:0}).limit(1)
            .sort({$natural: -1}).next( (err, doc) => {
                if (err) console.error('err in insertNewUrl ' + err);
                // generate a new short from the last one used
                var new_short = makeShortUrl(doc.shorturl);
                // and create a new document in the db
                req.urlcoll.insert({
                    'longurl': url_to_shorten, 
                    'shorturl': new_short
                }, (err, doc) => {
                    if (err) return console.log(err);
                    res.send('nouveau urllong: ' + url_to_shorten + 
                            ', nouveau racourci: ' + new_short);
                })
            })
    }

    
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    
    function makeShortUrl(lastShortUrl) {
        // return lastShortUrl + 1
        return (parseInt(lastShortUrl, 36) + 1).toString(36)
    }
}
module.exports = urlHandler;
