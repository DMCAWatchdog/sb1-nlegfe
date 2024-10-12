import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery('dashboardStats', async () => {
    const response = await axios.get('/api/dashboard-stats');
    return response.data;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Notices Sent"
          value={stats.totalNotices}
          icon={<CheckCircle className="text-green-500" size={24} />}
        />
        <DashboardCard
          title="Pending Notices"
          value={stats.pendingNotices}
          icon={<AlertCircle className="text-yellow-500" size={24} />}
        />
        <DashboardCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<CheckCircle className="text-blue-500" size={24} />}
        />
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {icon}
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default Dashboard;