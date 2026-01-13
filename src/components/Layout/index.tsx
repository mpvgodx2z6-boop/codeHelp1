'use client';

import React, {useEffect, useState} from 'react';
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  ConfigProvider,
  type MenuProps
} from 'antd';
import getNavList from './menu';
import {useRouter} from 'next/navigation';
import {MoonOutlined, SunOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {getThemeBg} from '@/utils';
import styles from './index.module.less';

const {Header, Content, Footer, Sider} = Layout;

interface IProps {
  children: React.ReactNode;
  curActive: string;
  defaultOpen?: string[];
}

/***********退出登录功能开始************/
const onLogout = () => {
  localStorage.removeItem('isDarkTheme');
  // 这里保留原项目的登录路径（你后续要改成 /login 再统一调整）
  window.location.href = '/zh/user/login';
};
/***********退出登录功能结束************/

/***********用户下拉菜单功能开始************/
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人中心',
    disabled: true
  },
  {
    type: 'divider'
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
    onClick: onLogout
  }
];
/***********用户下拉菜单功能结束************/

/***********通用布局功能开始************/
const CommonLayout: React.FC<IProps> = ({children, curActive, defaultOpen = ['/']}) => {
  const {
    token: {borderRadiusLG, colorTextBase, colorWarningText}
  } = theme.useToken();

  const router = useRouter();
  const navList = getNavList(null);

  const [curTheme, setCurTheme] = useState<boolean>(false);

  const toggleTheme = () => {
    const _curTheme = !curTheme;
    setCurTheme(_curTheme);
    localStorage.setItem('isDarkTheme', _curTheme ? 'true' : '');
  };

  /***********菜单点击跳转功能开始************/
  const handleSelect = (row: {key: string}) => {
    if (row.key.includes('http')) {
      window.open(row.key);
      return;
    }
    router.push(row.key);
  };
  /***********菜单点击跳转功能结束************/

  useEffect(() => {
    const isDark = !!localStorage.getItem('isDarkTheme');
    setCurTheme(isDark);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: curTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      <Layout style={{minHeight: '100vh'}}>
        <Sider
          theme={curTheme ? 'dark' : 'light'}
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={() => {}}
          onCollapse={() => {}}
        >
          <span className={styles.logo} style={getThemeBg(curTheme)}>
            Prompt-Tool
          </span>

          <Menu
            theme={curTheme ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={[curActive]}
            items={navList}
            defaultOpenKeys={defaultOpen}
            onSelect={handleSelect}
          />
        </Sider>

        <Layout>
          <Header style={{padding: 0, ...getThemeBg(curTheme), display: 'flex'}}>
            <div className={styles.rightControl}>
              <span onClick={toggleTheme} className={styles.theme} title="切换主题">
                {!curTheme ? (
                  <SunOutlined style={{color: colorWarningText}} />
                ) : (
                  <MoonOutlined style={{color: colorTextBase}} />
                )}
              </span>

              <div className={styles.avatar}>
                <Dropdown menu={{items: userMenuItems}} placement="bottomLeft" arrow>
                  <Avatar style={{color: '#fff', backgroundColor: colorTextBase}}>Admin</Avatar>
                </Dropdown>
              </div>
            </div>
          </Header>

          <Content style={{margin: '24px 16px 0'}}>
            <div
              style={{
                padding: 24,
                minHeight: 520,
                ...getThemeBg(curTheme),
                borderRadius: borderRadiusLG
              }}
            >
              {children}
            </div>
          </Content>

          <Footer style={{textAlign: 'center'}}>
            Prompt-Tool ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default CommonLayout;
/***********通用布局功能结束************/