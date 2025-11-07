class UIManager {
    static showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        // Добавляем цвет в зависимости от типа
        const colors = {
            success: '#00ff88',
            error: '#ff4444',
            warning: '#ffaa00',
            info: '#0088ff'
        };

        notification.style.borderColor = colors[type] || colors.info;

        gsap.fromTo(notification,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        setTimeout(() => {
            gsap.to(notification, {
                x: 100,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => notification.classList.add('hidden')
            });
        }, 3000);
    }

    static updateAccessLevel(level, color) {
        const accessLevel = document.getElementById('access-level');
        const valueElement = accessLevel.querySelector('.value');

        valueElement.textContent = level;
        valueElement.className = `value ${color}`;
    }

    static animateCodeDisplay(elementId, code) {
        const element = document.getElementById(elementId);
        gsap.fromTo(element,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
        element.innerHTML = `<div class="code-text">${code}</div>`;
    }
}