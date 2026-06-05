import { useEffect, useState } from "react";
import HeroProjeto from "../HeroProjeto/HeroProjeto";
import "./Home.css";
import { getProdutosDoJsonBin, getProdutosDoCache } from "../../services/produtosService";

function HomeProductCard({ produto, destaque }) {
  return (
    <article className={`home-card ${destaque ? "destaque-card" : ""}`}>
      <img src={produto.imagem} alt={produto.nome} loading="lazy" />
      <div className="home-card-body">
        <span className="home-card-category">
          {destaque ? "🌟" : "📌"} {produto.categoria}
        </span>
        <h3>{produto.nome}</h3>
        <p>{produto.descricao}</p>
        <div className="home-card-meta">
          <strong>R$ {produto.precoVenda.toFixed(2)}</strong>
          <span>{produto.quantidade} em estoque</span>
        </div>
      </div>
    </article>
  );
}

export default function Home({ onNavigate }) {
  const muhhouselogo = "/muhhouselogo.jpg";
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar produtos do JSONBin ao montar o componente
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const produtosJsonBin = await getProdutosDoJsonBin();
        
        if (produtosJsonBin && produtosJsonBin.length > 0) {
          setProdutos(produtosJsonBin);
        } else {
          // Fallback para cache
          const produtosCache = getProdutosDoCache();
          if (produtosCache) {
            const produtosArray = Array.isArray(produtosCache) ? produtosCache : (produtosCache?.produtos || []);
            setProdutos(produtosArray);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar produtos para Home:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  // Calcular produtos principais, mais vendidos, etc.
  const principaisProdutos = produtos.slice(0, 4);
  const produtosMaisVendidos = [...produtos]
    .sort((a, b) => (b.vendas || 0) - (a.vendas || 0))
    .slice(0, 3);
  const produtoDestaque = produtosMaisVendidos[0];

  if (carregando) {
    return <div className="home-page"><p>Carregando produtos...</p></div>;
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <HeroProjeto imagem={muhhouselogo} />
      </section>

      <section className="home-section home-destaque-section">
        <div className="home-section-header">
          <span>⭐ Destaque</span>
          <h2>Produto mais famoso do estoque</h2>
        </div>

        {produtoDestaque && (
          <div className="home-destaque-card">
            <img src={produtoDestaque.imagem} alt={produtoDestaque.nome} />
            <div className="home-destaque-content">
              <span className="home-badge">🔥 Mais vendido</span>
              <h3>{produtoDestaque.nome}</h3>
              <p>{produtoDestaque.descricao}</p>
              <div className="home-destaque-info">
                <span>Categoria: {produtoDestaque.categoria}</span>
                <strong>R$ {produtoDestaque.precoVenda.toFixed(2)}</strong>
              </div>
              <button type="button" onClick={() => onNavigate("my-products")}>Ver meus produtos</button>
            </div>
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <span>🔥 Principais produtos</span>
          <h2>Os produtos com maior destaque na adega</h2>
        </div>

        <div className="home-grid">
          {principaisProdutos.map((produto) => (
            <HomeProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <span>🏆 Mais vendidos</span>
          <h2>Os produtos com maior saída</h2>
        </div>

        <div className="home-grid">
          {produtosMaisVendidos.map((produto) => (
            <HomeProductCard key={produto.id} produto={produto} destaque />
          ))}
        </div>
      </section>
    </div>
  );
}
