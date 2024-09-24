async function fetchResultados(betHouse) {
    const dataEscolhida = new Date();
    dataEscolhida.setDate(dataEscolhida.getDate() - 1);
    const dataFormatada = dataEscolhida.toISOString().split('T')[0];

    const protocolo = 'https://';
    const dominioBase = 'api-aviator-';
    const identificador = 'cb5db3cad4c0';
    const sufixo = '.herokuapp.com';
    const caminho = `/history-filter-odd?date=${dataFormatada}&numberVelas=10000&betHouse=${betHouse}&filter=10`;
    
    // Construindo a URL completa
    const urlCompleta = `${protocolo}${dominioBase}${identificador}${sufixo}${caminho}`;

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

    const protocolo = 'https://';
    const dominioBase = 'api-aviator-';
    const identificador = 'cb5db3cad4c0';
    const sufixo = '.herokuapp.com';
    const caminho = `/history-filter-odd?date=${dataFormatada}&numberVelas=10000&betHouse=${betHouse}&filter=10`;
    
    // Construindo a URL completa
    const urlCompleta = `${protocolo}${dominioBase}${identificador}${sufixo}${caminho}`;

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
