'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

/***********首页跳转功能开始************/
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = document.cookie.includes('auth_token=');
    router.replace(hasToken ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
/***********首页跳转功能结束************/