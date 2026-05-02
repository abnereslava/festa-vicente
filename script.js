const nomesOriginais = [
"Abner","Mariana Cristina","Maria José","Flaviane","Lucas Tiago","Sara","Caio Moreira","Margarete","Dannilo","José David",
"Raquel","Mateus","Rafael Boeira","Flávia","Rafaela","Jéssica Fernanda","Cleverson","Helia","Ozamar","Onri",
"Priscila","Israel","Evelyn","Gabriel","Patrícia","Max","Lucas Gonçalves","Luana Bueno","Reianchell","Merli",
"Alexandre","Luiz Carlos","Maricler","Guilherme","Rebeca","Caio Miguel","Paula Caroline","Nikolas","Fernanda Caroline","Jessica Martins",
"Theodoro","Rosa Aurora","Noemi","Kevin","Luana Borges","Leonardo","Alex","Amanda","Willian Rodrigues","Amabilie",
"Kesia","Lucas Sant'Anna","Isabella","Maria Helena","Beijamin","Rafael Borges","Caio Borges","Lívia","Alice","William Alencar",
"Elisabeth","Noah","Cecília","Helena"
];

let grupoAtual = "";
let alternativaSelecionada = null;
let timerQuiz = null; // Variável para controlar a contagem regressiva
const ordemEquipes = ["Elfos", "Hobbits", "Anões", "Orcs"];

let estado = JSON.parse(localStorage.getItem("vicenteFesta")) || {
    disponiveis: [...nomesOriginais],
    grupos: { Elfos: [], Hobbits: [], "Anões": [], Orcs: [] },
    quizIniciado: false,
    perguntasDistribuidas: null,
    turnoGeral: 0, 
    pontosQuiz: { Elfos: 0, Hobbits: 0, "Anões": 0, Orcs: 0 }
};

const bancoPerguntas = [
    { titulo:"🏥 A Chegada", texto:"Quantas vezes mamãe e papai foram ao hospital no dia do nascimento?", alternativas:["3 vezes","2 vezes","1 vez"], correta:0 },
    { titulo:"🛋️ O Salto de Mordor", texto:"Com quantos meses Vicente se jogou do sofá?", alternativas:["8 meses","6 meses","4 meses"], correta:0 },
    { titulo:"🍈 Fruta do Condado", texto:"Qual é a fruta predileta de Vicente?", alternativas:["Pitaya","Manga","Banana"], correta:0 },
    { titulo:"🙏 Ritual do Banquete", texto:"O que ele sempre faz antes de uma refeição?", alternativas:["Mãozinhas de oração","Bate palmas","Joga comida no chão"], correta:0 },
    { titulo:"🌅 Despertar do Rei", texto:"O que Vicente faz assim que acorda?", alternativas:["Fica sentado","Põe as mãos no rosto","Grita pela mamãe"], correta:0 },
    { titulo:"🐵 Tesouro da Floresta", texto:"Qual é o brinquedo preferido?", alternativas:["Macaquinho da vovó","Pokémon","Dinossauro"], correta:0 },
    { titulo:"🏍️ Terras Livres", texto:"O que ele ama apontar na motoca?", alternativas:["Placas de trânsito","Pessoas","Os dois"], correta:0 },
    { titulo:"⚔️ Batalha dos 3 Meses", texto:"Com 3 meses Vicente passou por cirurgia. Do que era?", alternativas:["Hérnia inguinal","Fimose","Hérnia umbilical"], correta:0 },
    { titulo:"🥚 Feitiço de Popó", texto:"Qual alimento causou reação alérgica?", alternativas:["Ovo","Leite","Morango"], correta:0 },
    { titulo:"🪢 Laço do Destino", texto:"Quantas voltas do cordão no pescoço?", alternativas:["1 volta","2 voltas","3 voltas"], correta:2 },
    { titulo:"🏖️ Férias no Condado", texto:"Na praia, do que mais gostou?", alternativas:["Brincar na areia","Brincar no mar","Dormir"], correta:0 },
    { titulo:"🛡️ Batalha da Pele", texto:"Com menos de 1 mês, o que ele teve?", alternativas:["Dermatite atópica","Brotoeja","Icterícia"], correta:0 }
];

function salvar(){
    localStorage.setItem("vicenteFesta", JSON.stringify(estado));
}

function mostrar(id){
    document.querySelectorAll(".screen").forEach(t => t.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    
    if(id==="tela3") setTimeout(renderNomes,50);
    if(id==="telao") setTimeout(renderTelao,50);
    if(id==="quiz") setTimeout(prepararTurno,50);
    if(id==="ranking") setTimeout(gerarRankingFinal,50);
}

function escolherGrupo(grupo){
    // NOVA LÓGICA DE BALANCEAMENTO:
    // Verifica se TODAS as equipes já possuem pelo menos 5 membros.
    let todosTemMinimo = ordemEquipes.every(g => estado.grupos[g].length >= 5);
    
    // Se nem todas têm 5, bloqueia a inserção se a equipe escolhida já tiver alcançado a cota de 5.
    if(!todosTemMinimo && estado.grupos[grupo].length >= 5) {
        alert(`⚠️ Mantenha o equilíbrio da Terra Média!\n\nOs ${grupo} já possuem membros suficientes no momento.\nPor favor, escolha uma equipe que ainda não atingiu o mínimo de 5 integrantes. Quando todas as equipes tiverem 5 guerreiros, a restrição será removida!`);
        return;
    }

    grupoAtual = grupo;
    document.getElementById("grupoEscolhidoTitulo").innerText = grupo;
    document.getElementById("buscaNome").value = ""; 
    mostrar("tela3");
}

function renderNomes(){
    const area = document.getElementById("listaNomes");
    area.innerHTML = "";
    
    let termo = document.getElementById("buscaNome").value.toLowerCase();

    let filtrados = estado.disponiveis
        .filter(n => n.toLowerCase().includes(termo))
        .sort((a, b) => a.localeCompare(b));

    filtrados.forEach(nome => {
        const div = document.createElement("div");
        div.className = "nome-container";

        const btn = document.createElement("button");
        btn.className = "nameBtn";
        btn.innerText = nome;
        btn.onclick = () => confirmar(nome);

        const btnRemover = document.createElement("button");
        btnRemover.className = "removeBtn";
        btnRemover.innerHTML = "✖";
        btnRemover.title = "Remover Convidado (Não compareceu)";
        btnRemover.onclick = () => removerConvidado(nome);

        div.appendChild(btn);
        div.appendChild(btnRemover);
        area.appendChild(div);
    });
}

function removerConvidado(nome) {
    if(confirm(`O convidado "${nome}" não veio? Deseja removê-lo da lista de opções?`)){
        estado.disponiveis = estado.disponiveis.filter(n => n !== nome);
        salvar();
        renderNomes();
    }
}

function confirmar(nome){
    estado.grupos[grupoAtual].push(nome);
    estado.disponiveis = estado.disponiveis.filter(n=>n!==nome);
    salvar();
    
    // Adiciona o emoji dinâmico acima da confirmação
    document.getElementById("emojiConfirmacao").innerText = pegarEmoji(grupoAtual);
    document.getElementById("confirmacao").innerText = nome + " se uniu aos " + grupoAtual + "!";
    mostrar("tela4");
}

function renderTelao(){
    ["Elfos","Hobbits","Anões","Orcs"].forEach(grupo => {
        let id = "lista" + grupo.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        const ul = document.getElementById(id);
        if(ul){
            ul.innerHTML = "";
            estado.grupos[grupo].forEach(nome => {
                const li = document.createElement("li");
                li.innerText = "• " + nome;
                ul.appendChild(li);
            });
        }
    });
}

function irTelao(){ mostrar("telao"); }

function resetar(){
    if(confirm("Deseja apagar as alianças e o progresso da jornada?")){
        localStorage.removeItem("vicenteFesta");
        location.reload();
    }
}

// ------ LÓGICA DO QUIZ ------

function embaralhar(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function iniciarQuiz() {
    let perguntasSorteadas = embaralhar(bancoPerguntas);
    estado.perguntasDistribuidas = {
        "Elfos": perguntasSorteadas.slice(0, 3),
        "Hobbits": perguntasSorteadas.slice(3, 6),
        "Anões": perguntasSorteadas.slice(6, 9),
        "Orcs": perguntasSorteadas.slice(9, 12)
    };
    estado.quizIniciado = true;
    estado.turnoGeral = 0;
    estado.pontosQuiz = { Elfos: 0, Hobbits: 0, "Anões": 0, Orcs: 0 };
    
    salvar();
    mostrar("quiz");
}

function atualizarPlacarLateral() {
    ordemEquipes.forEach(eq => {
        let idEq = eq.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        document.getElementById("score" + idEq).innerText = estado.pontosQuiz[eq] + " pts";
    });
}

function limparDestaquesLateral() {
    document.querySelectorAll(".card-equipe").forEach(c => {
        c.classList.remove("turno-ativo", "acertou", "errou");
    });
}

function prepararTurno() {
    atualizarPlacarLateral();
    limparDestaquesLateral();
    
    // Cancela qualquer contagem anterior que possa ter ficado presa
    if(timerQuiz) clearInterval(timerQuiz);
    
    document.getElementById("btnConfirmar").classList.add("hidden");
    document.getElementById("btnProxima").classList.add("hidden");
    document.getElementById("resultadoQuiz").className = "resultado-box hidden";
    document.getElementById("resultadoQuiz").innerText = "";
    alternativaSelecionada = null;

    if (estado.turnoGeral >= 12) {
        mostrar("ranking");
        return;
    }

    let equipeVez = ordemEquipes[estado.turnoGeral % 4];
    let idEqCard = "cardTurno" + equipeVez.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    document.getElementById(idEqCard).classList.add("turno-ativo");
    document.getElementById("avisoTurno").innerText = "Atenção: Turno dos " + equipeVez;

    let indicePerguntaEquipe = Math.floor(estado.turnoGeral / 4);
    let p = estado.perguntasDistribuidas[equipeVez][indicePerguntaEquipe];

    let indexFoto = bancoPerguntas.findIndex(x => x.titulo === p.titulo) + 1;
    document.getElementById("fotoPergunta").src = "assets/imagens/foto" + indexFoto + ".jpg";
    
    document.getElementById("perguntaTitulo").innerText = p.titulo;
    document.getElementById("perguntaTexto").innerText = p.texto;

    const areaAlt = document.getElementById("alternativas");
    const contador = document.getElementById("contadorQuiz");
    
    areaAlt.innerHTML = "";
    areaAlt.classList.add("hidden"); // Esconde as alternativas no início
    contador.classList.remove("hidden"); // Mostra o contador
    
    let tempo = 3;
    contador.innerText = tempo;

    // Inicia a contagem regressiva
    timerQuiz = setInterval(() => {
        tempo--;
        if(tempo > 0) {
            contador.innerText = tempo;
        } else {
            clearInterval(timerQuiz);
            contador.classList.add("hidden");
            areaAlt.classList.remove("hidden"); // Revela as alternativas
        }
    }, 1000);

    // Constrói os botões invisíveis em segundo plano enquanto a contagem roda
    let alternativasComIndex = p.alternativas.map((texto, index) => ({texto: texto, originalIndex: index}));
    let alternativasEmbaralhadas = embaralhar(alternativasComIndex);

    alternativasEmbaralhadas.forEach((alt) => {
        const btn = document.createElement("button");
        btn.className = "altBtn";
        btn.innerText = alt.texto;
        
        btn.onclick = () => {
            document.querySelectorAll(".altBtn").forEach(x => x.classList.remove("selecionada"));
            btn.classList.add("selecionada");
            alternativaSelecionada = alt.originalIndex; 
            document.getElementById("btnConfirmar").classList.remove("hidden");
        };
        
        areaAlt.appendChild(btn);
    });
}

function confirmarResposta() {
    if (alternativaSelecionada === null) return;
    
    let equipeVez = ordemEquipes[estado.turnoGeral % 4];
    let indicePerguntaEquipe = Math.floor(estado.turnoGeral / 4);
    let p = estado.perguntasDistribuidas[equipeVez][indicePerguntaEquipe];
    
    let idEqCard = "cardTurno" + equipeVez.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let cardSide = document.getElementById(idEqCard);
    let resBox = document.getElementById("resultadoQuiz");

    document.querySelectorAll(".altBtn").forEach(btn => btn.disabled = true);
    document.getElementById("btnConfirmar").classList.add("hidden");

    // Validação correta indepentente da ordem atual dos botões
    if (alternativaSelecionada === p.correta) {
        estado.pontosQuiz[equipeVez]++;
        salvar();
        atualizarPlacarLateral();
        
        cardSide.classList.remove("turno-ativo");
        cardSide.classList.add("acertou");
        
        resBox.innerText = "✨ Glória! Os " + equipeVez + " acertaram!";
        resBox.className = "resultado-box sucesso";
    } else {
        cardSide.classList.remove("turno-ativo");
        cardSide.classList.add("errou");
        
        resBox.innerText = "💀 Sombras... A resposta estava errada.";
        resBox.className = "resultado-box falha";
    }

    document.getElementById("btnProxima").classList.remove("hidden");
}

function proximaPergunta() {
    estado.turnoGeral++;
    salvar();
    prepararTurno();
}

function gerarRankingFinal() {
    const board = document.getElementById("boardRanking");
    board.innerHTML = "";
    
    let placarOrdenado = ordemEquipes.map(eq => {
        return { nome: eq, pontos: estado.pontosQuiz[eq], emoji: pegarEmoji(eq) };
    }).sort((a, b) => b.pontos - a.pontos);

    let maxPontos = placarOrdenado[0].pontos;

    placarOrdenado.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "group pergaminho";
        
        let medalha = "";
        
        if(item.pontos === maxPontos && maxPontos > 0) {
            medalha = "👑";
            div.classList.add("vencedor"); 
        }

        div.innerHTML = `<h3>${medalha} ${item.emoji} ${item.nome}</h3>
                         <p style="font-size: 30px; margin-top:15px; color: var(--gold); font-weight:bold;">${item.pontos} Pontos</p>`;
        board.appendChild(div);
    });
}

function pegarEmoji(equipe){
    if(equipe==="Elfos") return "🧝";
    if(equipe==="Hobbits") return "🍃";
    if(equipe==="Anões") return "⛏️";
    return "🧌"; 
}

// ------ GERENCIADOR DA ANIMAÇÃO DO MASCOTE ------
function loopAnimacaoVicente() {
    const mascote = document.getElementById("vicenteMascote");
    if(!mascote) return;

    // Limpa classes de animação anteriores
    mascote.classList.remove("animacao-espiada", "animacao-pulos");

    // Lugares estratégicos: Canto Esquerdo, Centro-Esquerdo, Centro-Direito, Canto Direito
    const posicoes = [
        { left: "5%", right: "auto" },
        { left: "30%", right: "auto" },
        { left: "auto", right: "30%" },
        { left: "auto", right: "5%" }
    ];

    // Sorteia uma das posições e aplica no CSS inline
    const posEscolhida = posicoes[Math.floor(Math.random() * posicoes.length)];
    mascote.style.left = posEscolhida.left;
    mascote.style.right = posEscolhida.right;

    // Sorteia um tempo de espera entre 15 e 40 segundos
    const tempoEspera = Math.floor(Math.random() * (40000 - 15000 + 1)) + 15000;

    setTimeout(() => {
        // Sorteia a animação (50% de chance para cada)
        const classeAnimacao = Math.random() > 0.5 ? "animacao-espiada" : "animacao-pulos";
        
        // Força um reflow para o navegador entender que a animação deve recomeçar
        void mascote.offsetWidth; 
        mascote.classList.add(classeAnimacao);

        // A animação mais longa dura 4 segundos. Após 5 segundos, repete o ciclo.
        setTimeout(loopAnimacaoVicente, 5000);

    }, tempoEspera);
}

document.addEventListener("DOMContentLoaded", () => {
    mostrar("tela1");
    
    // Inicia o loop do mascote animado
    loopAnimacaoVicente();

    if(document.getElementById("btnIniciar")) {
        document.getElementById("btnIniciar").onclick = () => mostrar("tela2");
    }

    document.querySelectorAll("#tela2 .card").forEach(card => {
        if(card.dataset.grupo){
            card.onclick = () => escolherGrupo(card.dataset.grupo);
        }
    });
});