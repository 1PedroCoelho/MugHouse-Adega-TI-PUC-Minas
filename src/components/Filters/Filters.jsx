import "./Filters.css"
export default function Filters({
  busca,
  setBusca,
  filtroEstoque,
  setFiltroEstoque
}) {
  return (
    <div className="filters">

      <input
        type="text"
        placeholder="Buscar..."
        value={busca}
        onChange={(e) =>
          setBusca(e.target.value)
        }
      />

      <select
        value={filtroEstoque}
        onChange={(e) => setFiltroEstoque(e.target.value)}
      >
        <option value="todos">Todos</option>
        <option value="em-estoque">Em estoque</option>
        <option value="sem-estoque">Sem estoque</option>
      </select>

    </div>
  )
}
