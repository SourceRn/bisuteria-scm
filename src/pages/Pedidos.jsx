import Layout from "../components/layout/Layout";

export default function Pedidos() {
  return (
    <Layout titulo="Pedidos">
      <p style={{ color: "var(--color-text-soft)" }}>
        Gestión de pedidos de reposición — pendiente de conectar con
        GET/POST /pedidos-scm y PUT /pedidos-scm/:id/estado.
      </p>
    </Layout>
  );
}