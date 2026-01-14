'use client';

import React from 'react';
import {Button, Card, Form, Input, Space} from 'antd';

/***********项目联系人表单开始************/
export default function ProjectContactsForm() {
  return (
    <Card size="small" title="项目联系人">
      <Form.List name="contacts">
        {(fields, {add, remove}) => (
          <div>
            <Button
              onClick={() =>
                add({name: '', role: '', phone: '', wechat: '', email: '', notes: ''})
              }
            >
              新增联系人
            </Button>

            <div style={{marginTop: 12}}>
              {fields.map((field) => (
                <Card key={field.key} size="small" style={{marginBottom: 12}}>
                  <Space direction="vertical" style={{width: '100%'}}>
                    <Space style={{width: '100%'}} wrap>
                      <Form.Item
                        label="姓名"
                        name={[field.name, 'name']}
                        rules={[{required: true, message: '请输入姓名'}]}
                        style={{flex: 1}}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item label="角色" name={[field.name, 'role']} style={{flex: 1}}>
                        <Input placeholder="客户/产品/技术/财务..." />
                      </Form.Item>
                    </Space>

                    <Space style={{width: '100%'}} wrap>
                      <Form.Item label="电话" name={[field.name, 'phone']} style={{flex: 1}}>
                        <Input />
                      </Form.Item>

                      <Form.Item label="微信" name={[field.name, 'wechat']} style={{flex: 1}}>
                        <Input />
                      </Form.Item>

                      <Form.Item label="邮箱" name={[field.name, 'email']} style={{flex: 1}}>
                        <Input />
                      </Form.Item>
                    </Space>

                    <Form.Item label="备注" name={[field.name, 'notes']}>
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Button danger onClick={() => remove(field.name)}>
                      删除联系人
                    </Button>
                  </Space>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Form.List>
    </Card>
  );
}
/***********项目联系人表单结束************/