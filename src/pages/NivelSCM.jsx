import Layout from "../components/layout/Layout";

export default function NivelSCM() {
  return (
    <Layout titulo="Nivel de madurez SCM">
      <p style={{ color: "var(--color-text-soft)" }}>
        Checklist y nivel de adopción — pendiente de conectar con
        GET /scm/estado y PUT /scm/nivel.
      </p>
    </Layout>
  );
}