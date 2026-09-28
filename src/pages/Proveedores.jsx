import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from "../services/api";
import "./Proveedores.css";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", contacto: "", correo: "", telefono: "" });
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  function cargar() {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;

    getProveedores(params)
      .then(setProveedores)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const timeout = setTimeout(cargar, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar]);

  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearProveedor(nuevo);
      setNuevo({ nombre: "", contacto: "", correo: "", telefono: "" });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    setGuardandoEdicion(true);
    try {
      await actualizarProveedor(editando.id, {
        nombre: editando.nombre,
        contacto: editando.contacto,
        correo: editando.correo,
        telefono: editando.telefono,
      });
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleEliminar(proveedor) {
    const confirmado = window.confirm(`¿Eliminar a "${proveedor.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    try {
      await eliminarProveedor(proveedor.id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout titulo="Proveedores">
      <div className="proveedores__toolbar">
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="proveedores__search"
        />
        <button className="proveedores__new-btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Nuevo proveedor"}
        </button>
      </div>

      {mostrarForm && (
        <form className="proveedores__form" onSubmit={handleCrear}>
          <label className="proveedores__field">
            <span>Nombre</span>
            <input type="text" placeholder="Ej. Artesanías del Sur" required value={nuevo.nombre}
              onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="proveedores__field">
            <span>Contacto</span>
            <input type="text" placeholder="Ej. Juan Pérez" value={nuevo.contacto}
              onChange={(e) => setNuevo((p) => ({ ...p, contacto: e.target.value }))} />
          </label>
          <label className="proveedores__field">
            <span>Correo</span>
            <input type="email" placeholder="correo@ejemplo.com" value={nuevo.correo}
              onChange={(e) => setNuevo((p) => ({ ...p, correo: e.target.value }))} />
          </label>
          <label className="proveedores__field">
            <span>Teléfono</span>
            <input type="tel" placeholder="5512345678" value={nuevo.telefono}
              onChange={(e) => setNuevo((p) => ({ ...p, telefono: e.target.value }))} />
          </label>
          <button type="submit" disabled={guardando} className="proveedores__submit">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {error && <p className="proveedores__error">Error: {error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-scroll">
          <table className="proveedores__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td><span className="proveedores__row-name">{p.nombre}</span></td>
                  <td>{p.contacto || "—"}</td>
                  <td>{p.correo || "—"}</td>
                  <td>{p.telefono || "—"}</td>
                  <td>
                    <button className="proveedores__edit-btn" onClick={() => setEditando({
                      ...p,
                      contacto: p.contacto || "",
                      correo: p.correo || "",
                      telefono: p.telefono || "",
                    })}>
                      Editar
                    </button>
                    <button className="proveedores__delete-btn" onClick={() => handleEliminar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr><td colSpan={5} className="proveedores__empty">No hay proveedores registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <div className="proveedores__modal-overlay" onClick={() => setEditando(null)}>
          <form className="proveedores__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleGuardarEdicion}>
            <h2>Editar proveedor</h2>
            <label>Nombre
              <input type="text" required value={editando.nombre}
                onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))} />
            </label>
            <label>Contacto
              <input type="text" value={editando.contacto}
                onChange={(e) => setEditando((p) => ({ ...p, contacto: e.target.value }))} />
            </label>
            <label>Correo
              <input type="email" value={editando.correo}
                onChange={(e) => setEditando((p) => ({ ...p, correo: e.target.value }))} />
            </label>
            <label>Teléfono
              <input type="tel" value={editando.telefono}
                onChange={(e) => setEditando((p) => ({ ...p, telefono: e.target.value }))} />
            </label>
            <div className="proveedores__modal-actions">
              <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" disabled={guardandoEdicion}>{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}