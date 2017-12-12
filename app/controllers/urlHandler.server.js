'use strict';
function urlHandler(db) {
    /* jshint validthis:true */
    
    const isURL = require('validator/lib/isURL');
    const util = require('util')

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
                console.log('new url_to_shorten: ' + url_to_shorten + 'short: ' + doc.shorturl);
                res.json({"original_url":doc.longurl,"short_url":doc.shorturl});
            } else { 
                // url_to_shorten doesn't exist yet. Next middleware will create it.
                next()
            }
        })
    }

    this.createNewShort = function(req, res) {
        // Get the last shorturl from the collection and generate a new one.

        req.urlcoll.find({}, {'shorturl':1, _id:0}).limit(1)
            .sort({$natural: -1}).next( (err, doc) => {
                if (err) console.error('err in insertNewUrl ' + err);
                // generate a new short from the last one used
                var new_short;
                if (doc) {
                    new_short = makeShortUrl(doc.shorturl);
                } else {
                    // (only in case there is no entry in the collection yet)
                    new_short = 'aa'
                }
                // and create a new document in the collection
                req.urlcoll.insert({
                    'longurl': url_to_shorten, 
                    'shorturl': new_short
                }, (err, doc) => {
                    if (err) return console.log(err);
                    console.log('new url_to_shorten: ' + url_to_shorten + 'short: ' + new_short);
                    res.json({"original_url":url_to_shorten,"short_url":new_short});
                })
            })
    }

    this.useShort = function(req, res) {
        var urlcoll = db.collection('urlcoll');
        urlcoll.findOne({shorturl: req.params.shorturl}, (err, doc) => {
            if (err) console.error('err in useShort ' + err);
            console.log('doc est: ' + util.inspect(doc))
            if (doc) {
                console.log('shorturl: ' + doc.shorturl +'redirects to: ' + doc.longurl);
                // we have a match for shorturl
                res.redirect(doc.longurl)
            } else {
                res.json({'error': 'this url is not in the database'})
            }
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
