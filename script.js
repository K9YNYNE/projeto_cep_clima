// Função pro menu
function m() {
    const menu = document.getElementById('his-content');
    menu.style.right = "0";
}
function fecharm() {
    const menu = document.getElementById('his-content');
    menu.style.right = "-30vw";
}

// Função que vai buscar o endereço usando o CEP digitado
// Função para buscar o endereço pelo CEP
async function buscarEndereco() {
    let cep = document.getElementById('cep').value.trim(); // Pega o valor do CEP e tira os espaços em volta

    // Remove qualquer traço ou espaço dentro do CEP pra garantir que tá no formato certo
    cep = cep.replace(/[-\s]/g, '');

    // Verifica se o CEP tem 8 dígitos e é só número
    if (!/^\d{8}$/.test(cep)) {
        exibirMensagemErro('CEP inválido. Manda um CEP com 8 dígitos.'); // Mostra uma mensagem de erro
        return; // Sai daqui se o CEP estiver errado
    }
    
    try {
        // Chama a API ViaCEP pra buscar o endereço usando o CEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) {
            throw new Error('Deu ruim na requisição'); // Se a requisição não deu certo, lança um erro
        }

        const data = await response.json(); // Transforma a resposta em JSON
        if (data.erro) {
            throw new Error('CEP não encontrado'); // Se a API não achar o CEP, lança um erro
        }

        preencherDados(data); // Preenche os campos com o que a API devolveu
        adicionaHistorico(cep); // Adiciona o CEP no histórico
    } catch (error) {
        exibirMensagemErro(error.message); // Mostra a mensagem de erro
    }
}

// Função pra procurar o CEP usando o estado, cidade e logradouro (rua)
async function buscarCepPorEndereco() {
    const uf = document.getElementById('uf').value.trim().toUpperCase(); // Pega o estado (UF) e coloca em maiúsculo
    const cidade = document.getElementById('cidade').value.trim(); // Pega a cidade
    const logradouro = document.getElementById('logradouro').value.trim(); // Pega o logradouro (rua)

    // Verifica se os campos foram preenchidos
    if (uf.length === 0) {
        exibirMensagemErro('Manda o estado (UF).'); // Pede o estado se não tiver
        return;
    }

    if (cidade.length === 0) {
        exibirMensagemErro('Manda a cidade.'); // Pede a cidade se não tiver
        return;
    }

    if (logradouro.length === 0) {
        exibirMensagemErro('Manda o logradouro.'); // Pede o logradouro se não tiver
        return;
    }

    try {
        // Ajusta o logradouro pra garantir que não tenha espaços esquisitos
        const normalizedLogradouro = logradouro.replace(/\s+/g, '+');
        // Chama a API ViaCEP pra buscar o CEP com o endereço fornecido
        const response = await fetch(`https://viacep.com.br/ws/${uf}/${cidade}/${normalizedLogradouro}/json/`);
        if (!response.ok) {
            throw new Error('Deu ruim na requisição'); // Lança erro se a requisição falhar
        }

        const data = await response.json(); // Transforma a resposta em JSON
        if (data.length === 0) {
            throw new Error('Endereço não encontrado'); // Lança erro se o endereço não for encontrado
        }

        exibirCep(data[0].cep); // Mostra o primeiro CEP encontrado no input
        adicionaHistorico(data[0].cep); // Adiciona o CEP no histórico
    } catch (error) {
        exibirMensagemErro(error.message); // Mostra a mensagem de erro
    }
}

// Função pra mostrar o CEP no input de resultados
function exibirCep(cep) {
    const cepEncontradoInput = document.getElementById('cep-encontrado');
    cepEncontradoInput.value = cep; // Coloca o CEP encontrado no campo
    limparMensagemErro(); // Limpa qualquer mensagem de erro
}

// Função pra preencher os campos com os dados recebidos da API
function preencherDados(data) {
    document.getElementById('cep-info').value = data.cep || '';
    document.getElementById('logradouro-info').value = data.logradouro || '';
    document.getElementById('bairro-info').value = data.bairro || '';
    document.getElementById('cidade-info').value = data.localidade || '';
    document.getElementById('uf-info').value = data.uf || '';
    limparMensagemErro(); // Limpa qualquer mensagem de erro
}

// Limpa os campos do endereço depois da pesquisa
function limparInputsEndereco() {
    document.getElementById('uf').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('logradouro').value = '';
}

// Limpa todos os campos de entrada e resultados
function limparCampos() {
    document.getElementById('cep').value = '';
    document.getElementById('cep-info').value = '';
    document.getElementById('logradouro-info').value = '';
    document.getElementById('bairro-info').value = '';
    document.getElementById('cidade-info').value = '';
    document.getElementById('uf-info').value = '';
    document.getElementById('cep-encontrado').value = '';
    document.getElementById('resultado').innerHTML = '';
    limparMensagemErro(); // Limpa mensagem de erro, se houver
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
