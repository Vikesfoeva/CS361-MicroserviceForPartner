// CS 361 Microservice for Partners Project
// https://github.com/Vikesfoeva/CS361-MicroserviceForPartner
// Brandon Lenz
//Goal
// Searches an a MongoDB collection for patient(s) given the user search criteria.

// Logic
// FirstName & LastName are both case agnostic and searched based on includes such
// that a search for jO could return the name John. The MemberID field is also case 
// agnostic and also searches for substrings. The DOB must be exact. If a patient matches 
// on 1 search criteria, but not on the 2nd then they will be excluded. A list of all
// patients who aare valid options for all search criteria is who is returned.

// URL = https://lenzb-cs361-microservice.ue.r.appspot.com
// Hosted on Google Cloud Platform

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

// Allow cross origin
app.use(function (req, res, next) {
  const thisHost = req.get('host');
  res.header("Access-Control-Allow-Origin", "http://" + thisHost + "/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
        const patDate = new Date(thisPatient['DOB']);
        const checkDate = patDate.toISOString().substring(0,10);
        if (thisDate === checkDate) {
          matchedParams = matchedParams + 1;
        }
      }
      else if (String(thisPatient[thisKey]).toLowerCase().includes(searchParams[j][thisKey].toLowerCase())) {
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
