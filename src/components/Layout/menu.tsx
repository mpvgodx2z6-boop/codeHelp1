import {
    DashboardOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    BulbOutlined,
    ProfileOutlined,
    BuildOutlined,
    ExportOutlined,
    FolderOpenOutlined
} from '@ant-design/icons';
import React from 'react';

const getNavList = (_t: any) => {
    return [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: '概览',
            children: [{ key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' }]
        },
        {
            key: '/projects',
            icon: <FolderOpenOutlined />,
            label: '项目管理'
        },
        { key: '/standards', icon: <FileTextOutlined />, label: '规范中心' },
        { key: '/modules', icon: <AppstoreOutlined />, label: '模块管理' },
        { key: '/changes', icon: <HistoryOutlined />, label: '变更记录' },
        { key: '/tests', icon: <CheckCircleOutlined />, label: '人工测试' },
        { key: '/prompts', icon: <BulbOutlined />, label: '提示词库' },
        { key: '/templates', icon: <ProfileOutlined />, label: '模板管理' },
        { key: '/builder', icon: <BuildOutlined />, label: '生成器（8块输出）' },
        { key: '/export', icon: <ExportOutlined />, label: '导出/备份' }
    ];
};

export default getNavList;
