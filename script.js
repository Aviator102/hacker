// Função para construir a string de consulta
function construirStringConsulta(params) {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
}

// Função para construir a URL completa
function construirUrlCompleta(protocolo, dominio, caminho, params) {
    const stringConsulta = construirStringConsulta(params);
    return `${protocolo}${dominio}${caminho}?${stringConsulta}`;
}

// Componentes da URL
const protocolo = 'https://'; // Protocolo da API
const dominioBase = 'api-aviator'; // Parte base do domínio
const identificador = 'cb5db3'; // Parte identificadora
const sufixo = 'cad4c0'; // Parte final do domínio
const dominio = `${dominioBase}-${identificador}${sufixo}.herokuapp.com`; // Montagem do domínio
const caminhoResultados = '/history-filter-odd'; // Caminho da API para resultados
const caminhoOdds = '/history-filter-odd'; // Caminho da API para odds

async function fetchResultados(betHouse) {
    const dataEscolhida = new Date();
    dataEscolhida.setDate(dataEscolhida.getDate() - 1);
    const dataFormatada = dataEscolhida.toISOString().split('T')[0];

    // Montando os parâmetros
    const params = {
        date: dataFormatada,
        numberVelas: 10000,
        betHouse: betHouse,
        filter: 10
    };

    // Construindo a URL completa
    const urlCompleta = construirUrlCompleta(protocolo, dominio, caminhoResultados, params);

    try {
        const response = await fetch(urlCompleta);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        logToConsole('Erro ao buscar resultados.');
        return [];
    }
}

async function fetchOddsMaiorQueDez(betHouse) {
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split('T')[0];

    // Montando os parâmetros
    const params = {
        date: dataFormatada,
        numberVelas: 10000,
        betHouse: betHouse,
        filter: 10
    };

    // Construindo a URL completa
    const urlCompleta = construirUrlCompleta(protocolo, dominio, caminhoOdds, params);

    try {
        const response = await fetch(urlCompleta);
        const data = await response.json();

        const oddsMaiorQueDez = data.filter(item => parseFloat(item.odd) > 10);
        
        const resultadosOddsDiv = document.getElementById('resultadosOdds');
        resultadosOddsDiv.innerHTML = '<h2>Últimas Velas Rosas</h2>'; // Título atualizado
        if (oddsMaiorQueDez.length > 0) {
            for (let i = 0; i < Math.min(3, oddsMaiorQueDez.length); i++) {
                const item = oddsMaiorQueDez[i];
                logToConsole(`Horário: ${item.hour}, Vela: ${item.odd}`);
                resultadosOddsDiv.innerHTML += `Horário: ${item.hour}, Vela: ${item.odd}<br>`;
            }
            const agora = new Date();
            const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const horaAtualBrasilia = new Intl.DateTimeFormat('pt-BR', options).format(agora);
            resultadosOddsDiv.innerHTML += `<br>Horário atual de Brasília: ${horaAtualBrasilia}`;
        } else {
            resultadosOddsDiv.innerHTML = 'Nenhuma odd encontrada maior que 10.';
        }
        resultadosOddsDiv.style.opacity = 1;
    } catch (error) {
        console.error('Erro ao buscar odds:', error);
        logToConsole('Erro ao buscar odds.');
    }
}

function logToConsole(message) {
    const consoleDiv = document.getElementById('console');
    consoleDiv.innerHTML += message + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function simulateTerminal() {
    const messages = [
        "Iniciando processo de cálculo...",
        "Aguardando resposta do servidor...",
        "Analisando dados obtidos...",
        "Calculando Sementes: Sementes do servidor em progresso...",
        "Calculando SHA-256: hash em progresso...",
        "Hash calculado com sucesso!",
        "Preparando resultados para exibição...",
        "Resultado encontrado, exibindo...",
        "Finalizando consulta..."
    ];
    let count = 0;

    const interval = setInterval(() => {
        logToConsole(messages[count % messages.length]);
        count++;
        if (count >= messages.length) {
            clearInterval(interval);
        }
    }, 1000);
}

async function consultarResultados() {
    const betHouse = document.getElementById('betHouseSelector').value;
    logToConsole('Consultando resultados...');
    simulateTerminal();

    const resultados = await fetchResultados(betHouse);

    const agora = new Date();
    const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const horaAtualBrasilia = new Intl.DateTimeFormat('pt-BR', options).format(agora);

    const resultadosFuturos = resultados.filter(item => {
        const [hora, minuto, segundo] = item.hour.split(':').map(Number);
        const horaEvento = new Date();
        horaEvento.setHours(hora, minuto, segundo, 0);
        return horaEvento > agora;
    });

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.style.opacity = 0;

    if (resultadosFuturos.length > 0) {
        const ultimoResultado = resultadosFuturos.pop();
        const horarioOriginal = new Date();
        horarioOriginal.setHours(...ultimoResultado.hour.split(':'));

        const horariosPrevistos = [
            new Date(horarioOriginal.getTime() - (65 * 1000)), // -1 minuto e 5 segundos
            new Date(horarioOriginal.getTime()), // Horário original
            new Date(horarioOriginal.getTime() + (63 * 1000)) // +1 minuto e 3 segundos
        ];

        resultadosDiv.innerHTML = '';
        horariosPrevistos.forEach(horario => {
            const horarioFormatado = horario.toLocaleTimeString('pt-BR', { hour12: false });
            resultadosDiv.innerHTML += `Horário previsto: ${horarioFormatado}<br>`;
        });

        resultadosDiv.style.opacity = 1;
    } else {
        resultadosDiv.innerHTML = 'Nenhum resultado futuro encontrado.';
        resultadosDiv.style.opacity = 1;
    }
}

document.getElementById('consultarBtn').addEventListener('click', () => {
    consultarResultados();
    fetchOddsMaiorQueDez(document.getElementById('betHouseSelector').value);
});

// Evento para limpar resultados e console ao mudar de aposta
document.getElementById('betHouseSelector').addEventListener('change', () => {
    // Limpa os resultados e o console ao mudar a seleção
    document.getElementById('resultados').innerHTML = '<h2>Últimas Velas Rosas</h2>'; // Título inicial
    document.getElementById('resultadosOdds').innerHTML = '<h2>Previsão de Vela Rosa</h2>'; // Título inicial
    document.getElementById('console').innerHTML = ''; // Limpa o console
});
