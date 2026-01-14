/***********规范常量定义开始************/
export const SCOPE_OPTIONS = [
  {label: 'general 通用', value: 'general'},
  {label: 'code 代码', value: 'code'},
  {label: 'naming 命名', value: 'naming'},
  {label: 'api 接口', value: 'api'},
  {label: 'db 数据库', value: 'db'},
  {label: 'security 安全', value: 'security'},
  {label: 'testing 测试', value: 'testing'},
  {label: 'git Git', value: 'git'},
  {label: 'prompting 提示词', value: 'prompting'}
] as const;

export const LEVEL_OPTIONS = [
  {label: 'must 必须', value: 'must'},
  {label: 'should 建议', value: 'should'},
  {label: 'optional 可选', value: 'optional'}
] as const;

/***********前端框架选项开始************/
export const FRONTEND_FRAMEWORK_OPTIONS = [
  {label: 'Next.js', value: 'nextjs'},
  {label: 'React（非 Next）', value: 'react'},
  {label: 'Vue 2', value: 'vue2'},
  {label: 'Vue 3', value: 'vue3'},
  {label: 'Nuxt', value: 'nuxt'},
  {label: 'Angular', value: 'angular'},
  {label: 'UniApp', value: 'uniapp'},
  {label: 'Taro', value: 'taro'},
  {label: '小程序原生', value: 'miniprogram-native'},
  {label: '其它', value: 'other'}
] as const;
/***********前端框架选项结束************/

/***********后端框架选项开始************/
export const BACKEND_FRAMEWORK_OPTIONS = [
  {label: 'SpringBoot', value: 'springboot'},
  {label: 'SpringCloud', value: 'springcloud'},
  {label: 'Node.js + NestJS', value: 'nestjs'},
  {label: 'Node.js + Express', value: 'express'},
  {label: 'Node.js + Koa', value: 'koa'},
  {label: 'Django', value: 'django'},
  {label: 'FastAPI', value: 'fastapi'},
  {label: 'Flask', value: 'flask'},
  {label: 'Go Gin', value: 'gin'},
  {label: '.NET', value: 'dotnet'},
  {label: 'PHP Laravel', value: 'laravel'},
  {label: 'PHP ThinkPHP', value: 'thinkphp'},
  {label: '无后端/纯前端', value: 'none'},
  {label: '其它', value: 'other'}
] as const;
/***********后端框架选项结束************/

/***********语言选项开始************/
export const LANGUAGE_OPTIONS = [
  {label: 'TypeScript', value: 'ts'},
  {label: 'JavaScript', value: 'js'},
  {label: 'Java', value: 'java'},
  {label: 'Python', value: 'py'},
  {label: 'Go', value: 'go'},
  {label: 'PHP', value: 'php'},
  {label: 'C#', value: 'csharp'},
  {label: 'SQL', value: 'sql'},
  {label: '其它', value: 'other'}
] as const;
/***********语言选项结束************/

/***********DB 类型选项开始************/
export const DB_TYPE_OPTIONS = [
  {label: 'MySQL', value: 'mysql'},
  {label: 'PostgreSQL', value: 'postgres'},
  {label: 'SQLite', value: 'sqlite'},
  {label: 'MongoDB', value: 'mongodb'},
  {label: '其它', value: 'other'}
] as const;
/***********DB 类型选项结束************/

/***********接口风格选项开始************/
export const API_STYLE_OPTIONS = [
  {label: 'REST', value: 'rest'},
  {label: 'GraphQL', value: 'graphql'},
  {label: 'RPC', value: 'rpc'},
  {label: '其它', value: 'other'}
] as const;
/***********接口风格选项结束************/

/***********触发场景选项开始************/
export const ONLY_WHEN_OPTIONS = [
  {label: 'new_feature 新增功能', value: 'new_feature'},
  {label: 'bugfix 修复问题', value: 'bugfix'},
  {label: 'create_table 建表', value: 'create_table'},
  {label: 'alter_table 改表', value: 'alter_table'},
  {label: 'new_api 新增接口', value: 'new_api'},
  {label: 'refactor 重构', value: 'refactor'},
  {label: 'doc 文档变更', value: 'doc'},
  {label: 'export 导出/备份', value: 'export'},
  {label: 'security_change 安全相关变更', value: 'security_change'}
] as const;
/***********触发场景选项结束************/
/***********规范常量定义结束************/

/***********API 规范选项开始************/
export const API_AUTH_OPTIONS = [
  {label: 'None 无鉴权', value: 'none'},
  {label: 'Bearer Token（Authorization: Bearer ...）', value: 'bearer'},
  {label: 'Cookie Session', value: 'cookie'},
  {label: 'API Key', value: 'apikey'},
  {label: 'OAuth2/OIDC', value: 'oauth2'},
  {label: '其它', value: 'other'}
] as const;

export const API_ERROR_STYLE_OPTIONS = [
  {label: '统一错误码 + msg（code/msg/data）', value: 'code_msg_data'},
  {label: 'HTTP 状态码为主 + 标准错误体', value: 'http_status_with_body'},
  {label: '业务 code 为主（总是 200）', value: 'always_200_business_code'},
  {label: '其它', value: 'other'}
] as const;

export const API_PAGINATION_OPTIONS = [
  {label: '不分页', value: 'none'},
  {label: 'page/pageSize + total + list（推荐）', value: 'page_pagesize'},
  {label: 'offset/limit + total + list', value: 'offset_limit'},
  {label: 'cursor 游标分页', value: 'cursor'}
] as const;

export const API_IDEMPOTENCY_OPTIONS = [
  {label: '不要求', value: 'none'},
  {label: 'Idempotency-Key 请求头', value: 'idempotency_key_header'},
  {label: '请求唯一号 requestId', value: 'request_id'},
  {label: '业务幂等（基于业务唯一键）', value: 'business_unique_key'}
] as const;

export const API_RESPONSE_ENVELOPE_OPTIONS = [
  {label: '统一包裹：{ code, msg, data }', value: 'envelope_code_msg_data'},
  {label: '列表：{ code, msg, data: { list, total, page, pageSize } }', value: 'envelope_list'},
  {label: '不包裹：直接返回资源对象', value: 'raw_resource'},
  {label: '其它', value: 'other'}
] as const;
/***********API 规范选项结束************/

/***********DB 规范选项开始************/
export const DB_NAMING_STYLE_OPTIONS = [
  {label: 'snake_case（推荐）', value: 'snake_case'},
  {label: 'camelCase', value: 'camelCase'},
  {label: '其它', value: 'other'}
] as const;

export const DB_TIME_FIELDS_POLICY_OPTIONS = [
  {label: '必须：create_time/update_time/create_by/update_by（默认）', value: 'must_4_fields'},
  {label: '中间表可放宽（isJunctionTable）', value: 'junction_relax'},
  {label: '其它', value: 'other'}
] as const;

export const DB_SOFT_DELETE_OPTIONS = [
  {label: '不使用软删除', value: 'none'},
  {label: 'is_deleted（0/1）', value: 'is_deleted'},
  {label: 'deleted_at 时间戳', value: 'deleted_at'}
] as const;

export const DB_INDEX_POLICY_OPTIONS = [
  {label: '按查询条件建立索引（必填说明）', value: 'by_query'},
  {label: '唯一索引优先（业务唯一键）', value: 'unique_first'},
  {label: '全文检索/搜索字段说明', value: 'search_fields'}
] as const;

export const DB_SHARDING_OPTIONS = [
  {label: '不分表', value: 'none'},
  {label: '按时间分表', value: 'by_time'},
  {label: '按租户/客户分表', value: 'by_tenant'},
  {label: '按哈希分表', value: 'by_hash'},
  {label: '其它', value: 'other'}
] as const;
/***********DB 规范选项结束************/

/***********安全规范选项开始************/
export const SECURITY_TOKEN_STORAGE_OPTIONS = [
  {label: 'HttpOnly Cookie（推荐）', value: 'httpOnly_cookie'},
  {label: 'localStorage（不安全，v1 可接受需标注风险）', value: 'localStorage'},
  {label: 'sessionStorage', value: 'sessionStorage'},
  {label: '内存（刷新即丢）', value: 'memory'},
  {label: '其它', value: 'other'}
] as const;

export const SECURITY_SECRET_POLICY_OPTIONS = [
  {label: '禁止提交密钥到仓库（必须）', value: 'never_commit_secrets'},
  {label: '使用 .env + 示例 .env.example', value: 'env_files'},
  {label: '使用密钥管理服务（KMS）', value: 'kms'},
  {label: '其它', value: 'other'}
] as const;

export const SECURITY_PERMISSION_MODEL_OPTIONS = [
  {label: '无权限模型（单人/内部工具）', value: 'none'},
  {label: 'RBAC（角色权限）', value: 'rbac'},
  {label: 'ABAC（属性权限）', value: 'abac'},
  {label: 'ACL（资源访问控制）', value: 'acl'},
  {label: '其它', value: 'other'}
] as const;

export const SECURITY_SENSITIVE_MASKING_OPTIONS = [
  {label: '不涉及脱敏', value: 'none'},
  {label: '日志脱敏（token/手机号/身份证）', value: 'log_masking'},
  {label: '接口返回脱敏', value: 'response_masking'},
  {label: '前端展示脱敏', value: 'ui_masking'}
] as const;
/***********安全规范选项结束************/