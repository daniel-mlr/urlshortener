// setup requirements and instantiations
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())

// access to static files in public directory
app.use(express.static(__dirname + '/public'))

// Create the database entry
app.get('/new/:url_to_shorten(*)', (req, res) => {
    var { url_to_shorten } = req.params;
    console.log(url_to_shorten);
})


app.listen(process.env.PORT || 3000, () => console.log('Everything is ok!'))
