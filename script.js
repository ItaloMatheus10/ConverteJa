/* ===== Tabela de unidades ===== */
const UNIDADES = {
  comprimento: {
    m:  { nome: "metros",       simbolo: "m",  fator: 1 },
    km: { nome: "quilômetros",  simbolo: "km", fator: 1000 },
    cm: { nome: "centímetros",  simbolo: "cm", fator: 0.01 },
    mi: { nome: "milhas",       simbolo: "mi", fator: 1609.344 },
    ft: { nome: "pés",          simbolo: "ft", fator: 0.3048 }
  },
  massa: {
    kg: { nome: "quilogramas",  simbolo: "kg", fator: 1 },
    g:  { nome: "gramas",       simbolo: "g",  fator: 0.001 },
    lb: { nome: "libras",       simbolo: "lb", fator: 0.45359237 }
  },
  temperatura: {
    c: { nome: "graus Celsius",    simbolo: "°C" },
    f: { nome: "graus Fahrenheit", simbolo: "°F" },
    k: { nome: "kelvin",           simbolo: "K" }
  }
};

/* ===== Elementos da página ===== */
const campoCategoria = document.getElementById("categoria");
const campoOrigem = document.getElementById("origem");
const campoDestino = document.getElementById("destino");
const formulario = document.getElementById("form-conversao");
const campoValor = document.getElementById("valor");
const areaResultado = document.getElementById("resultado");
const listaHistorico = document.getElementById("historico");
const avisoHistoricoVazio = document.getElementById("historico-vazio");
const botaoLimpar = document.getElementById("limpar-historico");

/* ===== Menus de unidades ===== */

// Cria um <option> com o nome e o símbolo da unidade
function criarOpcao(codigo, unidade) {
  const opcao = document.createElement("option");
  opcao.value = codigo;
  opcao.textContent = `${unidade.nome} (${unidade.simbolo})`;
  return opcao;
}

// Preenche "De" e "Para" só com as unidades da categoria escolhida
function preencherUnidades() {
  const unidades = UNIDADES[campoCategoria.value];

  campoOrigem.replaceChildren();
  campoDestino.replaceChildren();

  for (const [codigo, unidade] of Object.entries(unidades)) {
    campoOrigem.append(criarOpcao(codigo, unidade));
    campoDestino.append(criarOpcao(codigo, unidade));
  }

  // Começa com unidades diferentes em "De" e "Para" (ex.: metros → quilômetros)
  campoDestino.selectedIndex = 1;
}

/* ===== Conversão ===== */

// Lê o texto digitado e devolve um número, ou NaN se for inválido.
// Aceita vírgula ou ponto como separador decimal ("2,5" ou "2.5").
function lerValor(texto) {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") {
    return NaN; // Number("") daria 0, o que esconderia o campo vazio
  }
  return Number(limpo);
}

// Temperatura: converte primeiro para Celsius e depois para o destino
function converterTemperatura(valor, origem, destino) {
  let celsius;
  if (origem === "c") celsius = valor;
  else if (origem === "f") celsius = (valor - 32) / 1.8;
  else celsius = valor - 273.15; // kelvin

  if (destino === "c") return celsius;
  if (destino === "f") return celsius * 1.8 + 32;
  return celsius + 273.15; // kelvin
}

// Escolhe a regra certa conforme a categoria
function converterValor(valor, categoria, origem, destino) {
  if (categoria === "temperatura") {
    return converterTemperatura(valor, origem, destino);
  }
  // Comprimento e massa: passa pela unidade base (metro ou quilograma)
  const unidades = UNIDADES[categoria];
  return valor * unidades[origem].fator / unidades[destino].fator;
}

// Formata no padrão brasileiro, com até 2 casas decimais (ex.: 3,11)
function formatarNumero(numero) {
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// Mostra uma mensagem na área de resultado: tipo "sucesso" ou "erro"
function mostrarResultado(texto, tipo) {
  areaResultado.textContent = texto;
  areaResultado.className = `resultado ${tipo}`;
}

// Chamada ao clicar em "Converter" ou apertar Enter
function converter(evento) {
  evento.preventDefault(); // impede o formulário de recarregar a página

  const valor = lerValor(campoValor.value);

  if (!Number.isFinite(valor)) {
    mostrarResultado("Digite um número válido.", "erro");
    campoValor.focus();
    return;
  }

  const categoria = campoCategoria.value;
  const origem = campoOrigem.value;
  const destino = campoDestino.value;
  const convertido = converterValor(valor, categoria, origem, destino);

  const simboloOrigem = UNIDADES[categoria][origem].simbolo;
  const simboloDestino = UNIDADES[categoria][destino].simbolo;
  const mensagem =
    `${formatarNumero(valor)} ${simboloOrigem} = ` +
    `${formatarNumero(convertido)} ${simboloDestino}`;

  mostrarResultado(mensagem, "sucesso");
    adicionarAoHistorico(mensagem);
}

/* ===== Histórico (localStorage) ===== */

const CHAVE_HISTORICO = "converteja-historico";
const LIMITE_HISTORICO = 5;

// Lê o histórico salvo no navegador. Se não existir ou estiver
// corrompido, devolve uma lista vazia em vez de quebrar o app.
function carregarHistorico() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_HISTORICO));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

// Grava a lista no navegador (localStorage só guarda texto, daí o JSON)
function salvarHistorico(lista) {
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
  } catch {
    // Se o navegador bloquear o armazenamento, o app segue funcionando,
    // apenas sem guardar o histórico.
  }
}

// Redesenha a lista na página a partir do que está salvo
function mostrarHistorico() {
  const lista = carregarHistorico();

  listaHistorico.replaceChildren();
  for (const texto of lista) {
    const item = document.createElement("li");
    item.textContent = texto;
    listaHistorico.append(item);
  }

  const vazio = lista.length === 0;
  avisoHistoricoVazio.hidden = !vazio;
  botaoLimpar.hidden = vazio;
}

// Coloca a conversão mais recente no topo e mantém só as 5 últimas
function adicionarAoHistorico(mensagem) {
  const lista = carregarHistorico();
  lista.unshift(mensagem);
  salvarHistorico(lista.slice(0, LIMITE_HISTORICO));
  mostrarHistorico();
}

// Apaga o histórico do navegador e atualiza a tela
function limparHistorico() {
  localStorage.removeItem(CHAVE_HISTORICO);
  mostrarHistorico();
}

/* ===== Inicialização ===== */
campoCategoria.addEventListener("change", preencherUnidades);
preencherUnidades();
formulario.addEventListener("submit", converter);
botaoLimpar.addEventListener("click", limparHistorico);
mostrarHistorico();