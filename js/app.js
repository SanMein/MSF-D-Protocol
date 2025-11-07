class MSFApp {
    constructor() {
        this.archive = [];
        this.auditCounter = 1;
        this.init();
    }

    init() {
        this.loadArchiveFromLocalStorage();
        this.setupEventListeners();
        this.setupAnimations();
    }

    loadArchiveFromLocalStorage() {
        const savedArchive = localStorage.getItem('msfArchive');
        if (savedArchive) {
            this.archive = JSON.parse(savedArchive);
            this.updateAuditCount();
        }
    }

    saveArchiveToLocalStorage() {
        localStorage.setItem('msfArchive', JSON.stringify(this.archive));
    }

    setupEventListeners() {
        document.getElementById('generate-fighter-code').addEventListener('click', () => {
            this.generateFighterCode();
        });

        document.getElementById('generate-audit-number').addEventListener('click', () => {
            this.generateAuditNumber();
        });

        document.getElementById('download-qr-btn').addEventListener('click', () => {
            this.downloadQRCode();
        });

        document.getElementById('access-code-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleAccessCode(event.target.value.trim());
                event.target.value = '';
            }
        });

        document.getElementById('clear-audit').addEventListener('click', () => {
            this.clearAudit();
        });

        document.getElementById('close-audit').addEventListener('click', () => {
            this.closeAuditWindow();
        });

        // Кнопка архива (появится при уровне Альфа)
        this.auditButton = document.createElement('button');
        this.auditButton.id = 'audit-button';
        this.auditButton.className = 'audit-btn hidden';
        this.auditButton.innerHTML = 'ARCHIVE';
        this.auditButton.addEventListener('click', () => this.showAuditWindow());
        document.body.appendChild(this.auditButton);
    }

    setupAnimations() {
        // Плавное появление панелей
        const panels = document.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            setTimeout(() => {
                panel.style.transition = 'all 0.5s ease';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    generateFighterCode() {
        const callsign = document.getElementById('operative-callsign').value.trim();
        const code = CodeGenerator.generateFighterCode(callsign);

        this.animateCodeDisplay('fighter-code', code);
        document.getElementById('fighter-timestamp').textContent = new Date().toLocaleString();

        CodeGenerator.generateQRCode(code)
            .then(() => {
                this.showNotification('Identity code generated successfully', 'success');
            })
            .catch(error => {
                console.error('QR generation error:', error);
                this.showNotification('QR code generation failed', 'error');
            });

        this.addToArchive('IDENTITY_CODE', code, callsign);
    }

    generateAuditNumber() {
        const callsign = document.getElementById('audit-callsign').value.trim();
        const auditNumber = CodeGenerator.generateAuditNumber(callsign);

        this.animateCodeDisplay('audit-number', auditNumber);
        this.showNotification('Audit number generated', 'success');

        this.addToArchive('AUDIT_NUMBER', auditNumber, callsign);
    }

    addToArchive(type, code, callsign) {
        const now = new Date();
        const timestamp = now.toLocaleString();
        const logEntry = {
            timestamp,
            type,
            code,
            callsign,
            auditId: this.auditCounter++
        };

        this.archive.push(logEntry);
        this.updateAuditCount();
        this.saveArchiveToLocalStorage();
    }

    updateAuditCount() {
        if (this.auditButton) {
            this.auditButton.textContent = `ARCHIVE (${this.archive.length})`;
        }
    }

    animateCodeDisplay(elementId, code) {
        const element = document.getElementById(elementId);
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';

        setTimeout(() => {
            element.textContent = code;
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 150);
    }

    downloadQRCode() {
        const canvas = document.getElementById('qr-code');
        if (!canvas) {
            this.showNotification('Generate a code first', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = `MSF-QR-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        this.showNotification('QR code downloaded', 'success');
    }

    handleAccessCode(code) {
        let level, color, message;

        switch(code) {
            case "GAMMAC-917230485619827364012398172034-TACOPS":
                level = "Γ-GAMMA";
                color = "gamma";
                message = "Gamma access level authorized";
                this.auditButton.classList.add('hidden');
                break;
            case "BETACX-042918637561290837465120934576-CMDOPS":
                level = "Β-BETA";
                color = "beta";
                message = "Beta access level authorized";
                this.auditButton.classList.add('hidden');
                break;
            case "ALPHAC-781296540128399317460325120458-GENCOM":
                level = "Α-ALPHA";
                color = "alpha";
                message = "Alpha access level authorized - Archive unlocked";
                this.auditButton.classList.remove('hidden');
                break;
            default:
                level = "Δ-DELTA";
                color = "delta";
                message = "Access denied - Delta level maintained";
                this.auditButton.classList.add('hidden');
        }

        this.updateAccessLevel(level, color);
        this.showNotification(message, color === 'delta' ? 'warning' : 'success');
    }

    updateAccessLevel(level, color) {
        const accessLevel = document.getElementById('access-level');
        accessLevel.textContent = level;
        accessLevel.className = `access-level ${color}`;
    }

    showAuditWindow() {
        const auditWindow = document.getElementById('audit-window');
        const auditLog = document.getElementById('audit-log');

        auditLog.innerHTML = this.archive.map(entry =>
            `${entry.timestamp} | ${entry.callsign || 'NO_CALLSIGN'} | ${entry.type} | ${entry.code}`
        ).join('\n\n');

        auditWindow.classList.remove('hidden');
    }

    clearAudit() {
        if (confirm('PURGE ARCHIVE? This action cannot be undone.')) {
            this.archive = [];
            this.auditCounter = 1;
            this.updateAuditCount();
            this.saveArchiveToLocalStorage();
            this.showNotification('Archive purged', 'success');
            this.closeAuditWindow();
        }
    }

    closeAuditWindow() {
        document.getElementById('audit-window').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        const colors = {
            success: '#5a8a5a',
            error: '#8a5a5a',
            warning: '#8a7a5a',
            info: '#5a7a8a'
        };

        notification.style.borderLeftColor = colors[type] || colors.info;

        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.classList.add('hidden'), 300);
        }, 3000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.msfApp = new MSFApp();
});