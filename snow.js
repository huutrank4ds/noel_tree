const snowCanvas = document.getElementById('snowCanvas');
const snowCtx = snowCanvas.getContext('2d');

let snowW, snowH;
let scaleRatio = 1;

function resizeSnow() {
    snowW = snowCanvas.width = window.innerWidth;
    snowH = snowCanvas.height = window.innerHeight;
    
    // Tính toán tỉ lệ scale cho điện thoại/laptop
    scaleRatio = Math.min(Math.max(window.innerWidth / 1400, 0.5), 1.2);
}
window.addEventListener('resize', resizeSnow);
resizeSnow();

const snowflakes = [];
// Giảm số lượng đi một chút vì vẽ bông tuyết tốn tài nguyên hơn vẽ hình tròn
const maxSnowflakes = 200; 

class Flake {
    constructor() {
        // --- KHỞI TẠO LẦN ĐẦU (Rải khắp màn hình) ---
        this.x = Math.random() * snowW;
        this.y = Math.random() * snowH; // Random từ 0 đến hết chiều cao
        
        this.setupProperties();
    }

    setupProperties() {
        // Các thuộc tính ngẫu nhiên
        this.baseRadius = Math.random() * 3 + 2; // Bông tuyết to hơn xíu để rõ cánh
        this.radius = this.baseRadius * scaleRatio; 
        this.speedY = (Math.random() * 1 + 0.5) * scaleRatio; 
        
        // Góc xoay và đung đưa
        this.angle = Math.random() * Math.PI * 2; 
        this.angleSpeed = Math.random() * 0.02 + 0.01; 
        this.swayStrength = Math.random() * 1.5 * scaleRatio; 
        this.opacity = Math.random() * 0.6 + 0.3; 
        
        // Tốc độ tự xoay của bông tuyết (spin)
        this.spin = Math.random() * Math.PI * 2;
        this.spinSpeed = (Math.random() - 0.5) * 0.02;
    }

    reset() {
        // --- RESET KHI CHẠM ĐÁY (Đưa lên đỉnh) ---
        this.x = Math.random() * snowW;
        this.y = -15; // Nằm trên mép màn hình một chút
        this.setupProperties();
    }

    update() {
        this.y += this.speedY + 2;
        
        // Logic đung đưa qua lại
        this.angle += this.angleSpeed;
        this.x += Math.cos(this.angle) * this.swayStrength;
        
        // Bông tuyết tự xoay nhẹ
        this.spin += this.spinSpeed;

        // Nếu chạm đáy -> Reset lên trên
        if (this.y > snowH + 10) {
            this.reset();
        }
        
        // Xử lý khi bay ra khỏi lề trái/phải
        if (this.x > snowW + 10) this.x = -10;
        if (this.x < -10) this.x = snowW + 10;
    }

    draw() {
        snowCtx.save();
        snowCtx.translate(this.x, this.y);
        snowCtx.rotate(this.spin); // Xoay bông tuyết
        
        snowCtx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        snowCtx.lineWidth = 1.5 * scaleRatio; // Độ dày nét vẽ
        snowCtx.lineCap = 'round'; // Đầu nét tròn
        
        // Hiệu ứng phát sáng nhẹ
        snowCtx.shadowBlur = 3;
        snowCtx.shadowColor = "white";

        snowCtx.beginPath();
        // VẼ BÔNG TUYẾT 6 CÁNH
        for (let i = 0; i < 6; i++) {
            snowCtx.moveTo(0, 0);
            snowCtx.lineTo(0, this.radius);
            snowCtx.stroke();
            snowCtx.rotate(Math.PI / 3); // Xoay 60 độ (360 / 6)
        }
        
        snowCtx.restore();
    }
}

// Hàm tạo mảng bông tuyết
function createSnowflakes() {
    snowflakes.length = 0; 
    const count = window.innerWidth < 600 ? 60 : maxSnowflakes;
    
    for (let i = 0; i < count; i++) {
        snowflakes.push(new Flake());
    }
}
createSnowflakes(); 

window.addEventListener('resize', createSnowflakes);

function animateSnow() {
    snowCtx.clearRect(0, 0, snowW, snowH);
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });
    requestAnimationFrame(animateSnow);
}

animateSnow();