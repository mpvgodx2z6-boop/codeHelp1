/***********多行文本处理工具开始************/
export function toLines(s: string): string[] {
  return String(s || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function fromLines(arr: string[] | undefined): string {
  return (arr || []).join('\n');
}
/***********多行文本处理工具结束************/