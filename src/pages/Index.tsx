import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

const Index = () => {
  const location = useLocation();

  const getTitle = (pathname: string) => {
    switch (pathname) {
      case '/nursing-homes':
        return 'Nursing Homes';
      case '/residents':
        return 'Residents';
      case '/finances':
        return 'Financial Tracking';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/':
      default:
        return 'Dashboard';
    }
  };

  const title = getTitle(location.pathname);

  return (
    <DashboardLayout title={title}>
      <Outlet />
    </DashboardLayout>
  );
};

export default Index;
