'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Card, Checkbox, Select, Space, Typography} from 'antd';
import {db} from '@/db';
import type {ProjectRecord} from '@/db/schema';

/***********项目范围选择条开始************/
export type ProjectScope = {
  projectId: string;
  includeGlobal: boolean;
};

export default function ProjectScopeBar(props: {
  value: ProjectScope;
  onChange: (v: ProjectScope) => void;
  allowGlobalToggle?: boolean;
}) {
  const {value, onChange, allowGlobalToggle = true} = props;
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await db.projects.orderBy('updatedAt').reverse().toArray();
      setProjects(rows);
    })();
  }, []);

  const options = useMemo(
    () =>
      projects
        .filter((p) => p.id !== 'global')
        .map((p) => ({label: `${p.name}（${p.status}）`, value: p.id})),
    [projects]
  );

  return (
    <Card size="small" style={{marginBottom: 12}}>
      <Space wrap align="center">
        <Typography.Text strong>项目：</Typography.Text>

        <Select
          style={{width: 320}}
          placeholder="请选择项目"
          value={value.projectId}
          options={options}
          onChange={(pid) => onChange({projectId: pid, includeGlobal: value.includeGlobal})}
        />

        {allowGlobalToggle ? (
          <Checkbox
            checked={value.includeGlobal}
            onChange={(e) => onChange({projectId: value.projectId, includeGlobal: e.target.checked})}
          >
            同时包含公共库（global）
          </Checkbox>
        ) : null}
      </Space>
    </Card>
  );
}
/***********项目范围选择条结束************/