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
          Projeto academico aplicado ao varejo
        </p>

        <h1 id="hero-projeto-titulo">
          Aplicacao web para
          <span>controle de estoque e</span>
          reposicao automatica
        </h1>

        <p className="hero-projeto__descricao">
          Solucao web desenvolvida para substituir controles manuais de estoque,
          permitindo cadastro de produtos, controle de entradas e saidas,
          monitoramento de estoque e apoio a reposicao automatica.
        </p>

        <div className="hero-projeto__meta" aria-label="Informacoes do projeto">
          <strong>Mug House Adega</strong>
          <span>Controle de Estoque e Reposicao Automatica</span>
        </div>

        <p className="hero-projeto__natureza">
          Projeto academico desenvolvido para aplicacao de conceitos de
          desenvolvimento web, experiencia do usuario, controle de estoque e
          gestao de produtos.
        </p>

        <button className="hero-projeto__botao" onClick={irParaCatalogo}>
          Ver catalogo
        </button>
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
