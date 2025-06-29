import db from '../config/db.js';
const { sql, getConnection } = db;

export const crearProducto = async (req, res) => {
  try {
    const { nombre, marca, descripcion, precioCompra, precioVenta, categoria, talla, img } = req.body;

    const pool = await getConnection();
    const request = pool.request();
    request.input('nombre', sql.NVarChar, nombre);

    const result = await request.query(`SELECT ID FROM Productos WHERE Nombre = @nombre`);

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'El producto ya existe. Use el formulario de reabastecimiento.' });
    }

    await request
      .input('marca', sql.NVarChar, marca)
      .input('descripcion', sql.Text, descripcion)
      .input('precioCompra', sql.Decimal(10, 2), precioCompra)
      .input('precioVenta', sql.Decimal(10, 2), precioVenta)
      .input('categoria', sql.NVarChar, categoria)
      .input('talla', sql.NVarChar, talla)
      .input('img', sql.NVarChar, img)
      .query(`
        INSERT INTO Productos (Nombre, Marca, Descripcion, PrecioCompra, Precio, Categoria, Talla, Imagen)
        VALUES (@nombre, @marca, @descripcion, @precioCompra, @precioVenta, @categoria, @talla, @img)
      `);

    res.status(200).json({ message: 'Producto registrado exitosamente' });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('Error al crear el producto');
  }
};

export const obtenerTodos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.query("SELECT * FROM Productos");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos.");
  }
};

export const obtenerPorId = async (req, res) => {
  const productoId = parseInt(req.params.id, 10);

  if (isNaN(productoId)) {
    console.error("ID inválido:", req.params.id);
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("productoId", db.sql.Int, productoId)
      .query("SELECT * FROM Productos WHERE ID = @productoId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).send("Error al obtener el producto.");
  }
};

export const eliminarProducto = async (req, res) => {
  const productoId = req.params.id;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('productoId', sql.Int, productoId)
      .query("DELETE FROM Productos WHERE ID = @productoId");

    if (result.rowsAffected[0] > 0) {
      res.status(200).send("Producto eliminado correctamente.");
    } else {
      res.status(404).send("Producto no encontrado.");
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).send("Error al eliminar el producto.");
  }
};

export const actualizarEstado = async (req, res) => {
  const productoId = req.params.id;
  const { estado } = req.body;

  if (!["habilitado", "deshabilitado"].includes(estado)) {
    return res.status(400).send("Estado inválido.");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("estado", sql.NVarChar, estado)
      .input("productoId", sql.Int, productoId)
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
};

export const actualizarProducto = async (req, res) => {
  const productoId = req.params.id;
  const { nombre, marca, descripcion, precioCompra, precio, stock, img, categoria, talla } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("productoId", sql.Int, productoId)
      .input("nombre", sql.NVarChar(255), nombre)
      .input("marca", sql.NVarChar(255), marca)
      .input("descripcion", sql.Text, descripcion)
      .input("precioCompra", sql.Decimal(10, 2), precioCompra)
      .input("precio", sql.Decimal(10, 2), precio)
      .input("stock", sql.Int, stock)
      .input("categoria", sql.NVarChar(100), categoria)
      .input("talla", sql.NVarChar, talla)
      .input("img", sql.NVarChar, img)
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
};

export const filtrarProductos = async (req, res) => {
  try {
    const { categoria } = req.query;

    const pool = await getConnection();
    const request = pool.request();

    let query = "SELECT * FROM Productos WHERE Estado = 'habilitado'";
    if (categoria && categoria.trim() !== "") {
      query += " AND Categoria = @categoria";
      request.input('categoria', sql.NVarChar, categoria);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

export const buscarProductos = async (req, res) => {
  try {
    const search = req.query.search;
    const pool = await getConnection();
    const request = pool.request();

    let query = "SELECT * FROM Productos WHERE Estado = 'habilitado'";
    if (search) {
      query += " AND (Nombre LIKE @searchStart OR Nombre LIKE @searchMid)";
      request.input('searchStart', sql.NVarChar, `${search}%`);
      request.input('searchMid', sql.NVarChar, `% ${search}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

export const verificarProducto = async (req, res) => {
  try {
    const { nombre } = req.body;
    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .query('SELECT ID FROM Productos WHERE Nombre = @nombre');

    if (result.recordset.length > 0) {
      return res.status(200).json({ message: 'Agregado a la lista.' });
    } else {
      return res.status(404).json({ message: 'El producto no existe' });
    }
  } catch (error) {
    console.error('Error al verificar producto:', error);
    res.status(500).send('Hubo un error en el proceso');
  }
};

export const reabastecer = async (req, res) => {
  try {
    const { proveedor, productos } = req.body;
    const pool = await getConnection();

    let proveedorID;
    const resultProveedor = await pool.request()
      .input('proveedor', sql.NVarChar, proveedor)
      .query('SELECT ID FROM Proveedores WHERE Nombre = @proveedor');

    if (resultProveedor.recordset.length > 0) {
      proveedorID = resultProveedor.recordset[0].ID;
    } else {
      const nuevoProveedor = await pool.request()
        .input('proveedor', sql.NVarChar, proveedor)
        .query('INSERT INTO Proveedores (Nombre) OUTPUT INSERTED.ID VALUES (@proveedor)');
      proveedorID = nuevoProveedor.recordset[0].ID;
    }

    const resultCompra = await pool.request()
      .input('proveedorID', sql.Int, proveedorID)
      .query('INSERT INTO Compras (ProveedorID) OUTPUT INSERTED.ID VALUES (@proveedorID)');
    const compraID = resultCompra.recordset[0].ID;

    for (const producto of productos) {
      const { nombre, cantidad } = producto;
      const resultProducto = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .query('SELECT ID, Stock, PrecioCompra FROM Productos WHERE Nombre = @nombre');

      const productoExistente = resultProducto.recordset[0];
      const newStock = productoExistente.Stock + parseInt(cantidad);

      await pool.request()
        .input('newStock', sql.Int, newStock)
        .input('productoID', sql.Int, productoExistente.ID)
        .query('UPDATE Productos SET Stock = @newStock WHERE ID = @productoID');

      await pool.request()
        .input('compraID', sql.Int, compraID)
        .input('productoID', sql.Int, productoExistente.ID)
        .input('cantidad', sql.Int, cantidad)
        .input('precioUnitario', sql.Decimal(10, 2), productoExistente.PrecioCompra)
        .query(`
          INSERT INTO DetalleCompras (CompraID, ProductoID, Cantidad, PrecioUnitario) 
          VALUES (@compraID, @productoID, @cantidad, @precioUnitario)
        `);
    }

    res.status(200).send('Stock actualizado y compra registrada exitosamente');
  } catch (error) {
    console.error('Error al registrar la compra:', error);
    res.status(500).send('Error al registrar la compra.');
  }
};
