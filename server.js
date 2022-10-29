const express = require('express');
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

app.post('/patients', async (req, res) => {
  // Capture search criteria
  const searchParams = [];
  if (req.body.lastName !== undefined) {
    searchParams.push({"LastName" : req.body.lastName});
  }
  if (req.body.firstName !== undefined) {
    searchParams.push({"FirstName" : req.body.firstName});
  }
  if (req.body.dateOfBirth !== undefined) {
    searchParams.push({"DOB" : req.body.dateOfBirth});
  }
  if (req.body.memberId !== undefined) {
    searchParams.push({"MemberID" : req.body.memberId});
  }

  // Error check
  if (searchParams.length === 0) {
    res.status(400);
    return res.send({'Error' : 'Please provide last name, first name, date of birth, or the member ID'});
  }

  // Query the database
  const patients = await client.db('Mini-EMR').collection('Patients').find().toArray();
  const searchResults = [];

  // Parse the results
  for (let i=0; i < patients.length; i++) {
    const thisPatient = patients[i];
    let isMatch = false;

    for (let j=0; j < searchParams.length; j++) {
      const thisKey = Object.keys(searchParams[j])[0];
      if (thisPatient[thisKey] === searchParams[j][thisKey]) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      searchResults.push(thisPatient);
    }
  };

  return res.send(searchResults);
});
