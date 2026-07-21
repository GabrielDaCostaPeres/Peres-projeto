/**
 * refresh-products.js
 * -------------------------------------------------------------------------
 * Roda automaticamente a cada hora (ver netlify.toml) e também pode ser
 * chamada manualmente em /.netlify/functions/refresh-products.
 *
 * O que faz:
 *   1. Lê o refresh_token salvo (gerado pelo oauth-callback.js).
 *   2. Renova o access_token (e salva o novo refresh_token, que o ML gira
 *      a cada uso).
 *   3. Para cada produto com "mlItemId" preenchido em product-config.js,
 *      busca título, preço e imagem REAIS na API oficial do Mercado Livre.
 *   4. Salva o resultado em cache (Netlify Blobs) para a função
 *      get-products.js servir rapidamente ao site.
 * -------------------------------------------------------------------------
 */
const { getStore } = require("@netlify/blobs");
const { PRODUCTS } = require("./product-config");

exports.handler = async () => {
  const { ML_CLIENT_ID, ML_CLIENT_SECRET } = process.env;
  const store = getStore("peres-produtos");

  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET) {
    return json(500, { error: "Faltam ML_CLIENT_ID / ML_CLIENT_SECRET nas variáveis de ambiente do Netlify." });
  }

  const savedTokens = await store.get("tokens", { type: "json" });
  if (!savedTokens || !savedTokens.refresh_token) {
    return json(400, { error: "Nenhum token salvo ainda. Faça a autorização única primeiro (veja o README)." });
  }

  // 1) Renova o access_token
  let accessToken;
  try {
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
        refresh_token: savedTokens.refresh_token,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return json(500, { error: "Falha ao renovar o token.", details: tokenData });
    }
    accessToken = tokenData.access_token;
    await store.setJSON("tokens", {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      obtained_at: Date.now(),
    });
  } catch (err) {
    return json(500, { error: "Erro ao renovar token.", details: err.message });
  }

  // 2) Busca dados reais de cada produto que já tem mlItemId preenchido
  const results = [];
  for (const p of PRODUCTS) {
    if (!p.mlItemId) {
      results.push({ ...p, live: false, reason: "mlItemId não preenchido em product-config.js" });
      continue;
    }
    try {
      const itemRes = await fetch(
        `https://api.mercadolibre.com/items/${p.mlItemId}?attributes=id,title,price,currency_id,pictures,permalink,available_quantity,status`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const item = await itemRes.json();

      if (!itemRes.ok) {
        results.push({ ...p, live: false, reason: `API retornou erro: ${item.message || itemRes.status}` });
        continue;
      }

      results.push({
        ...p,
        live: true,
        title: item.title,
        price: item.price,
        currency: item.currency_id,
        image: item.pictures && item.pictures[0] ? item.pictures[0].secure_url || item.pictures[0].url : null,
        available: item.available_quantity > 0 && item.status === "active",
        updatedAt: Date.now(),
      });
    } catch (err) {
      results.push({ ...p, live: false, reason: err.message });
    }
  }

  await store.setJSON("products-cache", {
    updatedAt: Date.now(),
    products: results,
  });

  const liveCount = results.filter((r) => r.live).length;
  return json(200, { ok: true, liveCount, total: results.length });
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

// Agendamento: roda sozinha a cada hora (ver netlify.toml)
module.exports.config = { schedule: "@hourly" };
