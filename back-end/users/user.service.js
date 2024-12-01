const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('helpers/db');

module.exports = {
    authenticate,
    create};
// autenticar usuario
async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Nombre de usuario o contraseña incorrectos';

    // autenticacion exitosa
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validar
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // encriptar contraseña
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // guardar usuario
    await db.User.create(params);
}


// async function getUser(id) {
//     const user = await db.User.findByPk(id);
//     if (!user) throw 'User not found';
//     return user;
// }

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}