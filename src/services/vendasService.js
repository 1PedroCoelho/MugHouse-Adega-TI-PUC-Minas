// Configuração do JSONBin para Vendas
const JSONBIN_VENDAS_ID = "6a230a71f5f4af5e29bf0ef8";
const JSONBIN_VENDAS_KEY = "$2a$10$4H5iUzUt4IATWCwga4c7FezjUZWQ5HA8NY.a51KiHorMVjNgqpsfu";
const JSONBIN_VENDAS_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_VENDAS_ID}`;

export async function getVendas() {
  try {
    const response = await fetch(`${JSONBIN_VENDAS_URL}/latest`, {
      headers: {
        "X-Master-Key": JSONBIN_VENDAS_KEY,
      },
    });

    if (!response.ok) throw new Error("Falha ao buscar vendas do JSONBin");

    const data = await response.json();
    // JSONBin retorna { record: [...] } ou { record: { vendas: [...] } }
    return Array.isArray(data.record) ? data.record : (data.record?.vendas || []);
  } catch (error) {
    console.warn("Não foi possível buscar vendas do JSONBin, usando cache local:", error);
    return null;
  }
}

export async function salvarVenda(venda) {
  try {
    // Buscar vendas existentes
    const vendasExistentes = await getVendas();
    
    if (vendasExistentes === null) {
      throw new Error("Não foi possível recuperar vendas existentes");
    }

    // Gerar novo ID único para a venda
    const novoId = vendasExistentes.length > 0 
      ? Math.max(...vendasExistentes.map(v => v.id)) + 1 
      : 1;

    // Criar novo registro de venda com dados completos
    const novaVenda = {
      id: novoId,
      produtoId: venda.produtoId,
      produtoNome: venda.produtoNome,
      quantidade: venda.quantidade,
      precoUnitario: venda.precoUnitario,
      precoCustoUnitario: venda.precoCustoUnitario,
      valorTotal: venda.quantidade * venda.precoUnitario,
      dataVenda: new Date().toISOString()
    };

    // Adicionar nova venda ao histórico
    const vendasAtualizadas = [...vendasExistentes, novaVenda];

    // Salvar no JSONBin
    const response = await fetch(JSONBIN_VENDAS_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_VENDAS_KEY,
      },
      body: JSON.stringify(vendasAtualizadas),
    });

    if (!response.ok) throw new Error("Falha ao salvar venda no JSONBin");

    console.log("Venda salva no JSONBin com sucesso!", novaVenda);
    
    // Salvar também no cache local
    salvarVendasNoCache(vendasAtualizadas);
    
    return {
      sucesso: true,
      mensagem: "Venda registrada com sucesso!",
      venda: novaVenda
    };
  } catch (error) {
    console.error("Erro ao salvar venda:", error);
    return {
      sucesso: false,
      mensagem: "Erro ao registrar venda. Tente novamente.",
      erro: error.message
    };
  }
}

export function getVendasDoCache() {
  try {
    const cached = localStorage.getItem("vendas_jsonbin_cache");
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Erro ao ler cache de vendas:", error);
    return null;
  }
}

export function salvarVendasNoCache(vendas) {
  try {
    localStorage.setItem("vendas_jsonbin_cache", JSON.stringify(vendas));
  } catch (error) {
    console.error("Erro ao salvar cache de vendas:", error);
  }
}