const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongodb
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
  if(err){
    err;
  }

  console.log('MongoDB is connected...');

  //connect to socket.io
  client.on('connection', function(){
    let chat = db.collection('chats');

    //function t0 send status to client
    sendStatus = function(s){
      socket.emit('status',s);
    }

    //get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        err;
      }

      //no error? emit messages
      socket.emit('output', res);

    });
    //handle input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;

      //check for name and message
      if(name == '' || message == '' ){
        //send error status
        sendStatus('Please enter a name and message');
      }
      else {
        //insert message into database
        chat.insert({name: name, message: message}, function(){
          client.emit('output', [data]);

          //send status object
          sendStatus({
            message: 'Message successfully sent',
            clear: true
          });
        });
      }
    });

    //handle clear
    socket.on('clear', function(data){
      //remove all chats from the collection
      chat.remove({}, function(){
        //emit cleared event
        socket.emit('cleared');
      });
    })

  });
});
