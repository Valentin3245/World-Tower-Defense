// ========== VARIÁVEIS ==========
let scene, camera, renderer;
let towers = [];
let enemies = [];
let selectedTower = null;
let gameState = {
    gold: 500,
    life: 100,
    wave: 1,
    playing: false,
    paused: false
};

const TOWERS = {
    archer: { cost: 100, damage: 25, range: 5, color: 0x8B4513 },
    mage: { cost: 150, damage: 40, range: 4, color: 0x9932CC },
    cannon: { cost: 200, damage: 80, range: 3, color: 0x2F4F4F },
    ice: { cost: 175, damage: 20, range: 4, color: 0x00BFFF },
    fire: { cost: 225, damage: 50, range: 4, color: 0xFF4500 }
};

const PATH = [
    {x:-10,z:0}, {x:-5,z:0}, {x:-5,z:5}, {x:0,z:5},
    {x:0,z:-5}, {x:5,z:-5}, {x:5,z:0}, {x:10,z:0}
];

// ========== NAVEGAÇÃO ==========
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goToMenu() {
    closeModals();
    showScreen('menu-screen');
    gameState.playing = false;
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// ========== SELEÇÃO ==========
function selectMap(map) {
    showScreen('difficulty-screen');
}

function selectMode(mode) {
    showScreen('map-screen');
}

function createLobby() {
    showScreen('lobby-screen');
}

function buyItem(item) {
    alert('Compra: ' + item);
}

// ========== JOGO ==========
function startGame(difficulty) {
    gameState.gold = difficulty === 'easy' ? 750 : difficulty === 'hard' ? 400 : 500;
    gameState.life = difficulty === 'easy' ? 150 : difficulty === 'hard' ? 75 : 100;
    gameState.wave = 1;
    gameState.playing = true;
    gameState.paused = false;
    towers = [];
    enemies = [];
    
    showScreen('game-screen');
    initGame();
    updateHUD();
}

function initGame() {
    const canvas = document.getElementById('game-canvas');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a3a19);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Luz
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    
    // Chão
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        new THREE.MeshLambertMaterial({color: 0x2d5a27})
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Caminho
    PATH.forEach((p, i) => {
        if (i < PATH.length - 1) {
            const next = PATH[i + 1];
            const len = Math.sqrt(Math.pow(next.x-p.x,2) + Math.pow(next.z-p.z,2));
            const path = new THREE.Mesh(
                new THREE.BoxGeometry(len + 1, 0.1, 1.5),
                new THREE.MeshLambertMaterial({color: 0x8B7355})
            );
            path.position.set((p.x+next.x)/2, 0.05, (p.z+next.z)/2);
            path.rotation.y = -Math.atan2(next.z-p.z, next.x-p.x);
            scene.add(path);
        }
    });
    
    // Bases
    const playerBase = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 2),
        new THREE.MeshLambertMaterial({color: 0x4169E1})
    );
    playerBase.position.set(10, 0.25, 0);
    scene.add(playerBase);
    
    const enemySpawn = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 2),
        new THREE.MeshLambertMaterial({color: 0x8B0000})
    );
    enemySpawn.position.set(-10, 0.25, 0);
    scene.add(enemySpawn);
    
    // Click para colocar torre
    canvas.onclick = (e) => {
        if (!selectedTower) return;
        
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(scene.children);
        
        if (hits.length > 0) {
            placeTower(hits[0].point.x, hits[0].point.z);
        }
    };
    
    gameLoop();
}

function createTower(color) {
    const tower = new THREE.Group();
    
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1, 0.5, 8),
        new THREE.MeshLambertMaterial({color: 0x555555})
    );
    base.position.y = 0.25;
    tower.add(base);
    
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.7, 2, 8),
        new THREE.MeshLambertMaterial({color})
    );
    body.position.y = 1.5;
    tower.add(body);
    
    const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 1, 8),
        new THREE.MeshLambertMaterial({color: 0x333333})
    );
    top.position.y = 3;
    tower.add(top);
    
    return tower;
}

function createEnemy() {
    const enemy = new THREE.Group();
    
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshLambertMaterial({color: 0x00FF00})
    );
    body.position.y = 0.5;
    enemy.add(body);
    
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshLambertMaterial({color: 0x00FF00})
    );
    head.position.y = 1;
    enemy.add(head);
    
    enemy.userData = {
        health: 100,
        speed: 0.02,
        reward: 10,
        pathIndex: 0,
        alive: true
    };
    
    return enemy;
}

function selectTower(type) {
    if (gameState.gold < TOWERS[type].cost) {
        alert('Ouro insuficiente!');
        return;
    }
    selectedTower = type;
    document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('selected'));
    event.target.closest('.tower-slot').classList.add('selected');
}

function placeTower(x, z) {
    if (!selectedTower) return;
    
    const data = TOWERS[selectedTower];
    if (gameState.gold < data.cost) return;
    
    // Verifica caminho
    for (let p of PATH) {
        if (Math.abs(x - p.x) < 1.5 && Math.abs(z - p.z) < 1.5) return;
    }
    
    const tower = createTower(data.color);
    tower.position.set(x, 0, z);
    tower.userData = {...data, lastShot: 0};
    scene.add(tower);
    towers.push(tower);
    
    gameState.gold -= data.cost;
    updateHUD();
    
    selectedTower = null;
    document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('selected'));
}

function startWave() {
    const btn = document.getElementById('wave-btn');
    btn.disabled = true;
    btn.textContent = '⚔️ EM ANDAMENTO...';
    
    const count = 5 + gameState.wave * 2;
    let spawned = 0;
    
    const spawn = setInterval(() => {
        if (spawned >= count) {
            clearInterval(spawn);
            return;
        }
        
        const enemy = createEnemy();
        enemy.position.set(PATH[0].x, 0, PATH[0].z);
        scene.add(enemy);
        enemies.push(enemy);
        spawned++;
        updateHUD();
    }, 800);
}

function gameLoop() {
    if (!gameState.playing) return;
    requestAnimationFrame(gameLoop);
    
    if (gameState.paused) {
        renderer.render(scene, camera);
        return;
    }
    
    // Mover inimigos
    enemies.forEach((e, i) => {
        if (!e.userData.alive) return;
        
        const target = PATH[e.userData.pathIndex];
        const dx = target.x - e.position.x;
        const dz = target.z - e.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist < 0.1) {
            e.userData.pathIndex++;
            if (e.userData.pathIndex >= PATH.length) {
                gameState.life -= 10;
                updateHUD();
                scene.remove(e);
                enemies.splice(i, 1);
                
                if (gameState.life <= 0) gameOver();
            }
        } else {
            e.position.x += (dx/dist) * e.userData.speed;
            e.position.z += (dz/dist) * e.userData.speed;
        }
    });
    
    // Torres atiram
    const now = Date.now();
    towers.forEach(t => {
        if (now - t.userData.lastShot < 1000) return;
        
        enemies.forEach(e => {
            if (!e.userData.alive) return;
            
            const dx = e.position.x - t.position.x;
            const dz = e.position.z - t.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist <= t.userData.range) {
                e.userData.health -= t.userData.damage;
                t.userData.lastShot = now;
                
                if (e.userData.health <= 0) {
                    e.userData.alive = false;
                    gameState.gold += e.userData.reward;
                    updateHUD();
                    scene.remove(e);
                }
            }
        });
    });
    
    // Limpar inimigos mortos
    enemies = enemies.filter(e => e.userData.alive);
    
    // Checar wave completa
    document.getElementById('enemies').textContent = enemies.length;
    if (enemies.length === 0 && document.getElementById('wave-btn').disabled) {
        gameState.wave++;
        gameState.gold += 50 + gameState.wave * 10;
        updateHUD();
        
        const btn = document.getElementById('wave-btn');
        btn.disabled = false;
        btn.textContent = '⚔️ INICIAR WAVE';
    }
    
    renderer.render(scene, camera);
}

function updateHUD() {
    document.getElementById('life').textContent = gameState.life;
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('enemies').textContent = enemies.length;
}

function pauseGame() {
    gameState.paused = true;
    document.getElementById('pause-modal').classList.add('active');
}

function resumeGame() {
    gameState.paused = false;
    closeModals();
}

function restartGame() {
    closeModals();
    startGame('normal');
}

function quitGame() {
    goToMenu();
}

function toggleSpeed() {
    // Implementar velocidade
}

function gameOver() {
    gameState.playing = false;
    document.getElementById('d-wave').textContent = gameState.wave;
    document.getElementById('defeat-modal').classList.add('active');
}

// Responsivo
window.onresize = () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
};
