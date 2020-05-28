'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _regeneratorRuntime = _interopDefault(require('@babel/runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('@babel/runtime/helpers/asyncToGenerator'));
var apolloServerExpress = require('apollo-server-express');
var express = _interopDefault(require('express'));
var passport$2 = _interopDefault(require('passport'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/defineProperty'));
var _slicedToArray = _interopDefault(require('@babel/runtime/helpers/slicedToArray'));
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
                  selected: selected
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
    getRaffles: function () {
      var _getRaffles = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(parent, args, context, info) {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (context.user) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", Error('No user'));

              case 2:
                _context3.prev = 2;
                _context3.next = 5;
                return Raffle.find();

              case 5:
                return _context3.abrupt("return", _context3.sent);

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](2);
                throw Error(_context3.t0);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[2, 8]]);
      }));

      function getRaffles(_x9, _x10, _x11, _x12) {
        return _getRaffles.apply(this, arguments);
      }

      return getRaffles;
    }()
  },
  Mutation: {
    auth: function () {
      var _auth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_, _ref3, _ref4) {
        var token, provider, req, res, profile, _yield$authenticateFa, fbProfile, _yield$authenticateGo, googleProfile, user, userForRegister, newUser;

        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                token = _ref3.token, provider = _ref3.provider;
                req = _ref4.req, res = _ref4.res;
                req.body = _objectSpread(_objectSpread({}, req.body), {}, {
                  access_token: token
                });
                _context4.prev = 3;
                _context4.t0 = provider;
                _context4.next = _context4.t0 === 'facebook' ? 7 : _context4.t0 === 'google' ? 13 : 19;
                break;

              case 7:
                _context4.next = 9;
                return authenticateFacebook$1(req, res);

              case 9:
                _yield$authenticateFa = _context4.sent;
                fbProfile = _yield$authenticateFa.data.profile;
                profile = fbProfile;
                return _context4.abrupt("break", 20);

              case 13:
                _context4.next = 15;
                return authenticateGoogle$1(req, res);

              case 15:
                _yield$authenticateGo = _context4.sent;
                googleProfile = _yield$authenticateGo.data.profile;
                profile = googleProfile;
                return _context4.abrupt("break", 20);

              case 19:
                return _context4.abrupt("break", 20);

              case 20:
                if (!profile) {
                  _context4.next = 31;
                  break;
                }

                _context4.next = 23;
                return User.findById(profile.id);

              case 23:
                user = _context4.sent;

                if (user) {
                  _context4.next = 30;
                  break;
                }

                userForRegister = {
                  _id: profile._json.id,
                  createAt: new Date(),
                  coins: 0,
                  name: profile._json.name || '',
                  email: provider === 'google' ? profile._json.email : email[0].value || '',
                  phone: profile._json.phone || 0,
                  photoURL: provider === 'google' ? profile._json.picture : email[0].value || ''
                };
                _context4.next = 28;
                return User.create(userForRegister);

              case 28:
                newUser = _context4.sent;
                return _context4.abrupt("return", _objectSpread(_objectSpread({}, newUser._doc), {}, {
                  token: newUser.generateJWT(newUser._id)
                }));

              case 30:
                return _context4.abrupt("return", _objectSpread(_objectSpread({}, user._doc), {}, {
                  token: user.generateJWT(user._id)
                }));

              case 31:
                return _context4.abrupt("return", Error('server error'));

              case 34:
                _context4.prev = 34;
                _context4.t1 = _context4["catch"](3);
                return _context4.abrupt("return", _context4.t1);

              case 37:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[3, 34]]);
      }));

      function auth(_x13, _x14, _x15) {
        return _auth.apply(this, arguments);
      }

      return auth;
    }(),
    createUser: function () {
      var _createUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(parent, args, context, info) {
        var _args$user, name, email, phone, photoURL, providerId, kitty;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _args$user = args.user, name = _args$user.name, email = _args$user.email, phone = _args$user.phone, photoURL = _args$user.photoURL, providerId = _args$user.providerId;
                kitty = new User({
                  name: name,
                  email: email,
                  phone: phone,
                  photoURL: photoURL,
                  providerId: providerId
                });
                _context5.next = 4;
                return kitty.save();

              case 4:
                return _context5.abrupt("return", kitty);

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function createUser(_x16, _x17, _x18, _x19) {
        return _createUser.apply(this, arguments);
      }

      return createUser;
    }(),
    incrementRaffle: function () {
      var _incrementRaffle = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(parent, args, context, info) {
        var price, userId, raffleRegister, raffle;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                price = args.price;
                userId = context.user._id;

                if (context.user) {
                  _context6.next = 4;
                  break;
                }

                return _context6.abrupt("return", Error('No user'));

              case 4:
                _context6.prev = 4;
                _context6.next = 7;
                return Raffle.findOne({
                  price: price
                });

              case 7:
                raffleRegister = _context6.sent;

                if (raffleRegister) {
                  _context6.next = 13;
                  break;
                }

                _context6.next = 11;
                return Raffle.create({
                  price: price,
                  usersCount: 1,
                  users: [userId],
                  createAt: new Date()
                });

              case 11:
                raffle = _context6.sent;
                return _context6.abrupt("return", raffle);

              case 13:
                _context6.next = 15;
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

              case 15:
                _context6.next = 17;
                return raffleRegister.save();

              case 17:
                return _context6.abrupt("return", raffleRegister);

              case 20:
                _context6.prev = 20;
                _context6.t0 = _context6["catch"](4);
                throw Error(_context6.t0);

              case 23:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[4, 20]]);
      }));

      function incrementRaffle(_x20, _x21, _x22, _x23) {
        return _incrementRaffle.apply(this, arguments);
      }

      return incrementRaffle;
    }()
  }
};

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n    input inputUser {\n        name: String!\n        email: String\n        phone: Int,\n        photoURL: String!\n        providerId: String!\n    }\n\n    type AuthResponse {\n        token: String\n        user: User!\n    }\n\n    type User {\n        token: String\n        _id: ID!\n        name: String!\n        email: String\n        phone: Int\n        coins: Int\n        photoURL: String!\n        providerId: String!\n        raffles: [ Raffle ]\n    }\n\n    type Raffle {\n        _id: ID\n        price: Float\n        usersCount: Int\n        users: [ String ]\n    }\n\n    type Number {\n        number: String!\n        value: Int!\n    }\n\n    type Ticket {\n        id: ID!\n        selected: [ Number! ]!\n    }\n\n    type Query {\n        getUser(id: ID!): User\n        getUserWithToken(token: String!): User\n        getTicket: Ticket!\n        getRaffles: [ Raffle! ]!\n    }\n\n    type Mutation {\n        auth(token: String!, provider: String!): User\n        createUser(user: inputUser): User!\n        incrementRaffle(price: Float!): Raffle\n    }\n"]);

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
