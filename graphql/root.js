const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
} = require('graphql');

const UserType = require("./users.js");

const users = require("../models/users.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        user: {
            type: UserType,
            description: 'One user.',
            args: {
                email: { type: GraphQLString }
            },
            resolve: async function(parent, args) {
                const user = await users.getUser(args.email);

                return user;
            }
        },
        users: {
            type: new GraphQLList(UserType),
            description: 'List of all users.',
            resolve: async function() {
                const allUsers = await users.getAllUsers();

                return allUsers;
            }
        }
    })
});

module.exports = RootQueryType;