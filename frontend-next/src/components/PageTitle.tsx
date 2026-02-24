"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  const pathname = usePathname();

  useEffect(() => {
    document.title = title;
  }, [pathname, title]);

  return null; // This component doesn't render anything
};

export default PageTitle;
