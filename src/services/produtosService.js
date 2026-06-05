// Configuração do JSONBin (atualize com seus dados)
const JSONBIN_ID = "6a21f31dda38895dfe890447"; // Seu ID do bin
const JSONBIN_KEY = "$2a$10$C8Gd.lDG8n41SuN9mhADSOBLPplIWnyD/BPy80O2c1cjmvfW5KSkW"; // Sua Master Key
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

export async function getProdutosDoJsonBin() {
  try {
    const response = await fetch(`${JSONBIN_URL}/latest`, {
      headers: {
        "X-Master-Key": JSONBIN_KEY,
      },
    });

    if (!response.ok) throw new Error("Falha ao buscar dados do JSONBin");

    const data = await response.json();
    // JSONBin retorna { record: { produtos: [...] } }
    return data.record?.produtos || [];
  } catch (error) {
    console.warn("Não foi possível buscar do JSONBin, usando cache local:", error);
    return null;
  }
}

export async function salvarProdutosNoJsonBin(produtos) {
  try {
    const response = await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY,
      },
      // Salva no formato que JSONBin espera: { produtos: [...] }
      body: JSON.stringify({ produtos: Array.isArray(produtos) ? produtos : produtos.produtos || [] }),
    });

    if (!response.ok) throw new Error("Falha ao salvar dados no JSONBin");

    console.log("Produtos salvos no JSONBin com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao salvar no JSONBin:", error);
    return false;
  }
}

export function getProdutosDoCache() {
  try {
    const cached = localStorage.getItem("produtos_jsonbin_cache");
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Erro ao ler cache:", error);
    return null;
  }
}

export function salvarProdutosNoCache(produtos) {
  try {
    // Salva no cache no mesmo formato do JSONBin: { produtos: [...] }
    const dadosACache = Array.isArray(produtos) ? { produtos } : produtos;
    localStorage.setItem("produtos_jsonbin_cache", JSON.stringify(dadosACache));
  } catch (error) {
    console.error("Erro ao salvar cache:", error);
  }
}
