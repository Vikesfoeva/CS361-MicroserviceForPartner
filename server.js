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
  const lastName = req.body.lastName;
  const firstName = req.body.firstName;
  const dateOfBirth = req.body.dateOfBirth;
  const memberId = req.body.memberId;

  if (lastName === undefined && firstName === undefined && dateOfBirth === undefined && memberId === undefined) {
    res.status(400);
    return res.send({'Error' : 'Please provide last name, first name, date of birth, or the member ID'});
  }
  const patients = await client.db('Mini-EMR').collection('Patients').find().toArray();
  const searchResults = [];

  for (let i=0; i < patients.length; i++) {
    const thisPatient = patients[i];
    let [lastNameMatch, firstNameMatch, dateOfBirthMatch, memberIdMatch] = [false, false, false, false];

    if (lastName !== undefined) {
      lastNameMatch = thisPatient['LastName'] === lastName;
    }

    if (firstName !== undefined) {
      firstNameMatch = thisPatient['FirstName'] === firstName;
    }

    if (dateOfBirth !== undefined) {
      dateOfBirthMatch = thisPatient['DOB'] === dateOfBirth;
    }

    if (memberId !== undefined) {
      memberIdMatch = thisPatient['MemberID'] === memberId;
    }

    if (lastNameMatch || firstNameMatch || dateOfBirthMatch || memberIdMatch) {
      searchResults.push(thisPatient);
    }
  };

  return res.send(searchResults);
});
