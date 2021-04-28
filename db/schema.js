const { gql } = require('apollo-server');

//SCHEMA
const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        password: String
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

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        creado: String
        vendedor: ID
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

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String
        telefono: String
    }

    type Query {
        obtenerUsuario(token: String!): Usuario
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto
        obtenerClientes: [Cliente]
    }

    type Mutation {
        #Usuarios
        guardarUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: LoginInput): Token

        #Productos
        guardarProducto(input: ProductoInput): Producto
        actualizarProducto(id: ID!, input: ProductoInput): Producto
        eliminarProducto(id: ID!): String

        #Clientes
        guardarCliente(input: ClienteInput): Cliente
    }

`;

module.exports = typeDefs;