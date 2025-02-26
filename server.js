const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;

const mongoURI = 'mongodb+srv://sohaib:SOHAIB@cluster0.9n80xku.mongodb.net/sohaib?retryWrites=true&ssl=true'

const client = new MongoClient(mongoURI);

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    client.connect().then(() => {
        console.log("Connected to MongoDB");
    }).catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('connected...');

    socket.on('message', async (msg) => {
        try {
            // Save the message to MongoDB
            const messagesCollection = client.db("CHAT").collection("messages");
            await messagesCollection.insertOne({ message: msg });
            console.log("Message saved to MongoDB:", msg);

            // Broadcast the message to other clients
            socket.broadcast.emit('message', msg);
        } catch (error) {
            console.error("Error handling message:", error);
        }
    });
});
