import jsPDF from 'jspdf';

export async function gerarPdfOS(ordem: any): Promise<void> {
  if (!ordem) throw new Error('Dados da OS não disponíveis');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  const col2 = W / 2 + 5;
  let y = 0;

  // Cores
  const vermelho: [number, number, number] = [185, 28, 28];
  const cinzaEscuro: [number, number, number] = [30, 30, 30];
  const cinzaMedio: [number, number, number] = [80, 80, 80];
  const cinzaClaro: [number, number, number] = [240, 240, 240];
  const branco: [number, number, number] = [255, 255, 255];

  const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = cinzaEscuro) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  };

  // ── CABEÇALHO ──────────────────────────────────────────────────────────────
  doc.setFillColor(...vermelho);
  doc.rect(0, 0, W, 35, 'F');

  setFont(20, 'bold', branco);
  doc.text('DM MOTOS', margin, 15);

  setFont(8, 'normal', [255, 200, 200]);
  doc.text('Sistema de Gestão de Oficina', margin, 21);

  // Número da OS à direita
  setFont(9, 'normal', [255, 200, 200]);
  doc.text('ORDEM DE SERVIÇO', W - margin, 12, { align: 'right' });
  setFont(16, 'bold', branco);
  doc.text(ordem.numero, W - margin, 21, { align: 'right' });

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    aberta: [59, 130, 246],
    em_andamento: [234, 179, 8],
    finalizada: [34, 197, 94],
    cancelada: [239, 68, 68],
  };
  const statusLabels: Record<string, string> = {
    aberta: 'ABERTA',
    em_andamento: 'EM ANDAMENTO',
    finalizada: 'FINALIZADA',
    cancelada: 'CANCELADA',
  };
  const statusColor = statusColors[ordem.status] || cinzaMedio;
  doc.setFillColor(...statusColor);
  doc.roundedRect(W - margin - 35, 24, 35, 8, 2, 2, 'F');
  setFont(7, 'bold', branco);
  doc.text(statusLabels[ordem.status] || ordem.status, W - margin - 17.5, 29.5, { align: 'center' });

  y = 43;

  // ── DATAS ────────────────────────────────────────────────────────────────
  setFont(7, 'normal', cinzaMedio);
  const dataCriacao = new Date(ordem.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Data: ${dataCriacao}`, margin, y);
  if (ordem.finalizado_em) {
    const dataFim = new Date(ordem.finalizado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.text(`Finalizada: ${dataFim}`, W - margin, y, { align: 'right' });
  }

  y += 6;
  doc.setDrawColor(...cinzaClaro);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 6;

  // ── CLIENTE / MOTO ────────────────────────────────────────────────────────
  const boxH = 24;

  // Box Cliente
  doc.setFillColor(...cinzaClaro);
  doc.roundedRect(margin, y, (W / 2) - margin - 3, boxH, 2, 2, 'F');
  setFont(7, 'bold', vermelho);
  doc.text('CLIENTE', margin + 4, y + 6);
  setFont(9, 'bold', cinzaEscuro);
  doc.text(ordem.clienteNome || '-', margin + 4, y + 13, { maxWidth: (W / 2) - margin - 10 });
  if (ordem.clienteTelefone) {
    setFont(7, 'normal', cinzaMedio);
    doc.text(ordem.clienteTelefone, margin + 4, y + 20);
  }

  // Box Moto
  doc.setFillColor(...cinzaClaro);
  doc.roundedRect(col2, y, (W / 2) - margin - 3, boxH, 2, 2, 'F');
  setFont(7, 'bold', vermelho);
  doc.text('MOTO', col2 + 4, y + 6);
  setFont(9, 'bold', cinzaEscuro);
  doc.text(ordem.motoDescricao || '-', col2 + 4, y + 13, { maxWidth: (W / 2) - margin - 10 });
  if (ordem.motoPlaca) {
    setFont(7, 'normal', cinzaMedio);
    doc.text(`Placa: ${ordem.motoPlaca}`, col2 + 4, y + 20);
  }

  y += boxH + 6;

  // ── PROBLEMA ────────────────────────────────────────────────────────────
  if (ordem.problema_relatado) {
    setFont(8, 'bold', vermelho);
    doc.text('PROBLEMA RELATADO', margin, y);
    y += 4;
    doc.setFillColor(...cinzaClaro);
    const probLines = doc.splitTextToSize(ordem.problema_relatado, W - margin * 2 - 8);
    const probH = probLines.length * 4.5 + 6;
    doc.roundedRect(margin, y, W - margin * 2, probH, 2, 2, 'F');
    setFont(8, 'normal', cinzaEscuro);
    doc.text(probLines, margin + 4, y + 5);
    y += probH + 5;
  }

  // ── SERVIÇO ────────────────────────────────────────────────────────────
  if (ordem.descricao_servico) {
    setFont(8, 'bold', vermelho);
    doc.text('SERVIÇO EXECUTADO', margin, y);
    y += 4;
    doc.setFillColor(...cinzaClaro);
    const servLines = doc.splitTextToSize(ordem.descricao_servico, W - margin * 2 - 8);
    const servH = servLines.length * 4.5 + 6;
    doc.roundedRect(margin, y, W - margin * 2, servH, 2, 2, 'F');
    setFont(8, 'normal', cinzaEscuro);
    doc.text(servLines, margin + 4, y + 5);
    y += servH + 5;
  }

  // ── PEÇAS ────────────────────────────────────────────────────────────────
  if (ordem.itens?.length > 0) {
    setFont(8, 'bold', vermelho);
    doc.text('PEÇAS UTILIZADAS', margin, y);
    y += 4;

    // Header tabela
    doc.setFillColor(...vermelho);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    setFont(7, 'bold', branco);
    doc.text('PEÇA', margin + 4, y + 4.8);
    doc.text('QTD', W - margin - 55, y + 4.8, { align: 'right' });
    doc.text('UNIT.', W - margin - 30, y + 4.8, { align: 'right' });
    doc.text('SUBTOTAL', W - margin, y + 4.8, { align: 'right' });
    y += 7;

    ordem.itens.forEach((item: any, i: number) => {
      const rowH = 7;
      doc.setFillColor(i % 2 === 0 ? 250 : 244, i % 2 === 0 ? 250 : 244, i % 2 === 0 ? 250 : 244);
      doc.rect(margin, y, W - margin * 2, rowH, 'F');
      setFont(7, 'normal', cinzaEscuro);
      doc.text(item.pecaNome || '-', margin + 4, y + 4.8);
      doc.text(String(item.quantidade), W - margin - 55, y + 4.8, { align: 'right' });
      doc.text(`R$ ${Number(item.preco_unitario || 0).toFixed(2)}`, W - margin - 30, y + 4.8, { align: 'right' });
      doc.text(`R$ ${Number(item.subtotal || 0).toFixed(2)}`, W - margin, y + 4.8, { align: 'right' });
      y += rowH;
    });
    y += 4;
  }

  // ── TOTAIS ────────────────────────────────────────────────────────────────
  const totalPecas = (ordem.itens || []).reduce((t: number, i: any) => t + Number(i.subtotal || 0), 0);
  const maoObra = Number(ordem.valor_mao_obra || 0);
  const total = Number(ordem.valor_total || 0);

  const totW = 75;
  const totX = W - margin - totW;

  // Mão de obra
  if (maoObra > 0) {
    doc.setFillColor(...cinzaClaro);
    doc.rect(totX, y, totW, 7, 'F');
    setFont(7, 'normal', cinzaMedio);
    doc.text('Peças:', totX + 4, y + 4.8);
    doc.text(`R$ ${totalPecas.toFixed(2)}`, W - margin, y + 4.8, { align: 'right' });
    y += 7;

    doc.setFillColor(...cinzaClaro);
    doc.rect(totX, y, totW, 7, 'F');
    setFont(7, 'normal', cinzaMedio);
    doc.text('Mão de Obra:', totX + 4, y + 4.8);
    doc.text(`R$ ${maoObra.toFixed(2)}`, W - margin, y + 4.8, { align: 'right' });
    y += 7;
  }

  // Total geral
  doc.setFillColor(...vermelho);
  doc.rect(totX, y, totW, 10, 'F');
  setFont(8, 'bold', branco);
  doc.text('TOTAL', totX + 4, y + 6.5);
  setFont(10, 'bold', branco);
  doc.text(`R$ ${total.toFixed(2)}`, W - margin, y + 6.5, { align: 'right' });
  y += 14;

  // ── ASSINATURA ────────────────────────────────────────────────────────────
  y = Math.max(y, 240);
  doc.setDrawColor(...cinzaMedio);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 70, y);
  doc.line(W - margin - 70, y, W - margin, y);

  setFont(7, 'normal', cinzaMedio);
  doc.text('Assinatura do Cliente', margin + 35, y + 4, { align: 'center' });
  doc.text('Responsável pela Oficina', W - margin - 35, y + 4, { align: 'center' });

  // ── RODAPÉ ────────────────────────────────────────────────────────────────
  doc.setFillColor(...cinzaClaro);
  doc.rect(0, 282, W, 15, 'F');
  setFont(7, 'normal', cinzaMedio);
  doc.text('DM Motos — Sistema de Gestão', W / 2, 288, { align: 'center' });
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W / 2, 293, { align: 'center' });

  try {
    doc.save(`OS-\${ordem.numero}.pdf`);
  } catch (err) {
    console.error('[PDF] Erro ao salvar:', err);
    throw new Error('Erro ao gerar o arquivo PDF');
  }
}
