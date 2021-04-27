const { gql } = require('apollo-server');

//SCHEMA
const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Token {
        token: String
    }

    type Producto {
        id: ID
        nombre: String
        stock: Float
        precio: Float
        creado: String
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }
    
    input ProductoInput {
        nombre: String!
        stock: Float!
        precio: Float!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    type Query {
        obtenerUsuario(token: String!): Usuario
    }

    type Mutation {
        guardarUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: LoginInput): Token

        guardarProducto(input: ProductoInput): Producto
    }

`;

module.exports = typeDefs;