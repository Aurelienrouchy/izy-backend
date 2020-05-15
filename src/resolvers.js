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
                
                return {
                    success: true,
                    message: 'Get user',
                    payload: {
                        user
                    }
                }
            } catch(error) {
                return {
                    success: false,
                    message: 'No user in database',
                    error
                }
            }
        },
        getTicket: async (parent, {token}, context, info) => {
            try {
                if (!context.user) {
                    return {
                        success: false,
                        message: 'No user in context',
                        error: 'No user in context'
                    }
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
                    success: true,
                    message: 'Get ticket\'s ramdom numbers and value',
                    payload: {
                        selected
                    }
                }
            } catch (error) {
                return {
                    success: false,
                    message: 'Error in ticket',
                    error
                }
            }
        },
        getRaffles: async (parent, args, context, info) => {
            if (!context.user) {
                return {
                    success: false,
                    message: 'No user in context',
                    error: 'Nou'
                }
            };

            try {
                const raffles = await Raffle.find();
                return {
                    success: true,
                    message: 'Get raffles',
                    payload: {
                        raffles
                    }
                };
            } catch(error) {
                return {
                    success: false,
                    message: 'No user in context',
                    error
                }
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
                            success: true,
                            message: 'Get user after create',
                            payload: {
                                ...newUser._doc,
                                token: newUser.generateJWT(newUser._id),
                            }
                        }; 
                    }

                    return {
                        success: true,
                        message: 'Get user after create',
                        payload: {
                            ...user._doc,
                            token: user.generateJWT(user._id),
                        }
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
            } catch(error) {
                return {
                    success: false,
                    message: 'Fb au fail',
                    error
                }
            }
        },
        incrementRaffle: async (parent, { price }, { _id: userId }, info) => {
            if (!context.user) {
                return {
                    success: false,
                    message: 'No user in context',
                    error: 'No user in context'
                }
            };

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

                    return {
                        success: true,
                        message: 'Create and get raffle',
                        payload: {
                            raffle
                        }
                    };
                }

                await Raffle.updateOne(
                    { price }, 
                    { 
                        $push: { users: userId },
                        $inc: { usersCount: 1 }
                    }
                );

                await raffleRegister.save();

                return {
                    success: true,
                    message: 'Update raffle',
                    payload: {
                        raffleRegister
                    }
                };
            } catch(error) {
                return {
                    success: false,
                    message: 'Fb au fail',
                    error
                }
            }
        },
        
    }
};