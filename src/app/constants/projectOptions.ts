/***********公共下拉选项开始************/

/***********通用项目选项开始************/
export const PROJECT_STATUS_OPTIONS = [
  {label: 'active', value: 'active'},
  {label: 'paused', value: 'paused'},
  {label: 'done', value: 'done'}
] as const;

export const PROJECT_CATEGORY_OPTIONS = [
  {label: '管理后台', value: 'admin'},
  {label: '小程序', value: 'mini_program'},
  {label: '官网', value: 'website'},
  {label: 'H5', value: 'h5'},
  {label: 'CRM', value: 'crm'},
  {label: 'ERP', value: 'erp'},
  {label: '电商', value: 'ecommerce'},
  {label: '内容系统', value: 'cms'},
  {label: '内部工具', value: 'internal_tool'},
  {label: '其它', value: 'other'}
] as const;
/***********通用项目选项结束************/

/***********标准宽度（避免太窄）开始************/
export const UI_WIDTH = {
  selectSm: 200,
  selectMd: 260,
  selectLg: 360,
  selectXl: 420
} as const;
/***********标准宽度（避免太窄）结束************/

/***********架构选项（与规范中心一致）开始************/
// 这些直接复用你 standards.constants.ts 里的选项，以免两份不一致
export {
  FRONTEND_FRAMEWORK_OPTIONS,
  BACKEND_FRAMEWORK_OPTIONS,
  LANGUAGE_OPTIONS,
  DB_TYPE_OPTIONS,
  API_STYLE_OPTIONS
} from '@/app/[locale]/standards/standards.constants';
/***********架构选项（与规范中心一致）结束************/

/***********规范 scope 扩展：新增 ui 组件规范开始************/
export const STANDARD_SCOPE_OPTIONS = [
  {label: 'general 通用', value: 'general'},
  {label: 'code 代码', value: 'code'},
  {label: 'ui 组件规范', value: 'ui'},
  {label: 'naming 命名', value: 'naming'},
  {label: 'api 接口', value: 'api'},
  {label: 'db 数据库', value: 'db'},
  {label: 'security 安全', value: 'security'},
  {label: 'testing 测试', value: 'testing'},
  {label: 'git Git', value: 'git'},
  {label: 'prompting 提示词', value: 'prompting'}
] as const;
/***********规范 scope 扩展：新增 ui 组件规范结束************/

/***********组件规范二级选项开始************/
export const UI_FORM_STYLE_OPTIONS = [
  {label: 'Ant Design Form（推荐）', value: 'antd_form'},
  {label: '原生表单', value: 'native'},
  {label: '其它', value: 'other'}
] as const;

export const UI_SELECT_STYLE_OPTIONS = [
  {label: '所有枚举字段必须用 Select 下拉', value: 'enum_as_select'},
  {label: '多选用 Select mode=multiple', value: 'multi_select'},
  {label: '必须提供 placeholder', value: 'placeholder_required'},
  {label: '宽度不得过窄（>= 260）', value: 'min_width_260'},
  {label: '表单控件宽度统一（selectMd/selectLg）', value: 'use_ui_width_constants'}
] as const;

export const UI_TABLE_STYLE_OPTIONS = [
  {label: 'Table 列宽合理，重要列不省略', value: 'table_width_reasonable'},
  {label: '长文本用 ellipsis + 可查看详情', value: 'ellipsis_with_view'},
  {label: '操作列固定宽度', value: 'actions_fixed_width'}
] as const;
/***********组件规范二级选项结束************/

/***********公共下拉选项结束************/