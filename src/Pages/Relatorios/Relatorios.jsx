import { useEffect, useMemo, useState } from "react";
import { produtos as produtosPadrao } from "../../data/produtos";
import { getVendas } from "../../services/vendasService";
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

function carregarProdutos() {
  const produtosSalvos = localStorage.getItem("produtos");
  return produtosSalvos ? hidratarProdutos(JSON.parse(produtosSalvos)) : hidratarProdutos(produtosPadrao);
}

function formatCurrency(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function obterVendas30Dias(vendas) {
  const agora = new Date();
  const trinta_dias_atras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  return vendas.filter((venda) => {
    const dataVenda = new Date(venda.dataVenda);
    return dataVenda >= trinta_dias_atras && dataVenda <= agora;
  });
}

export default function Relatorios() {
  const [produtos, setProdutos] = useState(() => carregarProdutos());
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      
      // Carregar produtos
      setProdutos(carregarProdutos());
      
      // Carregar vendas do JsonBin
      const vendasCarregadas = await getVendas();
      setVendas(vendasCarregadas || []);
      
      setCarregando(false);
    }

    carregarDados();
  }, []);

  // Filtrar vendas dos últimos 30 dias
  const vendas30d = useMemo(() => obterVendas30Dias(vendas), [vendas]);

  // Total vendido (30 dias)
  const totalVendido30d = useMemo(
    () => vendas30d.reduce((total, venda) => total + venda.quantidade, 0),
    [vendas30d]
  );

  // Receita estimada (valor total em estoque)
  const receita30d = useMemo(
    () => produtos.reduce((total, produto) => total + (produto.precoVenda * produto.quantidade), 0),
    [produtos]
  );

  // Produtos mais vendidos (últimos 30 dias)
  const maisVendidos = useMemo(() => {
    const vendidosPorProduto = {};

    vendas30d.forEach((venda) => {
      if (!vendidosPorProduto[venda.produtoId]) {
        vendidosPorProduto[venda.produtoId] = {
          produtoId: venda.produtoId,
          produtoNome: venda.produtoNome,
          quantidade: 0
        };
      }
      vendidosPorProduto[venda.produtoId].quantidade += venda.quantidade;
    });

    return Object.values(vendidosPorProduto)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)
      .map((item) => ({
        id: item.produtoId,
        nome: item.produtoNome,
        vendas30d: item.quantidade
      }));
  }, [vendas30d]);

  // Produtos mais caros (do catálogo)
  const maisCaros = useMemo(
    () => [...produtos].sort((a, b) => b.precoVenda - a.precoVenda).slice(0, 4),
    [produtos]
  );

  // Produtos mais baratos (do catálogo)
  const maisBaratos = useMemo(
    () => [...produtos].sort((a, b) => a.precoVenda - b.precoVenda).slice(0, 4),
    [produtos]
  );

  const maiorPreco = maisCaros[0];
  const menorPreco = maisBaratos[0];

  const vendasMax = Math.max(1, ...maisVendidos.map((produto) => produto.vendas30d || 0));

  if (carregando) {
    return (
      <section className="relatorios-page">
        <header className="relatorios-hero">
          <div>
            <p className="section-label">Relatórios</p>
            <h1>Painel de vendas e entradas</h1>
            <p>Carregando dados...</p>
          </div>
        </header>
      </section>
    );
  }

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
