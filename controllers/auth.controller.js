import bcrypt from 'bcrypt';
import db from '../config/db.js';
const { sql, getConnection } = db;

export const register = async (req, res) => {
  try {
    const { username, apellido, nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await getConnection();
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);

    const existing = await request.query(`
      SELECT Username, Correo FROM Usuarios 
      WHERE Username = @username OR Correo = @email
    `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Usuario o correo ya existe' });
    }

    await request
      .input('apellido', sql.NVarChar, apellido)
      .input('nombre', sql.NVarChar, nombre)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Usuarios (Username, Apellido, Nombre, Correo, Contrasena, Tipo_Usuario)
        VALUES (@username, @apellido, @nombre, @email, @hashedPassword, 'user')
      `);

    res.status(200).json({ message: 'Registro exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el registro');
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { username, apellido, nombre, email, direccion, telefono, dni, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await getConnection();
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
      SELECT Username, Correo FROM Usuarios 
      WHERE Username = @username OR Correo = @email
    `);

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'Usuario o correo ya existe' });
    }

    await request
      .input('apellido', sql.NVarChar, apellido)
      .input('nombre', sql.NVarChar, nombre)
      .input('direccion', sql.NVarChar, direccion)
      .input('telefono', sql.NVarChar, telefono)
      .input('dni', sql.NVarChar, dni)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Usuarios (Username, Apellido, Nombre, Correo, Direccion, Telefono, DNI, Contrasena, Tipo_Usuario)
        VALUES (@username, @apellido, @nombre, @email, @direccion, @telefono, @dni, @hashedPassword, 'admin')
      `);

    res.status(200).json({ message: 'Registro exitoso' });
  } catch (err) {
    console.error('Error en el registro de admin:', err);
    res.status(500).send('Error en el registro');
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await getConnection();
    const request = pool.request();
    request.input('username', sql.NVarChar, username);

    const result = await request.query(`
      SELECT ID, Tipo_Usuario, Contrasena FROM Usuarios WHERE Username = @username
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.Contrasena);

    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    req.session.usuario = {
      id: user.ID,
      tipo_usuario: user.Tipo_Usuario,
      username: username
    };

    res.status(200).send({ message: 'Inicio de sesión exitoso' });
  } catch (err) {
    console.error('Error durante el login:', err);
    res.status(500).send('Hubo un error durante el inicio de sesión');
  }
};

export const perfil = (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).send('No has iniciado sesión');
  }
  res.json({
    id: req.session.usuario.id,
    tipo_usuario: req.session.usuario.tipo_usuario,
    username: req.session.usuario.username
  });
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/login.html');
  });
};