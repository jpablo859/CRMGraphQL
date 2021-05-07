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

    type UsuarioConuslta {
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

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        creado: String
        vendedor: UsuarioConuslta
    }

    type PedidoGrupo {
        id: ID
        cantidad: Float
        precio: Float
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: UsuarioConuslta
        creado: String
        estado: EstadoPedido
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [UsuarioConuslta]
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

    input PedidoProductoInput {
        id: ID
        cantidad: Float
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        cliente: ID
        estado: EstadoPedido
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    type Query {
        obtenerUsuario(token: String!): Usuario
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente

        #Pedidos
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]

        #Busquedas Avanzadas
        obtenerMejoresClientes: [TopCliente]
        obtenerMejoresVendedores: [TopVendedor]
        buscarProducto(text: String!): [Producto]
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
        actualizarCliente(id: ID!, input: ClienteInput): Cliente

        #Pedidos
        guardarPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, input: PedidoInput): Pedido
        eliminarPedido(id: ID!): String
    }

`;

module.exports = typeDefs;