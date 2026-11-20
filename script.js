const palavras = [
  { numero: 1, direcao: "V", resposta: "EEPROM", linha: 1, coluna: 0, pista: "Armazenamento não volátil interno ao chip, apagável e regravável eletricamente byte a byte." },
  { numero: 2, direcao: "H", resposta: "RAM", linha: 1, coluna: 8, pista: "Memória principal volátil de leitura e escrita que perde todo conteúdo sem energia." },
  { numero: 2, direcao: "V", resposta: "REGISTRADORES", linha: 1, coluna: 8, pista: "Células ultrarrápidas no topo da hierarquia, internas ao processador, para operandos imediatos." },
  { numero: 3, direcao: "V", resposta: "UC", linha: 1, coluna: 12, pista: "Subsistema do processador que busca, decodifica instruções e gera sinais de coordenação." },
  { numero: 4, direcao: "V", resposta: "QUADCORE", linha: 1, coluna: 14, pista: "Arquitetura paralela com quatro unidades independentes de processamento no mesmo pastilhamento." },
  { numero: 5, direcao: "H", resposta: "CPU", linha: 2, coluna: 12, pista: "Componente central que interpreta instruções de máquina e coordena todo o sistema." },
  { numero: 6, direcao: "V", resposta: "ADDRESSBUS", linha: 3, coluna: 3, pista: "Conjunto unidirecional de linhas elétricas que transporta posições físicas da memória principal." },
  { numero: 7, direcao: "V", resposta: "MEMORIADEMASSA", linha: 3, coluna: 10, pista: "Armazenamento secundário persistente de alta capacidade e maior latência, como SSD ou HD." },
  { numero: 8, direcao: "V", resposta: "DMA", linha: 4, coluna: 12, pista: "Controlador que transfere blocos entre periféricos e RAM liberando o processador principal." },
  { numero: 9, direcao: "H", resposta: "MICROCONTROLADOR", linha: 6, coluna: 0, pista: "Circuito integrado embarcado que reúne núcleo, memórias e periféricos de I/O num único chip." },
  { numero: 10, direcao: "V", resposta: "CACHE", linha: 6, coluna: 5, pista: "Memória SRAM intermediária de baixíssima latência que reduz gargalos entre processador e RAM." },
  { numero: 11, direcao: "V", resposta: "DATABUS", linha: 6, coluna: 13, pista: "Trilha bidirecional cuja largura em bits define quantos bytes trafegam por ciclo." },
  { numero: 12, direcao: "H", resposta: "FLASH", linha: 8, coluna: 0, pista: "Tecnologia não volátil apagada em blocos inteiros, usada em SSDs e firmware embarcado." },
  { numero: 13, direcao: "H", resposta: "ULA", linha: 11, coluna: 13, pista: "Bloco combinacional do processador responsável por somas, deslocamentos binários e comparações booleanas." },
  { numero: 14, direcao: "H", resposta: "DUALCORE", linha: 16, coluna: 8, pista: "Chip com dois núcleos físicos capazes de executar duas threads simultaneamente em hardware." },
  { numero: 15, direcao: "V", resposta: "ROM", linha: 16, coluna: 14, pista: "Memória não volátil gravada na fabricação, ideal para armazenar firmware e rotinas de boot." }
];

const totalLinhas = 19;
const totalColunas = 16;
const TEMPO_DESAFIO_INICIAL = 300; // 5 minutos em segundos

let direcaoAtual = "H";
let celulaFocada = null;
let segundos = 0;
let intervaloTimer = null;
let modoDesafio = false;
let jogoEncerrado = false;
let qtdVerificacoes = 0;

function iniciar() {
  jogoEncerrado = false;
  qtdVerificacoes = 0;
  celulaFocada = null;
  direcaoAtual = "H";
  atualizarIndicadorDirecao();
  ocultarBanner();

  const mapa = Array.from({ length: totalLinhas }, () => Array(totalColunas).fill(""));

  for (let p = 0; p < palavras.length; p++) {
    const { linha, coluna, direcao, resposta } = palavras[p];
    for (let i = 0; i < resposta.length; i++) {
      const l = direcao === "H" ? linha : linha + i;
      const c = direcao === "H" ? coluna + i : coluna;
      mapa[l][c] = "x";
    }
  }

  let html = "";
  for (let l = 0; l < totalLinhas; l++) {
    html += "<div class='linha'>";
    for (let c = 0; c < totalColunas; c++) {
      if (mapa[l][c] === "") {
        html += "<div class='vazia'></div>";
      } else {
        const palavraInicio = palavras.find(item => item.linha === l && item.coluna === c);
        const numero = palavraInicio ? palavraInicio.numero : "";
        html += `<div class='celula'>`;
        if (numero !== "") {
          html += `<span class='numero'>${numero}</span>`;
        }
        html += `<input class='casa' type='text' maxlength='1' autocomplete='off' spellcheck='false' id='c${l}_${c}' aria-label='Linha ${l + 1}, Coluna ${c + 1}'>`;
        html += `</div>`;
      }
    }
    html += "</div>";
  }

  const tabuleiroEl = document.getElementById("tabuleiro");
  tabuleiroEl.innerHTML = html;

  let listaH = "";
  let listaV = "";
  for (let p = 0; p < palavras.length; p++) {
    const item = palavras[p];
    const li = `<li id='p${item.numero}${item.direcao}' onclick="selecionarPista(${p})">
      <b>${item.numero}.</b> ${item.pista}
      <span class='qtd-letras'>(${item.resposta.length})</span>
    </li>`;
    if (item.direcao === "H") {
      listaH += li;
    } else {
      listaV += li;
    }
  }

  document.getElementById("horizontais").innerHTML = listaH;
  document.getElementById("verticais").innerHTML = listaV;

  configurarEventosCelulas();
  atualizarPlacar(0);
  document.getElementById("tentativas").textContent = "Verificações: 0";
  reiniciarTimer();
}

function configurarEventosCelulas() {
  const casas = document.querySelectorAll(".casa");
  casas.forEach(casa => {
    const [l, c] = extrairCoordenadas(casa.id);

    casa.addEventListener("focus", () => {
      ajustarDirecaoAoFocar(l, c);
      celulaFocada = { l, c };
      destacarPalavraAtiva(l, c);
    });

    casa.addEventListener("click", () => {
      if (celulaFocada && celulaFocada.l === l && celulaFocada.c === c) {
        const opcoes = obterPalavrasNaCelula(l, c);
        if (opcoes.length > 1) {
          alternarDirecao();
        }
      }
    });

    casa.addEventListener("input", () => {
      if (jogoEncerrado) {
        casa.value = "";
        return;
      }
      const limpo = casa.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase();
      casa.value = limpo.slice(-1);
      casa.classList.remove("certa", "errada");

      if (casa.value !== "") {
        moverCursor(l, c, 1);
      }
    });

    casa.addEventListener("keydown", e => {
      if (e.key === " ") {
        e.preventDefault();
        alternarDirecao();
      } else if (e.key === "Backspace") {
        if (casa.value === "") {
          e.preventDefault();
          moverCursor(l, c, -1, true);
        } else {
          casa.classList.remove("certa", "errada");
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        direcaoAtual = "H";
        atualizarIndicadorDirecao();
        focarSeExistir(l, c + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        direcaoAtual = "H";
        atualizarIndicadorDirecao();
        focarSeExistir(l, c - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        direcaoAtual = "V";
        atualizarIndicadorDirecao();
        focarSeExistir(l + 1, c);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        direcaoAtual = "V";
        atualizarIndicadorDirecao();
        focarSeExistir(l - 1, c);
      } else if (e.key === "Enter") {
        e.preventDefault();
        conferir();
      }
    });
  });
}

function extrairCoordenadas(id) {
  const partes = id.substring(1).split("_");
  return [parseInt(partes[0], 10), parseInt(partes[1], 10)];
}

function obterPalavrasNaCelula(l, c) {
  return palavras.filter(p => {
    if (p.direcao === "H") {
      return p.linha === l && c >= p.coluna && c < p.coluna + p.resposta.length;
    }
    return p.coluna === c && l >= p.linha && l < p.linha + p.resposta.length;
  });
}

function ajustarDirecaoAoFocar(l, c) {
  const opcoes = obterPalavrasNaCelula(l, c);
  if (opcoes.length === 1) {
    direcaoAtual = opcoes[0].direcao;
    atualizarIndicadorDirecao();
  }
}

function alternarDirecao() {
  direcaoAtual = direcaoAtual === "H" ? "V" : "H";
  atualizarIndicadorDirecao();
  if (celulaFocada) {
    destacarPalavraAtiva(celulaFocada.l, celulaFocada.c);
  }
}

function atualizarIndicadorDirecao() {
  const texto = document.getElementById("texto-direcao");
  if (texto) {
    texto.textContent = direcaoAtual === "H" ? "HORIZONTAL →" : "VERTICAL ↓";
  }
}

function destacarPalavraAtiva(l, c) {
  document.querySelectorAll(".casa").forEach(el => el.classList.remove("palavra-ativa"));
  document.querySelectorAll(".pistas li").forEach(el => el.classList.remove("pista-ativa"));

  const opcoes = obterPalavrasNaCelula(l, c);
  if (opcoes.length === 0) return;

  const ativa = opcoes.find(p => p.direcao === direcaoAtual) || opcoes[0];
  direcaoAtual = ativa.direcao;
  atualizarIndicadorDirecao();

  for (let i = 0; i < ativa.resposta.length; i++) {
    const cl = ativa.direcao === "H" ? ativa.linha : ativa.linha + i;
    const cc = ativa.direcao === "H" ? ativa.coluna + i : ativa.coluna;
    const input = document.getElementById(`c${cl}_${cc}`);
    if (input) input.classList.add("palavra-ativa");
  }

  const pistaEl = document.getElementById(`p${ativa.numero}${ativa.direcao}`);
  if (pistaEl) {
    pistaEl.classList.add("pista-ativa");
    pistaEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function selecionarPista(indicePalavra) {
  const p = palavras[indicePalavra];
  direcaoAtual = p.direcao;
  atualizarIndicadorDirecao();
  const primeiraCasa = document.getElementById(`c${p.linha}_${p.coluna}`);
  if (primeiraCasa) {
    primeiraCasa.focus();
  }
}

function moverCursor(l, c, passo, apagarAnterior = false) {
  const proxL = direcaoAtual === "V" ? l + passo : l;
  const proxC = direcaoAtual === "H" ? c + passo : c;
  const destino = document.getElementById(`c${proxL}_${proxC}`);
  if (destino) {
    if (apagarAnterior) {
      destino.value = "";
      destino.classList.remove("certa", "errada");
    }
    destino.focus();
  }
}

function focarSeExistir(l, c) {
  const alvo = document.getElementById(`c${l}_${c}`);
  if (alvo) alvo.focus();
}

function conferir() {
  let acertos = 0;
  const celulasCertas = new Set();
  const celulasErradas = new Set();

  qtdVerificacoes++;
  document.getElementById("tentativas").textContent = `Verificações: ${qtdVerificacoes}`;

  for (let p = 0; p < palavras.length; p++) {
    const item = palavras[p];
    let digitado = "";
    const coords = [];

    for (let i = 0; i < item.resposta.length; i++) {
      const l = item.direcao === "H" ? item.linha : item.linha + i;
      const c = item.direcao === "H" ? item.coluna + i : item.coluna;
      const casa = document.getElementById(`c${l}_${c}`);
      digitado += casa.value.toUpperCase();
      coords.push(`${l}_${c}`);
    }

    const liPista = document.getElementById(`p${item.numero}${item.direcao}`);
    liPista.classList.remove("certa", "errada");

    if (digitado === item.resposta) {
      liPista.classList.add("certa");
      acertos++;
      coords.forEach(chave => celulasCertas.add(chave));
    } else {
      liPista.classList.add("errada");
      coords.forEach(chave => celulasErradas.add(chave));
    }
  }

  document.querySelectorAll(".casa").forEach(casa => {
    const chave = casa.id.substring(1);
    casa.classList.remove("certa", "errada");
    if (celulasCertas.has(chave)) {
      casa.classList.add("certa");
    } else if (celulasErradas.has(chave)) {
      casa.classList.add("errada");
    }
  });

  atualizarPlacar(acertos);

  if (acertos === palavras.length) {
    finalizarComVitoria();
  } else if (modoDesafio && !jogoEncerrado) {
    segundos = Math.max(0, segundos - 15);
    atualizarDisplayTimer();
    exibirBanner(`Penalidade do Modo Desafio: -15s aplicados (${palavras.length - acertos} palavra(s) pendente(s)).`, "alerta");
    if (segundos === 0) {
      encerrarPorTempo();
    }
  }
}

function atualizarPlacar(acertos) {
  const total = palavras.length;
  document.getElementById("resultado").textContent = `${acertos} de ${total} palavras`;
  const percentual = Math.round((acertos / total) * 100);
  document.getElementById("barra-fill").style.width = `${percentual}%`;
}

/* Cronômetro e Modo Desafio */
function alternarModoDesafio() {
  modoDesafio = document.getElementById("modo-desafio").checked;
  iniciar();
}

function reiniciarTimer() {
  clearInterval(intervaloTimer);
  const timerEl = document.getElementById("timer");
  timerEl.classList.remove("timer-alerta", "timer-critico");

  segundos = modoDesafio ? TEMPO_DESAFIO_INICIAL : 0;
  atualizarDisplayTimer();

  intervaloTimer = setInterval(() => {
    if (jogoEncerrado) return;

    if (modoDesafio) {
      segundos--;
      atualizarDisplayTimer();
      if (segundos <= 60 && segundos > 20) {
        timerEl.classList.add("timer-alerta");
      } else if (segundos <= 20) {
        timerEl.classList.remove("timer-alerta");
        timerEl.classList.add("timer-critico");
      }
      if (segundos <= 0) {
        encerrarPorTempo();
      }
    } else {
      segundos++;
      atualizarDisplayTimer();
    }
  }, 1000);
}

function atualizarDisplayTimer() {
  const mins = String(Math.floor(segundos / 60)).padStart(2, "0");
  const segs = String(segundos % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${mins}:${segs}`;
}

function finalizarComVitoria() {
  jogoEncerrado = true;
  clearInterval(intervaloTimer);
  const tempoFormatado = document.getElementById("timer").textContent;
  const patente = qtdVerificacoes === 1
    ? "Arquiteto de Silício (Perfeito em 1 verificação!)"
    : `Engenheiro de Hardware (${qtdVerificacoes} verificações)`;
  exibirBanner(`Sistema 100% validado! Todas as 16 palavras corretas • Relógio: ${tempoFormatado} • Nível: ${patente}.`, "sucesso");
}

function encerrarPorTempo() {
  jogoEncerrado = true;
  clearInterval(intervaloTimer);
  document.querySelectorAll(".casa").forEach(c => (c.disabled = true));
  conferir();
  exibirBanner("Tempo esgotado no Modo Desafio! Tabuleiro bloqueado. Clique em Reiniciar para tentar novamente.", "perigo");
}

function exibirBanner(mensagem, tipo) {
  const banner = document.getElementById("banner-status");
  banner.textContent = mensagem;
  banner.className = `banner-status ${tipo}`;
}

function ocultarBanner() {
  const banner = document.getElementById("banner-status");
  banner.className = "banner-status oculto";
  banner.textContent = "";
}

iniciar();