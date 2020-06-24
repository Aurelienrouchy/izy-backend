'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _regeneratorRuntime = _interopDefault(require('@babel/runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('@babel/runtime/helpers/asyncToGenerator'));
var apolloServerExpress = require('apollo-server-express');
var express = _interopDefault(require('express'));
var passport$2 = _interopDefault(require('passport'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/defineProperty'));
var _slicedToArray = _interopDefault(require('@babel/runtime/helpers/slicedToArray'));
var graphql = require('graphql');
var mongoose = require('mongoose');
var mongoose__default = _interopDefault(mongoose);
var jwt = _interopDefault(require('jsonwebtoken'));
var apolloServer = require('apollo-server');
var _taggedTemplateLiteral = _interopDefault(require('@babel/runtime/helpers/taggedTemplateLiteral'));

var Schema = mongoose__default.Schema;
var UserSchema = new Schema({
  _id: String,
  createAt: Date,
  name: String,
  coins: Number,
  email: String,
  phone: Number,
  photoURL: String,
  id: String,
  raffles: Array
}, {
  _id: false
}); // Model Methods

UserSchema.methods.generateJWT = function (token) {
  return jwt.sign({
    token: token
  }, process.env.JWT_KEY || 'Prout123');
};

var User = mongoose.model('user', UserSchema);

var Schema$1 = mongoose__default.Schema;
var raffleSchema = new Schema$1({
  createAt: Date,
  price: Number,
  usersCount: Number,
  users: Array
});
var Raffle = mongoose.model('raffle', raffleSchema);

var Schema$2 = mongoose__default.Schema;
var TicketSchema = new Schema$2({
  current: Array,
  finished: Number
});
var Ticket = mongoose.model('ticket', TicketSchema);

var Schema$3 = mongoose__default.Schema;
var GlobalSchema = new Schema$3({
  tickets: Object
}, {
  collection: 'global'
});
var Global = mongoose.model('global', GlobalSchema);

var Schema$4 = mongoose__default.Schema;
var historySchema = new Schema$4({
  createAt: Date,
  price: Number,
  user: String
});
var History = mongoose.model('history', historySchema);

var passport = require('passport');

var FacebookTokenStrategy = require('passport-facebook-token');

var GoogleTokenStrategy = require('passport-google-token').Strategy; // FACEBOOK STRATEGY


passport.use(new FacebookTokenStrategy({
  clientID: '1696089354000816',
  clientSecret: '8316811018a0a1479ecb7d9edca0820d',
  enableProof: false
}, function (accessToken, refreshToken, profile, done) {
  return done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });
}));

var authenticateFacebook = function authenticateFacebook(req, res) {
  return new Promise(function (resolve, reject) {
    passport.authenticate('facebook-token', {
      session: false
    }, function (err, data, info) {
      if (err) reject(err);
      resolve({
        data: data,
        info: info
      });
    })(req, res);
  });
}; // // GOOGLE STRATEGY


passport.use(new GoogleTokenStrategy({
  clientID: '108595256943-qq5i3mc7cn5u10ghoflb9hp9n3os10oc.apps.googleusercontent.com' // clientSecret: 'your-google-client-secret',

}, function (accessToken, refreshToken, profile, done) {
  return done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });
}));

var authenticateGoogle = function authenticateGoogle(req, res) {
  return new Promise(function (resolve, reject) {
    passport.authenticate('google-token', {
      session: false
    }, function (err, data, info) {
      if (err) reject(err);
      resolve({
        data: data,
        info: info
      });
    })(req, res);
  });
};

var passport$1 = {
  authenticateFacebook: authenticateFacebook,
  authenticateGoogle: authenticateGoogle
};

var getRamdomBetween = function getRamdomBetween(min, max) {
  return Math.random() * (max - min) + min;
};
var random = function random(total) {
  return getRamdomBetween(0, total);
};
var generateNumber = function generateNumber(total, numbers) {
  var selected = 0;
  var r = random(total);
  numbers.reduce(function (acc, cur, index) {
    if (r > acc && r <= acc + cur) {
      selected = index;
    }

    return acc + cur;
  }, 0);
  return selected;
};
var getUserWithToken = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(token) {
    var tokenDecoded;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            tokenDecoded = jwt.verify(token, process.env.JWT_KEY || 'Prout123');
            _context.next = 3;
            return User.findById(tokenDecoded.token);

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getUserWithToken(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _userNeedForRaffle;
var numbersCost = {
  0: 1000,
  1: 500,
  2: 200,
  3: 100,
  4: 50,
  5: 20,
  6: 10,
  7: 5,
  8: 3,
  9: 2,
  10: 1
};
var userNeedForRaffle = (_userNeedForRaffle = {}, _defineProperty(_userNeedForRaffle, '0.1', 333), _defineProperty(_userNeedForRaffle, '0.2', 667), _defineProperty(_userNeedForRaffle, '0.5', 1667), _defineProperty(_userNeedForRaffle, '1', 3333), _defineProperty(_userNeedForRaffle, '2', 6667), _defineProperty(_userNeedForRaffle, '5', 16667), _defineProperty(_userNeedForRaffle, '10', 33333), _defineProperty(_userNeedForRaffle, '50', 166667), _defineProperty(_userNeedForRaffle, '100', 333333), _userNeedForRaffle);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

require('dotenv').config();

var authenticateFacebook$1 = passport$1.authenticateFacebook,
    authenticateGoogle$1 = passport$1.authenticateGoogle;
var pubsub = new apolloServer.PubSub();
var resolvers = {
  Query: {
    getUserWithToken: function () {
      var _getUserWithToken2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(parent, _ref, context, info) {
        var token, user;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                token = _ref.token;
                _context.prev = 1;
                _context.next = 4;
                return getUserWithToken(token);

              case 4:
                user = _context.sent;
                return _context.abrupt("return", user);

              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](1);
                throw Error(_context.t0);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 8]]);
      }));

      function getUserWithToken$1(_x, _x2, _x3, _x4) {
        return _getUserWithToken2.apply(this, arguments);
      }

      return getUserWithToken$1;
    }(),
    getTicket: function () {
      var _getTicket = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(parent, _ref2, context, info) {
        var token, _yield$Global$find, _yield$Global$find2, global, _global$tickets, current, finished, _id, storedNumber, total, selected, count, i, indexOfNumber, ticket;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                token = _ref2.token;
                _context2.prev = 1;

                if (context.user) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return", Error('No user'));

              case 4:
                _context2.next = 6;
                return Global.find({});

              case 6:
                _yield$Global$find = _context2.sent;
                _yield$Global$find2 = _slicedToArray(_yield$Global$find, 1);
                global = _yield$Global$find2[0];
                _global$tickets = global.tickets, current = _global$tickets.current, finished = _global$tickets.finished, _id = global._id; // Just numbers and transform string to number

                storedNumber = Object.values(current).map(function (cur) {
                  return cur;
                }); // Calcul number of all numbers

                total = storedNumber.reduce(function (acc, cur) {
                  return acc + cur;
                }, 0);
                selected = [];
                count = 0;

                for (i = 0; i < 6; i++) {
                  indexOfNumber = generateNumber(total, storedNumber);
                  ticket = {
                    'finished': global.tickets.finished + 1,
                    'current': _objectSpread(_objectSpread({}, global.tickets.current), {}, _defineProperty({}, indexOfNumber, global.tickets.current[indexOfNumber] - 1))
                  };
                  global.tickets = ticket; // global.tickets.current[indexOfNumber] = global.tickets.current[indexOfNumber] - 1;

                  count = count + numbersCost[indexOfNumber];
                  selected.push(indexOfNumber);
                } // Update user coins 


                context.user.coins = context.user.coins + count; // Save all

                _context2.next = 18;
                return global.save();

              case 18:
                _context2.next = 20;
                return context.user.save();

              case 20:
                selected = selected.map(function (nb, index) {
                  var ramdom = getRamdomBetween(0, 40);
                  return {
                    number: ramdom.toFixed(),
                    value: numbersCost[nb]
                  };
                });
                return _context2.abrupt("return", {
                  selected: selected,
                  user: context.user
                });

              case 24:
                _context2.prev = 24;
                _context2.t0 = _context2["catch"](1);
                throw Error(_context2.t0);

              case 27:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[1, 24]]);
      }));

      function getTicket(_x5, _x6, _x7, _x8) {
        return _getTicket.apply(this, arguments);
      }

      return getTicket;
    }(),
    getHistory: function () {
      var _getHistory = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(parent, _ref3, context, info) {
        var token, histories, hist;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                token = _ref3.token;
                _context4.prev = 1;

                if (context.user) {
                  _context4.next = 4;
                  break;
                }

                return _context4.abrupt("return", Error('No user'));

              case 4:
                _context4.next = 6;
                return History.find({});

              case 6:
                histories = _context4.sent;
                _context4.next = 9;
                return Promise.all(histories.map( /*#__PURE__*/function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(history) {
                    var user;
                    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return User.findById(history.user);

                          case 2:
                            _context3.t0 = _context3.sent;

                            if (_context3.t0) {
                              _context3.next = 5;
                              break;
                            }

                            _context3.t0 = {};

                          case 5:
                            user = _context3.t0;
                            return _context3.abrupt("return", _objectSpread(_objectSpread({}, history._doc), {}, {
                              user: user.photoURL || ''
                            }));

                          case 7:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));

                  return function (_x13) {
                    return _ref4.apply(this, arguments);
                  };
                }()));

              case 9:
                hist = _context4.sent;
                console.log(hist);
                return _context4.abrupt("return", hist);

              case 14:
                _context4.prev = 14;
                _context4.t0 = _context4["catch"](1);
                throw Error(_context4.t0);

              case 17:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[1, 14]]);
      }));

      function getHistory(_x9, _x10, _x11, _x12) {
        return _getHistory.apply(this, arguments);
      }

      return getHistory;
    }(),
    getRaffles: function () {
      var _getRaffles = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(parent, args, context, info) {
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (context.user) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return", Error('No user'));

              case 2:
                _context5.prev = 2;
                _context5.next = 5;
                return Raffle.find();

              case 5:
                return _context5.abrupt("return", _context5.sent);

              case 8:
                _context5.prev = 8;
                _context5.t0 = _context5["catch"](2);
                throw Error(_context5.t0);

              case 11:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[2, 8]]);
      }));

      function getRaffles(_x14, _x15, _x16, _x17) {
        return _getRaffles.apply(this, arguments);
      }

      return getRaffles;
    }()
  },
  Mutation: {
    auth: function () {
      var _auth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_, _ref5, _ref6) {
        var token, provider, req, res, profile, _yield$authenticateFa, fbProfile, _yield$authenticateGo, googleProfile, user, userForRegister, newUser;

        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                token = _ref5.token, provider = _ref5.provider;
                req = _ref6.req, res = _ref6.res;
                req.body = _objectSpread(_objectSpread({}, req.body), {}, {
                  access_token: token
                });
                _context6.prev = 3;
                _context6.t0 = provider;
                _context6.next = _context6.t0 === 'facebook' ? 7 : _context6.t0 === 'google' ? 13 : 19;
                break;

              case 7:
                _context6.next = 9;
                return authenticateFacebook$1(req, res);

              case 9:
                _yield$authenticateFa = _context6.sent;
                fbProfile = _yield$authenticateFa.data.profile;
                profile = fbProfile;
                return _context6.abrupt("break", 20);

              case 13:
                _context6.next = 15;
                return authenticateGoogle$1(req, res);

              case 15:
                _yield$authenticateGo = _context6.sent;
                googleProfile = _yield$authenticateGo.data.profile;
                profile = googleProfile;
                return _context6.abrupt("break", 20);

              case 19:
                return _context6.abrupt("break", 20);

              case 20:
                if (!profile) {
                  _context6.next = 31;
                  break;
                }

                _context6.next = 23;
                return User.findById(profile.id);

              case 23:
                user = _context6.sent;

                if (user) {
                  _context6.next = 30;
                  break;
                }

                userForRegister = {
                  _id: profile._json.id,
                  createAt: new Date(),
                  coins: 0,
                  name: profile._json.name || '',
                  email: provider === 'google' ? profile._json.email : profile.emails[0].value || '',
                  phone: profile._json.phone || 0,
                  photoURL: provider === 'google' ? profile._json.picture : profile.photos[0].value || ''
                };
                _context6.next = 28;
                return User.create(userForRegister);

              case 28:
                newUser = _context6.sent;
                return _context6.abrupt("return", _objectSpread(_objectSpread({}, newUser._doc), {}, {
                  token: newUser.generateJWT(newUser._id)
                }));

              case 30:
                return _context6.abrupt("return", _objectSpread(_objectSpread({}, user._doc), {}, {
                  token: user.generateJWT(user._id)
                }));

              case 31:
                return _context6.abrupt("return", Error('server error'));

              case 34:
                _context6.prev = 34;
                _context6.t1 = _context6["catch"](3);
                return _context6.abrupt("return", _context6.t1);

              case 37:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[3, 34]]);
      }));

      function auth(_x18, _x19, _x20) {
        return _auth.apply(this, arguments);
      }

      return auth;
    }(),
    createUser: function () {
      var _createUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(parent, args, context, info) {
        var _args$user, name, email, phone, photoURL, providerId, kitty;

        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _args$user = args.user, name = _args$user.name, email = _args$user.email, phone = _args$user.phone, photoURL = _args$user.photoURL, providerId = _args$user.providerId;
                kitty = new User({
                  name: name,
                  email: email,
                  phone: phone,
                  photoURL: photoURL,
                  providerId: providerId
                });
                _context7.next = 4;
                return kitty.save();

              case 4:
                return _context7.abrupt("return", kitty);

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function createUser(_x21, _x22, _x23, _x24) {
        return _createUser.apply(this, arguments);
      }

      return createUser;
    }(),
    incrementRaffle: function () {
      var _incrementRaffle = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(parent, args, context, info) {
        var price, coins, userId, raffleRegister, winnerIndex, winner, _raffle, raffle;

        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                price = args.price, coins = args.coins;
                userId = context.user._id;

                if (context.user) {
                  _context8.next = 4;
                  break;
                }

                return _context8.abrupt("return", Error('No user'));

              case 4:
                _context8.prev = 4;
                _context8.next = 7;
                return Raffle.findOne({
                  price: price
                });

              case 7:
                raffleRegister = _context8.sent;
                context.user.coins = context.user.coins - coins;
                _context8.next = 11;
                return context.user.save();

              case 11:
                if (raffleRegister) {
                  _context8.next = 15;
                  break;
                }

                _context8.next = 14;
                return Raffle.create({
                  price: price,
                  usersCount: 1,
                  users: [userId],
                  createAt: new Date()
                });

              case 14:
                return _context8.abrupt("return");

              case 15:
                if (!(raffleRegister.usersCount > userNeedForRaffle[price])) {
                  _context8.next = 24;
                  break;
                }

                winnerIndex = getRamdomBetween(0, raffleRegister.usersCount - 1).toFixed();
                winner = raffleRegister.users[winnerIndex];
                _context8.next = 20;
                return History.create({
                  price: price,
                  user: winner,
                  createAt: new Date()
                });

              case 20:
                _context8.next = 22;
                return Raffle.updateOne({
                  price: price
                }, {
                  usersCount: 1,
                  users: [userId],
                  createAt: new Date()
                });

              case 22:
                _raffle = _context8.sent;
                return _context8.abrupt("return", {
                  coins: context.user.coins
                });

              case 24:
                _context8.next = 26;
                return Raffle.updateOne({
                  price: price
                }, {
                  $push: {
                    users: userId
                  },
                  $inc: {
                    usersCount: 1
                  }
                });

              case 26:
                raffle = _context8.sent;
                return _context8.abrupt("return", {
                  coins: context.user.coins
                });

              case 30:
                _context8.prev = 30;
                _context8.t0 = _context8["catch"](4);
                throw Error(_context8.t0);

              case 33:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[4, 30]]);
      }));

      function incrementRaffle(_x25, _x26, _x27, _x28) {
        return _incrementRaffle.apply(this, arguments);
      }

      return incrementRaffle;
    }()
  },
  Date: new graphql.GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: function parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize: function serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value); // ast value is always in string format
      }

      return null;
    }
  })
};

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n    scalar Date\n\n    input inputUser {\n        name: String!\n        email: String\n        phone: Int,\n        photoURL: String!\n        providerId: String!\n    }\n\n    type AuthResponse {\n        token: String\n        user: User!\n    }\n\n    type User {\n        token: String\n        _id: ID!\n        name: String!\n        email: String\n        phone: Int\n        coins: Int\n        photoURL: String!\n        providerId: String!\n        raffles: [ Raffle ]\n    }\n\n    type Raffle {\n        _id: ID\n        price: Float\n        usersCount: Int\n        users: [ String ]\n    }\n\n    type History {\n        _id: ID\n        price: Float!\n        user: String!\n        createAt: Date! \n    }\n\n    type IncrementRes {\n        coins: Int!\n        count: Int\n    }\n\n    type Number {\n        number: String!\n        value: Int!\n    }\n\n    type Ticket {\n        id: ID!\n        selected: [ Number! ]!\n    }\n\n    type Query {\n        getUser(id: ID!): User\n        getUserWithToken(token: String!): User\n        getTicket: Ticket!\n        getRaffles: [ Raffle! ]!\n        getHistory: [ History! ]!\n    }\n\n    type Mutation {\n        auth(token: String!, provider: String!): User\n        createUser(user: inputUser): User!\n        incrementRaffle(price: Float!, coins: Int!): IncrementRes\n    }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
var typeDefs = apolloServerExpress.gql(_templateObject());

var url = 'mongodb://aurelien:Prout123.!@ds211709.mlab.com:11709/izy';
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', function () {
  return console.log("Connected to mongo at ".concat(url));
});

var app = express();
var PORT = process.env.PORT || 4000;
app.use(passport$2.initialize());
var server = new apolloServerExpress.ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: function () {
    var _context = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
      var req, res, token, user;
      return _regeneratorRuntime.wrap(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              req = _ref.req, res = _ref.res;
              // Get the user token from the headers.
              token = req.headers.authorization || '';

              if (!token) {
                _context2.next = 8;
                break;
              }

              if (!token.startsWith('Bearer ')) {
                _context2.next = 8;
                break;
              }

              // Remove Bearer from string
              token = token.slice(7, token.length).trimLeft();
              _context2.next = 7;
              return getUserWithToken(token);

            case 7:
              user = _context2.sent;

            case 8:
              return _context2.abrupt("return", {
                req: req,
                res: res,
                user: user
              });

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee);
    }));

    function context(_x) {
      return _context.apply(this, arguments);
    }

    return context;
  }(),
  playground: true // introspection: true,

});
server.applyMiddleware({
  app: app
});
app.listen({
  port: PORT
}, function () {
  console.log("\uD83D\uDE80 Server ready at http://localhost:".concat(PORT).concat(server.graphqlPath));
});
