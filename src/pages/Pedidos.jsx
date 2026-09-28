import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getPedidosScm, getProductos, crearPedidoScm, actualizarEstadoPedidoScm } from "../services/api";
import "./Pedidos.css";

const ESTADOS = ["pendiente", "en_proceso", "surtido", "cancelado"];
const TIPOS = ["reposicion", "venta"];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState("");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ producto_id: "", cantidad: "", tipo: "reposicion", notas: "" });
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    const params = {};
    if (estado) params.estado = estado;
    if (tipo) params.tipo = tipo;

    getPedidosScm(params)
      .then(setPedidos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    getProductos().then(setProductos).catch(() => {});
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, tipo]);

  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearPedidoScm({ ...nuevo, cantidad: Number(nuevo.cantidad) });
      setNuevo({ producto_id: "", cantidad: "", tipo: "reposicion", notas: "" });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleCambiarEstado(pedido, nuevoEstado) {
    try {
      await actualizarEstadoPedidoScm(pedido.id, nuevoEstado);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout titulo="Pedidos">
      <div className="pedidos__toolbar">
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="pedidos__filter">
          <option value="">Todos los estados</option>
          {ESTADOS.map((es) => (
            <option key={es} value={es}>{es}</option>
          ))}
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="pedidos__filter">
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="pedidos__new-btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Generar pedido"}
        </button>
      </div>

      {mostrarForm && (
        <form className="pedidos__form" onSubmit={handleCrear}>
          <label className="pedidos__field">
            <span>Producto</span>
            <select required value={nuevo.producto_id} onChange={(e) => setNuevo((p) => ({ ...p, producto_id: e.target.value }))}>
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <label className="pedidos__field">
            <span>Cantidad</span>
            <input type="number" min="1" required placeholder="0" value={nuevo.cantidad}
              onChange={(e) => setNuevo((p) => ({ ...p, cantidad: e.target.value }))} />
          </label>
          <label className="pedidos__field">
            <span>Tipo</span>
            <select value={nuevo.tipo} onChange={(e) => setNuevo((p) => ({ ...p, tipo: e.target.value }))}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="pedidos__field">
            <span>Notas</span>
            <input type="text" placeholder="Opcional" value={nuevo.notas}
              onChange={(e) => setNuevo((p) => ({ ...p, notas: e.target.value }))} />
          </label>
          <button type="submit" disabled={guardando} className="pedidos__submit">
            {guardando ? "Guardando..." : "Generar"}
          </button>
        </form>
      )}

      {error && <p className="pedidos__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-scroll">
          <table className="pedidos__table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td><span className="pedidos__row-name">{p.producto_nombre}</span></td>
                  <td>{p.proveedor_nombre || "—"}</td>
                  <td>{p.cantidad}</td>
                  <td className="pedidos__tipo">{p.tipo}</td>
                  <td>
                    <span className={`pedido-estado-badge pedido-estado-badge--${p.estado}`}>
                      {p.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td>
                    {p.estado !== "surtido" && p.estado !== "cancelado" && (
                      <select
                        className="pedidos__estado-select"
                        value=""
                        onChange={(e) => handleCambiarEstado(p, e.target.value)}
                      >
                        <option value="" disabled>Cambiar estado...</option>
                        {ESTADOS.filter((es) => es !== p.estado).map((es) => (
                          <option key={es} value={es}>{es}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr><td colSpan={7} className="pedidos__empty">No hay pedidos con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}