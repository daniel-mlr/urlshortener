'use strict'

// setup requirements and instantiations
const express = require('express')
const app = express()
const mongo = require('mongodb').MongoClient
const bodyParser = require('body-parser')
// delegate routing
var routes = require('./app/routes/index.js')

// Connect to the database

const connection = 'mongodb://localhost:27017/urldb'
// mongo.connect(process.env.MONGOLAB_URI || connection, (err, db) => { doesnt work
mongo.connect(process.env.MONGODB_URI || connection, (err, database) => {
    if (err) {
        throw new Error(err + '  Database failed to connect')
    } else {
        console.log('MongoDB successfully connected')
    }
    
    // (note: must export DB_NAME in the same shell)
    const db = database.db(process.env.DB_NAME)

    // parse body of requests 
    app.use(bodyParser.urlencoded({extended: true}));
    
    // give access to static files and controllers
    app.use(express.static(__dirname + '/public'))
    app.use('/controllers', express.static(__dirname + '/app/controllers'))

    // process app and database objects
    routes(app, db)
    
    // monitor server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
})
