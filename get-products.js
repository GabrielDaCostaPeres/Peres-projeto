/**
 * get-products.js
 * -------------------------------------------------------------------------
 * Endpoint público (sem credenciais) que o front-end (index.html) consulta
 * para renderizar os cards. Sempre devolve o que estiver no cache mais
 * recente gerado por refresh-products.js — nunca inventa dado.
 * -------------------------------------------------------------------------
 */
const { getStore } = require("@netlify/blobs");
const { PRODUCTS } = require("./product-config");

exports.handler = async () => {
  const store = getStore("peres-produtos");
  const cache = await store.get("products-cache", { type: "json" });

  if (!cache) {
    // Ainda não rodou nenhuma atualização — devolve a config crua,
    // marcando tudo como "não disponível" em vez de inventar imagem/preço.
    return json(200, {
      updatedAt: null,
      products: PRODUCTS.map((p) => ({ ...p, live: false, reason: "Cache ainda não gerado. Rode /.netlify/functions/refresh-products." })),
    });
  }

  return json(200, cache);
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
    body: JSON.stringify(body),
  };
}
