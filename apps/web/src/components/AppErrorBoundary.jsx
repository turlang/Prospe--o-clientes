import { Component } from "react";

/**
 * Limite global de erros do React.
 *
 * Em vez de apresentar uma página totalmente branca, exibe uma mensagem de
 * diagnóstico e registra o erro completo no console do navegador.
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Delivery Burger] Falha de renderização:", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <section
          style={{
            width: "min(760px, 100%)",
            border: "1px solid #3f3f46",
            borderRadius: "18px",
            padding: "28px",
            background: "#18181b"
          }}
        >
          <p style={{ color: "#f59e0b", fontWeight: 800, marginTop: 0 }}>
            DELIVERY BURGER
          </p>
          <h1 style={{ marginBottom: "12px" }}>O front-end encontrou um erro.</h1>
          <p style={{ color: "#d4d4d8", lineHeight: 1.6 }}>
            A página não ficará mais em branco. Abra o console do navegador para
            consultar o erro técnico completo.
          </p>
          <pre
            style={{
              marginTop: "18px",
              overflow: "auto",
              borderRadius: "12px",
              padding: "14px",
              background: "#09090b",
              color: "#fca5a5",
              whiteSpace: "pre-wrap"
            }}
          >
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "18px",
              border: 0,
              borderRadius: "10px",
              padding: "12px 16px",
              fontWeight: 800,
              cursor: "pointer",
              background: "#f59e0b",
              color: "#18181b"
            }}
          >
            Recarregar aplicação
          </button>
        </section>
      </main>
    );
  }
}
