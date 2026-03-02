const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');
let currentMode = 'home';

// Audio Logic
const bgMusic = document.getElementById('bgMusic');
let isMusicPlaying = false;

function playMusicOnce() {
    if (!isMusicPlaying) {
        bgMusic.play().catch(error => {
            console.log("Autoplay dicegah, menunggu interaksi lebih lanjut.");
        });
        isMusicPlaying = true;
    }
}

// Game State
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');
let gameActive = false;
let score = 0;
let highScore = localStorage.getItem('fruitBest') || 0;
let player = { x: 0, y: 0, w: 110, h: 22 };
let items = [];
let gameReq;
let spawnTimer;

function initCanvas() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    player.y = window.innerHeight - 130;
}
window.addEventListener('resize', initCanvas);
initCanvas();

function showPage(pageId) {
    gameActive = false;
    cancelAnimationFrame(gameReq);
    clearTimeout(spawnTimer);
    
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active');
    
    currentMode = pageId;
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    if(pageId === 'game') initFruitGame();
    if(pageId === 'heart') {
        currentMsgIndex = -1;
        document.getElementById('wa-btn').style.display = 'none';
        document.getElementById('cat-text').innerText = "Halo Princes! Kenalin...Aku Pet Virtual Yang Diciptain Khusus Buat Jadi Moodboostermu.";
        document.getElementById('tap-info').style.display = 'block';
    }
}

function exitGame() { showPage('home'); }

// --- FITUR PESAN KUCING ---
const catMessages = [
    "Haii, Tapi AKu Belum Punya Nama, Yang Nyiptain Aku Mau Kamu Yang Bantu Kasi Aku Nama!!",
    "Semoga Aku Bisa Jadi MooodBostermu Ya Cantik, Biar Kita Bisa Sering Ketemu Dan Berinteraksi",
    "Semangat Ya Ngajarnya!! Semoga Apapun Yang Kamu Lalui Selama Ini Akan Dibayar Dengan Apa Yang Kamu Inginkan Di Masa Depan",
    "Semangat Juga Puasanya, Semoga Lancar Dan Semua Amal Kebaikanmu Diterima Ya!!",
    "Semangat Princes!!",
    "Semoga Ini Bisa Beneran Naikin Mood Baik Kamu Ya, dan Semoga Bisa Bikin Kamu Seneng Dan Bahagia, Meskipun Sedikit.hehe",
    "Oh Iyaa.. Kamu Juga Bisa Bantu Bikin Seneng Penciptaku Loo, Mau Tau Caranya?",
    "Dia Bakal Seneng Banget Dengan Tiga Hal Ini:<br>1. Dia Bakal Seneng Kalau Kamu Juga Seneng<br>2. Dia Bakal Seneng Kalau Kamu Bantu Doain Persib Menang Malam Ini<br>3. Dia Bakal Seneng Kalau Kamu Mau Ngasi Pap Lucu Kamu Hari Ini.hehe"
];

let currentMsgIndex = -1;

function nextMessage() {
    if (currentMsgIndex >= catMessages.length - 1) return;

    currentMsgIndex++;
    const textEl = document.getElementById('cat-text');
    const bubbleEl = document.getElementById('bubble');
    const waBtn = document.getElementById('wa-btn');
    const tapInfo = document.getElementById('tap-info');

    bubbleEl.style.transform = "scale(0.95)";
    
    setTimeout(() => {
        textEl.innerHTML = catMessages[currentMsgIndex];
        bubbleEl.style.transform = "scale(1)";
        
        if (currentMsgIndex === catMessages.length - 1) {
            waBtn.style.display = 'block';
            tapInfo.style.display = 'none';
        }
    }, 150);
}

function sendWA() {
    const phone = "6285859878076";
    const text = encodeURIComponent("Aku Suka / Aku Gasuka ?");
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// --- LOGIKA GARDEN ---
const flowers = ['🌸', '🌺', '🌷', '🌹', '🌼'];
document.getElementById('garden-area').addEventListener('pointerdown', (e) => {
    if(currentMode !== 'garden') return;
    const f = document.createElement('div');
    f.innerText = flowers[Math.floor(Math.random() * flowers.length)];
    f.style.position = 'fixed';
    f.style.left = `${e.clientX - 20}px`;
    f.style.top = `${e.clientY - 20}px`;
    f.style.fontSize = '3rem';
    f.style.pointerEvents = 'none';
    f.style.zIndex = '100';
    f.style.animation = 'bloomFloat 2s ease-out forwards';
    document.getElementById('garden').appendChild(f);
    setTimeout(() => f.remove(), 2000);
});

// --- GAME: FRUIT CATCHER ---
function initFruitGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    gameActive = true;
    score = 0;
    items = [];
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = highScore;
    updateGame();
    spawnLoop();
}

function spawnLoop() {
    if(!gameActive) return;
    items.push(new Item());
    let rate = Math.max(400, 1600 - (score * 4.5)); 
    spawnTimer = setTimeout(spawnLoop, rate);
}

class Item {
    constructor() {
        this.x = Math.random() * (window.innerWidth - 60) + 30;
        this.y = -60;
        this.type = Math.random() > 0.15 ? 'fruit' : 'bomb';
        this.icon = this.type === 'fruit' ? ['🍎', '🍒', '🍊', '🍇'][Math.floor(Math.random()*4)] : '💣';
        this.speed = 1.8 + (score / 150) + (Math.random() * 0.5); 
    }
    update() { this.y += this.speed; }
    draw() {
        gameCtx.font = "45px serif";
        gameCtx.fillText(this.icon, this.x - 22, this.y);
    }
}

function updateGame() {
    if(!gameActive) return;
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameCtx.fillStyle = '#64b5f6';
    gameCtx.beginPath();
    gameCtx.roundRect(player.x, player.y, player.w, player.h, 25);
    gameCtx.fill();
    gameCtx.strokeStyle = 'white';
    gameCtx.lineWidth = 3;
    gameCtx.stroke();

    for(let i = items.length - 1; i >= 0; i--) {
        items[i].update();
        items[i].draw();
        if(items[i].y >= player.y - 20 && items[i].y <= player.y + player.h &&
           items[i].x >= player.x && items[i].x <= player.x + player.w) {
            if(items[i].type === 'bomb') { gameOver(); return; }
            score += 10;
            if(score > highScore) { highScore = score; localStorage.setItem('fruitBest', highScore); }
            document.getElementById('score').innerText = score;
            document.getElementById('highScore').innerText = highScore;
            items.splice(i, 1);
        } else if(items[i].y > window.innerHeight) { items.splice(i, 1); }
    }
    gameReq = requestAnimationFrame(updateGame);
}

function gameOver() {
    gameActive = false;
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

const handleControl = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    player.x = Math.max(0, Math.min(window.innerWidth - player.w, x - player.w / 2));
};
gameCanvas.addEventListener('mousemove', handleControl);
gameCanvas.addEventListener('touchmove', handleControl);

// Zen Particles
let particles = [];
class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = 1;
    }
    update() { this.x += this.speedX; this.y += this.speedY; this.opacity -= 0.02; }
    draw() {
        mainCtx.globalAlpha = this.opacity;
        mainCtx.fillStyle = '#4db6ac';
        mainCtx.beginPath(); mainCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); mainCtx.fill();
    }
}

window.addEventListener('mousemove', (e) => {
    if(currentMode === 'zen') for(let i=0; i<3; i++) particles.push(new Particle(e.clientX, e.clientY));
});
window.addEventListener('touchmove', (e) => {
    if(currentMode === 'zen') for(let i=0; i<3; i++) particles.push(new Particle(e.touches[0].clientX, e.touches[0].clientY));
});

function animate() {
    mainCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    for(let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if(particles[i].opacity <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(animate);
}
animate();