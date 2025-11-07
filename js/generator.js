class CodeGenerator {
    static generateFighterCode(callsign = '') {
        const prefix = "MSF-";
        const randomPart1 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart2 = Math.random().toString(36).substr(2, 4).toUpperCase();
        const randomPart3 = Math.random().toString(36).substr(2, 4).toUpperCase();

        let code = `${prefix}${randomPart1}-${randomPart2}-${randomPart3}`;

        if (callsign) {
            code = `${callsign.toUpperCase()}-${code}`;
        }

        return code;
    }

    static generateAuditNumber(callsign = '') {
        const prefix = "MSF-D-";
        const mainNumber = Math.floor(100000 + Math.random() * 900000);
        const statusNumber = Math.floor(Math.random() * 10);

        let auditNumber = `${prefix}${mainNumber}-${statusNumber}`;

        if (callsign) {
            auditNumber = `${callsign.toUpperCase()}::${auditNumber}`;
        }

        return auditNumber;
    }

    static generateQRCode(code, canvasId = 'qr-code') {
        return new Promise((resolve, reject) => {
            const qrCanvas = document.getElementById(canvasId);
            QRCode.toCanvas(qrCanvas, code, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 120,
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
}