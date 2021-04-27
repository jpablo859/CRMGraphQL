const { ApolloServer } = require('apollo-server');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

require('dotenv').config();

const connectDB = require('./config/db');
connectDB();


//SERVIDOR
const server = new ApolloServer({
    typeDefs,
    resolvers
});


//ARRANCAR SERVIDOR
server.listen()
        .then(({url}) => console.log(`Server listo en la url: ${url}`))
