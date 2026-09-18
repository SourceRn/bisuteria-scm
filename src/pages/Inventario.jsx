import Layout from "../components/layout/Layout";

export default function Inventario() {
  return (
    <Layout titulo="Inventario">
      <p style={{ color: "var(--color-text-soft)" }}>
        Vista general de existencias y movimientos — pendiente de conectar con
        GET /productos/:id/movimientos y POST /inventario/movimiento.
      </p>
    </Layout>
  );
}