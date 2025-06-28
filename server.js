const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const path = require('path');
//const json = require('body-parser/lib/types/json'); no me acuerdo para que era esto

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// analizar solicitudes POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configurar sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// utilizar los archivos de carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// configuración de la base de datos

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// conectar a la base de datos
sql.connect(dbConfig)
  .then(pool => {
    console.log('Conectado a la base de datos');

    // ruta del registro
    app.post('/register', async (req, res) => {
      try {
        const { username, apellido, nombre, email, password } = req.body; // cuerpo de la solicitud POST

        // encriptar
        const hashedPassword = await bcrypt.hash(password, 10);

        // consulta para comprobar existencia de usuario
        const search = `
                    SELECT Username, Correo
                    FROM Usuarios 
                    WHERE Username = @username 
                    OR Correo = @email
                `;

        // consulta de verificación
        const requestSearch = pool.request();
        requestSearch.input('username', sql.NVarChar, username);
        requestSearch.input('email', sql.NVarChar, email);

        const result = await requestSearch.query(search);

        // verificar si se encontró alguna coincidencia
        if (result.recordset.length > 0) {
          const userExists = result.recordset.some(row => row.Usuario === username);
          const correoExists = result.recordset.some(row => row.Correo === email);

          if (userExists) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
          }

          if (correoExists) {
            return res.status(400).json({ message: 'El correo ya existe' });
          }
        }

        // consultas de inserción
        const insert = `
                    INSERT INTO Usuarios (Username, Apellido, Nombre, Correo, Contrasena, Tipo_Usuario)
                    VALUES (@username, @apellido, @nombre, @email, @hashedPassword, 'user')
                `;

        // ejecutar consulta
        const requestInsert = pool.request();
        requestInsert.input('username', sql.NVarChar, username);
        requestInsert.input('apellido', sql.NVarChar, apellido);
        requestInsert.input('nombre', sql.NVarChar, nombre);
        requestInsert.input('email', sql.NVarChar, email);
        requestInsert.input('hashedPassword', sql.NVarChar, hashedPassword);

        await requestInsert.query(insert);
        res.status(200).json({ message: 'Registro exitoso' });
      } catch (error) {
        console.error('Error durante el registro:', error);
        res.status(500).send('Hubo un error durante el registro');
      }
    });

    // ruta registro admin
    app.post('/registerE', async (req, res) => {
      try {
        const { username, apellido, nombre, email, direccion, telefono, dni, password } = req.body; // cuerpo de la solicitud POST

        // encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // consulta para comprobar existencia de usuario
        const search = `
                    SELECT Username, Correo
                    FROM Usuarios 
                    WHERE Username = @username 
                    OR Correo = @email
                `;

        // consulta de verificación
        const requestSearch = pool.request();
        requestSearch.input('username', sql.NVarChar, username);
        requestSearch.input('email', sql.NVarChar, email);

        const result = await requestSearch.query(search);

        // verificar si se encontró alguna coincidencia
        if (result.recordset.length > 0) {
          const userExists = result.recordset.some(row => row.Usuario === username);
          const correoExists = result.recordset.some(row => row.Correo === email);

          if (userExists) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
          }

          if (correoExists) {
            return res.status(400).json({ message: 'El correo ya existe' });
          }
        }

        // consultas de inserción
        const insert = `
                    INSERT INTO Usuarios (Username, Apellido, Nombre, Correo, Direccion, Telefono, DNI, Contrasena, Tipo_Usuario)
                    VALUES (@username, @apellido, @nombre, @email, @direccion, @telefono, @dni, @hashedPassword, 'admin')
                `;

        // ejecutar consulta
        const requestInsert = pool.request();
        requestInsert.input('username', sql.NVarChar, username);
        requestInsert.input('apellido', sql.NVarChar, apellido);
        requestInsert.input('nombre', sql.NVarChar, nombre);
        requestInsert.input('email', sql.NVarChar, email);
        requestInsert.input('direccion', sql.NVarChar, direccion);
        requestInsert.input('telefono', sql.NVarChar, telefono);
        requestInsert.input('dni', sql.NVarChar, dni);
        requestInsert.input('hashedPassword', sql.NVarChar, hashedPassword);

        await requestInsert.query(insert);
        res.status(200).json({ message: 'Registro exitoso' });
      } catch (error) {
        console.error('Error durante el registro:', error);
        res.status(500).send('Hubo un error durante el registro');
      }
    });

    // ruta del login
    app.post('/login', async (req, res) => {
      try {
        const { username, password } = req.body;

        // consulta
        const query = `SELECT ID, Tipo_Usuario, Contrasena FROM Usuarios WHERE Username = @username`;
        const request = pool.request();
        request.input('username', sql.NVarChar, username);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];
        const hashedPassword = user.Contrasena
        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
          return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // guardar datos del usuario en la sesión
        req.session.usuario = {
          id: user.ID,
          tipo_usuario: user.Tipo_Usuario,
          username: username
        };

        res.status(200).send({ message: 'Inicio de sesión exitoso' });
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.status(500).send('Hubo un error durante el inicio de sesión');
      }
    });

    // tener datos de la sesión
    app.get('/perfil', (req, res) => {
      if (!req.session.usuario) {
        return res.status(401).send('No has iniciado sesión');
      }

      // acceder a los datos de la sesión
      res.json({
        id: req.session.usuario.id,
        tipo_usuario: req.session.usuario.tipo_usuario,
        username: req.session.usuario.username
      });
    });

    // cerrar sesión
    app.get('/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login.html');
      });
    });

    app.post('/crud', async (req, res) => {
      try {
        const { nombre, marca, descripcion, precioCompra, precioVenta, categoria, talla, img } = req.body;

        // verificar si el producto ya existe
        const searchProducto = `SELECT ID FROM Productos WHERE Nombre = @nombre`;
        const requestSearch = pool.request();
        requestSearch.input('nombre', sql.NVarChar, nombre);

        const result = await requestSearch.query(searchProducto);

        if (result.recordset.length > 0) {
          // no permitir la inserción
          return res.status(400).json({ message: 'El producto ya existe. Use el formulario de reabastecimiento.' });
        }

        // insertar en la tabla Productos
        const insertProducto = `
                    INSERT INTO Productos (Nombre, Marca, Descripcion, PrecioCompra, Precio, Categoria, Talla, Imagen) 
                    VALUES (@nombre, @marca, @descripcion, @precioCompra, @precioVenta, @categoria, @talla, @img)
                `;
        const requestInsertProducto = pool.request();
        requestInsertProducto.input('nombre', sql.NVarChar, nombre);
        requestInsertProducto.input('marca', sql.NVarChar, marca);
        requestInsertProducto.input('descripcion', sql.Text, descripcion);
        requestInsertProducto.input('precioCompra', sql.Decimal(10, 2), precioCompra);
        requestInsertProducto.input('precioVenta', sql.Decimal(10, 2), precioVenta);
        requestInsertProducto.input('categoria', sql.NVarChar, categoria);
        requestInsertProducto.input('talla', sql.NVarChar, talla);
        requestInsertProducto.input('img', sql.NVarChar, img);
        request

        await requestInsertProducto.query(insertProducto);

        res.status(200).json({ message: 'Producto registrado exitosamente' });
      } catch (error) {
        console.error('Error durante la operación CRUD:', error);
        res.status(500).send('Hubo un error en el proceso');
      }
    });

    app.post('/reabastecer', async (req, res) => {
      try {
        const { proveedor, productos } = req.body;

        // verificar si existe proveedor
        let proveedorID;
        const resultProveedor = await pool
          .request()
          .input('proveedor', sql.NVarChar, proveedor)
          .query('SELECT ID FROM Proveedores WHERE Nombre = @proveedor');

        if (resultProveedor.recordset.length > 0) {
          proveedorID = resultProveedor.recordset[0].ID;
        } else {
          const resultNuevoProveedor = await pool
            .request()
            .input('proveedor', sql.NVarChar, proveedor)
            .query('INSERT INTO Proveedores (Nombre) OUTPUT INSERTED.ID VALUES (@proveedor)');
          proveedorID = resultNuevoProveedor.recordset[0].ID;
        }

        // insertar compra
        const resultCompra = await pool
          .request()
          .input('proveedorID', sql.Int, proveedorID)
          .query('INSERT INTO Compras (ProveedorID) OUTPUT INSERTED.ID VALUES (@proveedorID)');
        const compraID = resultCompra.recordset[0].ID;

        // procesar productos de la lista
        for (const producto of productos) {
          const { nombre, cantidad } = producto;

          // obtener id y stock del producto
          const resultProducto = await pool
            .request()
            .input('nombre', sql.NVarChar, nombre)
            .query('SELECT ID, Stock, PrecioCompra FROM Productos WHERE Nombre = @nombre');
          const productoExistente = resultProducto.recordset[0];
          const newStock = productoExistente.Stock + parseInt(cantidad);

          // actualizar stock
          await pool
            .request()
            .input('newStock', sql.Int, newStock)
            .input('productoID', sql.Int, productoExistente.ID)
            .query(`UPDATE Productos SET Stock = @newStock WHERE ID = @productoID`);

          // insertar en detalle compras
          await pool
            .request()
            .input('compraID', sql.Int, compraID)
            .input('productoID', sql.Int, productoExistente.ID)
            .input('cantidad', sql.Int, cantidad)
            .input('precioUnitario', sql.Decimal(10, 2), productoExistente.PrecioCompra)
            .query(`
                            INSERT INTO DetalleCompras (CompraID, ProductoID, Cantidad, PrecioUnitario) 
                            VALUES (@compraID, @productoID, @cantidad, @precioUnitario)
                        `);
        }

        // exito
        res.status(200).send('Stock actualizado y compra registrada exitosamente');

      } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).send('Error al registrar la compra.');
      }
    });

    app.post('/verificarR', async (req, res) => {
      try {
        const { nombre } = req.body;

        // verificar si el producto existe
        const searchProducto = `SELECT ID FROM Productos WHERE Nombre = @nombre`;
        const requestSearch = pool.request();
        requestSearch.input('nombre', sql.NVarChar, nombre);

        const result = await requestSearch.query(searchProducto);

        if (result.recordset.length > 0) {
          res.status(200).json({ message: 'Agregado a la lista.' });
        } else {
          return res.status(404).json({ message: 'El producto no existe' });
        }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Hubo un error en el proceso');
      }
    });

    // Ruta para obtener el kardex por categoria
    app.get('/kardexCat', async (req, res) => {
      const { categoria, fechaDesde, fechaHasta } = req.query;
      try {
        const result = await pool.request()
          .input('categoria', sql.NVarChar, categoria)  // Pasar categoría
          .input('fechaDesde', sql.Date, fechaDesde ? fechaDesde : null)  // Pasar fechaDesde, o NULL si no está presente
          .input('fechaHasta', sql.Date, fechaHasta ? fechaHasta : null)  // Pasar fechaHasta, o NULL si no está presente
          .query(`
                        SELECT 
                            FORMAT(COALESCE(C.FechaCompra, CV.FechaVenta), 'dd-MM-yyyy') AS Periodo,
                            P.Categoria AS Categoria,
                            P.Nombre AS Producto,
                            P.PrecioCompra AS Valor_Unitario_Entrada,
                            P.Precio AS Valor_Unitario_Salida,
                            ISNULL(SUM(DC.Cantidad), 0) AS Entrada_Cantidad,
                            ISNULL(SUM(DC.Cantidad * L.PrecioCompra), 0) AS Entrada_Total,
                            ISNULL(SUM(DVC.Cantidad), 0) AS Salida_Cantidad,
                            ISNULL(SUM(DVC.Cantidad * L.Precio), 0) AS Salida_Total,
                            (ISNULL(SUM(DC.Cantidad), 0) - ISNULL(SUM(DVC.Cantidad), 0)) AS Saldo_Cantidad,
                            (ISNULL(SUM(DC.Cantidad * L.PrecioCompra), 0) 
                            - ISNULL(SUM(DVC.Cantidad * L.Precio), 0)) AS Saldo_Total
                        FROM 
                            Productos P
                        LEFT JOIN 
                            DetalleCompras DC ON P.ID = DC.ProductoID
                        LEFT JOIN 
                            Compras C ON DC.CompraID = C.ID
                        LEFT JOIN 
                            DetalleCarritos DVC ON P.ID = DVC.ProductoID
                        LEFT JOIN 
                            CarritoVentas CV ON DVC.CarritoID = CV.ID
                        WHERE 
                            P.Categoria = @categoria  -- Filtrar por categoría
                            ${fechaDesde ? `AND (C.FechaCompra >= @fechaDesde OR CV.FechaVenta >= @fechaDesde)` : ''}
                            ${fechaHasta ? `AND (C.FechaCompra <= @fechaHasta OR CV.FechaVenta <= @fechaHasta)` : ''}
                        GROUP BY 
                            FORMAT(COALESCE(C.FechaCompra, CV.FechaVenta), 'dd-MM-yyyy'),
                            P.Categoria, 
                            P.Nombre, 
                            P.PrecioCompra,
                            P.Precio
                        ORDER BY 
                            Categoria, Periodo, Producto;
                    `);

        res.json(result.recordset);
      } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).send('Error al obtener los datos.');
      }
    });

    // Ruta para obtener productos con opción de filtrar por categoría
    app.get('/api/productos/filtrar', async (req, res) => {
      try {
        const categoria = req.query.categoria; // Obtener la categoría de la consulta
        console.log('Recibido en raw:', req.url);
        console.log('Categoría (query):', categoria);
        const query = categoria
          ? `SELECT * FROM Productos WHERE Categoria = @categoria AND Estado = 'habilitado'`
          : `SELECT * FROM Productos WHERE Estado = 'habilitado'`;

        const request = pool.request();

        // Si hay una categoría especificada, añade el parámetro a la consulta
        if (categoria) {
          request.input('categoria', sql.NVarChar, categoria);
        }

        const result = await request.query(query);

        res.json(result.recordset); // Enviar los resultados en formato JSON
      } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
      }
    });

    app.get('/api/productos/buscar', async (req, res) => {
      try {
        const search = req.query.search; // Obtener el término de búsqueda de la consulta

        // Consulta base para obtener solo los productos habilitados
        let query = `SELECT * FROM Productos WHERE Estado = 'habilitado'`;

        // Si se especifica un término de búsqueda, filtra por nombre o marca
        if (search) {
          query += ` AND (Nombre LIKE @searchStart OR Nombre LIKE @searchMid)`;
        }

        const request = pool.request();

        // Si hay un término de búsqueda, añade los parámetros a la consulta
        if (search) {
          // Coincidencias al inicio del nombre
          request.input('searchStart', sql.NVarChar, `${search}%`);
          // Coincidencias en cualquier parte del nombre
          request.input('searchMid', sql.NVarChar, `% ${search}%`);
        }

        const result = await request.query(query);

        // Enviar los resultados en formato JSON
        res.json(result.recordset);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
      }
    });

    // Obtener un producto por ID
    app.get('/api/productos/:id', async (req, res) => {
      const productoID = req.params.id;
      try {
        const result = await pool
          .request()
          .input('id', sql.Int, productoID)
          .query('SELECT * FROM Productos WHERE ID = @id');

        if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(result.recordset[0]);
      } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
      }
    });

    // Ruta para obtener todos los productos
    app.get("/api/productos", async (req, res) => {
      try {
        const productos = await pool.query("SELECT * FROM Productos");
        res.json(productos.recordset); // Ajustar según el driver de la base de datos
      } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al obtener productos.");
      }
    });

    app.delete("/api/productos/:id", async (req, res) => {
      const productoId = req.params.id;

      try {
        // Crea una solicitud (request) para declarar el parámetro
        const request = pool.request();

        // Declara el parámetro @productoId
        request.input('productoId', sql.Int, productoId); // Asegúrate de usar el tipo correcto de datos (Int, en este caso)

        // Realiza la consulta de eliminación
        const result = await request.query("DELETE FROM Productos WHERE ID = @productoId");

        if (result.rowsAffected[0] > 0) {
          res.status(200).send("Producto eliminado correctamente.");
        } else {
          res.status(404).send("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).send("Error al eliminar el producto.");
      }
    });

    app.put("/api/productos/:id/estado", async (req, res) => {
      const productoId = req.params.id;
      const { estado } = req.body;

      // Validar que el estado sea correcto
      if (!["habilitado", "deshabilitado"].includes(estado)) {
        return res.status(400).send("Estado inválido.");
      }

      try {
        const result = await pool
          .request()
          .input("estado", estado) // Asocia el valor del estado
          .input("productoId", productoId) // Asocia el valor del ID
          .query("UPDATE Productos SET Estado = @estado WHERE ID = @productoId");

        if (result.rowsAffected[0] > 0) {
          res.status(200).send("Estado del producto actualizado correctamente.");
        } else {
          res.status(404).send("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al actualizar el estado del producto:", error);
        res.status(500).send("Error al actualizar el estado del producto.");
      }
    });

    // Obtener detalles de un producto por ID
    app.get("/api/productos/:id", async (req, res) => {
      const productoId = req.params.id;

      try {
        const result = await pool.request()
          .input("productoId", sql.Int, productoId)
          .query("SELECT * FROM Productos WHERE ID = @productoId");

        if (result.recordset.length > 0) {
          res.json(result.recordset[0]);
        } else {
          res.status(404).send("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).send("Error al obtener el producto.");
      }
    });

    // Actualizar detalles de un producto
    app.put("/api/productos/update/:id", async (req, res) => {
      const productoId = req.params.id;
      const { nombre, marca, descripcion, precioCompra, precio, stock, img, categoria, talla } = req.body;

      try {
        const result = await pool.request()
          .input("productoId", sql.Int, productoId)
          .input("nombre", sql.NVarChar(255), nombre)
          .input("marca", sql.NVarChar(255), marca)
          .input("descripcion", sql.Text, descripcion)
          .input("precioCompra", sql.Decimal(10, 2), precioCompra)
          .input("precio", sql.Decimal(10, 2), precio)
          .input("stock", sql.Int, stock)
          .input("categoria", sql.NVarChar(100), categoria)
          .input('talla', sql.NVarChar, talla)
          .input('img', sql.NVarChar, img)
          .query(`
                        UPDATE Productos 
                        SET Nombre = @nombre, Marca = @marca, Descripcion = @descripcion, 
                            PrecioCompra = @precioCompra, Precio = @precio, Stock = @stock, 
                            Categoria = @categoria, Talla = @talla, Imagen = @img 
                        WHERE ID = @productoId
                    `);

        if (result.rowsAffected[0] > 0) {
          res.status(200).send("Producto actualizado correctamente.");
        } else {
          res.status(404).send("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).send("Error al actualizar el producto.");
      }
    });

    // Endpoint para agregar un producto al carrito
    app.post('/api/carrito', async (req, res) => {
      try {
        if (!req.session.usuario) {
          return res.status(401).send('No has iniciado sesión');
        }

        const { productoID, cantidad, precioUnitario } = req.body; // Obtenemos los datos del producto

        // Obtener el ID del usuario desde la sesión
        const usuarioID = req.session.usuario.id;

        // Paso 1: Verificar si ya existe un carrito pendiente
        const carritoResult = await sql.query(`
                    SELECT ID FROM CarritoVentas WHERE UsuarioID = ${usuarioID} AND Estado = 'Pendiente'
                `);

        let carritoID;
        if (carritoResult.recordset.length === 0) {
          // Si no existe un carrito pendiente, creamos uno nuevo
          const nuevoCarritoResult = await sql.query(`
                        INSERT INTO CarritoVentas (UsuarioID, Estado)
                        OUTPUT INSERTED.ID
                        VALUES (${usuarioID}, 'Pendiente')
                    `);
          carritoID = nuevoCarritoResult.recordset[0].ID;
        } else {
          // Si existe un carrito pendiente, usamos el ID del carrito encontrado
          carritoID = carritoResult.recordset[0].ID;
        }

        // Verificar si el producto ya está en el carrito
        const detalleResult = await sql.query(`
                    SELECT ID, Cantidad FROM DetalleCarritos 
                    WHERE CarritoID = ${carritoID} AND ProductoID = ${productoID}
                `);

        if (detalleResult.recordset.length > 0) {
          // Si el producto ya está en el carrito, actualizamos la cantidad
          const detalleID = detalleResult.recordset[0].ID;
          const nuevaCantidad = detalleResult.recordset[0].Cantidad + cantidad;

          await sql.query(`
                        UPDATE DetalleCarritos
                        SET Cantidad = ${nuevaCantidad}, PrecioUnitario = ${precioUnitario}
                        WHERE ID = ${detalleID}
                    `);

          res.status(200).send('Cantidad actualizada en el carrito');
        } else {
          // Si el producto no está en el carrito, lo añadimos
          await sql.query(`
                        INSERT INTO DetalleCarritos (CarritoID, ProductoID, Cantidad, PrecioUnitario)
                        VALUES (${carritoID}, ${productoID}, ${cantidad}, ${precioUnitario})
                    `);

          res.status(200).send('Producto añadido al carrito');
        }

      } catch (error) {
        console.error('Error al añadir/actualizar producto en el carrito:', error);
        res.status(500).send('Hubo un problema al añadir o actualizar el producto en el carrito');
      }
    });

    // Obtener los productos del carrito para un usuario
    app.get('/api/carrito/:usuarioID', async (req, res) => {
      try {
        const usuarioID = req.params.usuarioID;

        // Obtener el carrito del usuario
        const carritoResult = await sql.query(`
                    SELECT dc.ID AS DetalleID, p.Nombre, p.Imagen, p.Precio, dc.Cantidad
                    FROM DetalleCarritos dc
                    JOIN Productos p ON dc.ProductoID = p.ID
                    JOIN CarritoVentas cv ON dc.CarritoID = cv.ID
                    WHERE cv.UsuarioID = ${usuarioID} AND cv.Estado = 'Pendiente'
                `);

        res.json(carritoResult.recordset);
      } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Hubo un problema al obtener el carrito');
      }
    });

    // Eliminar un producto del carrito
    app.delete('/api/eliminar-carrito/:detalleID', async (req, res) => {
      const transaction = new sql.Transaction();
      try {
        await transaction.begin();

        const detalleID = req.params.detalleID;
        console.log('DetalleID recibido:', detalleID); // Agregar log para verificar el detalleID recibido

        const checkDetalle = await transaction.request().query(`
                    SELECT CarritoID FROM DetalleCarritos WHERE ID = ${detalleID}
                `);

        if (checkDetalle.recordset.length === 0) {
          throw new Error('No se encontró el detalleID en DetalleCarritos');
        }

        const carritoID = checkDetalle.recordset[0].CarritoID;
        console.log('CarritoID asociado al detalle:', carritoID); // Verificar el CarritoID

        const deleteDetalle = await transaction.request().query(`
                    DELETE FROM DetalleCarritos WHERE ID = ${detalleID}
                `);

        if (deleteDetalle.rowsAffected[0] === 0) {
          throw new Error('No se pudo eliminar el detalle del carrito');
        }

        const checkCarrito = await transaction.request().query(`
                    SELECT COUNT(*) AS itemCount FROM DetalleCarritos WHERE CarritoID = ${carritoID}
                `);

        // si no quedan productos, eliminar el carrito
        if (checkCarrito.recordset[0].itemCount === 0) {
          await transaction.request().query(`
                        DELETE FROM CarritoVentas WHERE ID = ${carritoID}
                    `);
          console.log('Carrito vacío, eliminado:', carritoID);
        }

        // transacción
        await transaction.commit();
        res.status(200).send('Producto eliminado y carrito vacío, carrito eliminado.');
      } catch (error) {
        // rollback en caso de error
        await transaction.rollback();
        console.error('Error al eliminar producto del carrito:', error.message);
        res.status(500).send('Hubo un problema al eliminar el producto y el carrito: ' + error.message);
      }
    });

    // actualizar el estado del carrito
    app.put('/api/carrito/:carritoID/finalizar', async (req, res) => {
      const carritoID = req.params.carritoID;
      const fechaVenta = new Date(); // Fecha actual

      try {
        // verificar si el carrito existe y está en estado 'Pendiente'
        const carrito = await pool.request()
          .input('carritoID', sql.Int, carritoID)
          .query('SELECT * FROM CarritoVentas WHERE ID = @carritoID AND Estado = \'Pendiente\'');

        if (carrito.recordset.length === 0) {
          return res.status(404).send('Carrito no encontrado o ya finalizado');
        }

        // actualizar el estado del carrito y la fechaVenta
        await pool.request()
          .input('carritoID', sql.Int, carritoID)
          .input('fechaVenta', sql.DateTime, fechaVenta)
          .query(`
                        UPDATE CarritoVentas
                        SET Estado = 'Finalizado', FechaVenta = @fechaVenta
                        WHERE ID = @carritoID
                    `);

        // obtener los detalles del carrito (productos y cantidades)
        const detallesResult = await pool.request()
          .input('CarritoID', sql.Int, carritoID)
          .query(`
                    SELECT ProductoID, Cantidad 
                    FROM DetalleCarritos 
                    WHERE CarritoID = @CarritoID
                `);

        const detalles = detallesResult.recordset;

        // actualizar el stock de los productos vendidos
        for (const detalle of detalles) {
          await pool.request()
            .input('ProductoID', sql.Int, detalle.ProductoID)
            .input('Cantidad', sql.Int, detalle.Cantidad)
            .query(`
                        UPDATE Productos 
                        SET Stock = Stock - @Cantidad 
                        WHERE ID = @ProductoID AND Stock >= @Cantidad
                    `);
        }

        res.status(200).send('Compra finalizada correctamente');
      } catch (error) {
        console.error('Error al finalizar la compra:', error);
        res.status(500).send('Hubo un error al finalizar la compra');
      }
    });

    // obtener el carrito del usuario
    app.get('/api/carrito-usuario', async (req, res) => {
      if (!req.session.usuario) {
        return res.status(401).send('No has iniciado sesión');
      }

      const usuarioID = req.session.usuario.id;  // id sesion

      try {
        // si ya existe un carrito pendiente para el usuario
        const carrito = await pool.request()
          .input('usuarioID', sql.Int, usuarioID)
          .query(`
                        SELECT ID FROM CarritoVentas
                        WHERE UsuarioID = @usuarioID AND Estado = 'Pendiente'
                    `);

        if (carrito.recordset.length === 0) {
          return res.status(404).send('No se encontró un carrito pendiente para el usuario');
        }

        // si existe devuelve id del carrito
        const carritoID = carrito.recordset[0].ID;
        res.json({ carritoID });
      } catch (error) {
        console.error('Error al obtener el carrito del usuario:', error);
        res.status(500).send('Hubo un error al obtener el carrito');
      }
    });

    // obtener los productos del carrito
    app.get('/api/carrito/:carritoID/productos', async (req, res) => {
      const carritoID = req.params.carritoID;

      try {
        const productos = await pool.request()
          .input('carritoID', sql.Int, carritoID)
          .query(`
                        SELECT P.ID AS ProductoID, P.Nombre, D.Cantidad, D.PrecioUnitario
                        FROM DetalleCarritos D
                        JOIN Productos P ON D.ProductoID = P.ID
                        WHERE D.CarritoID = @carritoID
                    `);

        if (productos.recordset.length === 0) {
          return res.status(404).send('No hay productos en este carrito');
        }

        res.json({ productos: productos.recordset });
      } catch (error) {
        console.error('Error al obtener los productos del carrito:', error);
        res.status(500).send('Hubo un error al obtener los productos del carrito');
      }
    });

    // inicio servidor
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });
