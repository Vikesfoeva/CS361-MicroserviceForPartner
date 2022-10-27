const express = require('express');
const path = require('path');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

// Connect to Mongo
// https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb-how-to-get-connected-to-your-database
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://brandonlenz:15XWJbReF3eXV0KY@cluster0.g2wvu5k.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

app.get('/', async (req, res) => {
    const out = await client.db('test');
    console.log(out);
    res.send('hi')

});
