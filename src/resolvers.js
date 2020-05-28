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
    Query: {
        getUserWithToken: async (parent, {token}, context, info) => {
            try {
                const user = await getUserWithToken(token);
                
                return user
            } catch(err) {
                throw Error(err);
            }
        },
        getTicket: async (parent, {token}, context, info) => {
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

                return {
                    selected
                }
            } catch (err) {
                throw Error(err);
            }
        },
        getRaffles: async (parent, args, context, info) => {
            if (!context.user) {
                return Error('No user');
            }

            try {
                return await Raffle.find();
            } catch(err) {
                throw Error(err);
            }
        },
    },
    Mutation: {
        auth: async (_, { token, provider }, { req, res }) => {
            req.body = {
                ...req.body,
                access_token: token,
            };

            try {
                let profile;

                switch (provider) {
                    case 'facebook':
                        const { data: { profile: fbProfile } }  = await authenticateFacebook(req, res);
                        profile = fbProfile;
                        break;
                
                    case 'google':
                        const { data: { profile: googleProfile } } = await authenticateGoogle(req, res);
                        profile = googleProfile;
                        break;
                
                    default:
                        break;
                }

                if (profile) {
                    const user = await User.findById(profile.id);

                    if (!user) {

                        const userForRegister = {
                            _id: profile._json.id,
                            createAt: new Date(),
                            coins: 0,
                            name: profile._json.name || '',
                            email: provider === 'google' ? profile._json.email : email[0].value || '',
                            phone: profile._json.phone || 0,
                            photoURL: provider === 'google' ? profile._json.picture : email[0].value || ''
                        };

                        const newUser = await User.create(userForRegister);

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

                return raffleRegister;

            } catch(err) {
                throw Error(err);
            }
        },
        
    }
};