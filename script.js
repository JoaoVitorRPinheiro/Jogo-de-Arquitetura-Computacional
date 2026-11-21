/* Cada pergunta possui numeração única de 1 a 16 (sem repetição entre Horizontal e Vertical) */
const palavras = [
  { numero: 1, direcao: "V", resposta: "EEPROM", linha: 1, coluna: 0, pista: "Memória persistente regravável byte a byte via pulsos elétricos sem remoção do circuito." },
  { numero: 2, direcao: "H", resposta: "RAM", linha: 1, coluna: 8, pista: "Armazenamento principal volátil de leitura e escrita que perde dados ao desligar." },
  { numero: 3, direcao: "V", resposta: "REGISTRADORES", linha: 1, coluna: 8, pista: "Células internas ao núcleo com latência de um ciclo para operandos imediatos." },
  { numero: 4, direcao: "V", resposta: "UC", linha: 1, coluna: 12, pista: "Decodifica instruções binárias e dispara sinais elétricos que coordenam todo o datapath." },
  { numero: 5, direcao: "V", resposta: "QUADCORE", linha: 1, coluna: 14, pista: "Pastilha monolítica que integra quatro motores independentes de execução paralela em hardware." },
  { numero: 6, direcao: "H", resposta: "CPU", linha: 2, coluna: 12, pista: "Orquestra o ciclo contínuo de busca, decodificação e execução das instruções de máquina." },
  { numero: 7, direcao: "V", resposta: "ADDRESSBUS", linha: 3, coluna: 3, pista: "Trilhas unidirecionais cuja largura em bits limita o total de locais acessíveis." },
  { numero: 8, direcao: "V", resposta: "MEMORIADEMASSA", linha: 3, coluna: 10, pista: "Armazenamento secundário não volátil de alta capacidade e latência elevada, como SSD." },
  { numero: 9, direcao: "V", resposta: "DMA", linha: 4, coluna: 12, pista: "Transfere blocos entre periféricos e memória principal sem intervenção contínua do processador." },
  { numero: 10, direcao: "H", resposta: "MICROCONTROLADOR", linha: 6, coluna: 0, pista: "Chip embarcado completo que integra núcleo, memórias internas e pinos periféricos programáveis." },
  { numero: 11, direcao: "V", resposta: "CACHE", linha: 6, coluna: 5, pista: "Hierarquia SRAM ultrarrápida em níveis que explora localidade temporal e espacial." },
  { numero: 12, direcao: "V", resposta: "DATABUS", linha: 6, coluna: 13, pista: "Via bidirecional paralela que transporta palavras binárias lidas ou escritas entre componentes." },
  { numero: 13, direcao: "H", resposta: "FLASH", linha: 8, coluna: 0, pista: "Tecnologia persistente apagada por blocos inteiros, base de pendrives e firmwares modernos." },
  { numero: 14, direcao: "H", resposta: "ULA", linha: 11, coluna: 13, pista: "Bloco combinacional que executa operações matemáticas, deslocamentos binários e atualiza flags de estado." },
  { numero: 15, direcao: "H", resposta: "DUALCORE", linha: 16, coluna: 8, pista: "Arquitetura com dois motores físicos independentes capazes de processar duas threads simultaneamente." },
  { numero: 16, direcao: "V", resposta: "ROM", linha: 16, coluna: 14, pista: "Conteúdo gravado por máscara na fabricação, imutável em operação normal para boot." }
];

const totalLinhas = 19;
const totalColunas = 16;

const CONFIG_MODOS = {
  treino: { nome: "MODO TREINO", tempo: 0, regressivo: false, penalidadeGeral: 0, penalidadeUnica: 0, dicasMax: 3, mostrarTamanho: true },
  dificil: { nome: "MODO DIFÍCIL", tempo: 240, regressivo: true, penalidadeGeral: 20, penalidadeUnica: 8, dicasMax: 3, mostrarTamanho: false },
  extremo: { nome: "MODO EXTREMO", tempo: 150, regressivo: true, penalidadeGeral: 30, penalidadeUnica: 12, dicasMax: 0, mostrarTamanho: false }
};

let modoAtual = "dificil";
let filtroAtual = "todas";
let direcaoAtual = "H";
let celulaFocada = null;
let palavraSelecionada = null;
let palavrasValidadas = new Set();
let segundos = 240;
let segundosDecorridos = 0;
let intervaloTimer = null;
let jogoEncerrado = false;
let qtdVerificacoes = 0;
let dicasRestantes = 3;
let dicasUsadas = 0;
let somAtivo = true;
let audioCtx = null;

/* Sintetizador de Áudio Puro (Web Audio API) */
function tocarSom(tipo) {
  if (!somAtivo) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const agora = audioCtx.currentTime;
    if (tipo === "tecla") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(540, agora);
      osc.frequency.exponentialRampToValueAtTime(240, agora + 0.04);
      gain.gain.setValueAtTime(0.05, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.04);
      osc.start(agora);
      osc.stop(agora + 0.045);
    } else if (tipo === "acerto") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, agora);
      osc.frequency.exponentialRampToValueAtTime(880, agora + 0.14);
      gain.gain.setValueAtTime(0.08, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.16);
      osc.start(agora);
      osc.stop(agora + 0.17);
    } else if (tipo === "dica") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, agora);
      osc.frequency.exponentialRampToValueAtTime(920, agora + 0.16);
      gain.gain.setValueAtTime(0.08, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.18);
      osc.start(agora);
      osc.stop(agora + 0.19);
    } else if (tipo === "erro") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(175, agora);
      osc.frequency.linearRampToValueAtTime(110, agora + 0.22);
      gain.gain.setValueAtTime(0.07, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.23);
      osc.start(agora);
      osc.stop(agora + 0.24);
    } else if (tipo === "vitoria") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, agora + idx * 0.08);
        g.gain.setValueAtTime(0.08, agora + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.08 + 0.34);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(agora + idx * 0.08);
        o.stop(agora + idx * 0.08 + 0.35);
      });
    }
  } catch (e) {
    // Ignora bloqueios de áudio automático
  }
}

function alternarSom() {
  somAtivo = !somAtivo;
  document.getElementById("btn-som").textContent = somAtivo ? "🔊" : "🔇";
}

function mudarDificuldade(novoModo) {
  modoAtual = novoModo;
  document.querySelectorAll(".diff-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.modo === novoModo);
  });
  document.getElementById("badge-modo").textContent = CONFIG_MODOS[novoModo].nome;
  iniciar();
}

function iniciar() {
  const cfg = CONFIG_MODOS[modoAtual];
  jogoEncerrado = false;
  qtdVerificacoes = 0;
  dicasRestantes = cfg.dicasMax;
  dicasUsadas = 0;
  segundosDecorridos = 0;
  celulaFocada = null;
  palavraSelecionada = null;
  palavrasValidadas = new Set();
  direcaoAtual = "H";

  document.getElementById("modal-fim").classList.add("oculto");
  atualizarBotaoDica();
  atualizarIndicadorDirecao();
  atualizarRecordeHUD();
  ocultarBanner();

  document.getElementById("visor-tag").textContent = "PERGUNTA NÃO SELECIONADA";
  document.getElementById("visor-slots").textContent = "";
  document.getElementById("visor-texto").textContent = "Clique em uma casa do tabuleiro ou selecione uma pergunta ao lado para começar.";
  document.getElementById("btn-validar-atual").disabled = true;

  const contagemCelula = Array.from({ length: totalLinhas }, () => Array(totalColunas).fill(0));
  for (let p = 0; p < palavras.length; p++) {
    const { linha, coluna, direcao, resposta } = palavras[p];
    for (let i = 0; i < resposta.length; i++) {
      const l = direcao === "H" ? linha : linha + i;
      const c = direcao === "H" ? coluna + i : coluna;
      contagemCelula[l][c]++;
    }
  }

  let html = "";
  for (let l = 0; l < totalLinhas; l++) {
    html += "<div class='linha'>";
    for (let c = 0; c < totalColunas; c++) {
      if (contagemCelula[l][c] === 0) {
        html += "<div class='vazia'></div>";
      } else {
        const inicios = palavras.filter(item => item.linha === l && item.coluna === c);
        const numeroBadge = inicios.map(item => item.numero).join("·");
        const classeCruzamento = contagemCelula[l][c] > 1 ? " cruzamento" : "";
        html += `<div class='celula${classeCruzamento}'>`;
        if (numeroBadge !== "") {
          html += `<span class='numero'>${numeroBadge}</span>`;
        }
        html += `<input class='casa' type='text' maxlength='1' autocomplete='off' spellcheck='false' id='c${l}_${c}' aria-label='Linha ${l + 1}, Coluna ${c + 1}'>`;
        html += `</div>`;
      }
    }
    html += "</div>";
  }

  document.getElementById("tabuleiro").innerHTML = html;

  let listaH = "";
  let listaV = "";
  for (let p = 0; p < palavras.length; p++) {
    const item = palavras[p];
    const tagTamanho = cfg.mostrarTamanho ? `<span class='qtd-letras'>(${item.resposta.length})</span>` : "";
    const li = `<li id='p${item.numero}'
      onclick="selecionarPista(${p})"
      onmouseenter="previsualizarPalavra(${p}, true)"
      onmouseleave="previsualizarPalavra(${p}, false)">
      <div class='pista-conteudo'>
        <b>${item.numero}.</b> ${item.pista}${tagTamanho}
      </div>
      <button type='button' class='btn-check-item' title='Validar apenas a pergunta ${item.numero}' onclick="event.stopPropagation(); conferirPalavraPorIndice(${p})">✓</button>
    </li>`;
    if (item.direcao === "H") {
      listaH += li;
    } else {
      listaV += li;
    }
  }

  document.getElementById("horizontais").innerHTML = listaH;
  document.getElementById("verticais").innerHTML = listaV;

  aplicarFiltroPistas();
  configurarEventosCelulas();
  atualizarPlacar();
  document.getElementById("tentativas").textContent = "Checagens: 0";
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
      if (jogoEncerrado || casa.readOnly) return;
      const limpo = casa.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase();
      casa.value = limpo.slice(-1);
      casa.classList.remove("errada", "dica-revelada");

      if (casa.value !== "") {
        tocarSom("tecla");
        avancarParaProximaEditavel(l, c);
      }
    });

    casa.addEventListener("keydown", e => {
      if (jogoEncerrado) return;

      if (casa.readOnly && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const proxima = encontrarProximaCasaEditavel(l, c);
        if (proxima) {
          proxima.value = e.key.toUpperCase();
          proxima.classList.remove("errada");
          tocarSom("tecla");
          const [nl, nc] = extrairCoordenadas(proxima.id);
          proxima.focus();
          avancarParaProximaEditavel(nl, nc);
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        alternarDirecao();
      } else if (e.key === "Tab") {
        e.preventDefault();
        navegarPalavra(e.shiftKey ? -1 : 1);
      } else if (e.key === "Backspace") {
        if (casa.readOnly || casa.value === "") {
          e.preventDefault();
          recuarEApagarEditavel(l, c);
        } else {
          casa.classList.remove("errada");
        }
      } else if (e.key === "Backspace") {
        if (casa.readOnly || casa.value === "") {
          e.preventDefault();
          recuarEApagarEditavel(l, c);
        } else {
          casa.classList.remove("errada");
        }
      } else if (e.key === "Delete") {
        if (!casa.readOnly) {
          e.preventDefault();
          casa.value = "";
          casa.classList.remove("errada", "dica-revelada");
        }
      } else if (e.key === "ArrowRight") {
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
        conferirPalavraAtual();
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
  palavraSelecionada = ativa;
  direcaoAtual = ativa.direcao;
  atualizarIndicadorDirecao();

  for (let i = 0; i < ativa.resposta.length; i++) {
    const cl = ativa.direcao === "H" ? ativa.linha : ativa.linha + i;
    const cc = ativa.direcao === "H" ? ativa.coluna + i : ativa.coluna;
    const input = document.getElementById(`c${cl}_${cc}`);
    if (input) input.classList.add("palavra-ativa");
  }

  const dirExtenso = ativa.direcao === "H" ? "HORIZONTAL" : "VERTICAL";
  document.getElementById("visor-tag").textContent = `PERGUNTA ${ativa.numero} • ${dirExtenso}`;
  document.getElementById("visor-texto").textContent = ativa.pista;

  const cfg = CONFIG_MODOS[modoAtual];
  document.getElementById("visor-slots").textContent = cfg.mostrarTamanho
    ? `${ativa.resposta.length} LETRAS`
    : "TAMANHO OCULTO";

  const btnValidar = document.getElementById("btn-validar-atual");
  btnValidar.disabled = palavrasValidadas.has(ativa.numero) || jogoEncerrado;

  const pistaEl = document.getElementById(`p${ativa.numero}`);
  if (pistaEl) {
    pistaEl.classList.add("pista-ativa");
    pistaEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function navegarPalavra(delta) {
  let idxAtual = palavraSelecionada ? palavras.indexOf(palavraSelecionada) : -1;
  for (let i = 0; i < palavras.length; i++) {
    idxAtual = (idxAtual + delta + palavras.length) % palavras.length;
    const candidata = palavras[idxAtual];
    if (!palavrasValidadas.has(candidata.numero)) {
      selecionarPista(idxAtual);
      return;
    }
  }
  selecionarPista((idxAtual + delta + palavras.length) % palavras.length);
}

function previsualizarPalavra(indicePalavra, ativar) {
  const p = palavras[indicePalavra];
  for (let i = 0; i < p.resposta.length; i++) {
    const l = p.direcao === "H" ? p.linha : p.linha + i;
    const c = p.direcao === "H" ? p.coluna + i : p.coluna;
    const casa = document.getElementById(`c${l}_${c}`);
    if (casa) casa.classList.toggle("preview-hover", ativar);
  }
}

function selecionarPista(indicePalavra) {
  const p = palavras[indicePalavra];
  direcaoAtual = p.direcao;
  atualizarIndicadorDirecao();

  let casaAlvo = document.getElementById(`c${p.linha}_${p.coluna}`);
  for (let i = 0; i < p.resposta.length; i++) {
    const l = p.direcao === "H" ? p.linha : p.linha + i;
    const c = p.direcao === "H" ? p.coluna + i : p.coluna;
    const candidata = document.getElementById(`c${l}_${c}`);
    if (candidata && !candidata.readOnly && candidata.value === "") {
      casaAlvo = candidata;
      break;
    }
  }
  if (casaAlvo) casaAlvo.focus();
}

function encontrarProximaCasaEditavel(l, c) {
  let passo = 1;
  while (passo < totalColunas + totalLinhas) {
    const proxL = direcaoAtual === "V" ? l + passo : l;
    const proxC = direcaoAtual === "H" ? c + passo : c;
    const destino = document.getElementById(`c${proxL}_${proxC}`);
    if (!destino) return null;
    if (!destino.readOnly) return destino;
    passo++;
  }
  return null;
}

function avancarParaProximaEditavel(l, c) {
  const destino = encontrarProximaCasaEditavel(l, c);
  if (destino) destino.focus();
}

function recuarEApagarEditavel(l, c) {
  let passo = 1;
  while (passo < totalColunas + totalLinhas) {
    const antL = direcaoAtual === "V" ? l - passo : l;
    const antC = direcaoAtual === "H" ? c - passo : c;
    const destino = document.getElementById(`c${antL}_${antC}`);
    if (!destino) return;
    if (!destino.readOnly) {
      destino.value = "";
      destino.classList.remove("errada");
      destino.focus();
      return;
    }
    passo++;
  }
}

function focarSeExistir(l, c) {
  const alvo = document.getElementById(`c${l}_${c}`);
  if (alvo) alvo.focus();
}

/* Filtro de Pistas */
function filtrarPistas(tipo) {
  filtroAtual = tipo;
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.filtro === tipo);
  });
  aplicarFiltroPistas();
}

function aplicarFiltroPistas() {
  document.querySelectorAll(".pistas li").forEach(li => {
    const esconder = filtroAtual === "pendentes" && li.classList.contains("certa");
    li.classList.toggle("oculta-filtro", esconder);
  });
}

/* Sistema de Dicas */
function usarDica() {
  if (jogoEncerrado || dicasRestantes <= 0) return;

  if (!palavraSelecionada) {
    exibirBanner("Selecione uma pergunta no tabuleiro ou na lista antes de pedir dica.", "alerta");
    return;
  }

  const candidatas = [];
  for (let i = 0; i < palavraSelecionada.resposta.length; i++) {
    const l = palavraSelecionada.direcao === "H" ? palavraSelecionada.linha : palavraSelecionada.linha + i;
    const c = palavraSelecionada.direcao === "H" ? palavraSelecionada.coluna + i : palavraSelecionada.coluna;
    const casa = document.getElementById(`c${l}_${c}`);
    if (casa && !casa.readOnly && casa.value.toUpperCase() !== palavraSelecionada.resposta[i]) {
      candidatas.push({ casa, letra: palavraSelecionada.resposta[i] });
    }
  }

  if (candidatas.length === 0) {
    exibirBanner("Todas as letras desta pergunta já estão corretas! Clique em Validar esta palavra.", "sucesso");
    return;
  }

  const sorteada = candidatas[Math.floor(Math.random() * candidatas.length)];
  sorteada.casa.value = sorteada.letra;
  sorteada.casa.readOnly = true;
  sorteada.casa.classList.remove("errada");
  sorteada.casa.classList.add("dica-revelada");
  sorteada.casa.focus();

  dicasRestantes--;
  dicasUsadas++;
  atualizarBotaoDica();
  tocarSom("dica");

  const cfg = CONFIG_MODOS[modoAtual];
  if (cfg.regressivo) {
    segundos = Math.max(0, segundos - 15);
    atualizarDisplayTimer();
    exibirBanner(`Dica na pergunta ${palavraSelecionada.numero}: letra "${sorteada.letra}" revelada (-15s).`, "alerta");
    if (segundos === 0) encerrarPorTempo();
  } else {
    exibirBanner(`Dica na pergunta ${palavraSelecionada.numero}: letra "${sorteada.letra}" revelada.`, "alerta");
  }
}

function atualizarBotaoDica() {
  const btn = document.getElementById("btn-dica");
  document.getElementById("dicas-restantes").textContent = dicasRestantes;
  btn.disabled = dicasRestantes <= 0;
}

/* Verificação Individual de Uma Pergunta */
function conferirPalavraAtual() {
  if (!palavraSelecionada) return;
  const idx = palavras.indexOf(palavraSelecionada);
  if (idx !== -1) conferirPalavraPorIndice(idx);
}

function conferirPalavraPorIndice(indicePalavra) {
  if (jogoEncerrado) return;

  const item = palavras[indicePalavra];
  if (palavrasValidadas.has(item.numero)) {
    exibirBanner(`A pergunta ${item.numero} já foi validada anteriormente.`, "sucesso");
    return;
  }

  qtdVerificacoes++;
  document.getElementById("tentativas").textContent = `Checagens: ${qtdVerificacoes}`;

  let digitado = "";
  const casasPalavra = [];
  for (let i = 0; i < item.resposta.length; i++) {
    const l = item.direcao === "H" ? item.linha : item.linha + i;
    const c = item.direcao === "H" ? item.coluna + i : item.coluna;
    const casa = document.getElementById(`c${l}_${c}`);
    digitado += casa.value.toUpperCase();
    casasPalavra.push(casa);
  }

  const liPista = document.getElementById(`p${item.numero}`);

  if (digitado === item.resposta) {
    palavrasValidadas.add(item.numero);
    liPista.classList.remove("errada");
    liPista.classList.add("certa");

    casasPalavra.forEach(casa => {
      casa.classList.remove("errada", "dica-revelada");
      casa.classList.add("certa");
      casa.readOnly = true;
    });

    aplicarFiltroPistas();
    atualizarPlacar();

    if (palavrasValidadas.size === palavras.length) {
      finalizarComVitoria();
    } else {
      tocarSom("acerto");
      exibirBanner(`Pergunta ${item.numero} correta! (${palavrasValidadas.size} de ${palavras.length} palavras validadas)`, "sucesso");
      navegarPalavra(1);
    }
  } else {
    liPista.classList.remove("certa");
    liPista.classList.add("errada");

    casasPalavra.forEach(casa => {
      // Protege células já travadas por cruzamentos ou dicas anteriores
      if (!casa.readOnly) {
        casa.classList.remove("errada");
        void casa.offsetWidth; // Reinicia animação shake
        casa.classList.add("errada");
      }
    });

    tocarSom("erro");
    const cfg = CONFIG_MODOS[modoAtual];
    if (cfg.regressivo && cfg.penalidadeUnica > 0) {
      segundos = Math.max(0, segundos - cfg.penalidadeUnica);
      atualizarDisplayTimer();
      exibirBanner(`Pergunta ${item.numero} incorreta! Penalidade individual de -${cfg.penalidadeUnica}s.`, "alerta");
      if (segundos === 0) encerrarPorTempo();
    } else {
      exibirBanner(`Pergunta ${item.numero} incorreta. Revise as letras em vermelho.`, "alerta");
    }

    selecionarPista(indicePalavra);
  }
}

/* Verificação Geral de Todas as Perguntas (Requisito 4) */
function conferir() {
  if (jogoEncerrado) return;

  const celulasCertas = new Set();
  const celulasErradas = new Set();

  qtdVerificacoes++;
  document.getElementById("tentativas").textContent = `Checagens: ${qtdVerificacoes}`;

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

    const liPista = document.getElementById(`p${item.numero}`);
    liPista.classList.remove("certa", "errada");

    if (digitado === item.resposta) {
      palavrasValidadas.add(item.numero);
      liPista.classList.add("certa");
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
      casa.readOnly = true;
    } else if (celulasErradas.has(chave) && !casa.readOnly) {
      casa.classList.add("errada");
    }
  });

  if (palavraSelecionada) {
    document.getElementById("btn-validar-atual").disabled = palavrasValidadas.has(palavraSelecionada.numero);
  }

  aplicarFiltroPistas();
  atualizarPlacar();

  const acertos = palavrasValidadas.size;
  if (acertos === palavras.length) {
    finalizarComVitoria();
  } else {
    tocarSom("erro");
    const cfg = CONFIG_MODOS[modoAtual];
    if (cfg.regressivo && cfg.penalidadeGeral > 0) {
      segundos = Math.max(0, segundos - cfg.penalidadeGeral);
      atualizarDisplayTimer();
      exibirBanner(`Conferência geral: ${acertos} de ${palavras.length} certas. Penalidade de -${cfg.penalidadeGeral}s aplicada!`, "alerta");
      if (segundos === 0) encerrarPorTempo();
    } else {
      exibirBanner(`${acertos} de ${palavras.length} palavras corretas. Revise os itens em vermelho.`, "alerta");
    }
  }
}

function atualizarPlacar() {
  const acertos = palavrasValidadas.size;
  const total = palavras.length;
  const percentual = Math.round((acertos / total) * 100);
  document.getElementById("resultado").textContent = `${acertos} de ${total} palavras`;
  document.getElementById("percentual-progresso").textContent = `${percentual}%`;
  document.getElementById("barra-fill").style.width = `${percentual}%`;

  const totalH = palavras.filter(p => p.direcao === "H").length;
  const certasH = palavras.filter(p => p.direcao === "H" && palavrasValidadas.has(p.numero)).length;
  const totalV = palavras.filter(p => p.direcao === "V").length;
  const certasV = palavras.filter(p => p.direcao === "V" && palavrasValidadas.has(p.numero)).length;

  document.getElementById("cont-h").textContent = `${certasH}/${totalH}`;
  document.getElementById("cont-v").textContent = `${certasV}/${totalV}`;
}
/* Cronômetro e Recorde */
function reiniciarTimer() {
  clearInterval(intervaloTimer);
  const timerEl = document.getElementById("timer");
  timerEl.classList.remove("timer-alerta", "timer-critico");

  const cfg = CONFIG_MODOS[modoAtual];
  segundos = cfg.tempo;
  segundosDecorridos = 0;
  atualizarDisplayTimer();

  intervaloTimer = setInterval(() => {
    if (jogoEncerrado) return;
    segundosDecorridos++;

    if (cfg.regressivo) {
      segundos--;
      atualizarDisplayTimer();
      if (segundos <= 60 && segundos > 20) {
        timerEl.classList.add("timer-alerta");
      } else if (segundos <= 20) {
        timerEl.classList.remove("timer-alerta");
        timerEl.classList.add("timer-critico");
      }
      if (segundos <= 0) encerrarPorTempo();
    } else {
      segundos++;
      atualizarDisplayTimer();
    }
  }, 1000);
}

function formatarTempo(totalSeg) {
  const mins = String(Math.floor(totalSeg / 60)).padStart(2, "0");
  const segs = String(totalSeg % 60).padStart(2, "0");
  return `${mins}:${segs}`;
}

function atualizarDisplayTimer() {
  document.getElementById("timer").textContent = formatarTempo(segundos);
}

function salvarRecordeSeMelhor() {
  const chave = `arqcomp_recorde_${modoAtual}`;
  const anterior = localStorage.getItem(chave);
  if (!anterior || segundosDecorridos < parseInt(anterior, 10)) {
    localStorage.setItem(chave, String(segundosDecorridos));
  }
  atualizarRecordeHUD();
}

function atualizarRecordeHUD() {
  const chave = `arqcomp_recorde_${modoAtual}`;
  const salvo = localStorage.getItem(chave);
  document.getElementById("melhor-tempo").textContent = salvo
    ? `Recorde: ${formatarTempo(parseInt(salvo, 10))}`
    : "Recorde: --:--";
}

function finalizarComVitoria() {
  jogoEncerrado = true;
  clearInterval(intervaloTimer);
  tocarSom("vitoria");
  salvarRecordeSeMelhor();

  const tempoGasto = formatarTempo(segundosDecorridos);
  document.getElementById("modal-badge").textContent = "MISSÃO CUMPRIDA // 100% VALIDADO";
  document.getElementById("modal-titulo").textContent = "Arquitetura Dominada!";
  document.getElementById("modal-descricao").textContent =
    `Você validou todas as 16 palavras em ${qtdVerificacoes} checagem(ns) no ${CONFIG_MODOS[modoAtual].nome}.`;
  document.getElementById("stat-acertos").textContent = "16 / 16";
  document.getElementById("stat-tempo").textContent = tempoGasto;
  document.getElementById("stat-dicas").textContent = String(dicasUsadas);
  document.getElementById("modal-fim").classList.remove("oculto");
}

function encerrarPorTempo() {
  jogoEncerrado = true;
  clearInterval(intervaloTimer);
  tocarSom("erro");

  let acertosFinais = 0;
  palavras.forEach(item => {
    let digitado = "";
    for (let i = 0; i < item.resposta.length; i++) {
      const l = item.direcao === "H" ? item.linha : item.linha + i;
      const c = item.direcao === "H" ? item.coluna + i : item.coluna;
      digitado += document.getElementById(`c${l}_${c}`).value.toUpperCase();
    }
    if (digitado === item.resposta) acertosFinais++;
  });

  document.querySelectorAll(".casa").forEach(c => (c.disabled = true));
  document.getElementById("modal-badge").textContent = "TIMEOUT // CLOCK ESGOTADO";
  document.getElementById("modal-titulo").textContent = "Tempo Esgotado!";
  document.getElementById("modal-descricao").textContent =
    "O ciclo de clock chegou a zero antes da validação completa do silício.";
  document.getElementById("stat-acertos").textContent = `${acertosFinais} / 16`;
  document.getElementById("stat-tempo").textContent = "00:00";
  document.getElementById("stat-dicas").textContent = String(dicasUsadas);
  document.getElementById("modal-fim").classList.remove("oculto");
}

function fecharModalEReiniciar() {
  document.getElementById("modal-fim").classList.add("oculto");
  iniciar();
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

document.addEventListener("DOMContentLoaded", () => {
  iniciar();
  selecionarPista(0);
});