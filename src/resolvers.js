import { GraphQLScalarType } from 'graphql';

import User from "./database/models/User";
import Raffle from "./database/models/Raffle";
import Ticket from "./database/models/Ticket";
import Global from "./database/models/Global";
import History from "./database/models/History";
import { PubSub, withFilter } from 'apollo-server';
import passport from './passport.js';
import { generateNumber, getUserWithToken, getRamdomBetween } from './database/utils';
import { numbersCost, userNeedForRaffle } from './database/constants';
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
                    selected,
                    user: context.user
                }
            } catch (err) {
                throw Error(err);
            }
        },
        getHistory: async (parent, {token}, context, info) => {
            try {
                if (!context.user) {
                    return Error('No user');
                }
                
                const histories = await History.find({});
                const hist = await Promise.all(histories.map( async history => {
                    const user = await User.findById(history.user) || {};
                    return {
                        ...history._doc,
                        user: user.photoURL || ''
                    }
                }));
                console.log(hist)
                return hist
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
                            email: provider === 'google' ? profile._json.email : profile.emails[0].value || '',
                            phone: profile._json.phone || 0,
                            photoURL: provider === 'google' ? profile._json.picture : profile.photos[0].value || ''
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
            const { price, coins } = args;
            const { _id: userId } = context.user;

            if (!context.user) {
                return Error('No user');
            }

            try {
                let raffleRegister = await Raffle.findOne({ price });

                context.user.coins = context.user.coins - coins;
                await context.user.save();

                if (!raffleRegister) {
                    await Raffle.create(
                        { 
                            price,
                            usersCount: 1,
                            users: [userId],
                            createAt: new Date()
                        }
                    );

                    return;
                }

                if (raffleRegister.usersCount > userNeedForRaffle[price]) {
                    const winnerIndex = getRamdomBetween(0, raffleRegister.usersCount - 1).toFixed();
                    const winner = raffleRegister.users[winnerIndex];

                    await History.create(
                        { 
                            price,
                            user: winner,
                            createAt: new Date()
                        }
                    );

                    const raffle = await Raffle.updateOne({ price }, {
                        usersCount: 1,
                        users: [userId],
                        createAt: new Date()
                    });

                    return {
                        coins: context.user.coins
                    };
                }

                const raffle = await Raffle.updateOne(
                    { price },
                    { 
                        $push: { users: userId },
                        $inc: { usersCount: 1 }
                    }
                );

                return {
                    coins: context.user.coins
                };

            } catch(err) {
                throw Error(err);
            }
        },
        
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
          return new Date(value); // value from the client
        },
        serialize(value) {
          return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return new Date(+ast.value) // ast value is always in string format
          }
          return null;
        },
    }),
};