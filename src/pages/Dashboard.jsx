import Layout from "../components/layout/Layout";

export default function Dashboard() {
  return (
    <Layout titulo="Dashboard SCM">
      <p style={{ color: "var(--color-text-soft)" }}>
        Panel de indicadores — pendiente de conectar con GET /scm/estado y /pedidos-scm/reportes.
      </p>
    </Layout>
  );
}