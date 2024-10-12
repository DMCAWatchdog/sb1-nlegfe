import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FileText } from 'lucide-react';

const CaseList: React.FC = () => {
  const { data: cases, isLoading, error } = useQuery('cases', async () => {
    const response = await axios.get('/api/cases');
    return response.data;
  });

  if (isLoading) return <div>Loading cases...</div>;
  if (error) return <div>Error loading cases</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Case List</h1>
      {cases.length === 0 ? (
        <p>No cases found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Case Number</th>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">Date Sent</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem: any) => (
                <tr key={caseItem.id} className="border-t">
                  <td className="px-4 py-2">{caseItem.case_number}</td>
                  <td className="px-4 py-2">{caseItem.url}</td>
                  <td className="px-4 py-2">{new Date(caseItem.date_sent).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{caseItem.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => window.open(`/api/case-pdf/${caseItem.case_number}`, '_blank')}
                      className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 flex items-center"
                    >
                      <FileText size={16} className="mr-1" />
                      View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CaseList;