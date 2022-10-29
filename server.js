// CS 361 Microservice for Partners Project
// Brandon Lenz

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
  if (req.body.LastName !== undefined) {
    searchParams.push({"LastName" : req.body.LastName});
  }
  if (req.body.FirstName !== undefined) {
    searchParams.push({"FirstName" : req.body.FirstName});
  }
  if (req.body.DOB !== undefined) {
    searchParams.push({"DOB" : req.body.DOB});
  }
  if (req.body.MemberID !== undefined) {
    searchParams.push({"MemberID" : req.body.MemberID});
  }

  // Error check
  if (searchParams.length === 0) {
    res.status(400);
    return res.send({'Error' : 'Please provide LastName, FirstName, DOB (yyyy-MM-dd), or the MemberID'});
  }

  // Query the database
  const patients = await client.db('Mini-EMR').collection('Patients').find().toArray();
  const searchResults = {
    matchCount: 0,
    results: []
  };

  // Parse the results
  for (let i=0; i < patients.length; i++) {
    const thisPatient = patients[i];
    let matchedParams = 0;
    // Check each query param for this patient
    for (let j=0; j < searchParams.length; j++) {
      const thisKey = Object.keys(searchParams[j])[0];
      
      // If we find a match add to response
      if (thisKey === 'DOB') {
        const thisDate = searchParams[j][thisKey];
        const patDate = thisPatient['DOB'].toISOString().substring(0,10);
        if (thisDate === patDate) {
          matchedParams = matchedParams + 1;
        }
      }
      else if (thisPatient[thisKey] === searchParams[j][thisKey]) {
        matchedParams = matchedParams + 1;
      } else {
        // Make this param very negative so we don't include this result
        matchedParams = matchedParams - 9999;
      }
    }

    if (matchedParams > searchResults['matchCount']) {
      searchResults['matchCount'] = matchedParams;
      searchResults['results'] = [thisPatient];

    } else if (matchedParams === searchResults['matchCount'] && matchedParams > 0) {
      const thisList = searchResults['results']
      thisList.push(thisPatient);
      searchResults['results'] = thisList;
    }

  };

  return res.send(searchResults['results']);
});
