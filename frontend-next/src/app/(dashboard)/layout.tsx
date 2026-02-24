import type { ReactNode } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute>
      <DefaultLayout>{children}</DefaultLayout>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
