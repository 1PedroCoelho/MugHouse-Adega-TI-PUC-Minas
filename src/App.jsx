import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Estoque from "./Pages/Estoque/Estoque";
import Relatorios from "./Pages/Relatorios/Relatorios";

function App() {
    const [currentPage, setCurrentPage] = useState("home");

    return (
        <>
            <Navbar activeView={currentPage} onNavigate={setCurrentPage} />

            {currentPage === "home" && <Home onNavigate={setCurrentPage} />}

            {(currentPage === "products" || currentPage === "my-products") && <Estoque />}

            {currentPage === "reports" && <Relatorios />}
        </>
    );
}

export default App;
