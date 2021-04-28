const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//RESOLVERS
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            const usuarioId = await jwt.verify(token, process.env.SECRET_SEED);

            return usuarioId;
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
        }
    },
    Mutation: {
        guardarUsuario: async (_, {input}) => {
            
            const { email, password} = input;

            try {
                const validarUsuario = await Usuario.findOne({email});
    
                if (validarUsuario) {
                    throw new Error('El usuario ya se encuentra registrado');
                }

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

            const validarPassword = await bcryptjs.compare(password, validarUsuario.password);

            if (!validarPassword) {
                throw new Error('Usuario o contraseña incorrecta');
            }

            return {
                token: crearToken(validarUsuario, process.env.SECRET_SEED, '2h')
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
            try {
                console.log(ctx);

                const cliente = await Cliente.findOne({email: input.email});
                
                if (cliente) {
                    throw new Error('El cliente ya se encuentra registrado');
                }

                const nuevoCliente = new Cliente(input);
                nuevoCliente.vendedor = ctx.usuario.id;

                const response = await nuevoCliente.save();

                return response;

            } catch (err) {
                console.log(err);
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