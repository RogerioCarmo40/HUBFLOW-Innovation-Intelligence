export async function exportReportToPDF(htmlElementId: string) {
  const element = document.getElementById(htmlElementId);
  if (!element) {
    console.error(`Elemento com ID "${htmlElementId}" não encontrado.`);
    return;
  }

  const htmlContent = element.innerHTML;

  try {
    const response = await fetch('http://localhost:8000/export-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html_content: htmlContent }),
    });

    if (!response.ok) throw new Error('Falha ao gerar o PDF.');

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'relatorio_hubflow.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Erro na exportação:', error);
    alert('Erro ao exportar PDF.');
  }
}