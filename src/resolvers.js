import mongoose, { model, isValidObjectId } from 'mongoose';

import User from "./database/models/User";
import Raffle from "./database/models/Raffle";
import Ticket from "./database/models/Ticket";
import Global from "./database/models/Global";
import { PubSub, withFilter } from 'apollo-server';
import passport from './passport.js';
import { generateNumber, getUserWithToken, getRamdomBetween } from './database/utils';
import { numbersCost } from './database/constants';
require('dotenv').config();

const { authenticateFacebook, authenticateGoogle } = passport;

const pubsub = new PubSub();
const RAFFLE_INCREMENT = 'RAFFLE_INCREMENT';

export const resolvers = {
    Subscription: {
        raffleIncrement: {
            subscribe: () => pubsub.asyncIterator([RAFFLE_INCREMENT]),
          }
    },
    Query: {
        getUserWithToken: async (parent, {token}, context, info) => await getUserWithToken(token),
        getTicket: async (parent, {token}, context, info) => {
            console.log('context-user',context.user);
            try {
                if (!context.user) {
                    return Error('No user');
                }
                
                // Get current stored numbers
                let [global] = await Global.find({});
                const { tickets: { current, finished }, _id } = global;
                // Just numbers and transform string to number
                const storedNumber = Object.values(current).map(cur => cur);
                // Calcul number of all numbers
                const total = storedNumber.reduce((acc, cur) => acc + cur, 0);
                let selected = [];
                let count = 0;

                for (let i = 0; i < 6; i++) {
                    const indexOfNumber = generateNumber(total, storedNumber);
                    const ticket = {
                        'finished': global.tickets.finished + 1,
                        'current': {
                            ...global.tickets.current,
                            [indexOfNumber]: global.tickets.current[indexOfNumber] - 1
                        }
                    };

                    global.tickets = ticket;
                    // global.tickets.current[indexOfNumber] = global.tickets.current[indexOfNumber] - 1;
                    count = count + numbersCost[indexOfNumber];
                    selected.push( indexOfNumber );
                }
                // Update user coins 
                context.user.coins = context.user.coins + count;
                // Save all
                await global.save();
                await context.user.save();

            
                selected = selected.map((nb, index) => {
                    const ramdom = getRamdomBetween(0, 40);
                    return {
                        number: ramdom.toFixed(),
                        value: numbersCost[nb]
                    }
                });

                console.log(selected)
                return {
                    selected
                }
            } catch (err) {
                throw Error(err);
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
            const { price } = args;
            const { _id: userId } = context.user;

            if (!context.user) {
                return Error('No user');
            }

            try {
                const raffleRegister = await Raffle.findOne({ price });
                
                if(!raffleRegister) {
                    const raffle = await Raffle.create(
                        { 
                            price,
                            usersCount: 1,
                            users: [userId],
                            createAt: new Date()
                        }
                    );
                    pubsub.publish(RAFFLE_INCREMENT, { raffleIncrement: raffle });
                    
                    return raffle;
                }

                await Raffle.updateOne(
                    { price }, 
                    { 
                        $push: { users: userId },
                        $inc: { usersCount: 1 }
                    }
                );

                await raffleRegister.save();

                pubsub.publish(RAFFLE_INCREMENT, { raffleIncrement: raffleRegister });

                return raffleRegister;

            } catch(err) {
                throw Error(err);
            }
        },
        
    }
};