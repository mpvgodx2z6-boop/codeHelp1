/***********文本导出工具开始************/
export function splitByLines(content: string, maxLines = 500) {
  const lines = (content || '').split('\n');
  if (lines.length <= maxLines) return [content];

  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    chunks.push(lines.slice(i, i + maxLines).join('\n'));
  }
  return chunks;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  downloadTextFile(filename, content, 'application/json;charset=utf-8');
}
/***********文本导出工具结束************/