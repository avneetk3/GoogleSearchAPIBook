const express = require('express');
//adding path
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');

const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');


const app = express();
const PORT = process.env.PORT || 3001;

//create new Apollo server and pass to schema data
const startServer= async ()=>{
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  playground: true,
  context: authMiddleware
});

//start server 
await server.start();

//integrate  Apollo server with Express application as middleware
server.applyMiddleware({app});
console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
}

startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});*/

//app.use(routes); //deleted this to fix error when access: http://localhost:3001/graphql unable to connect

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));

  // log where we can go to test our GQL API
 // console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});


process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});