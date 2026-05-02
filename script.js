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
let timerQuiz = null; 
const ordemEquipes = ["Elfos", "Hobbits", "Anões", "Orcs"];

// Variável para manter a ordem das alternativas na rodada atual
let alternativasAtuaisEmbaralhadas = [];

// O estado foi atualizado para suportar a nova dinâmica de rodadas globais
let estado = JSON.parse(localStorage.getItem("vicenteFesta")) || {
    disponiveis: [...nomesOriginais],
    grupos: { Elfos: [], Hobbits: [], "Anões": [], Orcs: [] },
    quizIniciado: false,
    perguntasDoJogo: [],
    rodadaAtual: 0,
    equipeRespondendoIndex: 0,
    respostasRodada: {}, // Guarda as respostas das 4 equipes antes de revelar
    pontosQuiz: { Elfos: 0, Hobbits: 0, "Anões": 0, Orcs: 0 }
};

const bancoPerguntas = [
    { titulo:"🏥 A Chegada", texto:"Quantas vezes a mamãe e o papai foram ao hospital na ocasião do nascimento?", alternativas:["3 vezes","2 vezes","1 vez"], correta:0 },
    { titulo:"🛋️ O Salto de Mordor", texto:"Com quantos meses o Vicente se jogou do sofá?", alternativas:["8 meses","6 meses","4 meses"], correta:0 },
    { titulo:"🍈 A Fruta do Condado", texto:"Qual é a fruta predileta de Vicente?", alternativas:["Pitaya","Manga","Banana"], correta:0 },
    { titulo:"🍖 O Ritual do Banquete", texto:"O que ele sempre faz antes de uma refeição?", alternativas:["Mãozinhas de oração","Bate palmas","Joga comida no chão"], correta:0 },
    { titulo:"🌅 O Despertar do Rei", texto:"O que Vicente faz assim que acorda?", alternativas:["Fica sentado","Põe as mãos no rosto","Grita pela mamãe"], correta:0 },
    { titulo:"🧸 O Tesouro de Mithril", texto:"Qual é o brinquedo preferido do Vicente?", alternativas:["Macaquinho de pelúcia","Pokémon de plástico","Dinossauro de pelúcia"], correta:0 },
    { titulo:"🏍️ Explorando as Terras Livres", texto:"O que ele ama apontar quando sai pra passear de motoca?", alternativas:["Placas de trânsito","Pessoas","Animais"], correta:0 },
    { titulo:"⚔️ A Batalha dos 3 Meses", texto:"Com 3 meses o Vicente passou por uma cirurgia. Devido a que?", alternativas:["Hérnia inguinal","Fimose","Hérnia umbilical"], correta:0 },
    { titulo:"🍴 O Manjar Proibido", texto:"Qual alimento lhe causou reação alérgica?", alternativas:["Ovo","Leite","Morango"], correta:0 },
    { titulo:"🪢 Laços do Destino", texto:"Com quantas voltas do cordão umbilical no pescoço o Vicente nasceu?", alternativas:["1 volta","2 voltas","3 voltas"], correta:2 },
    { titulo:"🏖️ Férias em Valinor", texto:"Ao visitar a praia, do que o Vicente mais gostou?", alternativas:["Brincar na areia","Brincar no mar","Dormir"], correta:0 },
    { titulo:"👁️ A Provação de Sauron", texto:"Com menos de 1 mês, o que ele teve na pele?", alternativas:["Dermatite atópica","Brotoeja","Icterícia"], correta:0 },
    { titulo:"🏖️ O Ingrediente Secreto", texto:"Após enfiar uma mão bem cheia de areia da praia na boca, o Vicente começou a demonstrar uma nova habilidade. Qual?", alternativas:["Engatinhar","Mandar beijo","Falar"], correta:0 },
    { titulo:"🎺 Anúncio Real", texto:"Com quantos meses o Vicente foi apresentado na Igreja?", alternativas:["3 meses","4 meses","2 meses"], correta:0 },
    { titulo:"🗣️ Aprendendo a Língua da Terra Média", texto:"Qual foi a primeira palavra que o Vicente aprendeu a falar?", alternativas:["Água","Papai","Abre"], correta:0 }
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
    let todosTemMinimo = ordemEquipes.every(g => estado.grupos[g].length >= 5);
    if(!todosTemMinimo && estado.grupos[grupo].length >= 5) {
        alert(`⚠️ Mantenha o equilíbrio da Terra Média!\n\nOs ${grupo} já possuem membros suficientes no momento.\nPor favor, escolha uma equipe que ainda não atingiu o mínimo de 5 integrantes.`);
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
    // Agora o jogo tem todas as perguntas em ordem aleatória (15 rodadas)
    estado.perguntasDoJogo = embaralhar(bancoPerguntas);
    estado.quizIniciado = true;
    estado.rodadaAtual = 0;
    estado.equipeRespondendoIndex = 0;
    estado.respostasRodada = {};
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
    
    if(timerQuiz) clearInterval(timerQuiz);
    
    document.getElementById("btnConfirmar").classList.add("hidden");
    document.getElementById("btnProxima").classList.add("hidden");
    const resBox = document.getElementById("resultadoQuiz");
    resBox.className = "resultado-box hidden";
    resBox.innerText = "";
    alternativaSelecionada = null;

    // Se todas as perguntas já foram feitas, vai pro Ranking
    if (estado.rodadaAtual >= estado.perguntasDoJogo.length) {
        mostrar("ranking");
        return;
    }

    let p = estado.perguntasDoJogo[estado.rodadaAtual];
    let equipeVez = ordemEquipes[estado.equipeRespondendoIndex];
    
    // Destaca a equipe que deve responder agora
    let idEqCard = "cardTurno" + equipeVez.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    document.getElementById(idEqCard).classList.add("turno-ativo");
    
    document.getElementById("avisoTurno").innerText = `Rodada ${estado.rodadaAtual + 1} - Vez dos ${equipeVez}`;

    // A mágica da imagem automatizada para todas as 15 perguntas
    let indexFoto = bancoPerguntas.findIndex(x => x.titulo === p.titulo) + 1;
    document.getElementById("fotoPergunta").src = "assets/pergunta" + indexFoto + ".png";
    
    document.getElementById("perguntaTitulo").innerText = p.titulo;
    document.getElementById("perguntaTexto").innerText = p.texto;

    const areaAlt = document.getElementById("alternativas");
    const contador = document.getElementById("contadorQuiz");
    
    areaAlt.innerHTML = "";

    // O cronômetro roda apenas na vez da 1ª equipe (Elfos). Para as outras, as alternativas já ficam liberadas.
    if (estado.equipeRespondendoIndex === 0) {
        areaAlt.classList.add("hidden"); 
        contador.classList.remove("hidden"); 
        
        // Embaralha as alternativas UMA VEZ por rodada
        let alternativasComIndex = p.alternativas.map((texto, index) => ({texto: texto, originalIndex: index}));
        alternativasAtuaisEmbaralhadas = embaralhar(alternativasComIndex);
        
        let tempo = 3;
        contador.innerText = tempo;

        timerQuiz = setInterval(() => {
            tempo--;
            if(tempo > 0) {
                contador.innerText = tempo;
            } else {
                clearInterval(timerQuiz);
                contador.classList.add("hidden");
                areaAlt.classList.remove("hidden");
            }
        }, 1000);
    } else {
        // Se for a 2ª, 3ª ou 4ª equipe a escolher, pula o contador
        contador.classList.add("hidden");
        areaAlt.classList.remove("hidden");
    }

    // Desenha as alternativas embaralhadas
    alternativasAtuaisEmbaralhadas.forEach((alt) => {
        const btn = document.createElement("button");
        btn.className = "altBtn";
        btn.innerText = alt.texto;
        
        btn.onclick = () => {
            document.querySelectorAll(".altBtn").forEach(x => x.classList.remove("selecionada"));
            btn.classList.add("selecionada");
            alternativaSelecionada = alt.originalIndex; 
            
            // O botão de confirmar diz exatamente o voto de quem você está registrando
            document.getElementById("btnConfirmar").innerText = `Registrar voto dos ${equipeVez}`;
            document.getElementById("btnConfirmar").classList.remove("hidden");
        };
        
        areaAlt.appendChild(btn);
    });
}

function confirmarResposta() {
    if (alternativaSelecionada === null) return;
    
    let equipeVez = ordemEquipes[estado.equipeRespondendoIndex];
    
    // Grava a resposta secreta da equipe
    estado.respostasRodada[equipeVez] = alternativaSelecionada;
    
    // Passa a vez para a próxima equipe
    estado.equipeRespondendoIndex++;
    salvar();

    if (estado.equipeRespondendoIndex < 4) {
        // Ainda faltam equipes escolherem
        prepararTurno();
    } else {
        // Todas as 4 equipes escolheram, hora de revelar!
        revelarRespostas();
    }
}

function revelarRespostas() {
    let p = estado.perguntasDoJogo[estado.rodadaAtual];
    let resBox = document.getElementById("resultadoQuiz");
    
    // Oculta a área de alternativas da tela para evitar cortes
    document.getElementById("alternativas").classList.add("hidden");
    
    document.getElementById("btnConfirmar").classList.add("hidden");
    document.getElementById("avisoTurno").innerText = "A Verdade Revelada!";

    limparDestaquesLateral(); 

    let acertaram = [];
    let erraram = [];

    // Confere quem acertou e errou
    ordemEquipes.forEach(eq => {
        let idEqCard = "cardTurno" + eq.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let cardSide = document.getElementById(idEqCard);
        
        if (estado.respostasRodada[eq] === p.correta) {
            estado.pontosQuiz[eq]++;
            cardSide.classList.add("acertou");
            acertaram.push(eq);
        } else {
            cardSide.classList.add("errou");
            erraram.push(eq);
        }
    });

    salvar();
    atualizarPlacarLateral();
    
    let textoCorreta = p.alternativas[p.correta];

    // Exibe o texto de resultado
    resBox.classList.remove("hidden");
    resBox.style.borderColor = ""; 

    if (acertaram.length === 4) {
        resBox.className = "resultado-box sucesso";
        resBox.innerHTML = `🌟 Perfeito! A resposta era <br><b>"${textoCorreta}"</b><br> Todas as alianças acertaram!`;
    } else if (acertaram.length === 0) {
        resBox.className = "resultado-box falha";
        resBox.innerHTML = `💀 Sombras... A resposta era <br><b>"${textoCorreta}"</b><br> Ninguém acertou!`;
    } else {
        resBox.className = "resultado-box";
        resBox.style.borderColor = "var(--gold)";
        resBox.innerHTML = `A resposta correta era <br><span style="color:var(--gold-glow); font-size:32px;">"${textoCorreta}"</span><br><br>✨ <b>Acertaram:</b> ${acertaram.join(", ")}<br>❌ <b>Erraram:</b> ${erraram.join(", ")}`;
    }

    let btnProxima = document.getElementById("btnProxima");
    btnProxima.classList.remove("hidden");
    
    // Se for a última pergunta, muda o texto do botão para finalizar
    if (estado.rodadaAtual === estado.perguntasDoJogo.length - 1) {
        btnProxima.innerText = "Ir para a Coroação Final";
    } else {
        btnProxima.innerText = "Avançar para a Próxima Pergunta";
    }
}

function proximaPergunta() {
    estado.rodadaAtual++;
    estado.equipeRespondendoIndex = 0;
    estado.respostasRodada = {};
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

    mascote.classList.remove("animacao-espiada", "animacao-pulos");

    const posicoes = [
        { left: "5%", right: "auto" },
        { left: "30%", right: "auto" },
        { left: "auto", right: "30%" },
        { left: "auto", right: "5%" }
    ];

    const posEscolhida = posicoes[Math.floor(Math.random() * posicoes.length)];
    mascote.style.left = posEscolhida.left;
    mascote.style.right = posEscolhida.right;

    const tempoEspera = Math.floor(Math.random() * (40000 - 15000 + 1)) + 15000;

    setTimeout(() => {
        const classeAnimacao = Math.random() > 0.5 ? "animacao-espiada" : "animacao-pulos";
        void mascote.offsetWidth; 
        mascote.classList.add(classeAnimacao);
        setTimeout(loopAnimacaoVicente, 5000);
    }, tempoEspera);
}

document.addEventListener("DOMContentLoaded", () => {
    mostrar("tela1");
    
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