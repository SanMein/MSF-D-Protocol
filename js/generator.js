// js/generator.js
class CodeGenerator {
    static generateMSFCode() {
        const prefix = "MSF-";
        const randomPart1 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart2 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart3 = Math.random().toString(36).substr(2, 4).toUpperCase();

        return `${prefix}${randomPart1}-${randomPart2}-${randomPart3}`;
    }

    static generateAuditNumber() {
        const prefix = "MSF-D-";
        const mainNumber = Math.floor(100000 + Math.random() * 900000);
        const statusNumber = Math.floor(Math.random() * 10);

        return `${prefix}${mainNumber}-${statusNumber}`;
    }

    static generateQRCodeWithText(text, canvasId = 'qr-code') {
        return new Promise((resolve, reject) => {
            const qrCanvas = document.getElementById(canvasId);

            QRCode.toCanvas(qrCanvas, text, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 180,
                color: {
                    dark: '#9B5AAF',
                    light: '#1a1a1a'
                }
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(qrCanvas);
                }
            });
        });
    }

    static generateBothCodes() {
        const msfCode = this.generateMSFCode();
        const auditNumber = this.generateAuditNumber();

        return {
            msfCode,
            auditNumber
        };
    }
}
