import "./ProductCard.css";
export default function ProductCard({ produto, onVerDetalhes, onExcluir }) {
  return (
    <div className="card">
      <img
        src={produto.imagem}
        alt={produto.nome}
      />

      <h3>{produto.nome}</h3>

      <p>{produto.categoria}</p>

      {produto.descricao && (
        <p className="descricao-produto">{produto.descricao}</p>
      )}

      <div className="precos">
        <span>Custo: R$ {produto.precoCusto.toFixed(2)}</span>
        <strong>Venda: R$ {produto.precoVenda.toFixed(2)}</strong>
      </div>

      <span className={`badge ${produto.quantidade > 0 ? "em-estoque" : "sem-estoque"}`}>
        {produto.quantidade > 0 ? `${produto.quantidade} em estoque` : "Sem estoque"}
      </span>

      {produto.pedidoFeito && (
        <span className="badge pedido-feito">Pedido feito</span>
      )}

      <div className="card-actions">
        <button type="button" onClick={() => onVerDetalhes(produto)}>
          Ver detalhes
        </button>
        <button type="button" onClick={() => onExcluir(produto.id)} className="btn-excluir">
          Excluir
        </button>
      </div>
    </div>
  )
}
