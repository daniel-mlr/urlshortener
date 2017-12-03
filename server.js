// setup requirements and instantiations
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// parse body of requests and allow cross-origin ressource sharing
app.use(bodyParser.json());
app.use(cors())

// access to static files in public directory
app.use(express.static(__dirname + '/public'))

// use pug as templating engine
// app.set('view engine', 'pug');
// app.set('views', './views')

// Create the database entry (asterix: accept whole string regardless of chars.)
app.get('/new/:url_to_shorten(*)', (req, res) => {
    var { url_to_shorten } = req.params;
    console.log(url_to_shorten);
    // console.log(req.body);
    res.send('bonjour: ' + url_to_shorten )
})

// app.get('/essai_view', (req, res) => {
//     res.render('first_view', {
//         name: 'Daniel',
//         url: 'http://dmeilleur.com'
//     })
// })

// app.get('/', (req, res) => {
//     res.render('index.pug', {
//         name: 'Daniel'
//     })
// })

app.post('/new', (req, res) => {
    console.log('méthode d\'envoi par post')
    res.send('test pour post: ' )
})

// catch all other urls
app.get('*', (req, res) => res.send('réponse invalide'))

// monitor server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
