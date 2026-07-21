/**
 * oauth-callback.js
 * -------------------------------------------------------------------------
 * Executado UMA VEZ, quando você autoriza o app no Mercado Livre.
 * O Mercado Livre redireciona pra cá com um "?code=..." na URL.
 * Essa função troca esse código por um access_token + refresh_token
 * e guarda tudo no Netlify Blobs, pra que refresh-products.js consiga
 * renovar sozinho depois (o refresh_token do ML é rotativo, então a
 * cada renovação salvamos o novo).
 * -------------------------------------------------------------------------
 */
const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!code) {
    return htmlResponse(400, "Nenhum código de autorização recebido. Refaça o passo de autorização a partir do link gerado no README.");
  }

  const { ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REDIRECT_URI } = process.env;

  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET || !ML_REDIRECT_URI) {
    return htmlResponse(500, "Faltam variáveis de ambiente (ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REDIRECT_URI) nas configurações do site no Netlify.");
  }

  try {
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
        code,
        redirect_uri: ML_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return htmlResponse(500, `O Mercado Livre recusou a troca do código: ${escapeHtml(JSON.stringify(tokenData))}`);
    }

    const store = getStore("peres-produtos");
    await store.setJSON("tokens", {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      obtained_at: Date.now(),
    });

    return htmlResponse(
      200,
      "Autorização concluída com sucesso! Os tokens foram salvos. Agora acesse /.netlify/functions/refresh-products uma vez para buscar os dados dos produtos pela primeira vez. Depois disso a atualização é automática a cada hora."
    );
  } catch (err) {
    return htmlResponse(500, `Erro inesperado: ${escapeHtml(err.message)}`);
  }
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function htmlResponse(statusCode, message) {
  const ok = statusCode === 200;
  return {
    statusCode,
    headers: { "content-type": "text/html; charset=utf-8" },
    body: `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>Peres Produtos · Configuração</title>
<style>
  body{font-family:system-ui,sans-serif;background:#F5F6FA;color:#0F172A;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}
  .box{max-width:480px;background:#fff;border-radius:20px;padding:32px;box-shadow:0 8px 30px rgba(15,23,42,.08)}
  h1{font-size:18px;margin:0 0 12px}
  p{font-size:14px;line-height:1.6;color:#334155}
  .badge{display:inline-block;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;margin-bottom:12px}
  .ok{background:#DCFCE7;color:#166534}
  .err{background:#FEE2E2;color:#991B1B}
</style></head>
<body><div class="box">
  <span class="badge ${ok ? "ok" : "err"}">${ok ? "Sucesso" : "Erro"}</span>
  <h1>${ok ? "Tudo certo ✅" : "Algo deu errado"}</h1>
  <p>${message}</p>
</div></body></html>`,
  };
};
