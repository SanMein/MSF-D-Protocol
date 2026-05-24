// js/app.js
class MSFApp {
    constructor() {
        this.archive = [];
        this.auditCounter = 1;
        this.currentSearchTerm = '';
        this.currentCodes = {
            msfCode: null,
            auditNumber: null
        };
        this.currentOperator = {
            callsign: null,
            dsid: null,
            service: null,
            serviceAbbr: null
        };
        this.init();
    }

    init() {
        this.loadArchiveFromLocalStorage();
        this.setupEventListeners();
        this.setupAnimations();
        this.updateQRInfoDisplay();
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
        document.getElementById('generate-msf-code').addEventListener('click', () => {
            if (this.validateOperatorData()) {
                this.generateMSFCode();
            }
        });

        document.getElementById('generate-audit-number').addEventListener('click', () => {
            if (this.validateOperatorData()) {
                this.generateAuditNumber();
            }
        });

        document.getElementById('generate-both').addEventListener('click', () => {
            if (this.validateOperatorData()) {
                this.generateBothCodes();
            }
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.registerOperator();
        });

        document.getElementById('access-code-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleAccessCode(event.target.value.trim());
                event.target.value = '';
            }
        });

        document.getElementById('clear-archive').addEventListener('click', () => {
            this.clearArchive();
        });

        document.getElementById('close-archive').addEventListener('click', () => {
            this.closeArchiveWindow();
        });

        document.getElementById('callsign').addEventListener('input', () => this.updateQRInfoDisplay());
        document.getElementById('dsid').addEventListener('input', () => this.updateQRInfoDisplay());
        document.querySelectorAll('input[name="service"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateQRInfoDisplay());
        });

        this.archiveButton = document.createElement('button');
        this.archiveButton.id = 'archive-button';
        this.archiveButton.className = 'archive-btn hidden';
        this.archiveButton.innerHTML = 'АРХИВ';
        this.archiveButton.addEventListener('click', () => this.showArchiveWindow());
        document.body.appendChild(this.archiveButton);
    }

    validateOperatorData() {
        const callsign = document.getElementById('callsign').value.trim();
        const dsid = document.getElementById('dsid').value.trim();
        const selectedService = document.querySelector('input[name="service"]:checked');

        if (!callsign) {
            this.showNotification('Введите позывной оперативника', 'warning');
            return false;
        }
        if (!this.validateCallsign(callsign)) {
            this.showNotification('Позывной: 2-8 символов, только латиница, без цифр', 'warning');
            return false;
        }
        if (!dsid) {
            this.showNotification('Введите DS-ID оперативника', 'warning');
            return false;
        }
        if (!selectedService) {
            this.showNotification('Выберите корпус', 'warning');
            return false;
        }

        this.currentOperator.callsign = callsign;
        this.currentOperator.dsid = dsid;
        this.currentOperator.serviceAbbr = selectedService.value;
        this.currentOperator.service = selectedService.getAttribute('data-name');

        return true;
    }

    validateCallsign(callsign) {
        const regex = /^[A-Za-z]{2,8}$/;
        return regex.test(callsign);
    }

    getMaskedDsid(dsid) {
        if (!dsid || dsid.length < 4) return '****';
        return '****' + dsid.slice(-4);
    }

    updateQRInfoDisplay() {
        const callsign = document.getElementById('callsign').value.trim() || '—';
        const dsid = document.getElementById('dsid').value.trim();
        const maskedDsid = dsid ? this.getMaskedDsid(dsid) : '—';
        const selectedService = document.querySelector('input[name="service"]:checked');
        const serviceAbbr = selectedService ? selectedService.value : '—';

        document.getElementById('qr-callsign').textContent = callsign;
        document.getElementById('qr-dsid-masked').textContent = maskedDsid;
        document.getElementById('qr-service-abbr').textContent = serviceAbbr;

        if (this.currentCodes.msfCode) {
            document.getElementById('qr-msf-code').textContent = this.currentCodes.msfCode;
        }
        if (this.currentCodes.auditNumber) {
            document.getElementById('qr-audit-number').textContent = this.currentCodes.auditNumber;
        }
    }

    generateMSFCode() {
        const msfCode = CodeGenerator.generateMSFCode();
        this.currentCodes.msfCode = msfCode;

        this.animateCodeDisplay('msf-code', msfCode);
        document.getElementById('msf-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-msf-code').textContent = msfCode;

        this.addToArchive('MSF_CODE', msfCode, null);

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

        this.addToArchive('AUDIT_MSF', auditNumber, null);

        if (this.currentCodes.msfCode && this.currentCodes.auditNumber) {
            this.updateQRCode();
        }

        this.showNotification('Аудит MSF сгенерирован', 'success');
    }

    generateBothCodes() {
        const codes = CodeGenerator.generateBothCodes();
        this.currentCodes = codes;

        this.animateCodeDisplay('msf-code', codes.msfCode);
        document.getElementById('msf-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-msf-code').textContent = codes.msfCode;

        this.animateCodeDisplay('audit-number', codes.auditNumber);
        document.getElementById('audit-timestamp').textContent = new Date().toLocaleString('ru-RU');
        document.getElementById('qr-audit-number').textContent = codes.auditNumber;

        this.updateQRCode();

        this.addToArchive('BOTH_CODES', `${codes.msfCode} | ${codes.auditNumber}`, null);

        this.showNotification('Оба кода сгенерированы', 'success');
    }

    async registerOperator() {
        if (!this.validateOperatorData()) {
            return;
        }

        if (!this.currentCodes.msfCode || !this.currentCodes.auditNumber) {
            this.showNotification('Сначала сгенерируйте оба кода (MSF и Аудит)', 'warning');
            return;
        }

        const callsign = this.currentOperator.callsign;
        const dsidFull = this.currentOperator.dsid;
        const dsidMasked = this.getMaskedDsid(dsidFull);
        const msfCode = this.currentCodes.msfCode;
        const auditNumber = this.currentCodes.auditNumber;
        const serviceAbbr = this.currentOperator.serviceAbbr;

        const clipboardText = `${callsign} | ${dsidMasked} | ${msfCode} | ${auditNumber} | ${serviceAbbr}`;

        const qrCanvas = document.getElementById('qr-code');
        if (!qrCanvas) {
            this.showNotification('QR-код не найден', 'error');
            return;
        }

        try {
            const blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            try {
                await navigator.clipboard.writeText(clipboardText);
            } catch (textError) {
                console.warn('Текст не скопирован отдельно, но изображение скопировано');
            }

            this.showNotification('Текст скопированы в буфер обмена', 'success');

            this.addToArchive('REGISTRATION',
                `${callsign} | ${serviceAbbr} | ${msfCode} | ${auditNumber}`,
                callsign);

        } catch (error) {
            console.error('Ошибка копирования:', error);

            try {
                await navigator.clipboard.writeText(clipboardText);
                this.showNotification('Не удалось скопировать QR-код (изображение), но текст скопирован', 'warning');
                this.addToArchive('REGISTRATION',
                    `${callsign} | ${serviceAbbr} | ${msfCode} | ${auditNumber}`,
                    callsign);
            } catch (textError) {
                this.showNotification('Не удалось скопировать данные. Попробуйте вручную.', 'error');
            }
        }
    }

    updateQRCode() {
        if (this.currentCodes.msfCode && this.currentCodes.auditNumber) {
            const callsign = this.currentOperator.callsign || 'OPERATOR';
            const dsidMasked = this.currentOperator.dsid ? this.getMaskedDsid(this.currentOperator.dsid) : '****';
            const serviceAbbr = this.currentOperator.serviceAbbr || 'NONE';

            const qrText = `${callsign} | ${dsidMasked} | ${this.currentCodes.msfCode} | ${this.currentCodes.auditNumber} | ${serviceAbbr}`;

            CodeGenerator.generateQRCodeWithText(qrText)
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
        const operatorInfo = callsign || this.currentOperator.callsign || 'UNKNOWN';

        const logEntry = {
            id: this.auditCounter,
            timestamp,
            type,
            code,
            operator: operatorInfo,
            service: this.currentOperator.serviceAbbr || null,
            auditId: this.auditCounter++
        };

        this.archive.push(logEntry);
        this.updateArchiveButton();
        this.saveArchiveToLocalStorage();
    }

    updateArchiveButton() {
        if (this.archiveButton) {
            this.archiveButton.innerHTML = `АРХИВ (${this.archive.length})`;
        }
        const archiveCountSpan = document.getElementById('archive-count');
        if (archiveCountSpan) {
            archiveCountSpan.textContent = `(${this.archive.length})`;
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
                message = "Доступ запрещён - Уровень Delta восстановлен";
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
        const modalHeader = document.querySelector('#archive-window .modal-header');

        const existingSearch = document.querySelector('.archive-search');
        const existingExport = document.querySelector('.btn-export');
        if (existingSearch) existingSearch.remove();
        if (existingExport) existingExport.remove();

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'ПОИСК ПО КОДУ ИЛИ ПОЗЫВНОМУ...';
        searchInput.className = 'archive-search';
        searchInput.value = this.currentSearchTerm;
        searchInput.addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value;
            this.filterArchive();
        });

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'ЭКСПОРТ';
        exportBtn.className = 'btn-export';
        exportBtn.addEventListener('click', () => this.exportArchive());

        const modalControls = modalHeader.querySelector('.modal-controls');
        modalControls.insertBefore(exportBtn, modalControls.firstChild);
        modalHeader.insertBefore(searchInput, modalControls);

        if (this.archive.length === 0) {
            archiveLog.innerHTML = `
                <div class="empty-archive">
                    <span>📭</span>
                    <p>АРХИВ ПУСТ</p>
                    <p style="font-size: 0.7rem; margin-top: 0.5rem;">Нет сгенерированных кодов для отображения.</p>
                </div>
            `;
        } else {
            this.renderArchiveTable();
        }

        archiveWindow.classList.remove('hidden');
    }

    renderArchiveTable() {
        const archiveLog = document.getElementById('archive-log');

        let filteredArchive = this.archive;
        if (this.currentSearchTerm) {
            const term = this.currentSearchTerm.toLowerCase();
            filteredArchive = this.archive.filter(entry =>
                entry.code.toLowerCase().includes(term) ||
                entry.type.toLowerCase().includes(term) ||
                entry.timestamp.toLowerCase().includes(term) ||
                (entry.operator && entry.operator.toLowerCase().includes(term))
            );
        }

        const sorted = [...filteredArchive].reverse();

        if (sorted.length === 0) {
            archiveLog.innerHTML = `
                <div class="empty-archive">
                    <span>🔍</span>
                    <p>НИЧЕГО НЕ НАЙДЕНО</p>
                    <p style="font-size: 0.7rem; margin-top: 0.5rem;">По запросу "${this.escapeHtml(this.currentSearchTerm)}" ничего не найдено.</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'archive-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th style="width: 140px;">ВРЕМЯ</th>
                    <th style="width: 90px;">ТИП</th>
                    <th style="width: 100px;">ПОЗЫВНОЙ</th>
                    <th>КОД</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((entry, idx) => {
                    let badgeClass = '';
                    let badgeText = '';
                    switch(entry.type) {
                        case 'MSF_CODE':
                            badgeClass = 'badge-msf';
                            badgeText = 'MSF КОД';
                            break;
                        case 'AUDIT_MSF':
                            badgeClass = 'badge-audit';
                            badgeText = 'АУДИТ';
                            break;
                        case 'BOTH_CODES':
                            badgeClass = 'badge-both';
                            badgeText = 'ОБА КОДА';
                            break;
                        case 'REGISTRATION':
                            badgeClass = 'badge-reg';
                            badgeText = 'РЕГИСТР.';
                            break;
                        default:
                            badgeClass = 'badge-msf';
                            badgeText = entry.type;
                    }
                    return `
                        <tr data-entry-id="${entry.id}">
                            <td>${sorted.length - idx}</td>
                            <td>${this.escapeHtml(entry.timestamp)}</td>
                            <td><span class="badge-type ${badgeClass}">${badgeText}</span></td>
                            <td>${this.escapeHtml(entry.operator || '—')}</td>
                            <td class="code-cell">${this.escapeHtml(entry.code)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;

        archiveLog.innerHTML = '';
        archiveLog.appendChild(table);

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                const codeCell = row.querySelector('.code-cell');
                if (codeCell) {
                    const code = codeCell.textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        this.showNotification('Код скопирован в буфер обмена', 'success');
                    }).catch(() => {
                        this.showNotification('Не удалось скопировать код', 'error');
                    });
                }
            });
        });
    }

    filterArchive() {
        this.renderArchiveTable();
    }

    exportArchive() {
        if (this.archive.length === 0) {
            this.showNotification('Архив пуст, нечего экспортировать', 'warning');
            return;
        }

        const exportData = {
            exportDate: new Date().toLocaleString('ru-RU'),
            totalEntries: this.archive.length,
            entries: this.archive
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `msf-archive-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`Экспортировано ${this.archive.length} записей`, 'success');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearArchive() {
        if (confirm('ОЧИСТИТЬ АРХИВ? Это действие нельзя отменить.')) {
            this.archive = [];
            this.auditCounter = 1;
            this.currentSearchTerm = '';
            this.updateArchiveButton();
            this.saveArchiveToLocalStorage();
            this.showNotification('Архив очищен', 'success');
            this.closeArchiveWindow();
        }
    }

    closeArchiveWindow() {
        document.getElementById('archive-window').classList.add('hidden');
        this.currentSearchTerm = '';
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
        }, 4000);
    }

    setupAnimations() {
        const panel = document.querySelector('.panel');
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';

        setTimeout(() => {
            panel.style.transition = 'all 0.5s ease';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.msfApp = new MSFApp();
});
