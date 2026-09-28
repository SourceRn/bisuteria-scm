import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getProductos, getMovimientosDeProducto, crearMovimiento } from "../services/api";
import "./Inventario.css";

const TIPOS = ["entrada", "salida"];
const MOTIVOS = ["venta", "ajuste", "reposicion", "compra"];

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [seleccionado, setSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoMov, setCargandoMov] = useState(false);

  const [nuevoMov, setNuevoMov] = useState({ tipo: "entrada", cantidad: "", motivo: "ajuste" });
  const [guardandoMov, setGuardandoMov] = useState(false);

  function cargarProductos() {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;

    getProductos(params)
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const timeout = setTimeout(cargarProductos, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar]);

  function abrirProducto(producto) {
    setSeleccionado(producto);
    setCargandoMov(true);
    getMovimientosDeProducto(producto.id)
      .then(setMovimientos)
      .catch((err) => setError(err.message))
      .finally(() => setCargandoMov(false));
  }

  async function handleRegistrarMovimiento(e) {
    e.preventDefault();
    setGuardandoMov(true);
    try {
      const resultado = await crearMovimiento({
        producto_id: seleccionado.id,
        tipo: nuevoMov.tipo,
        cantidad: Number(nuevoMov.cantidad),
        motivo: nuevoMov.motivo,
      });
      setNuevoMov({ tipo: "entrada", cantidad: "", motivo: "ajuste" });
      cargarProductos();
      abrirProducto({ ...seleccionado, stock_actual: resultado.stock_nuevo });

      if (resultado.pedido_generado) {
        alert(
          `Se generó automáticamente un pedido de reposición (estrategia PUSH) por ${resultado.pedido_generado.cantidad} unidades.`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoMov(false);
    }
  }

  return (
    <Layout titulo="Inventario">
      <div className="inventario__layout">
        <div className="inventario__list">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="inventario__search"
          />

          {error && <p className="inventario__error">Error: {error}</p>}

          {cargando ? (
            <p>Cargando...</p>
          ) : (
            <div className="table-scroll">
              <table className="inventario__table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock actual</th>
                    <th>Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr
                      key={p.id}
                      className={`inventario__row ${seleccionado?.id === p.id ? "is-selected" : ""}`}
                      onClick={() => abrirProducto(p)}
                    >
                      <td><span className="inventario__row-name">{p.nombre}</span></td>
                      <td>{p.stock_actual}</td>
                      <td>{p.stock_minimo}</td>
                      <td>
                        {p.stock_actual <= p.stock_minimo ? (
                          <span className="inventario__badge inventario__badge--bajo">Stock bajo</span>
                        ) : (
                          <span className="inventario__badge inventario__badge--normal">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="inventario__detail">
          {!seleccionado ? (
            <p className="inventario__empty">Selecciona un producto para ver su historial de movimientos.</p>
          ) : (
            <>
              <h2>{seleccionado.nombre}</h2>
              <p className="inventario__stock-actual">Stock actual: <strong>{seleccionado.stock_actual}</strong></p>

              <form className="inventario__form" onSubmit={handleRegistrarMovimiento}>
                <select value={nuevoMov.tipo} onChange={(e) => setNuevoMov((p) => ({ ...p, tipo: e.target.value }))}>
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Cantidad"
                  min="1"
                  required
                  value={nuevoMov.cantidad}
                  onChange={(e) => setNuevoMov((p) => ({ ...p, cantidad: e.target.value }))}
                />
                <select value={nuevoMov.motivo} onChange={(e) => setNuevoMov((p) => ({ ...p, motivo: e.target.value }))}>
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <button type="submit" disabled={guardandoMov}>
                  {guardandoMov ? "..." : "Registrar"}
                </button>
              </form>

              <h3>Historial</h3>
              {cargandoMov ? (
                <p>Cargando...</p>
              ) : movimientos.length === 0 ? (
                <p className="inventario__empty">Sin movimientos registrados.</p>
              ) : (
                <ul className="inventario__timeline">
                  {movimientos.map((m) => (
                    <li key={m.id}>
                      <span className={`inventario__mov-tipo inventario__mov-tipo--${m.tipo}`}>
                        {m.tipo === "entrada" ? "+" : "−"}{m.cantidad}
                      </span>
                      <span className="inventario__mov-motivo">{m.motivo}</span>
                      <time>{new Date(m.fecha).toLocaleString()}</time>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}