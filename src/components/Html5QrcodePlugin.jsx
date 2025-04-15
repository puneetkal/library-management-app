"use client"
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

const Html5QrcodePlugin = ({ fps, qrbox, disableFlip, qrCodeSuccessCallback }) => {
    useEffect(() => {
        // Creates the configuration object for Html5QrcodeScanner.
        const config = {
            fps: fps || 10,
            qrbox: qrbox || 250,
            aspectRatio: 1.0,
            disableFlip: disableFlip || false
        };

        let html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            config,
            false // verbose
        );

        // Success callback is required.
        if (!qrCodeSuccessCallback) {
            throw "qrCodeSuccessCallback is required callback.";
        }

        html5QrcodeScanner.render(qrCodeSuccessCallback, (error) => {
            // Ignore NotFoundException
            if (error?.message?.includes('NotFoundException')) {
                return;
            }
            console.warn('QR Scan Error:', error);
        });

        // cleanup function when component will unmount
        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear()
                    .catch(error => {
                        console.error("Failed to clear html5QrcodeScanner.", error);
                    });
                html5QrcodeScanner = null;
            }
        };
    }, [fps, qrbox, disableFlip, qrCodeSuccessCallback]);

    return (
        <div 
            id={qrcodeRegionId} 
            className="w-full overflow-hidden rounded-lg"
            style={{ minHeight: '300px' }}
        />
    );
};

export default Html5QrcodePlugin;