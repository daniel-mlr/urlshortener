'use strict'

module.exports = function(app, db) {
    // note: some google chrome extensions cause 
    // the get request to be sent twice!

    const isURL = require('validator/lib/isURL');
    const util = require('util');

    // root: call home page
    app.route('/').get((req, res) => {
        res.sendFile(process.cwd() + '/public/index.html')
    })
    
    
    // create and/or access the collection
    var urlcoll = db.collection('urlcoll');

    // Route via GET (asterix: accept whole string regardless of chars.)
    app.route('/new/:url_to_shorten(*)').get( (req, res) => {
        var { url_to_shorten } = req.params;
       

        console.log('url soumis par GET: ' + url_to_shorten);
        console.log('req.params dans index.js): ' + JSON.stringify(req.query))
        
        if (isURL(url_to_shorten, {protocols: ['http', 'https'] })) {
            console.log('de GET: cet uri semble correct. ' + url_to_shorten);

            
            // url query parameters have been stripped; put them back
            if (!isEmpty(req.query)) {
                console.log('req.query ne devrait pas être vide. ' + 
                        JSON.stringify(req.params))
                url_to_shorten += '?' + JSON.stringify(req.query)
                    .replace(/:/g, '=').replace(/["{}]/g, '').replace(/,/g, '&')
            }
           
            // put back the http protocol if not there
            if (!url_to_shorten.startsWith('http')) {
                url_to_shorten = 'http://' + url_to_shorten
            }

            // find url_to_shorten, if not exists, create it
            urlcoll.findOne({'longurl': url_to_shorten}, {}, (err, doc) => {
                if (err) return console.log(err);
                console.log('inspection: ' + util.inspect(doc));

                if (doc !== null) {
                    // url_to_shorten existe, 
                    res.send('urllong existant: ' + doc.longurl + 
                            ',  racourci: ' + doc.shorturl);
                } else { 

                    urlcoll.find({}, {'shorturl':1, _id:0})
                        .limit(1).sort({$natural: -1}).next( (err, doc) => {
                            if (err) console.log(err);
                            console.log('methode next: ' + doc.shorturl)

                            // generate a new short from the last one used
                            var new_short = makeShortUrl(doc.shorturl)
                            urlcoll.insert({
                                'longurl': url_to_shorten, 
                                'shorturl': new_short
                            }, (err, doc) => {
                                if (err) return console.log(err);
                                console.log('insertion réussie');
                                res.send('nouveau urllong: ' + url_to_shorten + 
                                        ', nouveau racourci: ' + new_short);

                            })
                    })
                }
            })

        } else {
            res.send('de GET: ' + url_to_shorten + ' n\'est pas correct')
        }

    })
    
    // Route via POST
    app.route('/new/').post((req, res) => {
        // traitement de post
        console.log('le post fonctionne!');
        console.log(req.body);
        var { url_to_shorten } = req.body

        // res.send('url de post: ' + url_to_shorten)
        if (isURL(url_to_shorten, {protocols: ['http', 'https'] })) {
            res.send('cet uri semble correct. ' + url_to_shorten)
        } else {
            res.send(url_to_shorten + ' n\'est pas correct')
        }

        console.log(req.query);
            
    })

    // catch all other urls
    app.get('*', (req, res) => {
        console.log('get asterisque');
        res.json({"error": "no short url found for given input" })
    })

    function makeShortUrl(lastShortUrl) {
        // return lastShortUrl + 1
        return (parseInt(lastShortUrl, 36) + 1).toString(36)
    }

    // function isEmpty(obj) {
    //     for(var key in obj) {
    //         if(obj.hasOwnProperty(key))
    //             return false;
    //     }
    //     return true;
    // }

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

}
