import "./Header.css";

export default function Header() {
    function recarregarPagina() {
        window.location.reload();
    }

    return (
        <header className="header">
            <button className="header-logo" onClick={recarregarPagina}>
                MUG HOUSE ADEGA
            </button>
            <span>Controle de Estoque</span>
        </header>
    );
}
