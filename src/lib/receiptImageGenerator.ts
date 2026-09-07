/**
 * High-Resolution Thermal Receipt PNG Generator
 * Renders an authentic thermal receipt image and downloads it directly as a .png file.
 */

interface ReceiptImageParams {
  registrationId: string;
  fullName?: string;
  mobileNumber?: string;
  countryCode?: string;
  centre?: string;
  cardNo?: string;
  tshirtSize?: string;
  customJerseyName?: string;
  preferredJerseyNumber?: string;
  accommodationRequired?: string;
  foodPreference?: string;
  sportsList: string[];
  hasPaymentProof: boolean;
  paymentUtr?: string;
}

export function downloadReceiptAsImage(params: ReceiptImageParams) {
  const width = 640;
  const scale = 2; // Retina 2x resolution
  
  // Calculate dynamic height based on sports (without barcode/regId)
  const baseHeight = 720 + (params.sportsList.length * 28);
  const height = baseHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // 1. Draw Thermal Paper Background
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, width, height);

  // Paper subtle border
  ctx.strokeStyle = '#e2e2dc';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // 2. Draw Serrated Cutter Teeth at Bottom
  const teethCount = 36;
  const toothWidth = width / teethCount;
  ctx.fillStyle = '#f1f1ee';
  for (let i = 0; i < teethCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * toothWidth, height);
    ctx.lineTo(i * toothWidth + toothWidth / 2, height - 8);
    ctx.lineTo((i + 1) * toothWidth, height);
    ctx.closePath();
    ctx.fill();
  }

  let y = 38;
  const padX = 36;
  const contentWidth = width - padX * 2;

  // 3. Header Section
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('RAJ PREMIER LEAGUE', padX, y);

  y += 24;
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('SEASON 9 • TOURNAMENT PASS', padX, y);

  // Gold emblem box on top right
  const badgeSize = 52;
  ctx.fillStyle = '#fffbeb';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(width - padX - badgeSize, 26, badgeSize, badgeSize, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#d97706';
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', width - padX - badgeSize / 2, 62);
  ctx.textAlign = 'left';

  y += 32;

  // 4. Payment Status Badge Box
  const badgeH = 50;
  if (params.hasPaymentProof) {
    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(padX, y, contentWidth, badgeH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✓ PAYMENT SUCCESSFUL', width / 2, y + 23);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED PASS • 25-27 DEC 2026 | RESEARCH CENTRE', width / 2, y + 40);
  } else {
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(padX, y, contentWidth, badgeH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ PAYMENT DUE', width / 2, y + 23);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('ATTACH PROOF AT DESK • RESEARCH CENTRE', width / 2, y + 40);
  }
  ctx.textAlign = 'left';

  y += badgeH + 20;

  // Dashed divider helper
  const drawDashedLine = (currY: number) => {
    ctx.strokeStyle = '#c4c4be';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padX, currY);
    ctx.lineTo(width - padX, currY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawDashedLine(y);
  y += 22;

  // Helper to draw row
  const drawRow = (label: string, value: string, valColor: string = '#111827') => {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(label, padX, y);

    ctx.fillStyle = valColor;
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(value, width - padX, y);
    ctx.textAlign = 'left';
    y += 24;
  };

  // Participant rows
  drawRow('PLAYER:', params.fullName || 'Participant');
  drawRow('CONTACT:', `${params.countryCode || '+91'} ${params.mobileNumber || ''}`);
  drawRow('CENTRE:', `${params.centre || 'Mumbai'}${params.cardNo ? ` (${params.cardNo})` : ''}`);
  drawRow(
    'JERSEY:',
    `SIZE ${params.tshirtSize || 'L'}${params.customJerseyName ? ` • ${params.customJerseyName}` : ''}${params.preferredJerseyNumber ? ` #${params.preferredJerseyNumber}` : ''}`,
    '#92400e'
  );
  drawRow(
    'HOSPITALITY:',
    `${params.accommodationRequired === 'Yes' ? 'Stay: Dec 25-27' : 'Self-Arranged'} • ${params.foodPreference || 'Regular'}`
  );
  drawRow(
    'PROOF:',
    params.paymentUtr
      ? `UTR: ${params.paymentUtr}`
      : params.hasPaymentProof
      ? 'SCREENSHOT ATTACHED'
      : 'PAYMENT DUE',
    params.hasPaymentProof ? '#065f46' : '#92400e'
  );

  y += 4;
  drawDashedLine(y);
  y += 24;

  // Registered Sports Arena
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText('CHAMPIONSHIP ARENAS (1X INCLUDED):', padX, y);
  y += 20;

  params.sportsList.forEach((sport) => {
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`• ${sport}`, padX, y);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('INCLUDED', width - padX, y);
    ctx.textAlign = 'left';
    y += 22;
  });

  y += 8;
  // Solid divider
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  y += 20;

  // Totals Breakdown
  drawRow('Tournament Registration', params.hasPaymentProof ? 'VERIFIED' : 'PENDING PROOF', '#4b5563');
  drawRow('Player Kit & Pass', 'INCLUDED', '#4b5563');

  // Solid line for TOTAL
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  y += 20;

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText('TOTAL STATUS', padX, y);

  ctx.fillStyle = params.hasPaymentProof ? '#047857' : '#b45309';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(params.hasPaymentProof ? 'PAYMENT SUCCESSFUL' : 'PAYMENT DUE', width - padX, y);
  ctx.textAlign = 'left';

  y += 24;
  drawDashedLine(y);
  y += 20;

  // Footer Greeting
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ PLAY WITH PASSION • WIN WITH GRACE ★', width / 2, y);

  y += 18;
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('RPL S9 ORGANIZING COMMITTEE', width / 2, y);

  // 5. Direct PNG Download Named as Person's Name
  canvas.toBlob((blob) => {
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      const personName = params.fullName?.trim()
        ? params.fullName.trim().replace(/[/\\?%*:|"<>]/g, '')
        : 'Participant';
      downloadAnchor.download = `rpl 9 pass ${personName}.png`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(blobUrl);
    }
  }, 'image/png');
}
