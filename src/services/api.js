import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Productos
export const getProductos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/productos${query ? `?${query}` : ""}`);
};
export const getProducto = (id) => request(`/productos/${id}`);
export const crearProducto = (datos) => request("/productos", { method: "POST", body: JSON.stringify(datos) });
export const actualizarProducto = (id, datos) =>
  request(`/productos/${id}`, { method: "PUT", body: JSON.stringify(datos) });
export const actualizarEstrategiaProducto = (id, estrategia_logistica) =>
  request(`/productos/${id}/estrategia`, { method: "PUT", body: JSON.stringify({ estrategia_logistica }) });
export const eliminarProducto = (id) => request(`/productos/${id}`, { method: "DELETE" });

// Proveedores
export const getProveedores = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/proveedores${query ? `?${query}` : ""}`);
};
export const crearProveedor = (datos) => request("/proveedores", { method: "POST", body: JSON.stringify(datos) });
export const actualizarProveedor = (id, datos) =>
  request(`/proveedores/${id}`, { method: "PUT", body: JSON.stringify(datos) });
export const eliminarProveedor = (id) => request(`/proveedores/${id}`, { method: "DELETE" });

// Movimientos de inventario
export const getMovimientosDeProducto = (productoId) => request(`/productos/${productoId}/movimientos`);
export const crearMovimiento = (datos) =>
  request("/inventario/movimiento", { method: "POST", body: JSON.stringify(datos) });

// Pedidos SCM
export const getPedidosScm = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/pedidos-scm${query ? `?${query}` : ""}`);
};
export const crearPedidoScm = (datos) => request("/pedidos-scm", { method: "POST", body: JSON.stringify(datos) });
export const actualizarEstadoPedidoScm = (id, estado) =>
  request(`/pedidos-scm/${id}/estado`, { method: "PUT", body: JSON.stringify({ estado }) });

// Nivel SCM y reportes
export const getNivelScm = () => request("/scm/estado");
export const actualizarNivelScm = (datos) => request("/scm/nivel", { method: "PUT", body: JSON.stringify(datos) });
export const getReportesScm = () => request("/scm/reportes");

export const getNotificacionesScm = () => request("/scm/notificaciones");
