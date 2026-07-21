# Peres Produtos — Setup

Site com imagem e preço **reais**, buscados direto da API oficial do Mercado
Livre (atualiza sozinho a cada hora). Siga os passos na ordem.

## 1. Pegue o Client Secret

No painel de desenvolvedor do Mercado Livre, na mesma tela onde você viu o
Client ID (`3955040168416099`), copie também o **Client Secret**. Guarde-o
com cuidado — ele não deve ir para o código nem para o Git, só para as
variáveis de ambiente do Netlify (passo 3).

## 2. Suba o projeto no Netlify

- Arraste esta pasta no [app.netlify.com/drop](https://app.netlify.com/drop),
  ou conecte um repositório Git com esses arquivos.
- Anote a URL gerada, algo como `https://peres-produtos.netlify.app`.

## 3. Configure as variáveis de ambiente

No Netlify: **Site settings → Environment variables**, adicione:

| Nome | Valor |
|---|---|
| `ML_CLIENT_ID` | `3955040168416099` |
| `ML_CLIENT_SECRET` | (o que você copiou no passo 1) |
| `ML_REDIRECT_URI` | `https://SEU-SITE.netlify.app/.netlify/functions/oauth-callback` |

Depois de adicionar, faça um **redeploy** do site para as variáveis entrarem
em vigor.

## 4. Cadastre a Redirect URI no app do Mercado Livre

No painel de desenvolvedor do ML, na configuração do seu app, cole a mesma
URL do `ML_REDIRECT_URI` acima no campo de "Redirect URI" / "URI de
redirecionamento".

## 5. Autorize o app (só uma vez)

Acesse esta URL no navegador (troque `SEU_REDIRECT_URI` pela URL codificada
do passo 3), logado com a conta de afiliado/vendedor do Mercado Livre:

```
https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=3955040168416099&redirect_uri=SEU_REDIRECT_URI
```

Você vai autorizar o app e ser redirecionado de volta para o seu site, numa
página confirmando "Autorização concluída com sucesso". Isso salva os tokens
automaticamente — não precisa repetir esse passo depois (o token se renova
sozinho).

## 6. Rode a primeira sincronização

Acesse uma vez, manualmente:

```
https://SEU-SITE.netlify.app/.netlify/functions/refresh-products
```

Isso busca os dados reais (imagem, preço, título) de todos os produtos que
já têm `mlItemId` preenchido em `netlify/functions/product-config.js`, e
guarda em cache. A partir daqui, essa mesma função roda sozinha a cada hora.

## 7. Preencha os 15 IDs reais dos produtos

Abra `netlify/functions/product-config.js` — tem instruções detalhadas no
topo do arquivo sobre como achar o `mlItemId` de cada link. Um já está
preenchido como exemplo (confirme se é o produto certo). Preencha os outros
14, faça commit/redeploy, e rode o passo 6 de novo.

## Como o site se comporta enquanto um produto não tem `mlItemId`

O card mostra "Aguardando sincronização com o Mercado Livre" no lugar da
imagem — **nunca** um placeholder genérico fingindo ser o produto real. Isso
é proposital: preferimos mostrar honestamente que o dado ainda não chegou a
mostrar algo que pode estar errado.
