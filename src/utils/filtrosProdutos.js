export const FILTROS_INICIAIS = {
  busca: "",
  palavraChave: "",
  preco: [0, 200],
  situacoes: []
}

export function normalizarTexto(valor = "") {
  return String(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function filtrarProdutos(produtos, filtros) {
  const busca = normalizarTexto(filtros.busca)
  const palavraChave = normalizarTexto(filtros.palavraChave)
  const [precoMin, precoMax] = filtros.preco

  return produtos.filter((produto) => {
    const textoProduto = normalizarTexto(
      [
        produto.nome,
        produto.categoria,
        produto.descricao
      ].filter(Boolean).join(" ")
    )

    const combinaBusca = !busca || textoProduto.includes(busca)
    const combinaPalavraChave = !palavraChave || textoProduto.includes(palavraChave)
    const precoVenda = Number(produto.precoVenda || 0)
    const combinaPreco = precoVenda >= precoMin && precoVenda <= precoMax
    const combinaSituacao = filtrarPorSituacao(produto, filtros.situacoes)

    return combinaBusca && combinaPalavraChave && combinaPreco && combinaSituacao
  })
}

export function filtrarPorSituacao(produto, situacoes) {
  if (!situacoes.length) {
    return true
  }

  return situacoes.some((situacao) => {
    if (situacao === "em-estoque") {
      return produto.quantidade > 0
    }

    if (situacao === "esgotado") {
      return produto.quantidade === 0
    }

    if (situacao === "pedido-feito") {
      return Boolean(produto.pedidoFeito)
    }

    return true
  })
}

export function obterMaisVendidos30d(produtos, limite = 3) {
  return [...produtos]
    .filter((produto) => Number(produto.vendas30d || produto.vendas || 0) > 0)
    .sort((a, b) => Number(b.vendas30d || b.vendas || 0) - Number(a.vendas30d || a.vendas || 0))
    .slice(0, limite)
}

export function calcularLimitePreco(produtos, minimo = 200) {
  const maiorPreco = produtos.reduce((maior, produto) => {
    return Math.max(maior, Number(produto.precoVenda || 0))
  }, 0)

  return Math.max(minimo, Math.ceil(maiorPreco / 10) * 10)
}
