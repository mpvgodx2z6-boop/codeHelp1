'use client';

import React, {useMemo} from 'react';
import {Button, Card, Checkbox, Drawer, Form, Input, Select, Space, Typography} from 'antd';
import type {FormInstance} from 'antd';
import {
  SCOPE_OPTIONS,
  LEVEL_OPTIONS,
  FRONTEND_FRAMEWORK_OPTIONS,
  BACKEND_FRAMEWORK_OPTIONS,
  LANGUAGE_OPTIONS,
  DB_TYPE_OPTIONS,
  API_STYLE_OPTIONS,
  ONLY_WHEN_OPTIONS,
  API_AUTH_OPTIONS,
  API_ERROR_STYLE_OPTIONS,
  API_PAGINATION_OPTIONS,
  API_IDEMPOTENCY_OPTIONS,
  API_RESPONSE_ENVELOPE_OPTIONS,
  DB_NAMING_STYLE_OPTIONS,
  DB_TIME_FIELDS_POLICY_OPTIONS,
  DB_SOFT_DELETE_OPTIONS,
  DB_INDEX_POLICY_OPTIONS,
  DB_SHARDING_OPTIONS,
  SECURITY_TOKEN_STORAGE_OPTIONS,
  SECURITY_SECRET_POLICY_OPTIONS,
  SECURITY_PERMISSION_MODEL_OPTIONS,
  SECURITY_SENSITIVE_MASKING_OPTIONS
} from './standards.constants';
import type {StandardsFormValues} from './standards.form';

/***********规范编辑抽屉开始************/
export default function StandardsEditorDrawer(props: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  form: FormInstance;
  editing: boolean;

  saveToGlobal: boolean;
  setSaveToGlobal: (v: boolean) => void;
  canChooseProject: boolean;
  sourceText: string;
}) {
  const {open, onClose, onSubmit, form, editing, saveToGlobal, setSaveToGlobal, canChooseProject, sourceText} = props;

  const scopeValue = Form.useWatch('scope', form) as StandardsFormValues['scope'];
  const currentScope = useMemo(() => scopeValue ?? 'code', [scopeValue]);

  const isCode = currentScope === 'code';
  const isApi = currentScope === 'api';
  const isDb = currentScope === 'db';
  const isSecurity = currentScope === 'security';

  return (
    <Drawer
      title={editing ? '编辑规范' : '新建规范'}
      width={900}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={onSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      {!editing ? (
        <Card size="small" style={{marginBottom: 12}}>
          <Checkbox checked={saveToGlobal} disabled={!canChooseProject} onChange={(e) => setSaveToGlobal(e.target.checked)}>
            保存到公共库（global）
          </Checkbox>
          {!canChooseProject ? (
            <Typography.Paragraph type="secondary" style={{margin: '8px 0 0'}}>
              当前未选择项目：只能保存到公共库（global）。
            </Typography.Paragraph>
          ) : null}
        </Card>
      ) : (
        <Card size="small" style={{marginBottom: 12}}>
          <Typography.Text type="secondary">{sourceText}</Typography.Text>
        </Card>
      )}

      <Form layout="vertical" form={form}>
        <Form.Item label="标题" name="title" rules={[{required: true, message: '请输入标题'}]}>
          <Input />
        </Form.Item>

        <Space style={{width: '100%'}} size={12} wrap>
          <Form.Item label="类型（scope）" name="scope" style={{width: 260}}>
            <Select
              options={[...SCOPE_OPTIONS]}
              onChange={(v) => {
                // 切换类型时清理 code 的 appliesTo（其它类型先不存 appliesTo）
                if (v !== 'code') {
                  form.setFieldsValue({
                    applies_frontendFrameworks: [],
                    applies_backendFrameworks: [],
                    applies_languages: [],
                    applies_dbTypes: [],
                    applies_apiStyles: [],
                    applies_onlyWhen: []
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item label="强制级别（level）" name="level" style={{width: 260}}>
            <Select options={[...LEVEL_OPTIONS]} />
          </Form.Item>
        </Space>

        {isCode ? (
          <Card size="small" title="代码规范适用条件（仅 code 类型需要）" style={{marginBottom: 12}}>
            <Form.Item label="前端框架 frontendFrameworks（可多选）" name="applies_frontendFrameworks">
              <Select mode="multiple" allowClear options={[...FRONTEND_FRAMEWORK_OPTIONS]} />
            </Form.Item>

            <Form.Item label="后端框架 backendFrameworks（可多选）" name="applies_backendFrameworks">
              <Select mode="multiple" allowClear options={[...BACKEND_FRAMEWORK_OPTIONS]} />
            </Form.Item>

            <Form.Item label="语言 languages（可多选）" name="applies_languages">
              <Select mode="multiple" allowClear options={[...LANGUAGE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="DB 类型 dbTypes（可多选）" name="applies_dbTypes">
              <Select mode="multiple" allowClear options={[...DB_TYPE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="接口风格 apiStyles（可多选）" name="applies_apiStyles">
              <Select mode="multiple" allowClear options={[...API_STYLE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="触发场景 onlyWhen（可多选，可空）" name="applies_onlyWhen">
              <Select mode="multiple" allowClear options={[...ONLY_WHEN_OPTIONS]} />
            </Form.Item>
          </Card>
        ) : null}

        {isApi ? (
          <Card size="small" title="接口规范（api）" style={{marginBottom: 12}}>
            <Form.Item label="鉴权方式" name="api_auth">
              <Select options={[...API_AUTH_OPTIONS]} />
            </Form.Item>

            <Form.Item label="错误码/错误体风格" name="api_errorStyle">
              <Select options={[...API_ERROR_STYLE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="分页规范" name="api_pagination">
              <Select options={[...API_PAGINATION_OPTIONS]} />
            </Form.Item>

            <Form.Item label="幂等规范" name="api_idempotency">
              <Select options={[...API_IDEMPOTENCY_OPTIONS]} />
            </Form.Item>

            <Form.Item label="返回结构（Response Envelope）" name="api_responseEnvelope">
              <Select options={[...API_RESPONSE_ENVELOPE_OPTIONS]} />
            </Form.Item>
          </Card>
        ) : null}

        {isDb ? (
          <Card size="small" title="数据库规范（db）" style={{marginBottom: 12}}>
            <Form.Item label="字段/表命名风格" name="db_namingStyle">
              <Select options={[...DB_NAMING_STYLE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="时间/审计字段策略" name="db_timeFieldsPolicy">
              <Select options={[...DB_TIME_FIELDS_POLICY_OPTIONS]} />
            </Form.Item>

            <Form.Item label="软删除方案" name="db_softDelete">
              <Select options={[...DB_SOFT_DELETE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="索引策略" name="db_indexPolicy">
              <Select options={[...DB_INDEX_POLICY_OPTIONS]} />
            </Form.Item>

            <Form.Item label="分表策略" name="db_sharding">
              <Select options={[...DB_SHARDING_OPTIONS]} />
            </Form.Item>
          </Card>
        ) : null}

        {isSecurity ? (
          <Card size="small" title="安全规范（security）" style={{marginBottom: 12}}>
            <Form.Item label="Token 存储策略" name="sec_tokenStorage">
              <Select options={[...SECURITY_TOKEN_STORAGE_OPTIONS]} />
            </Form.Item>

            <Form.Item label="密钥管理策略" name="sec_secretPolicy">
              <Select options={[...SECURITY_SECRET_POLICY_OPTIONS]} />
            </Form.Item>

            <Form.Item label="权限模型" name="sec_permissionModel">
              <Select options={[...SECURITY_PERMISSION_MODEL_OPTIONS]} />
            </Form.Item>

            <Form.Item label="敏感信息脱敏策略" name="sec_sensitiveMasking">
              <Select options={[...SECURITY_SENSITIVE_MASKING_OPTIONS]} />
            </Form.Item>
          </Card>
        ) : null}

        <Form.Item label="Checklist（每行一条；Builder 可直接输出）" name="checklistItems">
          <Input.TextArea rows={6} />
        </Form.Item>

        <Form.Item label="正文（可多行，导出时会自动按 500 行拆分）" name="content">
          <Input.TextArea rows={14} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
/***********规范编辑抽屉结束************/