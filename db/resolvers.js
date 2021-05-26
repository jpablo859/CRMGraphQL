const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//RESOLVERS
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {}, ctx) => {
            return ctx.usuario;
        },
        obtenerProductos: async () => {
            try {
                const response = await Producto.find({});
                return response;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerProducto: async (_, {id}) => {
            try {
                const response = await Producto.findById(id);

                if (!response) {
                    throw new Error('No existe el producto');
                }

                return response;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerClientes: async () => {
            try {
                const response = await Cliente.find({}).populate('vendedor');
                return response;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const response = await Cliente.find({
                    vendedor: ctx.usuario.id.toString()
                }).populate('vendedor');
                return response;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerCliente: async (_, {id}, ctx) => {

            const cliente = await Cliente.findOne({
                _id: id,
                vendedor: ctx.usuario.id
            }).populate('vendedor');

            console.log(cliente)

            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }
            
            try {
                return cliente;
            } catch (err){
                console.log(err)
            }
        },
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({
                    vendedor: ctx.usuario.id
                }).populate('cliente vendedor');

                return pedidos;
            } catch (err) {

            }
        },
        obtenerPedido: async (_, {id}, ctx) => {
            const pedido = await Pedido.findOne({
                _id: id,
                vendedor: ctx.usuario.id
            });

            if (!pedido) throw new Error('No existe el pedido');

            try {
                return pedido;
            } catch (err) {
                console.log(err)
            }
        },
        obtenerPedidosEstado: async (_, {estado}, ctx) => {
            const pedidos = await Pedido.find({
                estado,
                vendedor: ctx.usuario.id
            }).populate('vendedor cliente');

            if (!pedidos) throw new Error(`
                No hay pedidos en estado ${estado}
            `);

            try {
                return pedidos;
            } catch (err) {
                console.log(err);
                return "Error interno";
            }
        },
        obtenerMejoresClientes: async () => {
            try {
                const clientes = await Pedido.aggregate([
                    { $match: {estado:'COMPLETADO'}},
                    { $group: {
                        _id: "$cliente",
                        total: { $sum: "$total" }
                    }},
                    {
                        $lookup: {
                            from: "clientes",
                            localField: "_id",
                            foreignField: "_id",
                            as: "cliente"
                        }
                    },
                    { $sort: { total: -1 } }
                ]);

                console.log(clientes)

                return clientes;
            } catch (err) {
                console.log(err);
                return "Error interno";
            }

            
        },
        obtenerMejoresVendedores: async () => {
            try {
                const vendedores = await Pedido.aggregate([
                    { $match: {estado:'COMPLETADO'}},
                    { $group: {
                        _id: "$vendedor",
                        total: { $sum: "$total" }
                    }},
                    {
                        $lookup: {
                            from: "usuarios",
                            localField: "_id",
                            foreignField: "_id",
                            as: "vendedor"
                        }
                    },
                    { $limit: 3 },
                    { $sort: { total: -1 } }
                ]);

                console.log(vendedores)

                return vendedores;
            } catch (err) {
                console.log(err);
                return "Error interno";
            }

            
        },
        buscarProducto: async (_, {text}) => {
            try {
                const productos = await Producto.find({$text: {
                    $search: text
                }});
                return productos;
            } catch (err) {
                console.log(err);
                return "Error interno";
            }
        }
    },
    Mutation: {
        guardarUsuario: async (_, {input}) => {
            
            const { email, password} = input;

            const validarUsuario = await Usuario.findOne({email});

            if (validarUsuario) {
                throw new Error('El usuario ya se encuentra registrado');
            }
            
            try {

                //HASH CONTRASEÑA
                const salt = bcryptjs.genSaltSync(10);
                input.password = bcryptjs.hashSync(password, salt);

                const usuario = new Usuario(input);
                await usuario.save();

                return usuario;

            } catch (err) {
                console.log(err)
            }


        },
        autenticarUsuario: async (_, {input}) => {

            const { email, password } = input;

            const validarUsuario = await Usuario.findOne({email});
            
            if (!validarUsuario) {
                throw new Error('Usuario o contraseña incorrecta');
            }
            
            if (!bcryptjs.compareSync(password, validarUsuario.password)) {
                throw new Error('Usuario o contraseña incorrecta');
            }

            const { id, nombre, apellido } = validarUsuario;

            try {
                return {
                    token: crearToken({
                        id, email, nombre, apellido
                    }, process.env.SECRET_SEED, '2h')
                }
            } catch (err) {
                console.log(err)
            }

        },
        guardarProducto: async (_, {input}) => {
            try {
                console.log(input)
                const producto = new Producto(input);

                const response = await producto.save();

                return response;
            } catch (err) {
                // console.log(err)
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            try {
                let response = await Producto.findById(id);

                if (!response) {
                    throw new Error('Producto no encontrado');
                }

                response = await Producto.findOneAndUpdate({_id: id}, input, {new: true});

                console.log(response)

                return response;
            } catch (err) {
                console.log(err)
                return err;
            }
        },
        eliminarProducto: async (_, {id}) => {
            try {
                const response = await Producto.findByIdAndDelete(id);
                
                if (!response) {
                    throw new Error('Producto no encontrado')
                }

                return 'Producto eliminado';
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        guardarCliente: async (_, {input}, ctx) => {
            const cliente = await Cliente.findOne({email: input.email});

            console.log(cliente)
            
            if (cliente) {
                throw new Error('El cliente ya se encuentra registrado');
            }

            try {

                const nuevoCliente = new Cliente(input);
                nuevoCliente.vendedor = ctx.usuario.id;

                const response = await nuevoCliente.save();

                return response;

            } catch (err) {
                console.log(err);
            }
        },
        actualizarCliente: async (_, {id, input}, ctx) => {

            console.log(input);
            const cliente = await Cliente.findOne({
                _id: id,
                vendedor: ctx.usuario.id
            });

            if (!cliente) {
                throw new Error('No existe el cliente');
            }

            try {

                const nuevoCliente = await Cliente.findOneAndUpdate(
                    {_id: id}, input, {new: true}
                ).populate('vendedor')

                return nuevoCliente;
            } catch (err) {
                console.log(err)
                return "Error interno";
            }
        },
        guardarPedido: async (_, {input}, ctx) => {
            const cliente = await Cliente.findOne({
                _id: input.cliente,
                vendedor: ctx.usuario.id
            });

            if (!cliente) {
                throw new Error('No existe el cliente');
            }

            for await (const item of input.pedido) {
                const producto = await Producto.findById(item.id);
                
                if (!producto) throw new Error('No existe el producto');

                if (item.cantidad > producto.stock) {
                    throw new Error(`Stock insuficiente para el Producto ${producto.nombre}`)
                } else {
                    producto.stock-=item.cantidad;
                    item.precio = producto.precio;
                    await producto.save();
                }
            }
            try {

                const nuevoPedido = await Pedido(input);
                nuevoPedido.vendedor = ctx.usuario.id;

                const response = await nuevoPedido.save();

                return response;

            } catch (err) {
                console.log(err);
                return "Error interno";
            }
        },
        actualizarPedido: async (_, {id, input}, ctx) => {
            const pedido = await Pedido.findOne({
                _id: id,
            });

            if (!pedido) {
                throw new Error('No existe el pedido');
            }

            const cliente = await Cliente.findOne({
                _id: input.cliente,
                vendedor: ctx.usuario.id
            });

            if (!cliente) {
                throw new Error('No existe el cliente');
            }

            if (input.pedido) {
                for await (const item of input.pedido) {
                    const producto = await Producto.findById(item.id);
                    
                    if (!producto) throw new Error('No existe el producto');
    
                    const itemAnterior = pedido.pedido.find(({id}) => id === item.id);
                    const cantidadAnterior = itemAnterior.cantidad || 0;
                    
                    producto.stock+=cantidadAnterior;
                    
                    if (item.cantidad > producto.stock) {
                        throw new Error(`Stock insuficiente para el Producto ${producto.nombre}`)
                    } else {
                        producto.stock-=item.cantidad;
                        item.precio = itemAnterior.precio || 0;
                        await producto.save();
                    }
                }
            }


            try {
                const response = await Pedido.findOneAndUpdate(
                    {_id: id},
                    input,
                    {new: true}
                );
                return response;
            } catch (err) {
                console.log(err);
            }

        },
        eliminarPedido: async (_, {id}, ctx) => {

            const response = await Pedido.findOneAndDelete({
                _id: id, 
                vendedor: ctx.usuario.id
            });

            if (!response) throw new Error('No existe el pedido');

            try {
                return "Pedido eliminado";
            } catch (err) {
                console.log(err)
                return "Error interno";
            }
        },
        eliminarCliente: async (_, {id}, ctx) => {
            const response = await Cliente.findOneAndDelete({
                _id: id,
                vendedor: ctx.usuario.id
            });

            if (!response) throw new Error('No existe el cliente');

            try {
                return "Cliente eliminado";
            } catch (err) {
                console.log(err);
                return "Error interno";
            }
        }
    }
}

const crearToken = (usuario, secret, expiresIn) => {
    const { id, email, nombre, apellido } = usuario;

    return jwt.sign({
        id,
        email,
        nombre,
        apellido
    }, secret, {expiresIn});
}

module.exports = resolvers;