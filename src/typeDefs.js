import { gql } from "apollo-server-express";

export const typeDefs = gql`
    input inputUser {
        name: String!
        email: String
        phone: Int,
        photoURL: String!
        providerId: String!
    }

    type AuthResponse {
        token: String
        user: User!
    }

    type User {
        token: String
        _id: ID!
        name: String!
        email: String
        phone: Int
        coins: Int
        photoURL: String!
        providerId: String!
        raffles: [ Raffle ]
    }

    type Raffle {
        _id: ID
        price: Float
        usersCount: Int
        users: [ String ]
    }

    type Number {
        number: String!
        value: Int!
    }

    type Ticket {
        id: ID!
        selected: [ Number! ]!
    }

    type Query {
        getUser(id: ID!): User
        getUserWithToken(token: String!): User
        getTicket: Ticket!
        getRaffles: [ Raffle! ]!
    }

    type Mutation {
        authFacebook(token: String!): User
        authGoogle(token: String!): User
        createUser(user: inputUser): User!
        incrementRaffle(price: Float!): Raffle
    }
`;