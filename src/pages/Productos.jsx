import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { supabase } from "../services/supabase";
import { getProductos, getProveedores, crearProducto, actualizarProducto, eliminarProducto } from "../services/api";
import "./Productos.css";

const ESTRATEGIAS = ["PUSH", "PULL"];

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [estrategia, setEstrategia] = useState("");
  const [stockBajo, setStockBajo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "", descripcion: "", categoria: "", stock_actual: 0, stock_minimo: 0,
    proveedor_id: "", costo_unitario: 0, precio_venta: 0, estrategia_logistica: "PULL",
  });
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  function cargar() {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;
    if (estrategia) params.estrategia = estrategia;
    if (stockBajo) params.stock_bajo = "true";

    getProductos(params)
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    getProveedores().then(setProveedores).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(cargar, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, estrategia, stockBajo]);

  async function subirImagen(archivo) {
    const extension = archivo.name.split(".").pop();
    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("productos").upload(nombreArchivo, archivo);
    if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

    const { data } = supabase.storage.from("productos").getPublicUrl(nombreArchivo);
    return data.publicUrl;
  }

  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      let imagen_url = "";
      if (archivoImagen) {
        setSubiendoImagen(true);
        imagen_url = await subirImagen(archivoImagen);
        setSubiendoImagen(false);
      }

      await crearProducto({ ...nuevo, proveedor_id: nuevo.proveedor_id || null, imagen_url });
      setNuevo({
        nombre: "", descripcion: "", categoria: "", stock_actual: 0, stock_minimo: 0,
        proveedor_id: "", costo_unitario: 0, precio_venta: 0, estrategia_logistica: "PULL",
      });
      setArchivoImagen(null);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    setGuardandoEdicion(true);
    try {
      let imagen_url = editando.imagen_url;
      if (archivoImagen) {
        imagen_url = await subirImagen(archivoImagen);
      }

      await actualizarProducto(editando.id, {
        nombre: editando.nombre,
        descripcion: editando.descripcion,
        categoria: editando.categoria,
        stock_minimo: Number(editando.stock_minimo),
        proveedor_id: editando.proveedor_id || null,
        costo_unitario: Number(editando.costo_unitario),
        precio_venta: Number(editando.precio_venta),
        imagen_url,
        estrategia_logistica: editando.estrategia_logistica,
      });
      setEditando(null);
      setArchivoImagen(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleEliminar(producto) {
    const confirmado = window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    try {
      await eliminarProducto(producto.id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout titulo="Productos">
      <div className="productos__toolbar">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="productos__search"
        />
        <select value={estrategia} onChange={(e) => setEstrategia(e.target.value)} className="productos__filter">
          <option value="">Todas las estrategias</option>
          {ESTRATEGIAS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <label className="productos__checkbox">
          <input type="checkbox" checked={stockBajo} onChange={(e) => setStockBajo(e.target.checked)} />
          Solo stock bajo
        </label>
        <button className="productos__new-btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Nuevo producto"}
        </button>
      </div>

      {mostrarForm && (
        <form className="productos__form" onSubmit={handleCrear}>
          <label className="productos__field">
            <span>Nombre</span>
            <input type="text" placeholder="Ej. Collar Armonía" required value={nuevo.nombre}
              onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Categoría</span>
            <input type="text" placeholder="Ej. Collares" value={nuevo.categoria}
              onChange={(e) => setNuevo((p) => ({ ...p, categoria: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Stock inicial</span>
            <input type="number" placeholder="0" min="0" value={nuevo.stock_actual}
              onChange={(e) => setNuevo((p) => ({ ...p, stock_actual: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Stock mínimo</span>
            <input type="number" placeholder="0" min="0" value={nuevo.stock_minimo}
              onChange={(e) => setNuevo((p) => ({ ...p, stock_minimo: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Proveedor</span>
            <select value={nuevo.proveedor_id} onChange={(e) => setNuevo((p) => ({ ...p, proveedor_id: e.target.value }))}>
              <option value="">Sin proveedor</option>
              {proveedores.map((pr) => (
                <option key={pr.id} value={pr.id}>{pr.nombre}</option>
              ))}
            </select>
          </label>

          <label className="productos__field">
            <span>Costo unitario</span>
            <input type="number" placeholder="0.00" min="0" step="0.01" value={nuevo.costo_unitario}
              onChange={(e) => setNuevo((p) => ({ ...p, costo_unitario: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Precio de venta</span>
            <input type="number" placeholder="0.00" min="0" step="0.01" value={nuevo.precio_venta}
              onChange={(e) => setNuevo((p) => ({ ...p, precio_venta: e.target.value }))} />
          </label>

          <label className="productos__field">
            <span>Imagen</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivoImagen(e.target.files[0])}
            />
          </label>

          <label className="productos__field">
            <span>Estrategia logística</span>
            <select value={nuevo.estrategia_logistica} onChange={(e) => setNuevo((p) => ({ ...p, estrategia_logistica: e.target.value }))}>
              {ESTRATEGIAS.map((es) => (
                <option key={es} value={es}>{es}</option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={guardando} className="productos__submit">
            {subiendoImagen ? "Subiendo imagen..." : guardando ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {error && <p className="productos__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-scroll">
          <table className="productos__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Precio</th>
                <th>Estrategia</th>
                <th>Proveedor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className={p.stock_actual <= p.stock_minimo ? "productos__row--critico" : ""}>
                  <td className="productos__row-nombre-con-imagen">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="productos__thumb" />
                    ) : (
                      <div className="productos__thumb productos__thumb--vacio" />
                    )}
                    <span className="productos__row-name">{p.nombre}</span>
                  </td>
                  <td>{p.categoria || "—"}</td>
                  <td>{p.stock_actual}</td>
                  <td>{p.stock_minimo}</td>
                  <td>${p.precio_venta}</td>
                  <td><span className={`estrategia-badge estrategia-badge--${p.estrategia_logistica.toLowerCase()}`}>{p.estrategia_logistica}</span></td>
                  <td>{p.proveedor_nombre || "—"}</td>
                  <td>
                    <button className="productos__edit-btn"
                    onClick={() => setEditando({
                      ...p,
                      proveedor_id: p.proveedor_id || "",
                      descripcion: p.descripcion || "",
                      categoria: p.categoria || "",
                    })}>
                      Editar
                    </button>
                    <button className="productos__delete-btn" onClick={() => handleEliminar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr><td colSpan={8} className="productos__empty">No hay productos con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <div className="productos__modal-overlay" onClick={() => setEditando(null)}>
          <form className="productos__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleGuardarEdicion}>
            <h2>Editar producto</h2>
            <label>Nombre
              <input type="text" required value={editando.nombre}
                onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))} />
            </label>
            <label>Descripción
              <input type="text" value={editando.descripcion || ""}
                onChange={(e) => setEditando((p) => ({ ...p, descripcion: e.target.value }))} />
            </label>
            <label>Categoría
              <input type="text" value={editando.categoria || ""}
                onChange={(e) => setEditando((p) => ({ ...p, categoria: e.target.value }))} />
            </label>
            <label>Stock mínimo
              <input type="number" min="0" value={editando.stock_minimo}
                onChange={(e) => setEditando((p) => ({ ...p, stock_minimo: e.target.value }))} />
            </label>
            <label>Proveedor
              <select value={editando.proveedor_id} onChange={(e) => setEditando((p) => ({ ...p, proveedor_id: e.target.value }))}>
                <option value="">Sin proveedor</option>
                {proveedores.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.nombre}</option>
                ))}
              </select>
            </label>
            <label>Costo unitario
              <input type="number" min="0" step="0.01" value={editando.costo_unitario}
                onChange={(e) => setEditando((p) => ({ ...p, costo_unitario: e.target.value }))} />
            </label>
            <label>Precio de venta
              <input type="number" min="0" step="0.01" value={editando.precio_venta}
                onChange={(e) => setEditando((p) => ({ ...p, precio_venta: e.target.value }))} />
            </label>
            <label>Imagen actual
              {editando.imagen_url ? (
                <img src={editando.imagen_url} alt={editando.nombre} style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} />
              ) : (
                <p style={{ fontSize: 12, color: "var(--color-text-soft)" }}>Sin imagen</p>
              )}
              <input type="file" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files[0])} />
            </label>
            <label>Estrategia logística
              <select value={editando.estrategia_logistica} onChange={(e) => setEditando((p) => ({ ...p, estrategia_logistica: e.target.value }))}>
                {ESTRATEGIAS.map((es) => (
                  <option key={es} value={es}>{es}</option>
                ))}
              </select>
            </label>
            <div className="productos__modal-actions">
              <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" disabled={guardandoEdicion}>{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}