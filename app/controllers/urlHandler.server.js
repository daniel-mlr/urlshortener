function urlHandler(db) {
    'use strict';
    /* jshint validthis:true */
    
    const isURL = require('validator/lib/isURL');

    // create and/or access the collection
    var urlcoll = db.collection('urlcoll');

    var url_to_shorten;

    this.urlServiceGet = function(req, res){
        url_to_shorten = req.params.url_to_shorten;
       
        // url query parameters have been stripped; put them back
        // (i.e. we want www.example.com?a=2 and www.example.com?a=3 to be
        // two separate entries)
        if (!isEmpty(req.query)) {
            url_to_shorten += '?' + JSON.stringify(req.query)
                .replace(/:/g, '=').replace(/["{}]/g, '').replace(/,/g, '&')
        }
        
        if (validUrl(url_to_shorten)) {
            shortenURL(req, res, url_to_shorten)
        } else {
            res.json({"error": url_to_shorten + "is not a valid url"})
        }
        
    }
    
    this.urlServicePost = function(req, res){
        url_to_shorten = req.body.url_to_shorten;
        if (validUrl(url_to_shorten)) {
            shortenURL(req, res)
        } else {
            res.json({"error": url_to_shorten + "is not a valid url"})
        }
    }
    
    function validUrl(url) {
        // check if url is in a valid form
        var isurl_options = {protocols:  ['http', 'https'] }
        return isURL(url, isurl_options)
    }
       
    function shortenURL(req, res) {
   
        // prepend the http protocol if not present
        if (!url_to_shorten.startsWith('http')) {
            url_to_shorten = 'http://' + url_to_shorten
        }
    
        urlcoll.findOne({'longurl': url_to_shorten}, {}, (err, doc) => {
            if (err) return console.log(err);
            
            if (doc !== null) {
                // url_to_shorten exists already in the collection
                res.send('urllong existant: ' + doc.longurl + 
                        ',  racourci: ' + doc.shorturl);
            } else { 
                // url_to_shorten doesn't exist yet
                // we get the last shorturl name entered 
                // from which we will generate a new one
                urlcoll.find({}, {'shorturl':1, _id:0})
                    .limit(1).sort({$natural: -1}).next( (err, doc) => {
                        if (err) console.error('err in insertNewUrl ' + err);
                        // generate a new short from the last one used
                        var new_short = makeShortUrl(doc.shorturl)
                            // and create a new document in the db
                            urlcoll.insert({
                                'longurl': url_to_shorten, 
                                'shorturl': new_short
                            }, (err, doc) => {
                                if (err) return console.log(err);
                                res.send('nouveau urllong: ' + url_to_shorten + 
                                        ', nouveau racourci: ' + new_short);
                            })
                    })
            }
        
        })
    }

    /*
    function insertNewUrl(err, doc) {
        if (err) console.error('err in insertNewUrl ' + err);
        // generate a new short from the last one used
        var new_short = makeShortUrl(doc.shorturl)
            // and create a new document in the db
            urlcoll.insert({
                'longurl': url_to_shorten, 
                'shorturl': new_short
            }, (err, doc) => {
                if (err) return console.log(err);
                res.send('nouveau urllong: ' + url_to_shorten + 
                        ', nouveau racourci: ' + new_short);
            })
    }
    */
    
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    
    function makeShortUrl(lastShortUrl) {
        // return lastShortUrl + 1
        return (parseInt(lastShortUrl, 36) + 1).toString(36)
    }
}
module.exports = urlHandler;
