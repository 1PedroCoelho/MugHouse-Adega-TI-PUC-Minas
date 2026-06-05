import { useEffect, useMemo, useState } from "react"
import { produtos } from "../../data/produtos"
import "./Estoque.css";
import SidebarFiltros from "../../components/SidebarFiltros/SidebarFiltros"
import ProductCard from "../../components/ProductCard/ProductCard"
import ModalVenda from "../../components/ModalVenda/ModalVenda"
import {
  FILTROS_INICIAIS,
  calcularLimitePreco,
  filtrarProdutos,
  obterMaisVendidos30d
} from "../../utils/filtrosProdutos"
import {
  getProdutosDoJsonBin,
  getProdutosDoCache,
  salvarProdutosNoCache,
  salvarProdutosNoJsonBin
} from "../../services/produtosService"

const produtoInicial = {
  nome: "",
  categoria: "",
  precoCusto: "",
  precoVenda: "",
  quantidade: "",
  imagem: "",
  descricao: ""
}

function hidratarProdutos(produtosSalvos) {
  // Se receber um array, processa normalmente
  // Se receber um objeto com chave 'produtos', extrai o array
  const produtosArray = Array.isArray(produtosSalvos) ? produtosSalvos : (produtosSalvos?.produtos || [])
  
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
    pedidoFeito: produto.pedidoFeito ?? produto.quantidade === 0
  }))
}

export default function Estoque() {

  const [listaProdutos, setListaProdutos] = useState(() => {
    const produtosSalvos = localStorage.getItem("produtos")
    return produtosSalvos ? hidratarProdutos(JSON.parse(produtosSalvos)) : produtos
  })
  const [carregando, setCarregando] = useState(true)
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [formulario, setFormulario] = useState(produtoInicial)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [formAberto, setFormAberto] = useState(false)
  const [view, setView] = useState("list")
  const [produtoVenda, setProdutoVenda] = useState(null)
  const [modalVendaKey, setModalVendaKey] = useState(0)

  // Carregar dados do JSONBin ou cache
  useEffect(() => {
    async function carregarProdutos() {
      setCarregando(true)
      try {
        // Tenta buscar do JSONBin
        const produtosJsonBin = await getProdutosDoJsonBin()
        
        if (produtosJsonBin) {
          setListaProdutos(hidratarProdutos(produtosJsonBin))
          salvarProdutosNoCache(produtosJsonBin)
        } else {
          // Se falhar, tenta usar o cache
          const produtosCache = getProdutosDoCache()
          if (produtosCache) {
            setListaProdutos(hidratarProdutos(produtosCache))
          }
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarProdutos()
  }, [])

  useEffect(() => {
    localStorage.setItem("produtos", JSON.stringify(listaProdutos))
    // Também tenta salvar no JSONBin
    salvarProdutosNoJsonBin(listaProdutos)
  }, [listaProdutos])

  const precoLimite = useMemo(() => {
    return calcularLimitePreco(listaProdutos)
  }, [listaProdutos])

  const filtrosComPrecoValido = useMemo(() => {
    return {
      ...filtros,
      preco: [
        Math.min(filtros.preco[0], precoLimite),
        Math.min(filtros.preco[1], precoLimite)
      ]
    }
  }, [filtros, precoLimite])

  const produtosFiltrados = useMemo(() => {
    return filtrarProdutos(listaProdutos, filtrosComPrecoValido)
  }, [filtrosComPrecoValido, listaProdutos])

  const produtosMaisVendidos = useMemo(() => {
    return obterMaisVendidos30d(listaProdutos, 3)
  }, [listaProdutos])

  function limparFiltros() {
    setFiltros({
      ...FILTROS_INICIAIS,
      preco: [0, precoLimite]
    })
  }

  function abrirCadastro() {
    setFormulario(produtoInicial)
    setProdutoEditando(null)
    setFormAberto(true)
  }

  function abrirEdicao(produto) {
    setFormulario({
      nome: produto.nome,
      categoria: produto.categoria,
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda,
      quantidade: produto.quantidade,
      imagem: produto.imagem,
      descricao: produto.descricao || ""
    })
    setProdutoEditando(produto.id)
    setFormAberto(true)
    setView("edit-page")
  }

  function fecharFormulario() {
    setFormulario(produtoInicial)
    setProdutoEditando(null)
    setFormAberto(false)
    setView("list")
  }

  function atualizarCampo(campo, valor) {
    setFormulario((formAtual) => ({
      ...formAtual,
      [campo]: valor
    }))
  }

  function salvarProduto(event) {
    event.preventDefault()

    const produtoFormatado = {
      nome: formulario.nome.trim(),
      categoria: formulario.categoria.trim(),
      precoCusto: Number(formulario.precoCusto),
      precoVenda: Number(formulario.precoVenda),
      quantidade: Number(formulario.quantidade),
      imagem: formulario.imagem.trim() || "https://images.unsplash.com/photo-1606765962248-7ff407b51667",
      descricao: formulario.descricao?.trim() || "",
      pedidoFeito: Number(formulario.quantidade) === 0
    }

    if (produtoEditando) {
      setListaProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === produtoEditando
            ? { ...produto, ...produtoFormatado }
            : produto
        )
      )
    } else {
      setListaProdutos((produtosAtuais) => [
        ...produtosAtuais,
        {
          id: Date.now(),
          vendas: 0,
          vendas30d: 0,
          ...produtoFormatado
        }
      ])
    }

    fecharFormulario()
  }

  function excluirProduto(id) {
    const confirmou = window.confirm("Deseja excluir este produto?")

    if (confirmou) {
      setListaProdutos((produtosAtuais) =>
        produtosAtuais.filter((produto) => produto.id !== id)
      )
    }
  }

  function registrarEntrada(id) {
    const quantidade = Number(window.prompt("Quantidade de entrada:", "1"))

    if (quantidade > 0) {
      setListaProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === id
            ? { ...produto, quantidade: produto.quantidade + quantidade, pedidoFeito: false }
            : produto
        )
      )
    }
  }

  function abrirModalVenda(id) {
    const produtoSelecionado = listaProdutos.find((produto) => produto.id === id)

    if (produtoSelecionado) {
      setProdutoVenda(produtoSelecionado)
      setModalVendaKey((keyAtual) => keyAtual + 1)
    }
  }

  function fecharModalVenda() {
    setProdutoVenda(null)
  }

  function confirmarVenda(id, quantidade) {
    setListaProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              quantidade: produto.quantidade - quantidade,
              vendas: (produto.vendas || 0) + quantidade,
              vendas30d: (produto.vendas30d || produto.vendas || 0) + quantidade,
              pedidoFeito: produto.quantidade - quantidade === 0 ? true : produto.pedidoFeito
            }
          : produto
      )
    )
  }

  function abrirRelatorioProduto(produto) {
    window.alert(
      `${produto.nome}\n${produto.vendas30d || produto.vendas || 0} vendas em 30 dias\nEstoque atual: ${produto.quantidade}`
    )
  }

  return (
    <div className="estoque-container" id="produtos">

{view === "list" && (
          <SidebarFiltros
            filtros={filtrosComPrecoValido}
            precoLimite={precoLimite}
            produtosMaisVendidos={produtosMaisVendidos}
            onFiltrosChange={setFiltros}
            onLimparFiltros={limparFiltros}
            onAdicionar={abrirCadastro}
            onRelatorio={abrirRelatorioProduto}
          />
        )}

      <main>

        {view === "list" && (
          <section className="estoque-topo">
            <div>
              <h1>Meus produtos</h1>
              <p>Cadastre produtos, registre entradas e controle vendas.</p>
            </div>
          </section>
        )}

        {view === "edit-page" && formAberto && (
          <div className="detalhes-header" style={{ marginBottom: "18px" }}>
            <div>
              <h2>Editar produto</h2>
              <p>{formulario.categoria}</p>
            </div>
            <button type="button" onClick={fecharFormulario}>
              Voltar para produtos
            </button>
          </div>
        )}

        {formAberto && view === "edit-page" ? (
          <div className="produto-edit-card">
            <div className="produto-edit-card__visual">
              <img
                src={formulario.imagem || "https://images.unsplash.com/photo-1606765962248-7ff407b51667"}
                alt={formulario.nome || "Produto em edição"}
              />
            </div>

            <form className="produto-form produto-form--edit" onSubmit={salvarProduto}>
              <h2>{produtoEditando ? "Editar produto" : "Cadastrar produto"}</h2>

              <label>
                Nome
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  type="text"
                  value={formulario.categoria}
                  onChange={(e) => atualizarCampo("categoria", e.target.value)}
                  required
                />
              </label>

              <label>
                Preco de custo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precoCusto}
                  onChange={(e) => atualizarCampo("precoCusto", e.target.value)}
                  required
                />
              </label>

              <label>
                Preco de venda
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precoVenda}
                  onChange={(e) => atualizarCampo("precoVenda", e.target.value)}
                  required
                />
              </label>

              <label>
                Quantidade
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formulario.quantidade}
                  onChange={(e) => atualizarCampo("quantidade", e.target.value)}
                  required
                />
              </label>

              <label>
                Imagem
                <input
                  type="url"
                  value={formulario.imagem}
                  onChange={(e) => atualizarCampo("imagem", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="form-full">
                Descricao
                <input
                  type="text"
                  value={formulario.descricao || ""}
                  onChange={(e) => atualizarCampo("descricao", e.target.value)}
                  placeholder="Resumo opcional do produto"
                />
              </label>

              <div className="form-actions">
                <button type="submit">
                  {produtoEditando ? "Salvar alteracoes" : "Cadastrar"}
                </button>
                <button type="button" onClick={fecharFormulario}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : formAberto ? (
          <form className="produto-form" onSubmit={salvarProduto}>
            <h2>{produtoEditando ? "Editar produto" : "Cadastrar produto"}</h2>

            <label>
              Nome
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                required
              />
            </label>

            <label>
              Categoria
              <input
                type="text"
                value={formulario.categoria}
                onChange={(e) => atualizarCampo("categoria", e.target.value)}
                required
              />
            </label>

            <label>
              Preco de custo
              <input
                type="number"
                min="0"
                step="0.01"
                value={formulario.precoCusto}
                onChange={(e) => atualizarCampo("precoCusto", e.target.value)}
                required
              />
            </label>

            <label>
              Preco de venda
              <input
                type="number"
                min="0"
                step="0.01"
                value={formulario.precoVenda}
                onChange={(e) => atualizarCampo("precoVenda", e.target.value)}
                required
              />
            </label>

            <label>
              Quantidade
              <input
                type="number"
                min="0"
                step="1"
                value={formulario.quantidade}
                onChange={(e) => atualizarCampo("quantidade", e.target.value)}
                required
              />
            </label>

            <label>
              Imagem
              <input
                type="url"
                value={formulario.imagem}
                onChange={(e) => atualizarCampo("imagem", e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="form-full">
              Descricao
              <input
                type="text"
                value={formulario.descricao || ""}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
                placeholder="Resumo opcional do produto"
              />
            </label>

            <div className="form-actions">
              <button type="submit">
                {produtoEditando ? "Salvar alteracoes" : "Cadastrar"}
              </button>
              <button type="button" onClick={fecharFormulario}>
                Cancelar
              </button>
            </div>
          </form>
        ) : null}


        {view === "list" && (
          <>
            <div className="resultado-filtros">
              <strong>{produtosFiltrados.length}</strong>
              <span>
                {produtosFiltrados.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </span>
            </div>
          </>
        )}

        {view === "list" ? (
          produtosFiltrados.length === 0 ? (
            <div className="estado-vazio">
              Nenhum produto encontrado.
            </div>
          ) : (
            <div className="grid-produtos">
              {produtosFiltrados.map(produto => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                  onVerDetalhes={abrirEdicao}
                  onExcluir={excluirProduto}
                />
              ))}
            </div>
          )
        ) : null}

      </main>

      <ModalVenda
        key={modalVendaKey}
        produto={produtoVenda}
        isOpen={Boolean(produtoVenda)}
        onClose={fecharModalVenda}
        onConfirm={confirmarVenda}
      />

    </div>
  )
}
