import { useEffect, useMemo, useState } from "react"
import "./ModalVenda.css"

export default function ModalVenda({
  produto,
  isOpen,
  onClose,
  onConfirm
}) {
  const [quantidade, setQuantidade] = useState(1)
  const [erro, setErro] = useState("")

  const total = useMemo(() => {
    if (!produto) {
      return 0
    }

    return quantidade * produto.precoVenda
  }, [produto, quantidade])

  useEffect(() => {
    function fecharComEsc(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", fecharComEsc)
    }

    return () => {
      document.removeEventListener("keydown", fecharComEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen || !produto) {
    return null
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  function alterarQuantidade(valor) {
    const novaQuantidade = Number(valor)

    if (novaQuantidade < 1) {
      setQuantidade(1)
      setErro("A quantidade minima para venda e 1 unidade.")
      return
    }

    if (novaQuantidade > produto.quantidade) {
      setQuantidade(produto.quantidade)
      setErro("Quantidade maior do que o estoque disponivel.")
      return
    }

    setQuantidade(novaQuantidade)
    setErro("")
  }

  function diminuirQuantidade() {
    alterarQuantidade(quantidade - 1)
  }

  function aumentarQuantidade() {
    alterarQuantidade(quantidade + 1)
  }

  function confirmarVenda() {
    if (quantidade > produto.quantidade) {
      setErro("Quantidade maior do que o estoque disponivel.")
      return
    }

    onConfirm(produto.id, quantidade)
    onClose()
  }

  function fecharAoClicarFora(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-venda-overlay" onMouseDown={fecharAoClicarFora}>
      <section
        className="modal-venda"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-venda-titulo"
      >
        <header className="modal-venda-header">
          <h2 id="modal-venda-titulo">Registrar Venda</h2>
          <button
            type="button"
            className="modal-venda-fechar"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            X
          </button>
        </header>

        <img
          className="modal-venda-imagem"
          src={produto.imagem}
          alt={produto.nome}
        />

        <div className="modal-venda-info">
          <p>
            <span>Produto</span>
            <strong>{produto.nome}</strong>
          </p>

          <p>
            <span>Estoque atual</span>
            <strong>{produto.quantidade} unidades</strong>
          </p>

          <p>
            <span>Valor unitario</span>
            <strong>{formatarMoeda(produto.precoVenda)}</strong>
          </p>
        </div>

        <div className="modal-venda-quantidade">
          <label htmlFor="quantidade-venda">Quantidade</label>

          <div className="controle-quantidade">
            <button
              type="button"
              onClick={diminuirQuantidade}
              disabled={quantidade <= 1}
            >
              -
            </button>

            <input
              id="quantidade-venda"
              type="number"
              min="1"
              max={produto.quantidade}
              value={quantidade}
              onChange={(event) => alterarQuantidade(event.target.value)}
            />

            <button
              type="button"
              onClick={aumentarQuantidade}
              disabled={quantidade >= produto.quantidade}
            >
              +
            </button>
          </div>

          {erro && <span className="modal-venda-erro">{erro}</span>}
        </div>

        <div className="modal-venda-total">
          <span>Total</span>
          <strong>{formatarMoeda(total)}</strong>
        </div>

        <footer className="modal-venda-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="button"
            className="confirmar"
            onClick={confirmarVenda}
          >
            Confirmar Venda
          </button>
        </footer>
      </section>
    </div>
  )
}
