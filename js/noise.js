let animationFrameId;

function initNoise() {
    const canvas = document.getElementById('noise-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let offset = 0;
    const spacing = 60;
    const cycleLength = canvas.height + spacing;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        offset += 0.3;
        if (offset > cycleLength) {
            offset -= cycleLength;
        }

        // Более тонкий и стильный шум
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 0.5;

        for (let x = -canvas.height; x < canvas.width + canvas.height; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + offset, 0);
            ctx.lineTo(x + offset - canvas.height, canvas.height);
            ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
    });
}

document.addEventListener('DOMContentLoaded', initNoise);