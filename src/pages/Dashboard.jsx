import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import Layout from "../components/layout/Layout";
import { getReportesScm } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReportesScm()
      .then(setDatos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Layout titulo="Dashboard SCM">
      {cargando && <p>Cargando...</p>}
      {error && <p className="dashboard__error">Error: {error}</p>}

      {datos && (
        <>
          <div className="dashboard__counters">
            <div className="dashboard__card">
              <p className="dashboard__card-label">Productos</p>
              <p className="dashboard__card-value">{datos.resumen.total_productos}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Proveedores</p>
              <p className="dashboard__card-value">{datos.resumen.total_proveedores}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Pedidos en proceso</p>
              <p className="dashboard__card-value">{datos.resumen.pedidos_en_proceso}</p>
            </div>
            <div className="dashboard__card">
              <p className="dashboard__card-label">Productos en stock bajo</p>
              <p className="dashboard__card-value dashboard__card-value--warning">
                {datos.resumen.productos_stock_bajo}
              </p>
            </div>
          </div>

          <div className="dashboard__panels">
            <div className="dashboard__panel">
              <h2>Productos más vendidos</h2>
              {datos.productos_mas_vendidos.every((p) => p.total_vendido === 0) ? (
                <p className="dashboard__empty">Sin ventas registradas todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={datos.productos_mas_vendidos.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg)" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="nombre" fontSize={11} width={100} />
                    <Tooltip />
                    <Bar dataKey="total_vendido" fill="var(--color-sage)" name="Vendido" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="dashboard__panel">
              <h2>Inventario crítico</h2>
              {datos.inventario_critico.length === 0 ? (
                <p className="dashboard__empty">Ningún producto en stock crítico 🎉</p>
              ) : (
                <ul className="dashboard__risk-list">
                  {datos.inventario_critico.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="dashboard__risk-row"
                      onClick={() => navigate("/productos")}
                    >
                      <span className="dashboard__risk-name">{p.nombre}</span>
                      <span className="dashboard__risk-stock">
                        {p.stock_actual}/{p.stock_minimo}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="dashboard__panel dashboard__panel--full">
            <h2>Rotación lenta</h2>
            {datos.rotacion_lenta.length === 0 ? (
              <p className="dashboard__empty">No hay productos con rotación lenta detectada.</p>
            ) : (
              <div className="table-scroll">
                <table className="dashboard__table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock actual</th>
                      <th>Salidas registradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.rotacion_lenta.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td>{p.stock_actual}</td>
                        <td>{p.total_salidas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}