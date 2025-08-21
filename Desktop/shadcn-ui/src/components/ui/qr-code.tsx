import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  className?: string;
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export function QRCodeComponent({
  value,
  size = 200,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = '',
  includeMargin = false,
  imageSettings,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const options = {
      errorCorrectionLevel: level,
      type: 'image/png',
      quality: 0.8,
      margin: includeMargin ? 2 : 0,
      width: size,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    };

    // Generate QR code
    QRCode.toCanvas(canvasRef.current, value, options, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    });
  }, [value, size, level, bgColor, fgColor, includeMargin]);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} />
      {imageSettings && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src={imageSettings.src}
            alt="QR Code Logo"
            style={{
              width: `${imageSettings.width}%`,
              height: `${imageSettings.height}%`,
              backgroundColor: bgColor,
              padding: '4px',
              borderRadius: '4px',
            }}
          />
        </div>
      )}
    </div>
  );
}
