const treeCanvas = document.getElementById('treeCanvas');
const ctx = treeCanvas.getContext('2d');

// --- CẤU HÌNH ---
const config = {
    particleCount: 1500,    
    spirals: 6,             
    rotationSpeed: 0.02,   
    
    // ĐỘ DÀY DẢI NGÂN HÀ: 
    // Bây giờ bạn có thể tăng số này lên to hơn (ví dụ 60-80) mà không lo đỉnh bị nát
    scatterRadius: 100,      

    giftRatio: 0.3,         
    starScale: 0.12,        
    
    treeWidthRatio: 0.8,    
    treeHeightRatio: 0.55,  
    yOffsetRatio: -0.05   
};

let width, height, treeW, treeH, centerY;
let globalAngle = 0;
const particles = [];
const neonColors = ['#FF0055', '#00FF99', '#00CCFF', '#FFFF33', '#CC00FF'];
const giftColors = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#FFFFFF'];

function updateDimensions() {
    width = treeCanvas.width = window.innerWidth;
    height = treeCanvas.height = window.innerHeight;

    treeW = Math.min(width * config.treeWidthRatio, 350); 
    treeH = height * config.treeHeightRatio;
    
    centerY = (height / 2) + (treeH / 2) + (height * config.yOffsetRatio);

    createParticles();
}
window.addEventListener('resize', updateDimensions);

class Particle {
    constructor(i) {
        // percent: 0 (đỉnh) -> 1 (đáy)
        this.percent = i / config.particleCount;
        this.type = Math.random() < config.giftRatio ? 'gift' : 'bulb';

        // Logic xoắn ốc
        const spiralAngle = this.percent * config.spirals * Math.PI * 2;
        const coneRadius = this.percent * (treeW / 2);

        // --- KHẮC PHỤC LỖI DÍNH CHÙM ---
        // Độ dày (scatter) sẽ nhỏ dần khi lên đỉnh
        const randomAngle = Math.random() * Math.PI * 0.5;
        
        // Công thức: Scatter Cơ Bản * Tỉ lệ độ cao + một chút tản nhẹ (2px)
        const dynamicScatter = (config.scatterRadius * this.percent) + 1;
        const randomDist = Math.random() * dynamicScatter;

        // Tính toạ độ 3D
        const xBase = Math.cos(spiralAngle) * coneRadius;
        const zBase = Math.sin(spiralAngle) * coneRadius;

        this.x = xBase + Math.cos(randomAngle) * randomDist;
        this.z = zBase + Math.sin(randomAngle) * randomDist;
        
        this.y = (this.percent * treeH) - treeH;
        this.y += (Math.random() - 0.5) * 20; 

        // Màu sắc
        if (this.type === 'bulb') {
            this.color = neonColors[Math.floor(Math.random() * neonColors.length)];
            this.size = 2 + Math.random() * 2;
            this.blinkOffset = Math.random() * 100;
        } else {
            this.color = giftColors[Math.floor(Math.random() * giftColors.length)];
            this.size = 3 + Math.random() * 4;
        }
    }

    draw(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const xRot = this.x * cos - this.z * sin;
        const zRot = this.x * sin + this.z * cos;

        const fov = treeW * 2; 
        const scale = fov / (fov + zRot);
        if (scale < 0) return;

        const x2d = (width / 2) + xRot * scale;
        const y2d = centerY + this.y * scale;

        this.currentZ = zRot; 

        ctx.save();
        ctx.translate(x2d, y2d);
        ctx.scale(scale, scale);

        if (this.type === 'bulb') {
            const alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005 + this.blinkOffset);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'black';
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size, -this.size, this.size*2, this.size*2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(-this.size/3, -this.size, this.size/1.5, this.size*2);
            ctx.fillRect(-this.size, -this.size/3, this.size*2, this.size/1.5);
        }
        ctx.restore();
    }
}

function drawStar(angle) {
    const tipX = 0;
    // Điều chỉnh vị trí ngôi sao cho sát đỉnh cây hơn một chút
    const tipY = -treeH - (treeH * config.starScale * 0.5); 
    const tipZ = 0;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const xRot = tipX * cos - tipZ * sin;
    const zRot = tipX * sin + tipZ * cos;

    const fov = treeW * 2;
    const scale = fov / (fov + zRot);

    const x2d = (width / 2) + xRot * scale;
    const y2d = centerY + tipY * scale;

    const starR = (treeW * config.starScale) * scale;
    
    ctx.save();
    ctx.translate(x2d, y2d);
    ctx.rotate(-angle * 2); 

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD700';
    
    const grad = ctx.createRadialGradient(0,0, starR*0.2, 0,0, starR);
    grad.addColorStop(0, 'white');
    grad.addColorStop(0.4, '#FFD700');
    grad.addColorStop(1, '#FF8F00');
    ctx.fillStyle = grad;

    ctx.beginPath();
    for(let i=0; i<5; i++){
        ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*starR, 
                   -Math.sin((18+i*72)*Math.PI/180)*starR);
        ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*(starR*0.5), 
                   -Math.sin((54+i*72)*Math.PI/180)*(starR*0.5));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function createParticles() {
    particles.length = 0;
    for(let i=0; i<config.particleCount; i++){
        particles.push(new Particle(i));
    }
}

function animateTree() {
    ctx.clearRect(0, 0, width, height);
    globalAngle -= config.rotationSpeed;

    particles.forEach(p => {
        p.currentZ = p.x * Math.sin(globalAngle) + p.z * Math.cos(globalAngle);
    });

    particles.sort((a, b) => b.currentZ - a.currentZ);
    particles.forEach(p => p.draw(globalAngle));
    drawStar(globalAngle);

    requestAnimationFrame(animateTree);
}

updateDimensions();
animateTree();