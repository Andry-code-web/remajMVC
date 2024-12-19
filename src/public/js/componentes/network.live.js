export class NetworkAnimationL {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.maxPoints = 60;
        this.maxDistance = 170;
        this.isDark = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.points = [];
        for (let i = 0; i < this.maxPoints; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speedX: (Math.random() - 0.5) * 0.7,
                speedY: (Math.random() - 0.5) * 0.7
            });
        }
    }

    drawLines(point, index) {
        for (let i = index + 1; i < this.points.length; i++) {
            const point2 = this.points[i];
            const dx = point.x - point2.x;
            const dy = point.y - point2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.maxDistance) {
                const opacity = (1 - distance / this.maxDistance) * 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(point2.x, point2.y);
                const color = this.isDark ? '255, 229, 208' : '0, 0, 0';
                this.ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                this.ctx.stroke();
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.points.forEach((point, index) => {
            // Update position
            point.x += point.speedX;
            point.y += point.speedY;

            // Bounce off edges
            if (point.x < 0 || point.x > this.canvas.width) point.speedX *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.speedY *= -1;

            // Draw point
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            const color = this.isDark ? '255, 229, 208' : '0, 0, 0';
            this.ctx.fillStyle = `rgba(${color}, 0.5)`;
            this.ctx.fill();

            // Draw connections
            this.drawLines(point, index);
        });

        requestAnimationFrame(() => this.animate());
    }

    setTheme(isDark) {
        this.isDark = isDark;
    }
}

export default NetworkAnimationL;