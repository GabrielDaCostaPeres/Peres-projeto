/**
 * ==========================================================================
 * CONFIGURAÇÃO DOS PRODUTOS — Peres Produtos
 * ==========================================================================
 * Cada produto precisa do "mlItemId": o ID real do anúncio no Mercado Livre
 * (formato "MLB" + números, ex: "MLB5311203520").
 *
 * COMO ENCONTRAR O mlItemId DE CADA PRODUTO:
 *   1. Abra o link de afiliado (campo "link" abaixo) em um navegador normal.
 *   2. Espere a página do produto carregar por completo.
 *   3. Olhe a URL final na barra de endereço. Ela terá um destes formatos:
 *        a) .../nome-do-produto/p/MLB46995818?...&wid=MLB5311203520&...
 *           -> use o valor de "wid=" (esse é o ID real do anúncio/vendedor)
 *        b) .../MLB-5311203520-nome-do-produto-_JM
 *           -> use o número logo depois de "MLB-" (ex: MLB5311203520)
 *   4. Cole o valor no campo "mlItemId" do produto correspondente abaixo.
 *
 * Enquanto "mlItemId" estiver como null, a função refresh-products.js vai
 * pular esse produto e o card vai mostrar um estado de "imagem indisponível"
 * no lugar de uma imagem falsa — nunca vamos inventar imagem ou preço.
 * ==========================================================================
 */

const PRODUCTS = [
  // ---------- Categoria: Diversos ----------
  { promoCode: "TZZLQ8-K0DY", link: "https://meli.la/1MCjMpB", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-1LK6", link: "https://meli.la/1fVMiTv", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-D671", link: "https://meli.la/1keqD1G", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-R3KD", link: "https://meli.la/2UdLyLU", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-5Y7C", link: "https://meli.la/13NtwV7", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-K1JC", link: "https://meli.la/1b7vgqW", cat: "diversos", mlItemId: null },
  { promoCode: "TZZLQ8-Z5JY", link: "https://meli.la/1kkoF1d", cat: "diversos", mlItemId: null },

  // ---------- Categoria: Mochilas Masculinas ----------
  { promoCode: "TZZLQ8-Y2HQ", link: "https://meli.la/2nvevQj", cat: "mochilas", mlItemId: null },
  { promoCode: "TZZLQ8-67YG", link: "https://meli.la/1n6KzTu", cat: "mochilas", mlItemId: null },
  { promoCode: "TZZLQ8-LP6E", link: "https://meli.la/1YDcKDM", cat: "mochilas", mlItemId: null },

  // ---------- Categoria: Bolsas Femininas ----------
  // Exemplo já preenchido com o ID real que você mandou (confirme se é este produto mesmo!)
  { promoCode: "TZZLQ8-CEFC", link: "https://meli.la/2M4tPiy", cat: "bolsas", mlItemId: "MLB5311203520" },
  { promoCode: "TZZLQ8-8R3H", link: "https://meli.la/2sFdH4v", cat: "bolsas", mlItemId: null },
  { promoCode: "TZZLQ8-ZWML", link: "https://meli.la/2XsDaYh", cat: "bolsas", mlItemId: null },
  { promoCode: "TZZLQ8-4SXZ", link: "https://meli.la/1LnQ4qq", cat: "bolsas", mlItemId: null },
  { promoCode: "TZZLQ8-S4E1", link: "https://meli.la/1E8Ueue", cat: "bolsas", mlItemId: null },
];

module.exports = { PRODUCTS };
