/***********ID 生成工具开始************/
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
/***********ID 生成工具结束************/