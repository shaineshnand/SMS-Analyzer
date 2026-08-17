export function drawBarChart(options: {
  title: string;
  labels: string[];
  values: number[];
  formatValue: (value: number) => string;
  barColor?: string;
  width?: number;
  height?: number;
}): string {
  const dpr = 2;
  const count = Math.max(options.labels.length, 1);
  const dense = count > 8;
  const width = options.width ?? (dense ? 1200 : 980);
  const height = options.height ?? (dense ? 460 : 400);
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const pad = {
    top: dense ? 48 : 56,
    right: 28,
    bottom: dense ? 78 : 56,
    left: 92,
  };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...options.values, 1);
  const barColor = options.barColor ?? '#006666';
  const slot = plotW / count;
  const barW = dense ? Math.max(6, slot * 0.62) : Math.max(18, Math.min(72, slot * 0.7));
  const labelEvery = dense ? (count > 24 ? 3 : 2) : 1;
  const showValues = !dense;

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Calibri, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(options.title, pad.left, 32);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    const tick = max * (1 - i / 4);
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Calibri, Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(options.formatValue(tick), pad.left - 10, y + 4);
  }

  options.labels.forEach((label, index) => {
    const value = options.values[index] ?? 0;
    const x = pad.left + slot * index + (slot - barW) / 2;
    const barH = (value / max) * plotH;
    const y = pad.top + plotH - barH;
    const centerX = x + barW / 2;

    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, barW, Math.max(barH, 2));

    if (showValues) {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 11px Calibri, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.formatValue(value), centerX, Math.max(y - 8, 48));
    }

    const isLast = index === count - 1;
    const onStep = index % labelEvery === 0;
    const showLabel = onStep || (isLast && index % labelEvery > 1);
    if (!showLabel) return;

    ctx.fillStyle = '#475569';
    ctx.font = dense ? '11px Calibri, Segoe UI, sans-serif' : '12px Calibri, Segoe UI, sans-serif';
    if (dense) {
      ctx.save();
      ctx.translate(centerX, height - 58);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, centerX, height - 22);
    }
  });

  return canvas.toDataURL('image/png');
}
