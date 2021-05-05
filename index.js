const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');


require('dotenv').config();

const connectDB = require('./config/db');
connectDB();


//SERVIDOR
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || null;

        if (token) {
            try {
                const usuario = jwt.verify(token, process.env.SECRET_SEED);

                if (!usuario) {
                    throw new Error('No');
                }

                return {
                    usuario
                }
            } catch (err) {
                console.log(err)
                return err;
            }
        }
    } 
});


//ARRANCAR SERVIDOR
server.listen()
        .then(({url}) => console.log(`Server listo en la url: ${url}`))
