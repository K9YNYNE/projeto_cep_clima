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
    const divClima = document.querySelector('.inputsetup');
    divClima.innerHTML += `
        <p><strong>Clima em ${data.name}:</strong> ${data.weather[0].description}, ${data.main.temp}°C</p>
    `;
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
