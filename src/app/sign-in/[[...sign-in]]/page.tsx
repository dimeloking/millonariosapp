import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="login">
      <section className="login-left" aria-label="Resumen de Divisas">
        <div className="login-brand">
          <div className="brand-mark">D</div>
          <div>
            <div className="serif" style={{ fontSize: 20, lineHeight: 1 }}>
              Divisas
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "#5a5f68",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Gestión de envíos
            </div>
          </div>
        </div>

        <div className="login-hero">
          <div className="eyebrow">COP · USD · AWG</div>
          <h1>
            Tus envíos,
            <br />
            tus <em>números</em>,
            <br />
            un solo lugar.
          </h1>
          <p>
            Registra ventas en pesos y deja que la conversión a dólares, florines y ganancias se
            calcule sola.
          </p>
        </div>

        <div className="login-ticker">
          <div>
            <span className="label">COP / USD</span>
            <span className="val up">↑ 3,680.00</span>
          </div>
          <div>
            <span className="label">USD / AWG</span>
            <span className="val">1.7500</span>
          </div>
          <div>
            <span className="label">Estipulado</span>
            <span className="val">3,153.15</span>
          </div>
          <div>
            <span className="label">Ganancia mes</span>
            <span className="val up">$52.29M</span>
          </div>
        </div>
      </section>

      <section className="login-right" aria-label="Iniciar sesión">
        <SignInForm />
      </section>
    </main>
  );
}
