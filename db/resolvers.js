const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//RESOLVERS
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            const usuarioId = await jwt.verify(token, process.env.SECRET_SEED);

            return usuarioId;
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
                const salt = await bcryptjs.genSalt(10);
                input.password = await bcryptjs.hash(password, salt);

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
                // const producto = new Producto(input);

                // const response = await producto.save();

                // return response;
            } catch (err) {
                // console.log(err)
            }
        }
    }
}

const crearToken = (usuario, secret, expiresIn) => {
    const { id, email, nombre, apellido } = usuario;

    return jwt.sign({id}, secret, {expiresIn});
}

module.exports = resolvers;