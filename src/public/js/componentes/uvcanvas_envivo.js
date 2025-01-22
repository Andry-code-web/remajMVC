document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const lines = [];
  const lineCount = 50;

  for (let i = 0; i < lineCount; i++) {
      lines.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 50 + 50,
          speed: Math.random() * 0.5 + 0.1
      });
  }

  function drawLine(x, y, length) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + length);
      ctx.stroke();
  }

  function animate() {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(44, 42, 42, 0.9)';
      ctx.lineWidth = 1;

      lines.forEach(line => {
          drawLine(line.x, line.y, line.length);
          line.y += line.speed;

          if (line.y > height) {
              line.y = -line.length;
              line.x = Math.random() * width;
          }
      });

      requestAnimationFrame(animate);
  }

  animate();
});