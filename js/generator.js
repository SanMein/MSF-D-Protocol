class CodeGenerator {
    // Generate MSF code (MSF-XXXX-XXXX-XXXX)
    static generateMSFCode() {
        const prefix = "MSF-";
        const randomPart1 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart2 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart3 = Math.random().toString(36).substr(2, 4).toUpperCase();

        return `${prefix}${randomPart1}-${randomPart2}-${randomPart3}`;
    }

    // Generate audit number (MSF-D-XXXXXX-X)
    static generateAuditNumber() {
        const prefix = "MSF-D-";
        const mainNumber = Math.floor(100000 + Math.random() * 900000);
        const statusNumber = Math.floor(Math.random() * 10);

        return `${prefix}${mainNumber}-${statusNumber}`;
    }

    // Generate QR code with both codes
    static generateQRCode(msfCode, auditNumber, canvasId = 'qr-code') {
        return new Promise((resolve, reject) => {
            const qrCanvas = document.getElementById(canvasId);
            const combinedText = `MSF Code: ${msfCode}\nAudit Number: ${auditNumber}`;

            QRCode.toCanvas(qrCanvas, combinedText, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 180,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
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

    // Generate both codes at once
    static generateBothCodes() {
        const msfCode = this.generateMSFCode();
        const auditNumber = this.generateAuditNumber();

        return {
            msfCode,
            auditNumber
        };
    }
}