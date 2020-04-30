import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";
import './database'

const app = express();

app.use(passport.initialize());

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, res }) => ({ req, res }),
	playground: true
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);