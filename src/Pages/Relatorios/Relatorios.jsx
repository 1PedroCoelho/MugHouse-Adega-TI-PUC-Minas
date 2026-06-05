import { useEffect, useMemo, useState } from "react";
import { produtos as produtosPadrao } from "../../data/produtos";
import "./Relatorios.css";

function hidratarProdutos(produtosSalvos) {
  const produtosArray = Array.isArray(produtosSalvos) ? produtosSalvos : (produtosSalvos?.produtos || []);

  return produtosArray.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    precoCusto: produto.precoCusto,
    precoVenda: produto.precoVenda,
    quantidade: produto.quantidade,
    categoria: produto.categoria,
    imagem: produto.imagem,
    descricao: produto.descricao ?? "",
    vendas: produto.vendas ?? 0,
    vendas30d: produto.vendas30d ?? produto.vendas ?? 0,
    pedidoFeito: produto.pedidoFeito ?? produto.quantidade === 0,
    entrada: produto.entrada ?? null
  }));
}

function carregarRelatorios() {
  const produtosSalvos = localStorage.getItem("produtos");
  return produtosSalvos ? hidratarProdutos(JSON.parse(produtosSalvos)) : hidratarProdutos(produtosPadrao);
}

function formatCurrency(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Relatorios() {
  const [produtos, setProdutos] = useState(() => carregarRelatorios());

  useEffect(() => {
    setProdutos(carregarRelatorios());
  }, []);

  const totalVendido30d = useMemo(
    () => produtos.reduce((total, produto) => total + (produto.vendas30d || 0), 0),
    [produtos]
  );

  const receita30d = useMemo(
    () => produtos.reduce((total, produto) => total + (produto.vendas30d || 0) * produto.precoVenda, 0),
    [produtos]
  );

  const maisVendidos = useMemo(
    () => [...produtos].sort((a, b) => (b.vendas30d || 0) - (a.vendas30d || 0)).slice(0, 5),
    [produtos]
  );

  const maisCaros = useMemo(
    () => [...produtos].sort((a, b) => b.precoVenda - a.precoVenda).slice(0, 4),
    [produtos]
  );

  const maisBaratos = useMemo(
    () => [...produtos].sort((a, b) => a.precoVenda - b.precoVenda).slice(0, 4),
    [produtos]
  );

  const maiorPreco = maisCaros[0];
  const menorPreco = maisBaratos[0];

  const vendasMax = Math.max(1, ...maisVendidos.map((produto) => produto.vendas30d || 0));

  return (
    <section className="relatorios-page">
      <header className="relatorios-hero">
        <div>
          <p className="section-label">Relatórios</p>
          <h1>Painel de vendas e entradas</h1>
          <p>Veja os produtos mais vendidos, os preços mais altos e as entradas de estoque em um único lugar.</p>
        </div>
      </header>

      <div className="relatorios-grid">
        <article className="relatorio-card relatorio-summary">
          <h2>Resumo do mês</h2>
          <div className="relatorio-summary-grid">
            <div>
              <span>Total vendido (30 dias)</span>
              <strong>{totalVendido30d} unidades</strong>
            </div>
            <div>
              <span>Receita estimada</span>
              <strong>{formatCurrency(receita30d)}</strong>
            </div>
            <div>
              <span>Produtos cadastrados</span>
              <strong>{produtos.length}</strong>
            </div>
            <div>
              <span>Pedidos em falta</span>
              <strong>{produtos.filter((p) => p.pedidoFeito).length}</strong>
            </div>
          </div>
        </article>

        <article className="relatorio-card">
          <h2>Pedidos mais vendidos</h2>
          <div className="relatorio-bars">
            {maisVendidos.map((produto) => {
              const percent = Math.round(((produto.vendas30d || 0) / vendasMax) * 100);
              return (
                <div key={produto.id} className="bar-item">
                  <div className="bar-meta">
                    <strong>{produto.nome}</strong>
                    <span>{produto.vendas30d || 0} vendas</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="relatorio-card">
          <h2>Produtos mais caros</h2>
          <ol className="produto-rank">
            {maisCaros.map((produto) => (
              <li key={produto.id}>
                <span>{produto.nome}</span>
                <strong>{formatCurrency(produto.precoVenda)}</strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="relatorio-card">
          <h2>Produtos mais baratos</h2>
          <ol className="produto-rank">
            {maisBaratos.map((produto) => (
              <li key={produto.id}>
                <span>{produto.nome}</span>
                <strong>{formatCurrency(produto.precoVenda)}</strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="relatorio-card relatorio-highlight">
          <h2>Preço mais alto</h2>
          {maiorPreco ? (
            <div className="highlight-card">
              <strong>{maiorPreco.nome}</strong>
              <p>{formatCurrency(maiorPreco.precoVenda)} por unidade</p>
            </div>
          ) : (
            <p>Sem dados de preço.</p>
          )}
        </article>

        <article className="relatorio-card relatorio-highlight">
          <h2>Preço mais baixo</h2>
          {menorPreco ? (
            <div className="highlight-card">
              <strong>{menorPreco.nome}</strong>
              <p>{formatCurrency(menorPreco.precoVenda)} por unidade</p>
            </div>
          ) : (
            <p>Sem dados de preço.</p>
          )}
        </article>

        <article className="relatorio-card relatorio-entrada-card">
          <h2>Data de entrada</h2>
          <p>Registre a entrada de produtos no estoque para capturar a data de chegada.</p>
          <div className="entrada-list">
            {produtos.map((produto) => (
              <div key={produto.id} className="entrada-item">
                <span>{produto.nome}</span>
                <strong>{produto.entrada ? new Date(produto.entrada).toLocaleDateString("pt-BR") : "Não registrada"}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
