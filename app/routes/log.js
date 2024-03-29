var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('logdb', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'logdb' database");
    db.collection('log', {safe:true}, function(err, collection) {
      if (err) {
        console.log("The 'log' collection doesn't exist.");
      }
    });
  }
});

exports.find = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving',id);
  db.collection('log', function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
      res.send(item);
    });
  });
};

exports.list = function(req, res) {
  console.log("list")
  db.collection('log', function(err, collection) {
    collection.find().toArray(function(err, items) {
      res.send(items);
    });
  });
};

exports.add = function(req, res) {
  var logEvent = req.body;
  var query = req.query;
  for(var q in query){
    logEvent[escape(q)] = escape(query[q]);
  }
  // From http://www.vancelucas.com/blog/count-the-number-of-object-keysproperties-in-node-js/
  // logEvent.length will return undefines. Solution is to
  // count the key length from the Object prototype directly.
  if(Object.keys(logEvent).length > 0){
    logEvent.timestamp = new Date().getTime();
    console.log('Logging',JSON.stringify(logEvent));
    db.collection('log', function(err, collection) {
      collection.insert(logEvent, {safe:true}, function(err, result) {
        if (err) {
          res.send({'error':'An error has occurred'});
        } else {
          console.log('Success: ' + JSON.stringify(result[0]));
          res.send(result[0]);
        }
      });
    });
  } else {
    res.send("no data to log");
  }
}

exports.update = function(req, res) {
  var id = req.params.id;
  var logEvent = req.body;
  console.log('Updating',id);
  console.log(JSON.stringify(logEvent));
  db.collection('log', function(err, collection) {
    collection.update({'_id':new BSON.ObjectID(id)}, logEvent, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating logEvent: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        console.log('' + result + ' document(s) updated');
        res.send(logEvent);
      }
    });
  });
}

exports.delete = function(req, res) {
  var id = req.params.id;
  console.log('Deleting logEvent',id);
  db.collection('log', function(err, collection) {
    collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred - ' + err});
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
  });
}

