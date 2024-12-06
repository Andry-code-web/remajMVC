class NetworkAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.maxPoints = 50;
        this.maxDistance = 180;
        this.isDark = true;
        this.particleColor = '255, 229, 208';

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
        this.setupSectionObserver();
        this.checkCurrentSection(); // Verificar la sección actual al inicio
    }

    checkCurrentSection() {
        const activeSection = document.querySelector('.seccion.active');
        if (activeSection && activeSection.classList.contains('seccion2')) {
            this.isDark = false;
            this.particleColor = '0, 0, 0';
        }
    }

    setupSectionObserver() {
        const sections = document.querySelectorAll('.seccion');
        
        // Observador para cambios de clase
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.updateColors(mutation.target);
                }
            });
        });

        // Observar cada sección
        sections.forEach(section => {
            observer.observe(section, {
                attributes: true,
                attributeFilter: ['class']
            });

            // Manejar transiciones
            section.addEventListener('transitionstart', () => {
                if (section.classList.contains('active')) {
                    this.updateColors(section);
                }
            });
        });
    }

    updateColors(section) {
        const isSection2 = section.classList.contains('seccion2');
        this.isDark = !isSection2;
        this.particleColor = isSection2 ? '0, 0, 0' : '255, 229, 208';
        
        // Forzar una actualización inmediata del canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
                speedX: (Math.random() - 0.5) * 0.6,
                speedY: (Math.random() - 0.5) * 0.6
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
                const opacity = (1 - distance / this.maxDistance) * 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(point2.x, point2.y);
                this.ctx.strokeStyle = `rgba(${this.particleColor}, ${opacity})`;
                this.ctx.stroke();
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.points.forEach((point, index) => {
            // Actualizar posición
            point.x += point.speedX;
            point.y += point.speedY;

            // Rebotar en los bordes
            if (point.x < 0 || point.x > this.canvas.width) point.speedX *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.speedY *= -1;

            // Dibujar punto
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.particleColor}, 0.5)`;
            this.ctx.fill();

            // Dibujar conexiones
            this.drawLines(point, index);
        });

        requestAnimationFrame(() => this.animate());
    }
}

export default NetworkAnimation;