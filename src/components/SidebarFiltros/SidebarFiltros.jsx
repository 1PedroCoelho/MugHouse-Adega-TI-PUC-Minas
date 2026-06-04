import { useMemo, useState } from "react"
import "./SidebarFiltros.css"

const SITUACOES = [
  { valor: "em-estoque", label: "Em estoque" },
  { valor: "esgotado", label: "Esgotado" },
  { valor: "pedido-feito", label: "Pedido feito" }
]

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  })
}

export default function SidebarFiltros({
  filtros,
  precoLimite,
  produtosMaisVendidos,
  onFiltrosChange,
  onLimparFiltros,
  onAdicionar,
  onRelatorio
}) {
  const [arrastando, setArrastando] = useState(null)
  const [precoMin, precoMax] = filtros.preco

  const rangeStyle = useMemo(() => {
    const menor = (precoMin / precoLimite) * 100
    const maior = (precoMax / precoLimite) * 100

    return {
      "--range-start": `${menor}%`,
      "--range-end": `${maior}%`
    }
  }, [precoLimite, precoMax, precoMin])

  function atualizarFiltro(campo, valor) {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    })
  }

  function atualizarPreco(tipo, valor) {
    const numero = Number(valor)

    if (tipo === "min") {
      atualizarFiltro("preco", [Math.min(numero, precoMax), precoMax])
      return
    }

    atualizarFiltro("preco", [precoMin, Math.max(numero, precoMin)])
  }

  function alternarSituacao(valor) {
    const marcada = filtros.situacoes.includes(valor)
    const proximasSituacoes = marcada
      ? filtros.situacoes.filter((situacao) => situacao !== valor)
      : [...filtros.situacoes, valor]

    atualizarFiltro("situacoes", proximasSituacoes)
  }

  return (
    <aside className="sidebar-filtros">
      <div className="sidebar-filtros__acoes">
        <button className="sidebar-filtros__adicionar" onClick={onAdicionar}>
          + Adicionar
        </button>

        <button className="sidebar-filtros__limpar" onClick={onLimparFiltros}>
          Remover filtros
        </button>
      </div>

      <section className="sidebar-filtros__bloco">
        <div className="sidebar-filtros__cabecalho">
          <h3>Performance</h3>
          <span>30 dias</span>
        </div>

        <div className="performance-lista">
          {produtosMaisVendidos.length === 0 ? (
            <p className="sidebar-filtros__vazio">Nenhuma venda registrada.</p>
          ) : (
            produtosMaisVendidos.map((produto) => (
              <article className="performance-card" key={produto.id}>
                <img src={produto.imagem} alt={produto.nome} />

                <div>
                  <h4>{produto.nome}</h4>
                  <p>{produto.vendas30d || produto.vendas || 0} vendas em 30 dias</p>
                  <button onClick={() => onRelatorio(produto)}>
                    Relatorio
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="sidebar-filtros__bloco">
        <h3>Palavra-chave</h3>
        <input
          type="search"
          placeholder="Nenhuma"
          value={filtros.palavraChave}
          onChange={(event) => atualizarFiltro("palavraChave", event.target.value)}
        />
      </section>

      <section className="sidebar-filtros__bloco">
        <div className="sidebar-filtros__cabecalho">
          <h3>Preco</h3>
          <span>
            {formatarMoeda(precoMin)} - {formatarMoeda(precoMax)}
          </span>
        </div>

        <div
          className={`range-duplo ${arrastando ? "is-dragging" : ""}`}
          style={rangeStyle}
        >
          <input
            type="range"
            min="0"
            max={precoLimite}
            step="1"
            value={precoMin}
            onMouseDown={() => setArrastando("min")}
            onMouseUp={() => setArrastando(null)}
            onChange={(event) => atualizarPreco("min", event.target.value)}
            aria-label="Preco minimo"
          />

          <input
            type="range"
            min="0"
            max={precoLimite}
            step="1"
            value={precoMax}
            onMouseDown={() => setArrastando("max")}
            onMouseUp={() => setArrastando(null)}
            onChange={(event) => atualizarPreco("max", event.target.value)}
            aria-label="Preco maximo"
          />
        </div>

        <div className="range-valores">
          <span>{formatarMoeda(0)}</span>
          <span>{formatarMoeda(precoLimite)}</span>
        </div>
      </section>

      <section className="sidebar-filtros__bloco">
        <h3>Situacao</h3>

        <div className="situacoes-lista">
          {SITUACOES.map((situacao) => (
            <label className="situacao-opcao" key={situacao.valor}>
              <input
                type="checkbox"
                checked={filtros.situacoes.includes(situacao.valor)}
                onChange={() => alternarSituacao(situacao.valor)}
              />
              <span>{situacao.label}</span>
            </label>
          ))}
        </div>
      </section>
    </aside>
  )
}
