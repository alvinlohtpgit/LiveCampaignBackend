var express = require('express');
var router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const admin = require('firebase-admin');

var serviceAccount = require('/Users/workit/WebstormProjects/LiveCampaignBackend/servicekey/smsvote-firebase-adminsdk-ehb8l-185c948782.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smsvote.firebaseio.com"
});

var db = admin.firestore();



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/sms', function(req,res){

  const twiml = new MessagingResponse();
  var posterCountry = req.body.FromCountry;
  var posterMessage = req.body.Body.trim();

  console.log('SMS From : ' + posterCountry);
  console.log('Message : ' + posterMessage);

  // Check if the message is what we want
  if (posterMessage.length > 1) {
    console.log('Received Length is more than 1');
    twiml.message('Please enter only A,B,C or D');
  }

  else if (posterMessage.length == 1) {
    posterMessage = posterMessage.toUpperCase();

    if ((posterMessage != 'A') && (posterMessage != 'B') && (posterMessage != 'C') && (posterMessage != 'D')){
      twiml.message('Please enter only A,B,C or D');
    }

    else{
      // Add the document to the firestore
      var voteDoc = db.collection('Votes').add({
        choice: posterMessage,
        location: posterCountry,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
      }).then(ref => {
        console.log("Added Doc with ID " + ref.id);
      });

        twiml.message('Thank you for your vote');
    }
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

});

module.exports = router;
