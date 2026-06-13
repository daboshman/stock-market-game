import { ImageResponse } from 'next/og';

export function generateIcon(size: number): ImageResponse {
  const r = size * 0.19;
  const p = size * 0.15;
  const bars = [0.38, 0.52, 0.42, 0.68, 0.88];
  const totalW = size - p * 2;
  const barW = (totalW / bars.length) * 0.68;
  const gap = (totalW / bars.length) * 0.32;
  const maxH = size - p * 1.8;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#4f46e5',
          borderRadius: r,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: p * 0.7,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${gap}px` }}>
          {bars.map((ratio, i) => (
            <div
              key={i}
              style={{
                width: `${barW}px`,
                height: `${maxH * ratio}px`,
                background: i === bars.length - 1 ? '#a5f3fc' : 'rgba(255,255,255,0.72)',
                borderRadius: `${barW * 0.35}px ${barW * 0.35}px 0 0`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
