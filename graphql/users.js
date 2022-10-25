const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLScalarType,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'Users',
    description: 'This is a user.',
    fields: () => ({
        email: { type: new GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLString },
        fname: { type: GraphQLString },
        lname: { type: GraphQLString },
    })
})

module.exports = UserType;