import "./ProductCard.css";
export default function ProductCard({
  produto,
  onEditar,
  onExcluir,
  onEntrada,
  onSaida
}) {
  const emEstoque = produto.quantidade > 0

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

      <span className={`badge ${emEstoque ? "em-estoque" : "sem-estoque"}`}>
        {emEstoque ? `${produto.quantidade} em estoque` : "Sem estoque"}
      </span>

      {produto.pedidoFeito && (
        <span className="badge pedido-feito">Pedido feito</span>
      )}

      <div className="card-actions">
        <button onClick={() => onEntrada(produto.id)}>Entrada</button>
        <button onClick={() => onSaida(produto.id)} disabled={!emEstoque}>Venda</button>
        <button onClick={() => onEditar(produto)}>Editar</button>
        <button className="danger" onClick={() => onExcluir(produto.id)}>Excluir</button>
      </div>
    </div>
  )
}
