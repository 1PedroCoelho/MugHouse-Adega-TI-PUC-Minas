import "./Sidebar.css"
export default function Sidebar({ resumo, produtosMaisVendidos, onAdicionar }) {
  return (
    <aside className="sidebar">

      <button onClick={onAdicionar}>
        + Adicionar
      </button>

      <div className="resumo-estoque">
        <span>Produtos</span>
        <strong>{resumo.totalProdutos}</strong>
      </div>

      <div className="resumo-estoque">
        <span>Unidades em estoque</span>
        <strong>{resumo.totalUnidades}</strong>
      </div>

      <div className="resumo-estoque">
        <span>Valor de venda</span>
        <strong>R$ {resumo.valorVenda.toFixed(2)}</strong>
      </div>

      <h3>Mais vendidos</h3>

      {produtosMaisVendidos.length === 0 ? (
        <p className="vazio">Nenhuma venda registrada.</p>
      ) : (
        produtosMaisVendidos.map((produto) => (
          <div className="mais-vendidos" key={produto.id}>
            <span>{produto.nome}</span>
            <strong>{produto.vendas} vendas</strong>
          </div>
        ))
      )}

    </aside>
  )
}
