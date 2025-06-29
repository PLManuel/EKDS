import db from '../config/db.js';

const { sql, getConnection } = db;

export const kardexPorCategoria = async (req, res) => {
  const { categoria, fechaDesde, fechaHasta } = req.query;
  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('categoria', sql.NVarChar, categoria)
      .input('fechaDesde', sql.Date, fechaDesde || null)
      .input('fechaHasta', sql.Date, fechaHasta || null);

    const query = `
      SELECT 
        FORMAT(COALESCE(C.FechaCompra, CV.FechaVenta), 'dd-MM-yyyy') AS Periodo,
        P.Categoria AS Categoria,
        P.Nombre AS Producto,
        P.PrecioCompra AS Valor_Unitario_Entrada,
        P.Precio AS Valor_Unitario_Salida,
        ISNULL(SUM(DC.Cantidad), 0) AS Entrada_Cantidad,
        ISNULL(SUM(DC.Cantidad * P.PrecioCompra), 0) AS Entrada_Total,
        ISNULL(SUM(DVC.Cantidad), 0) AS Salida_Cantidad,
        ISNULL(SUM(DVC.Cantidad * P.Precio), 0) AS Salida_Total,
        (ISNULL(SUM(DC.Cantidad), 0) - ISNULL(SUM(DVC.Cantidad), 0)) AS Saldo_Cantidad,
        (ISNULL(SUM(DC.Cantidad * P.PrecioCompra), 0) - ISNULL(SUM(DVC.Cantidad * P.Precio), 0)) AS Saldo_Total
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
        P.Categoria = @categoria
        ${fechaDesde ? "AND (C.FechaCompra >= @fechaDesde OR CV.FechaVenta >= @fechaDesde)" : ''}
        ${fechaHasta ? "AND (C.FechaCompra <= @fechaHasta OR CV.FechaVenta <= @fechaHasta)" : ''}
      GROUP BY 
        FORMAT(COALESCE(C.FechaCompra, CV.FechaVenta), 'dd-MM-yyyy'),
        P.Categoria, 
        P.Nombre, 
        P.PrecioCompra,
        P.Precio
      ORDER BY 
        Categoria, Periodo, Producto;
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en la consulta de kardex:', error);
    res.status(500).send('Error al obtener los datos del kardex.');
  }
};
