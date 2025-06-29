import db from '../config/db.js';
const { sql, getConnection } = db;

export const agregarAlCarrito = async (req, res) => {
  try {
    if (!req.session.usuario) return res.status(401).send('No has iniciado sesión');
    const { productoID, cantidad, precioUnitario } = req.body;
    const usuarioID = req.session.usuario.id;
    const pool = await getConnection();

    let carritoResult = await pool.request()
      .input('usuarioID', sql.Int, usuarioID)
      .query(`SELECT ID FROM CarritoVentas WHERE UsuarioID = @usuarioID AND Estado = 'Pendiente'`);

    let carritoID = carritoResult.recordset.length === 0
      ? (await pool.request().input('usuarioID', sql.Int, usuarioID)
          .query(`INSERT INTO CarritoVentas (UsuarioID, Estado) OUTPUT INSERTED.ID VALUES (@usuarioID, 'Pendiente')`)).recordset[0].ID
      : carritoResult.recordset[0].ID;

    const detalleResult = await pool.request()
      .input('carritoID', sql.Int, carritoID)
      .input('productoID', sql.Int, productoID)
      .query(`SELECT ID, Cantidad FROM DetalleCarritos WHERE CarritoID = @carritoID AND ProductoID = @productoID`);

    if (detalleResult.recordset.length > 0) {
      const nuevaCantidad = detalleResult.recordset[0].Cantidad + cantidad;
      await pool.request()
        .input('detalleID', sql.Int, detalleResult.recordset[0].ID)
        .input('cantidad', sql.Int, nuevaCantidad)
        .input('precioUnitario', sql.Decimal(10, 2), precioUnitario)
        .query(`UPDATE DetalleCarritos SET Cantidad = @cantidad, PrecioUnitario = @precioUnitario WHERE ID = @detalleID`);
      res.status(200).send('Cantidad actualizada en el carrito');
    } else {
      await pool.request()
        .input('carritoID', sql.Int, carritoID)
        .input('productoID', sql.Int, productoID)
        .input('cantidad', sql.Int, cantidad)
        .input('precioUnitario', sql.Decimal(10, 2), precioUnitario)
        .query(`INSERT INTO DetalleCarritos (CarritoID, ProductoID, Cantidad, PrecioUnitario) VALUES (@carritoID, @productoID, @cantidad, @precioUnitario)`);
      res.status(200).send('Producto añadido al carrito');
    }
  } catch (error) {
    console.error('Error al añadir/actualizar producto en el carrito:', error);
    res.status(500).send('Error en el carrito');
  }
};

export const obtenerCarritoUsuario = async (req, res) => {
  try {
    const usuarioID = req.params.usuarioID;
    const pool = await getConnection();
    const result = await pool.request()
      .input('usuarioID', sql.Int, usuarioID)
      .query(`
        SELECT dc.ID AS DetalleID, p.Nombre, p.Imagen, p.Precio, dc.Cantidad
        FROM DetalleCarritos dc
        JOIN Productos p ON dc.ProductoID = p.ID
        JOIN CarritoVentas cv ON dc.CarritoID = cv.ID
        WHERE cv.UsuarioID = @usuarioID AND cv.Estado = 'Pendiente'
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
};

export const eliminarDetalleCarrito = async (req, res) => {
  const detalleID = req.params.detalleID;
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const result = await transaction.request()
      .input('detalleID', sql.Int, detalleID)
      .query(`SELECT CarritoID FROM DetalleCarritos WHERE ID = @detalleID`);
    if (result.recordset.length === 0) throw new Error('Detalle no encontrado');
    const carritoID = result.recordset[0].CarritoID;

    await transaction.request()
      .input('detalleID', sql.Int, detalleID)
      .query(`DELETE FROM DetalleCarritos WHERE ID = @detalleID`);

    const count = await transaction.request()
      .input('carritoID', sql.Int, carritoID)
      .query(`SELECT COUNT(*) AS total FROM DetalleCarritos WHERE CarritoID = @carritoID`);

    if (count.recordset[0].total === 0) {
      await transaction.request()
        .input('carritoID', sql.Int, carritoID)
        .query(`DELETE FROM CarritoVentas WHERE ID = @carritoID`);
    }

    await transaction.commit();
    res.status(200).send('Producto eliminado correctamente');
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar del carrito:', error);
    res.status(500).send('Error eliminando del carrito');
  }
};

export const finalizarCompra = async (req, res) => {
  const carritoID = req.params.carritoID;
  const pool = await getConnection();
  try {
    const check = await pool.request()
      .input('carritoID', sql.Int, carritoID)
      .query(`SELECT * FROM CarritoVentas WHERE ID = @carritoID AND Estado = 'Pendiente'`);
    if (check.recordset.length === 0) {
      return res.status(404).send('Carrito no encontrado o ya finalizado');
    }

    await pool.request()
      .input('carritoID', sql.Int, carritoID)
      .input('fechaVenta', sql.DateTime, new Date())
      .query(`UPDATE CarritoVentas SET Estado = 'Finalizado', FechaVenta = @fechaVenta WHERE ID = @carritoID`);

    const productos = await pool.request()
      .input('carritoID', sql.Int, carritoID)
      .query(`SELECT ProductoID, Cantidad FROM DetalleCarritos WHERE CarritoID = @carritoID`);

    for (const item of productos.recordset) {
      await pool.request()
        .input('ProductoID', sql.Int, item.ProductoID)
        .input('Cantidad', sql.Int, item.Cantidad)
        .query(`UPDATE Productos SET Stock = Stock - @Cantidad WHERE ID = @ProductoID AND Stock >= @Cantidad`);
    }

    res.status(200).send('Compra finalizada correctamente');
  } catch (error) {
    console.error('Error al finalizar compra:', error);
    res.status(500).send('Error al finalizar la compra');
  }
};

export const obtenerCarritoID = async (req, res) => {
  if (!req.session.usuario) return res.status(401).send('No has iniciado sesión');
  const usuarioID = req.session.usuario.id;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('usuarioID', sql.Int, usuarioID)
      .query(`SELECT ID FROM CarritoVentas WHERE UsuarioID = @usuarioID AND Estado = 'Pendiente'`);

    if (result.recordset.length === 0) {
      return res.status(404).send('No se encontró un carrito pendiente para el usuario');
    }

    res.json({ carritoID: result.recordset[0].ID });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error al obtener carrito');
  }
};

export const obtenerProductosCarrito = async (req, res) => {
  const carritoID = req.params.carritoID;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('carritoID', sql.Int, carritoID)
      .query(`
        SELECT P.ID AS ProductoID, P.Nombre, D.Cantidad, D.PrecioUnitario
        FROM DetalleCarritos D
        JOIN Productos P ON D.ProductoID = P.ID
        WHERE D.CarritoID = @carritoID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send('No hay productos en este carrito');
    }

    res.json({ productos: result.recordset });
  } catch (error) {
    console.error('Error al obtener productos del carrito:', error);
    res.status(500).send('Error al obtener productos del carrito');
  }
};
