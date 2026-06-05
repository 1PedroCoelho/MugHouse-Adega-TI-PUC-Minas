import "./HeroProjeto.css"

export default function HeroProjeto({ imagem }) {
  function irParaCatalogo() {
    const secaoProdutos = document.getElementById("produtos")

    if (secaoProdutos) {
      secaoProdutos.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }

  return (
    <section className="hero-projeto" aria-labelledby="hero-projeto-titulo">
      <div className="hero-projeto__conteudo">
        <p className="hero-projeto__eyebrow">
        </p>

        <h1 id="hero-projeto-titulo"><span>Seja bem-vindo ao Mug House Adega!</span></h1>

      </div>

      <div className="hero-projeto__visual" aria-label="Imagem demonstrativa do sistema">
        <div className="hero-projeto__mockup">
          <div className="hero-projeto__mockup-barra">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <img
            src={imagem}
            alt="Tela demonstrativa do sistema Mug House Adega"
          />
        </div>
      </div>
    </section>
  )
}
