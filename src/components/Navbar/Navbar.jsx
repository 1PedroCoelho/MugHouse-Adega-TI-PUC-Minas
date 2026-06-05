import "./Navbar.css";

export default function Navbar({ activeView, onNavigate }) {
  const handleNavigation = (view) => {
    onNavigate(view);
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand" onClick={() => handleNavigation("home")}> 
          <div className="brand-mark">🏠︎</div>
          <div>
            <p className="eyebrow">MUG HOUSE ADEGA</p>
            <h1>Controle de estoque e reposição automática</h1>
          </div>
        </div>
        <nav className="main-nav">
          <button
            className={`nav-btn ${activeView === "home" ? "active" : ""}`}
            data-view="home"
            onClick={() => handleNavigation("home")}
          >
            Início
          </button>
          <button
            className={`nav-btn ${activeView === "my-products" ? "active" : ""}`}
            data-view="my-products"
            onClick={() => handleNavigation("my-products")}
          >
            Meus produtos
          </button>
          <button
            className={`nav-btn ${activeView === "reports" ? "active" : ""}`}
            data-view="reports"
            onClick={() => handleNavigation("reports")}
          >
            Relatórios
          </button>
        </nav>
      </header>
    </div>
  );
}
