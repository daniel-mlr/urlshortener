'use strict'

// setup requirements and instantiations
const express = require('express')
const app = express()
const cors = require('cors')
// const mongoose = require('mongoose')
const mongo = require('mongodb').MongoClient
const bodyParser = require('body-parser')
// delegate routing
var routes = require('./app/routes/index.js')

// Connect to the database
mongo.connect('mongodb://localhost:27017/urldb', (err, db) => {
    if (err) {
        throw new Error('Database failed to connect')
    } else {
        console.log('MongoDB successfully connect on port 27017')
    }

    // parse body of requests and allow cross-origin ressource sharing
    // app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    // app.use(cors())
    
    // access to static files in public directory
    app.use(express.static(__dirname + '/public'))
    app.use('/controllers', express.static(__dirname + '/app/controllers'))

    // process app and database objects
    routes(app, db)
    // db.close()
    
    // monitor server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`server listening on port ${PORT}`))

})





/*
app.post('/new', (req, res) => {
    console.log('méthode d\'envoi par post')
    res.send('test pour post: ' )
})
*/
