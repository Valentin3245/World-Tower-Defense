// ============ VARIÁVEIS GLOBAIS ============
let gameState = {
    gold: 500,
    life: 100,
    wave: 1,
    gems: 100,
    highScore: 0,
    level: 1,
    selectedTower: null,
    towers: [],
    enemies: [],
    isPlaying: false,
    soundEnabled: true,
    vibrationEnabled: true
};

// Preços das torres
const towerPrices = {
    archer: 100,
    mage: 150,
    cannon: 200,
    ice: 175
};

const towerEmojis = {
    archer: '🏹',
    mage: '🧙',
    cannon: '💣',
    ice: '❄️'
};

// ============ LOADING SCREEN ============
const tips = [
    "💡 Dica: Torres de gelo deixam os inimigos lentos!",
    "💡 Dica: Magos causam dano em área!",
    "💡 Dica: Arqueiros são baratos e eficientes!",
    "💡 Dica: Canhões causam muito dano!",
    "💡 Dica: Combine diferentes torres!",
    "💡 Dica: Guarde ouro para emergências!"
];

// Criar partículas
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 4 + 's';
        particle.style.background = ['#e94560', '#f39c12', '#4ecca3'][Math.floor(Math.random() * 3)];
        container.appendChild(particle);
    }
}

// Simular loading
function simulateLoading() {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    const tipText = document.getElementById('tip-text');
    
    let progress = 0;
    const messages = [
        'Carregando recursos...',
        'Preparando torres...',
        'Invocando inimigos...',
        'Construindo mapa...',
        'Quase pronto...'
    ];
    
    // Mudar dica a cada 2 segundos
    let tipIndex = 0;
    setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        tipText.textContent = tips[tipIndex];
    }, 2000);
    
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            loadingText.textContent = 'Pronto!';
            
            setTimeout(() => {
                showScreen('menu-screen');
            }, 500);
        } else {
            progressBar.style.width = progress + '%';
            loadingText.textContent = messages[Math.floor(progress / 25)];
        }
    }, 200);
}

// ============ NAVEGAÇÃO ============
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    vibrate();
    showScreen('game-screen');
    gameState.isPlaying = true;
    resetGame();
}

function goToMenu() {
    vibrate();
    closeAllModals();
    showScreen('menu-screen');
    gameState.isPlaying = false;
}

// ============ JOGO ============
function resetGame() {
    gameState.gold = 500;
    gameState.life = 100;
    gameState.wave = 1;
    gameState.towers = [];
    gameState.enemies = [];
    gameState.selectedTower = null;
    
    updateGameUI();
    clearTowers();
}

function updateGameUI() {
    document.getElementById('game-gold').textContent = gameState.gold;
    document.getElementById('game-life').textContent = gameState.life;
    document.getElementById('game-wave').textContent = gameState.wave;
}

function selectTower(type) {
    vibrate();
    
    // Remover seleção anterior
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Verificar se tem ouro
    if (gameState.gold >= towerPrices[type]) {
        gameState.selectedTower = type;
        document.getElementById('tower-' + type).classList.add('selected');
        showMessage('Toque no mapa para posicionar ' + towerEmojis[type]);
    } else {
        showMessage('❌ Ouro insuficiente!');
        gameState.selectedTower = null;
    }
}

function placeTower(x, y) {
    if (!gameState.selectedTower) return;
    
    const price = towerPrices[gameState.selectedTower];
    if (gameState.gold < price) {
        showMessage('❌ Ouro insuficiente!');
        return;
    }
    
    // Criar torre
    const tower = document.createElement('div');
    tower.className = 'placed-tower';
    tower.textContent = towerEmojis[gameState.selectedTower];
    tower.style.left = x + 'px';
    tower.style.top = y + 'px';
    
    document.getElementById('game-area').appendChild(tower);
    
    // Deduzir ouro
    gameState.gold -= price;
    gameState.towers.push({
        type: gameState.selectedTower,
        x: x,
        y: y,
        element: tower
    });
    
    updateGameUI();
    vibrate();
    
    // Limpar seleção
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    gameState.selectedTower = null;
    
    showMessage('✅ Torre posicionada!');
}

function clearTowers() {
    document.querySelectorAll('.placed-tower').forEach(t => t.remove());
    document.querySelectorAll('.enemy').forEach(e => e.remove());
}

function showMessage(text) {
    document.getElementById('game-message').textContent = text;
}

// Adicionar evento de clique na área do jogo
document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        gameArea.addEventListener('click', function(e) {
            if (gameState.selectedTower && gameState.isPlaying) {
                const rect = gameArea.getBoundingClientRect();
                const x = e.clientX - rect.left - 20;
                const y = e.clientY - rect.top - 20;
                placeTower(x, y);
            }
        });
    }
});

function startWave() {
    vibrate();
    
    if (gameState.towers.length === 0) {
        showMessage('⚠️ Posicione pelo menos uma torre!');
        return;
    }
    
    const btn = document.getElementById('start-wave-btn');
    btn.disabled = true;
    btn.textContent = '⚔️ WAVE EM ANDAMENTO...';
    
    showMessage('🌊 Wave ' + gameState.wave + ' iniciada!');
    
    // Simular wave
    setTimeout(() => {
        const reward = 50 + (gameState.wave * 25);
        gameState.gold += reward;
        gameState.wave++;
        
        updateGameUI();
        
        btn.disabled = false;
        btn.textContent = '⚔️ INICIAR WAVE';
        
        showMessage('✅ Wave completada! +💰' + reward);
        
        // Atualizar recorde
        if (gameState.wave > gameState.highScore) {
            gameState.highScore = gameState.wave;
            document.getElementById('high-score').textContent = gameState.highScore;
        }
        
        vibrate();
    }, 3000);
}

// ============ MODAIS ============
function pauseGame() {
    vibrate();
    document.getElementById('pause-modal').classList.add('active');
}

function resumeGame() {
    vibrate();
    document.getElementById('pause-modal').classList.remove('active');
}

function restartGame() {
    vibrate();
    document.getElementById('pause-modal').classList.remove('active');
    resetGame();
    showMessage('🔄 Jogo reiniciado!');
}

function openShop() {
    vibrate();
    document.getElementById('shop-modal').classList.add('active');
}

function closeShop() {
    vibrate();
    document.getElementById('shop-modal').classList.remove('active');
}

function buyItem(item) {
    vibrate();
    
    const prices = { gold: 50, life: 30, power: 100 };
    const price = prices[item];
    
    if (gameState.gems >= price) {
        gameState.gems -= price;
        document.getElementById('gems').textContent = gameState.gems;
        
        if (item === 'gold') {
            gameState.gold += 500;
            updateGameUI();
        }
        
        alert('✅ Compra realizada!');
    } else {
        alert('❌ Gemas insuficientes!');
    }
}

function openSettings() {
    vibrate();
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
    vibrate();
    document.getElementById('settings-modal').classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============ UTILIDADES ============
function vibrate() {
    if (gameState.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// ============ INICIALIZAÇÃO ============
window.onload = function() {
    createParticles();
    simulateLoading();
    
    // Carregar configurações
    document.getElementById('sound-toggle').addEventListener('change', function() {
        gameState.soundEnabled = this.checked;
    });
    
    document.getElementById('vibration-toggle').addEventListener('change', function() {
        gameState.vibrationEnabled = this.checked;
    });
};
