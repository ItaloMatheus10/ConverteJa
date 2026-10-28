/* ===== Tabela de unidades =====
   Comprimento e massa: "fator" diz quanto 1 unidade vale na unidade base
   (metro para comprimento, quilograma para massa).
   Temperatura não usa fator, pois a conversão tem soma/subtração;
   ela será tratada com fórmulas próprias. */
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

/* ===== Inicialização ===== */
campoCategoria.addEventListener("change", preencherUnidades);
preencherUnidades();