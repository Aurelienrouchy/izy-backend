import User from "./database/models/User.js";
import Raffle from "./database/models/Raffle.js";
import { PubSub } from 'apollo-server';
import jwt from 'jsonwebtoken';
import passport from './passport';
require('dotenv').config();

const { authenticateFacebook, authenticateGoogle } = passport;

const pubsub = new PubSub();

export const resolvers = {
    Subscription: {
        raffleIncrement: {
            subscribe: () => pubsub.asyncIterator([RAFFLE_INCREMENT]),
        },
    },
    Query: {
        getUserWithToken: async (parent, {token}, context, info) => {
            const tokenDecoded = jwt.verify(token, process.env.JWT_KEY || 'Prout123');

            console.log(tokenDecoded)
            console.log(await User.findById(tokenDecoded.token))
            return await User.findById(tokenDecoded.token);
        },
        getTicket: async (parent, {token}, context, info) => {
            return {
                id: '2',
                numbers: [2,2,2],
                userNumers: [0,9]
            }
        },
    },
    Mutation: {
        authFacebook: async (_, { token }, { req, res }) => {
            req.body = {
                ...req.body,
                access_token: token,
            };
            
            try {
                const { data: {profile, refreshToken}, data, info } = await authenticateFacebook(req, res);

                if (data) {
                    const user = await User.findById(profile.id);

                    if (!user) {
                        const newUser = await User.create({
                            _id: profile.id,
                            createAt: new Date(),
                            name: profile.displayName || '',
                            email: profile.emails[0].value || '',
                            phone: profile.phone || 0,
                            photoURL: profile.photos[0].value || ''
                        })

                        return {
                            ...newUser._doc,
                            token: newUser.generateJWT(newUser._id),
                        };
                    }

                    return {
                        ...user._doc,
                        token: user.generateJWT(user._id),
                    };
                }
        
                if (info) {
                    switch (info.code) {
                        case 'ETIMEDOUT':
                            return (new Error('Failed to reach Facebook: Try Again'));
                        default:
                            return (new Error('something went wrong'));
                    }
                }
                return (Error('server error'));
            } catch (error) {
                return error;
            }
        },
        createUser: async (parent, args, context, info) => {
            const {user: {name, email, phone, photoURL, providerId}} = args;
            const kitty = new User({ name, email, phone, photoURL, providerId });

            await kitty.save();

            return kitty;
        },
        incrementRaffle: async (parent, args, context, info) => {
            const {price} = args;
            console.log(parent, args, context, info)
            try {
                Raffle.findOne({ price }, (err, raffle) => {
                    if(err) throw Error(err)

                    if(!raffle) {
                        Raffle.create(
                            { 
                                price,
                                users: [],
                                createAt: new Date()
                            }, 
                            (error, raffle) => {
                                if(error) throw Error(error)


                            }
                        );
                    }
                });

                pubsub.publish(RAFFLE_INCREMENT, { price });

            } catch(err) {
                throw Error(err);
            }
        }
    }
};