// setup requirements and instantiations
const express = require('express')
const app = express()
const cors = require('cors')
// const mongoose = require('mongoose')
const mongo = require('mongodb').MongoClient
const bodyParser = require('body-parser')


// Connect to the database
mongo.connect('mongodb://localhost:27017/urldb', (err, db) => {
    if (err) {
        throw new Error('Database failed to connect')
    } else {
        console.log('MongoDB successfully connect on port 27017')
    }

    // parse body of requests and allow cross-origin ressource sharing
    app.use(bodyParser.json());
    app.use(cors())
    
    // access to static files in public directory
    app.use(express.static(__dirname + '/public'))
    app.use('/controllers', express.static(__dirname + '/app/controllers'))

    // Create the database entry (asterix: accept whole string 
    // regardless of chars.)
    app.get('/new/:url_to_shorten(*)', (req, res) => {
        var { url_to_shorten } = req.params;
        console.log(url_to_shorten);
        res.send('bonjour: ' + url_to_shorten )
    })

    // catch all other urls
    app.get('*', (req, res) => res.send('This page doesn\'t exist'))

})


// monitor server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server listening on port ${PORT}`))



/*
app.post('/new', (req, res) => {
    console.log('méthode d\'envoi par post')
    res.send('test pour post: ' )
})
*/
