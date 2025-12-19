class MSFApp {
    constructor() {
        this.archive = [];
        this.auditCounter = 1;
        this.currentCodes = {
            msfCode: null,
            auditNumber: null
        };
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
            this.updateArchiveButton();
        }
    }

    saveArchiveToLocalStorage() {
        localStorage.setItem('msfArchive', JSON.stringify(this.archive));
    }

    setupEventListeners() {
        // Generate MSF code button
        document.getElementById('generate-msf-code').addEventListener('click', () => {
            this.generateMSFCode();
        });

        // Generate audit number button
        document.getElementById('generate-audit-number').addEventListener('click', () => {
            this.generateAuditNumber();
        });

        // Generate both codes button
        document.getElementById('generate-both').addEventListener('click', () => {
            this.generateBothCodes();
        });

        // Download QR code button
        document.getElementById('download-qr-btn').addEventListener('click', () => {
            this.downloadQRCode();
        });

        // Access code input
        document.getElementById('access-code-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleAccessCode(event.target.value.trim());
                event.target.value = '';
            }
        });

        // Archive window controls
        document.getElementById('clear-archive').addEventListener('click', () => {
            this.clearArchive();
        });

        document.getElementById('close-archive').addEventListener('click', () => {
            this.closeArchiveWindow();
        });

        // Create archive button
        this.archiveButton = document.createElement('button');
        this.archiveButton.id = 'archive-button';
        this.archiveButton.className = 'archive-btn hidden';
        this.archiveButton.innerHTML = 'АРХИВ';
        this.archiveButton.addEventListener('click', () => this.showArchiveWindow());
        document.body.appendChild(this.archiveButton);
    }

    setupAnimations() {
        // Smooth panel appearance
        const panel = document.querySelector('.panel');
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';

        setTimeout(() => {
            panel.style.transition = 'all 0.5s ease';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 200);
    }

    generateMSFCode() {
        const msfCode = CodeGenerator.generateMSFCode();
        this.currentCodes.msfCode = msfCode;

        this.animateCodeDisplay('msf-code', msfCode);
        document.getElementById('msf-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-msf-code').textContent = msfCode;

        this.addToArchive('MSF_CODE', msfCode, null);

        // Generate QR code if both codes exist
        if (this.currentCodes.msfCode && this.currentCodes.auditNumber) {
            this.updateQRCode();
        }

        this.showNotification('Код MSF сгенерирован', 'success');
    }

    generateAuditNumber() {
        const auditNumber = CodeGenerator.generateAuditNumber();
        this.currentCodes.auditNumber = auditNumber;

        this.animateCodeDisplay('audit-number', auditNumber);
        document.getElementById('audit-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-audit-number').textContent = auditNumber;

        this.addToArchive('AUDIT_NUMBER', auditNumber, null);

        // Generate QR code if both codes exist
        if (this.currentCodes.msfCode && this.currentCodes.auditNumber) {
            this.updateQRCode();
        }

        this.showNotification('Аудит-номер сгенерирован', 'success');
    }

    generateBothCodes() {
        const codes = CodeGenerator.generateBothCodes();
        this.currentCodes = codes;

        // Update MSF code display
        this.animateCodeDisplay('msf-code', codes.msfCode);
        document.getElementById('msf-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-msf-code').textContent = codes.msfCode;

        // Update audit number display
        this.animateCodeDisplay('audit-number', codes.auditNumber);
        document.getElementById('audit-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-audit-number').textContent = codes.auditNumber;

        // Generate QR code
        this.updateQRCode();

        // Add to archive
        this.addToArchive('BOTH_CODES', `${codes.msfCode} | ${codes.auditNumber}`, null);

        this.showNotification('Оба кода сгенерированы', 'success');
    }

    updateQRCode() {
        if (this.currentCodes.msfCode && this.currentCodes.auditNumber) {
            CodeGenerator.generateQRCode(this.currentCodes.msfCode, this.currentCodes.auditNumber)
                .then(() => {
                    this.showNotification('QR-код обновлён', 'success');
                })
                .catch(error => {
                    console.error('QR generation error:', error);
                    this.showNotification('Ошибка генерации QR-кода', 'error');
                });
        }
    }

    addToArchive(type, code, callsign) {
        const now = new Date();
        const timestamp = now.toLocaleString('ru-RU');
        const logEntry = {
            timestamp,
            type,
            code,
            auditId: this.auditCounter++
        };

        this.archive.push(logEntry);
        this.updateArchiveButton();
        this.saveArchiveToLocalStorage();
    }

    updateArchiveButton() {
        if (this.archiveButton) {
            this.archiveButton.textContent = `АРХИВ (${this.archive.length})`;
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
        if (!canvas || !this.currentCodes.msfCode || !this.currentCodes.auditNumber) {
            this.showNotification('Сначала сгенерируйте оба кода', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = `MSF-QR-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        this.showNotification('QR-код скачан', 'success');
    }

    handleAccessCode(code) {
        let level, color, message;

        switch(code) {
            case "GAMMAC-917230485619827364012398172034-TACOPS":
                level = "Γ-GAMMA";
                color = "gamma";
                message = "Уровень доступа Gamma авторизован";
                this.archiveButton.classList.add('hidden');
                break;
            case "BETACX-042918637561290837465120934576-CMDOPS":
                level = "Β-BETA";
                color = "beta";
                message = "Уровень доступа Beta авторизован";
                this.archiveButton.classList.add('hidden');
                break;
            case "ALPHAC-781296540128399317460325120458-GENCOM":
                level = "Α-ALPHA";
                color = "alpha";
                message = "Уровень доступа Alpha авторизован - Архив разблокирован";
                this.archiveButton.classList.remove('hidden');
                break;
            default:
                level = "Δ-DELTA";
                color = "delta";
                message = "Доступ запрещён - Уровень Delta сохранён";
                this.archiveButton.classList.add('hidden');
        }

        this.updateAccessLevel(level, color);
        this.showNotification(message, color === 'delta' ? 'warning' : 'success');
    }

    updateAccessLevel(level, color) {
        const accessLevel = document.getElementById('access-level');
        accessLevel.textContent = level;
        accessLevel.className = `access-level ${color}`;
    }

    showArchiveWindow() {
        const archiveWindow = document.getElementById('archive-window');
        const archiveLog = document.getElementById('archive-log');

        if (this.archive.length === 0) {
            archiveLog.textContent = "АРХИВ ПУСТ\n\nНет сгенерированных кодов для отображения.";
        } else {
            archiveLog.innerHTML = this.archive.map(entry =>
                `${entry.timestamp} | ${entry.type}\n${entry.code}\n${'-'.repeat(60)}`
            ).join('\n\n');
        }

        archiveWindow.classList.remove('hidden');
    }

    clearArchive() {
        if (confirm('ОЧИСТИТЬ АРХИВ? Это действие нельзя отменить.')) {
            this.archive = [];
            this.auditCounter = 1;
            this.updateArchiveButton();
            this.saveArchiveToLocalStorage();
            this.showNotification('Архив очищен', 'success');
            this.closeArchiveWindow();
        }
    }

    closeArchiveWindow() {
        document.getElementById('archive-window').classList.add('hidden');
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

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.msfApp = new MSFApp();
});