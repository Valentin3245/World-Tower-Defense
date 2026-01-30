// Função de exemplo
function mostrarMensagem() {
    const mensagens = [
        "🎉 Funcionou perfeitamente!",
        "🚀 Incrível! Está funcionando!",
        "✨ Você é demais!",
        "🔥 App atualizado com sucesso!",
        "💪 Continue assim!"
    ];
    
    const random = Math.floor(Math.random() * mensagens.length);
    document.getElementById('mensagem').innerHTML = mensagens[random];
    
    // Efeito de vibração (se suportado)
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Mostra quando carregou
console.log("✅ JavaScript carregado do GitHub!");

// Adiciona data/hora do carregamento
window.onload = function() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR');
    console.log("⏰ Carregado às: " + hora);
};