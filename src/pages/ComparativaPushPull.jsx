import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Layout from "../components/layout/Layout";
import { getProductos } from "../services/api";
import "./ComparativaPushPull.css";

const COLORS = { PUSH: "#B8935A", PULL: "#B3AEDD" };

export default function ComparativaPushPull() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Layout titulo="Comparativa Push vs Pull"><p>Cargando...</p></Layout>;
  if (error) return <Layout titulo="Comparativa Push vs Pull"><p className="comparativa__error">Error: {error}</p></Layout>;

  const push = productos.filter((p) => p.estrategia_logistica === "PUSH");
  const pull = productos.filter((p) => p.estrategia_logistica === "PULL");

  const datosGrafica = [
    { name: "PUSH", value: push.length },
    { name: "PULL", value: pull.length },
  ];

  return (
    <Layout titulo="Comparativa Push vs Pull">
      <div className="comparativa__panels">
        <div className="comparativa__chart-panel">
          <h2>Distribución de estrategias</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={datosGrafica}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
              >
                {datosGrafica.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="comparativa__cards">
          <div className="comparativa__card comparativa__card--push">
            <p className="comparativa__card-label">PUSH</p>
            <p className="comparativa__card-value">{push.length}</p>
            <p className="comparativa__card-desc">productos</p>
          </div>
          <div className="comparativa__card comparativa__card--pull">
            <p className="comparativa__card-label">PULL</p>
            <p className="comparativa__card-value">{pull.length}</p>
            <p className="comparativa__card-desc">productos</p>
          </div>
        </div>
      </div>

      <div className="comparativa__info-panels">
        <div className="comparativa__info-card comparativa__info-card--push">
          <h3>PUSH</h3>
          <p>Se genera pedido automáticamente cuando el stock llega al mínimo.</p>
        </div>
        <div className="comparativa__info-card comparativa__info-card--pull">
          <h3>PULL</h3>
          <p>Se genera pedido solo bajo demanda real, de forma manual.</p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="comparativa__table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Estrategia</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr
                key={p.id}
                className="comparativa__row"
                onClick={() => navigate("/productos")}
              >
                <td><span className="comparativa__row-name">{p.nombre}</span></td>
                <td>{p.categoria || "—"}</td>
                <td>{p.stock_actual}</td>
                <td>{p.stock_minimo}</td>
                <td>
                  <span className={`estrategia-badge estrategia-badge--${p.estrategia_logistica.toLowerCase()}`}>
                    {p.estrategia_logistica}
                  </span>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td colSpan={5} className="comparativa__empty">No hay productos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}