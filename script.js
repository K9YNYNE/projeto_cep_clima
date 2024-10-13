function buscarEndereco() {
    const cep = document.getElementById('cep').value;

    if (!cep) {
        alert('Por favor, insira um CEP válido.');
        return;
    }

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert('CEP não encontrado.');
            } else {
                document.getElementById('cidade-info').value = data.localidade;
                exibirResultado(data);
                buscarClima(data.localidade); // Passa a cidade para buscar o clima
                salvarHistorico(cep);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
        });
}

function exibirResultado(data) {
    const divResultados = document.querySelector('.divres');
    divResultados.innerHTML = `
        <p><strong>Endereço:</strong> ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}</p>
        <p><strong>CEP:</strong> ${data.cep}</p>
    `;
}

function buscarClima(cidade) {
    const apiKey = 'f329635310647d6ca90c5a6257f6eb82';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            exibirClima(data);
        })
        .catch(error => {
            console.error('Erro ao buscar clima:', error);
        });
}

function exibirClima(data) {
    const divClima = document.getElementById('end-content'); // Div 'end-content'
    const climaDescricao = data.weather[0].description;
    const iconClima = data.weather[0].icon;
    let imgSrc = '';

    // Verifica o código do ícone para determinar a imagem
    if (iconClima.includes('d')) { // Se for dia (ícone termina com 'd')
        if (climaDescricao.includes('nuvens')) {
            imgSrc = '/icons/nublado.png'; // Imagem para nublado de dia
        } else if (climaDescricao.includes('chuva')) {
            imgSrc = '/icons/chuva-dia.png'; // Imagem para chuva de dia
        } else {
            imgSrc = '/icons/sol.png'; // Imagem para sol
        }
    } else if (iconClima.includes('n')) { // Se for noite (ícone termina com 'n')
        if (climaDescricao.includes('nuvens')) {
            imgSrc = '/icons/nublado-noite.png'; // Imagem para nublado à noite
        } else if (climaDescricao.includes('chuva')) {
            imgSrc = '/icons/chuva-noite.png'; // Imagem para chuva à noite
        } else {
            imgSrc = '/icons/lua.png'; // Imagem para lua (noite clara)
        }
    }

    // Obter a data e hora atual
    const dataAtual = new Date();
    const horarioAtual = dataAtual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Exibe os dados do clima com o ícone, temperatura grande e horário atual
    divClima.innerHTML = `
        <div style="text-align: center;">
            <img src="${imgSrc}" alt="${climaDescricao}" style="width: 150px; height: 150px; margin-bottom: 20px;"> <!-- Aumentei o tamanho do ícone -->
            <h1 style="font-size: 4em; font-family: 'Protest Strike', sans-serif; margin-bottom: 20px;">${data.main.temp}°C</h1>
            <p style="font-size: 1.5em; margin-bottom: 10px;"><strong>Clima em ${data.name}:</strong> ${climaDescricao}</p>
            <p style="font-size: 1.5em; margin-bottom: 10px;"><strong>Máxima:</strong> ${data.main.temp_max}°C</p>
            <p style="font-size: 1.5em; margin-bottom: 10px;"><strong>Mínima:</strong> ${data.main.temp_min}°C</p>
            <p style="font-size: 1.5em; margin-bottom: 20px;"><strong>Umidade:</strong> ${data.main.humidity}%</p>
            <p style="font-size: 1.5em; margin-bottom: 20px;"><strong>Vento:</strong> ${data.wind.speed} km/h</p>
            <h2 style="font-size: 4em; font-family: 'Protest Strike', sans-serif; margin-top: 20px;">${horarioAtual}</h2>
        </div>
        <div style="margin-top: 40px;" id="previsao-content">
            <!-- Previsão do clima será inserida aqui -->
        </div>
    `;

    buscarPrevisao(data.name); // Chama a função para buscar a previsão do clima
}

function buscarPrevisao(cidade) {
    const apiKey = 'f329635310647d6ca90c5a6257f6eb82';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&cnt=4&lang=pt_br`; // cnt=4 para incluir hoje e os próximos 3 dias

    fetch(url)
        .then(response => response.json())
        .then(data => {
            exibirPrevisao(data);
        })
        .catch(error => {
            console.error('Erro ao buscar previsão:', error);
            document.getElementById('previsao-content').innerHTML = '<p>Erro ao buscar previsão do tempo.</p>';
        });
}

function exibirPrevisao(data) {
    const divPrevisao = document.getElementById('previsao-content');
    divPrevisao.innerHTML = ''; // Limpa as previsões anteriores

    // Exibe as previsões para os próximos 3 dias
    let dataAtual = new Date();
    data.list.slice(1, 4).forEach((dia, index) => { // Começa de 1 para pular a previsão atual
        const dataDia = new Date(dia.dt * 1000);
        const tempDia = dia.main.temp;
        const climaDia = dia.weather[0].description;
        const iconDia = dia.weather[0].icon;
        const imgSrc = `http://openweathermap.org/img/wn/${iconDia}@2x.png`;

        // Verifica se a data já foi exibida para evitar duplicatas
        const dataFormatada = dataDia.toLocaleDateString('pt-BR');

        if (dataDia.toDateString() !== dataAtual.toDateString() && index < 3) {
            divPrevisao.innerHTML += `
                <div style="text-align: center; margin: 20px 0;">
                    <h3 style="margin: 10px 0;">${dataFormatada}</h3>
                    <img src="${imgSrc}" alt="${climaDia}" style="width: 80px; height: 80px;">
                    <p style="font-size: 1.2em;">${tempDia}°C</p>
                    <p>${climaDia}</p>
                </div>
            `;
        }
    });
}


function limparCampos() {
    document.getElementById('cep').value = '';
    document.getElementById('cidade-info').value = '';
    const divResultados = document.querySelector('.divres');
    divResultados.innerHTML = '<h2>Resultados</h2>';
}

function salvarHistorico(cep) {
    let historico = localStorage.getItem('historico') ? JSON.parse(localStorage.getItem('historico')) : [];
    historico.push(cep);
    localStorage.setItem('historico', JSON.stringify(historico));
    exibirHistorico();
}

function exibirHistorico() {
    const historico = localStorage.getItem('historico') ? JSON.parse(localStorage.getItem('historico')) : [];
    const divHistorico = document.getElementById('historico');
    divHistorico.innerHTML = '';
    historico.forEach(cep => {
        divHistorico.innerHTML += `<p>${cep}</p>`;
    });
}


// Mostra a mensagem de erro
function exibirMensagemErro(mensagem) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `<p class="erro">${mensagem}</p>`; // Coloca a mensagem de erro na tela
}

// Limpa a mensagem de erro
function limparMensagemErro() {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = ''; // Remove a mensagem de erro
}

// Adiciona o CEP no histórico, se já não estiver lá
function adicionaHistorico(cep) {
    cep = cep.replace(/[-\s]/g, ''); // Limpa qualquer traço ou espaço
    let hist = JSON.parse(localStorage.getItem('historicoCep')) || []; // Pega o histórico do localStorage ou cria um novo array vazio

    // Se o CEP não estiver no histórico, adiciona ele
    if (!hist.includes(cep)) {
        hist.push(cep);
        localStorage.setItem('historicoCep', JSON.stringify(hist)); // Salva o histórico atualizado no localStorage
        atualizaHistorico(); // Atualiza a lista de históricos na tela
    }
}

// Atualiza a lista de históricos que aparece na tela
function atualizaHistorico() {
    const histDiv = document.getElementById('historico');
    let hist = JSON.parse(localStorage.getItem('historicoCep')) || []; // Pega o histórico do localStorage
    histDiv.innerHTML = ''; // Limpa a lista atual

    // Adiciona cada CEP como um botão
    hist.forEach(cep => {
        const btn = document.createElement('button');
        btn.innerText = cep;
        btn.onclick = () => buscaEnderecoPorCep(cep); // Faz a busca de novo se clicar no botão
        histDiv.appendChild(btn);
    });

    // Adiciona um botão pra limpar o histórico
    const limparBtn = document.createElement('button');
    limparBtn.innerText = 'Limpar Histórico';
    limparBtn.onclick = limparHistorico; // Chama a função pra limpar o histórico
    histDiv.appendChild(limparBtn);
}

// Faz a busca pelo CEP que tá no histórico
async function buscaEnderecoPorCep(cep) {
    cep = cep.replace(/[-\s]/g, ''); // Limpa qualquer traço ou espaço
    document.getElementById('cep').value = cep; // Coloca o CEP no input
    await buscarEndereco(); // Faz a busca usando a função que já criamos
}

// Limpa o histórico do localStorage
function limparHistorico() {
    localStorage.removeItem('historicoCep'); // Apaga o histórico do localStorage
    atualizaHistorico(); // Atualiza a lista de históricos na tela
}

// Quando a página carregar, chama a função pra atualizar o histórico
window.onload = atualizaHistorico;
