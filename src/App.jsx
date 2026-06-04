import Header from "./components/Header/Header";
import HeroProjeto from "./components/HeroProjeto/HeroProjeto";
import Estoque from "./Pages/Estoque/Estoque";

function App() {
    const screenshotSistema = "/screenshot-sistema.png";

    return (
        <>
            <Header />
            <HeroProjeto imagem={screenshotSistema} />
            <Estoque />
        </>
    );
}

export default App;
