import jsPDF from 'jspdf';

export function gerarPdfRelatorio(dados: {
  periodo: string;
  faturamento: number;
  ticketMedio: number;
  emAberto: number;
  totalOS: number;
  finalizadas: number;
  canceladas: number;
  abertas: number;
  ordens: any[];
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  const vermelho: [number, number, number] = [185, 28, 28];
  const cinzaEscuro: [number, number, number] = [30, 30, 30];
  const cinzaMedio: [number, number, number] = [100, 100, 100];
  const cinzaClaro: [number, number, number] = [245, 245, 245];
  const branco: [number, number, number] = [255, 255, 255];
  const verde: [number, number, number] = [34, 197, 94];

  let y = 0;

  // ── CABEÇALHO ──────────────────────────────────────────────────
  doc.setFillColor(...vermelho);
  doc.rect(0, 0, W, 28, 'F');
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(...branco);
  doc.text('DM MOTOS', margin, 12);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 200, 200);
  doc.text('Relatório Financeiro', margin, 19);
  doc.setFontSize(9); doc.setTextColor(...branco);
  doc.text(`Período: ${dados.periodo}`, W - margin, 12, { align: 'right' });
  doc.setFontSize(7); doc.setTextColor(255, 200, 200);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W - margin, 19, { align: 'right' });

  y = 36;

  // ── CARDS DE RESUMO ─────────────────────────────────────────────
  const cardW = (W - margin * 2 - 6) / 3;

  // Faturamento
  doc.setFillColor(...vermelho);
  doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 200, 200);
  doc.text('FATURAMENTO TOTAL', margin + 4, y + 6);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(...branco);
  doc.text(`R$ ${dados.faturamento.toFixed(2)}`, margin + 4, y + 15);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 200, 200);
  doc.text(`${dados.finalizadas} OS finalizada(s)`, W - margin - 4, y + 11, { align: 'right' });
  y += 24;

  // 3 cards
  const cards = [
    { label: 'Ticket Médio', value: `R$ ${dados.ticketMedio.toFixed(2)}`, color: cinzaClaro },
    { label: 'Em Aberto', value: `R$ ${dados.emAberto.toFixed(2)}`, color: cinzaClaro },
    { label: 'Total de OS', value: String(dados.totalOS), color: cinzaClaro },
  ];
  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 3);
    doc.setFillColor(...card.color);
    doc.roundedRect(x, y, cardW, 16, 2, 2, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...cinzaMedio);
    doc.text(card.label, x + 4, y + 6);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...cinzaEscuro);
    doc.text(card.value, x + 4, y + 13);
  });
  y += 22;

  // Status resumo
  const statusCards = [
    { label: 'Finalizadas', value: dados.finalizadas, cor: verde },
    { label: 'Em Andamento', value: dados.abertas, cor: [234, 179, 8] as [number,number,number] },
    { label: 'Canceladas', value: dados.canceladas, cor: [239, 68, 68] as [number,number,number] },
  ];
  statusCards.forEach((s, i) => {
    const x = margin + i * (cardW + 3);
    doc.setFillColor(...cinzaClaro);
    doc.roundedRect(x, y, cardW, 12, 2, 2, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...cinzaMedio);
    doc.text(s.label, x + 4, y + 5);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...s.cor);
    doc.text(String(s.value), x + 4, y + 11);
  });
  y += 18;

  // ── TABELA DE OS ────────────────────────────────────────────────
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...cinzaEscuro);
  doc.text('Ordens de Serviço', margin, y);
  y += 5;

  // Header tabela
  doc.setFillColor(...vermelho);
  doc.rect(margin, y, W - margin * 2, 7, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...branco);
  doc.text('Nº OS', margin + 2, y + 4.8);
  doc.text('Cliente', margin + 25, y + 4.8);
  doc.text('Data', margin + 95, y + 4.8);
  doc.text('Status', margin + 125, y + 4.8);
  doc.text('Total', W - margin, y + 4.8, { align: 'right' });
  y += 7;

  const statusColors: Record<string, [number,number,number]> = {
    finalizada: [34, 197, 94],
    aberta: [59, 130, 246],
    em_andamento: [234, 179, 8],
    cancelada: [239, 68, 68],
  };

  dados.ordens.forEach((o, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 250 : 245);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...cinzaEscuro);
    doc.text(o.numero || '-', margin + 2, y + 4.5);
    doc.text((o.clienteNome || '-').substring(0, 28), margin + 25, y + 4.5);
    doc.text(new Date(o.created_at).toLocaleDateString('pt-BR'), margin + 95, y + 4.5);
    const cor = statusColors[o.status] || cinzaMedio;
    doc.setTextColor(...cor);
    doc.text((o.status || '').replace('_', ' '), margin + 125, y + 4.5);
    doc.setTextColor(...cinzaEscuro);
    doc.text(`R$ ${Number(o.valor_total || 0).toFixed(2)}`, W - margin, y + 4.5, { align: 'right' });
    y += 7;
  });

  // Rodapé
  doc.setFillColor(...cinzaClaro);
  doc.rect(0, 285, W, 12, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...cinzaMedio);
  doc.text('DM Motos — Sistema de Gestão', W / 2, 291, { align: 'center' });

  doc.save(`Relatorio-DM-Motos-${dados.periodo.replace(/\s/g, '-')}.pdf`);
}
