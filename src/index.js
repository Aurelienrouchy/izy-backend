import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import bodyParser from "body-parser";
import passport from "passport";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";
import './database/index.js'
import { getUserWithToken } from './database/utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(passport.initialize());

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req, res, connection }) => {
		if (connection) {
			// check connection for metadata
			return connection.context;
		} else {
			// Get the user token from the headers.
			let token = req.headers.authorization || '';
			let user;

			if (token) {
				if (token.startsWith('Bearer ')) {
					// Remove Bearer from string
					token = token.slice(7, token.length).trimLeft();

					user = await getUserWithToken(token)
				}
			}
			
			return ({ req, res, user })
		}
	},
	playground: true,
	introspection: true,
});

server.applyMiddleware({ 
	app,
 });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
	console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`)
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
});