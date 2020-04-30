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
        photoURL: String!
        providerId: String!
        raffles: [ Raffle ]
    }

    type Raffle {
        id: ID!
        price: Int!
        users: [ ID! ]!
    }

    type Ticket {
        id: ID!
        numbers: [ Int! ]!
        userNumbers: [ Int! ]!
    }

    type Subscription {
        raffleIncrement: Raffle
    }

    type Query {
        getUser(id: ID!): User
        getUserWithToken(token: String!): User
        getTicket: Ticket!
    }

    type Mutation {
        authFacebook(token: String!): User
        authGoogle(token: String!): User
        createUser(user: inputUser): User!
        incrementRaffle(price: Float!): Raffle!
    }
`;