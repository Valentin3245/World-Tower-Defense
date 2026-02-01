// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let scene, camera, renderer, controls;
let gameScene, gameCamera, gameRenderer;
let towers = [];
let enemies = [];
let projectiles = [];
let selectedTower = null;
let selectedPlacedTower = null;
let gameState = {
    gold: 500,
    life: 100,
    wave: 1,
    maxWaves: 20,
    isPlaying: false,
    isPaused: false,
    speed: 1,
    gems: 1000,
    coins: 5000,
    level: 1,
    selectedMap: 'forest',
    difficulty: 'normal'
};

const TOWER_DATA = {
    archer: { cost: 100, damage: 25, range: 5, speed: 1.0, color: 0x8B4513 },
    mage: { cost: 150, damage: 40, range: 4, speed: 1.5, color: 0x9932CC },
    cannon: { cost: 200, damage: 80, range: 3, speed: 2.5, color: 0x2F4F4F },
    ice: { cost: 175, damage: 20, range: 4, speed: 1.2, color: 0x00BFFF },
    fire: { cost: 225, damage: 50, range: 4, speed: 1.0, color: 0xFF4500 }
};

const ENEMY_DATA = {
    goblin: { health: 100, speed: 0.02, reward: 10, color: 0x00FF00 },
    orc: { health: 250, speed: 0.015, reward: 25, color: 0x228B22 },
    troll: { health: 500, speed: 0.01, reward: 50, color: 0x006400 },
    boss: { health: 2000, speed: 0.008, reward: 200, color: 0x8B0000 }
};

// Caminho dos inimigos
const PATH = [
    { x: -10, z: 0 },
    { x: -5, z: 0 },
    { x: -5, z: 5 },
    { x: 0, z: 5 },
    { x: 0, z: -5 },
    { x: 5, z: -5 },
    { x: 5, z: 0 },
    { x: 10, z: 0 }
];

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.onload = function() {
    createParticles();
    simulateLoading();
};

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.background = ['#e94560', '#f39c12', '#4ecca3'][Math.floor(Math.random() * 3)];
        container.appendChild(p);
    }
}

function simulateLoading() {
    const bar = document.getElementById('loading-progress');
    const text = document.getElementById('loading-text');
    const messages = ['Carregando...', 'Preparando torres...', 'Criando inimigos...', 'Quase pronto...'];
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 20 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            text.textContent = 'Pronto!';
            setTimeout(() => {
                showScreen('menu-screen');
                initMenuScene();
            }, 500);
        } else {
            bar.style.width = progress + '%';
            text.textContent = messages[Math.floor(progress / 30)];
        }
    }, 200);
}

// ==========================================
// NAVEGAÇÃO
// ==========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    vibrate(30);
}

function goToMenu() {
    closeAllModals();
    showScreen('menu-screen');
    gameState.isPlaying = false;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// ==========================================
// 3D MENU BACKGROUND
// ==========================================
function initMenuScene() {
    const canvas = document.getElementById('menu-canvas');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    
    // Torre decorativa rotacionando
    const tower = createTower3D(0xe94560);
    tower.position.set(0, 0, 0);
    scene.add(tower);
    
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 1, 0);
    
    function animateMenu() {
        requestAnimationFrame(animateMenu);
        tower.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animateMenu();
}

// ==========================================
// CRIAR MODELOS 3D
// ==========================================
function createTower3D(color = 0x8B4513) {
    const tower = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.CylinderGeometry(0.8, 1, 0.5, 8);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    tower.add(base);
    
    // Corpo principal
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    tower.add(body);
    
    // Topo
    const topGeo = new THREE.ConeGeometry(0.7, 1, 8);
    const topMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 3;
    tower.add(top);
    
    // Detalhes (janelas)
    const windowGeo = new THREE.BoxGeometry(0.2, 0.3, 0.1);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 0.5 });
    for (let i = 0; i < 4; i++) {
        const window = new THREE.Mesh(windowGeo, windowMat);
        window.position.y = 1.5;
        window.position.x = Math.cos(i * Math.PI / 2) * 0.55;
        window.position.z = Math.sin(i * Math.PI / 2) * 0.55;
        window.lookAt(window.position.x * 2, 1.5, window.position.z * 2);
        tower.add(window);
    }
    
    return tower;
}

function createEnemy3D(type = 'goblin') {
    const data = ENEMY_DATA[type];
    const enemy = new THREE.Group();
    
    // Corpo
    const bodyGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    enemy.add(body);
    
    // Cabeça
    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: data.color });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1;
    enemy.add(head);
    
    // Olhos
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 0.5 });
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(0.1, 1.05, 0.2);
    enemy.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(-0.1, 1.05, 0.2);
    enemy.add(eye2);
    
    // Pernas
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const legMat = new THREE.MeshLambertMaterial({ color: data.color });
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(0.15, 0.1, 0);
    enemy.add(leg1);
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(-0.15, 0.1, 0);
    enemy.add(leg2);
    
    // Barra de vida
    const healthBarBg = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.1, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    healthBarBg.position.y = 1.5;
    enemy.add(healthBarBg);
    
    const healthBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.08, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x00FF00 })
    );
    healthBar.position.y = 1.5;
    healthBar.name = 'healthBar';
    enemy.add(healthBar);
    
    // Dados do inimigo
    enemy.userData = {
        type: type,
        health: data.health,
        maxHealth: data.health,
        speed: data.speed,
        reward: data.reward,
        pathIndex: 0,
        alive: true
    };
    
    return enemy;
}

function createProjectile(from, to, color = 0xFFFF00) {
    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: color, emissive: color });
    const projectile = new THREE.Mesh(geo, mat);
    projectile.position.copy(from);
    projectile.userData = {
        target: to,
        speed: 0.3
    };
    return projectile;
}

// ==========================================
// GAME LOGIC
// ==========================================
function selectMap(map) {
    gameState.selectedMap = map;
    showScreen('difficulty-screen');
}

function selectMode(mode) {
    if (mode === 'endless') {
        gameState.maxWaves = Infinity;
    }
    showScreen('map-screen');
}

function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.wave = 1;
    gameState.life = difficulty === 'easy' ? 150 : difficulty === 'hard' ? 75 : 100;
    gameState.gold = difficulty === 'easy' ? 750 : difficulty === 'hard' ? 400 : 500;
    
    towers = [];
    enemies = [];
    projectiles = [];
    
    showScreen('game-screen');
    initGameScene();
    updateHUD();
}

function initGameScene() {
    const canvas = document.getElementById('game-canvas');
    gameScene = new THREE.Scene();
    gameScene.background = new THREE.Color(0x1a3a19);
    
    gameCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    gameRenderer.setSize(window.innerWidth, window.innerHeight);
    gameRenderer.shadowMap.enabled = true;
    
    // Luz
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    gameScene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    gameScene.add(sun);
    
    // Chão
    const groundGeo = new THREE.PlaneGeometry(30, 20);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    gameScene.add(ground);
    
    // Caminho
    createPath();
    
    // Base do jogador
    const baseGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const playerBase = new THREE.Mesh(baseGeo, baseMat);
    playerBase.position.set(10, 0.25, 0);
    gameScene.add(playerBase);
    
    // Spawn dos inimigos
    const spawnGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const spawnMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const spawn = new THREE.Mesh(spawnGeo, spawnMat);
    spawn.position.set(-10, 0.25, 0);
    gameScene.add(spawn);
    
    // Câmera
    gameCamera.position.set(0, 15, 15);
    gameCamera.lookAt(0, 0, 0);
    
    // Raycaster para cliques
    setupRaycaster();
    
    // Loop de jogo
    gameLoop();
}

function createPath() {
    const pathMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    
    for (let i = 0; i < PATH.length - 1; i++) {
        const start = PATH[i];
        const end = PATH[i + 1];
        
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2));
        const pathGeo = new THREE.BoxGeometry(length + 1, 0.1, 1.5);
        const pathMesh = new THREE.Mesh(pathGeo, pathMat);
        
        pathMesh.position.x = (start.x + end.x) / 2;
        pathMesh.position.z = (start.z + end.z) / 2;
        pathMesh.position.y = 0.05;
        
        const angle = Math.atan2(end.z - start.z, end.x - start.x);
        pathMesh.rotation.y = -angle;
        
        gameScene.add(pathMesh);
    }
}

function setupRaycaster() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    document.getElementById('game-canvas').addEventListener('click', (e) => {
        if (!selectedTower) return;
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, gameCamera);
        const intersects = raycaster.intersectObjects(gameScene.children);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            placeTower(point.x, point.z);
        }
    });
}

function selectTower(type) {
    if (gameState.gold < TOWER_DATA[type].cost) {
        showMessage('Ouro insuficiente!');
        return;
    }
    
    selectedTower = type;
    document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('selected'));
    document.querySelector(`[data-tower="${type}"]`).classList.add('selected');
    vibrate(30);
}

function placeTower(x, z) {
    if (!selectedTower) return;
    
    const data = TOWER_DATA[selectedTower];
    if (gameState.gold < data.cost) return;
    
    // Verificar se não está no caminho
    for (let point of PATH) {
        if (Math.abs(x - point.x) < 1.5 && Math.abs(z - point.z) < 1.5) {
            showMessage('Não pode colocar no caminho!');
            return;
        }
    }
    
    const tower = createTower3D(data.color);
    tower.position.set(x, 0, z);
    tower.userData = {
        type: selectedTower,
        damage: data.damage,
        range: data.range,
        speed: data.speed,
        lastShot: 0,
        level: 1
    };
    
    gameScene.add(tower);
    towers.push(tower);
    
    gameState.gold -= data.cost;
    updateHUD();
    
    // Limpar seleção
    selectedTower = null;
    document.querySelectorAll('.tower-slot').forEach(s => s.classList.remove('selected'));
    
    vibrate(50);
}

function startWave() {
    const btn = document.getElementById('wave-btn');
    btn.disabled = true;
    btn.textContent = '⚔️ WAVE EM ANDAMENTO...';
    
    const enemyCount = 5 + gameState.wave * 2;
    let spawned = 0;
    
    const spawnInterval = setInterval(() => {
        if (spawned >= enemyCount) {
            clearInterval(spawnInterval);
            return;
        }
        
        let type = 'goblin';
        if (gameState.wave >= 5 && Math.random() > 0.7) type = 'orc';
        if (gameState.wave >= 10 && Math.random() > 0.8) type = 'troll';
        if (gameState.wave % 5 === 0 && spawned === enemyCount - 1) type = 'boss';
        
        const enemy = createEnemy3D(type);
        enemy.position.set(PATH[0].x, 0, PATH[0].z);
        gameScene.add(enemy);
        enemies.push(enemy);
        
        spawned++;
        updateHUD();
    }, 1000);
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    
    requestAnimationFrame(gameLoop);
    
    if (gameState.isPaused) {
        gameRenderer.render(gameScene, gameCamera);
        return;
    }
    
    // Mover inimigos
    moveEnemies();
    
    // Torres atiram
    towerShoot();
    
    // Mover projéteis
    moveProjectiles();
    
    // Checar wave completa
    checkWaveComplete();
    
    // Checar game over
    if (gameState.life <= 0) {
        gameOver();
    }
    
    gameRenderer.render(gameScene, gameCamera);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        if (!enemy.userData.alive) return;
        
        const target = PATH[enemy.userData.pathIndex];
        const dx = target.x - enemy.position.x;
        const dz = target.z - enemy.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 0.1) {
            enemy.userData.pathIndex++;
            if (enemy.userData.pathIndex >= PATH.length) {
                // Inimigo chegou ao fim
                gameState.life -= 10;
                updateHUD();
                removeEnemy(enemy, index);
            }
        } else {
            enemy.position.x += (dx / dist) * enemy.userData.speed * gameState.speed;
            enemy.position.z += (dz / dist) * enemy.userData.speed * gameState.speed;
            enemy.lookAt(target.x, enemy.position.y, target.z);
        }
        
        // Animação simples de andar
        enemy.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.1;
    });
}

function towerShoot() {
    const now = Date.now();
    
    towers.forEach(tower => {
        if (now - tower.userData.lastShot < tower.userData.speed * 1000) return;
        
        // Encontrar inimigo mais próximo no alcance
        let closest = null;
        let closestDist = Infinity;
        
        enemies.forEach(enemy => {
            if (!enemy.userData.alive) return;
            
            const dx = enemy.position.x - tower.position.x;
            const dz = enemy.position.z - tower.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist <= tower.userData.range && dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        });
        
        if (closest) {
            // Criar projétil
            const from = tower.position.clone();
            from.y = 2;
            const to = closest.position.clone();
            to.y = 0.5;
            
            const projectile = createProjectile(from, to, TOWER_DATA[tower.userData.type].color);
            projectile.userData.damage = tower.userData.damage;
            projectile.userData.targetEnemy = closest;
            gameScene.add(projectile);
            projectiles.push(projectile);
            
            tower.userData.lastShot = now;
            
            // Torre olha para o inimigo
            tower.lookAt(closest.position.x, tower.position.y, closest.position.z);
        }
    });
}

function moveProjectiles() {
    projectiles.forEach((proj, index) => {
        const target = proj.userData.targetEnemy;
        if (!target || !target.userData.alive) {
            gameScene.remove(proj);
            projectiles.splice(index, 1);
            return;
        }
        
        const dx = target.position.x - proj.position.x;
        const dy = (target.position.y + 0.5) - proj.position.y;
        const dz = target.position.z - proj.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 0.3) {
            // Acertou
            target.userData.health -= proj.userData.damage;
            
            // Atualizar barra de vida
            const healthBar = target.getObjectByName('healthBar');
            if (healthBar) {
                healthBar.scale.x = target.userData.health / target.userData.maxHealth;
            }
            
            if (target.userData.health <= 0) {
                target.userData.alive = false;
                gameState.gold += target.userData.reward;
                updateHUD();
                
                // Animação de morte
                setTimeout(() => {
                    const idx = enemies.indexOf(target);
                    if (idx > -1) {
                        gameScene.remove(target);
                        enemies.splice(idx, 1);
                    }
                }, 100);
            }
            
            gameScene.remove(proj);
            projectiles.splice(index, 1);
        } else {
            proj.position.x += (dx / dist) * proj.userData.speed;
            proj.position.y += (dy / dist) * proj.userData.speed;
            proj.position.z += (dz / dist) * proj.userData.speed;
        }
    });
}

function removeEnemy(enemy, index) {
    gameScene.remove(enemy);
    enemies.splice(index, 1);
}

function checkWaveComplete() {
    const alive = enemies.filter(e => e.userData.alive);
    document.getElementById('enemies-count').textContent = alive.length;
    
    if (alive.length === 0 && document.getElementById('wave-btn').disabled) {
        gameState.wave++;
        
