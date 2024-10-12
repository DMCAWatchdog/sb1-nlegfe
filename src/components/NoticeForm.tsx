import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { Send, Upload, Calendar } from 'lucide-react';

const NoticeForm: React.FC = () => {
  const [selectedViolation, setSelectedViolation] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [backdatedDate, setBackdatedDate] = useState<string>('');

  const { data: violations, isLoading, error } = useQuery('violations', async () => {
    const response = await axios.get('/api/violations');
    return response.data;
  });

  const createNoticeMutation = useMutation((data: { violationId: number, backdatedDate?: string }) =>
    axios.post('/api/create-notice', data)
  );

  const importViolationsMutation = useMutation((formData: FormData) =>
    axios.post('/api/import-violations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedViolation) {
      createNoticeMutation.mutate({ 
        violationId: selectedViolation, 
        backdatedDate: backdatedDate || undefined 
      });
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (importFile) {
      const formData = new FormData();
      formData.append('file', importFile);
      importViolationsMutation.mutate(formData);
    }
  };

  if (isLoading) return <div>Loading violations...</div>;
  if (error) return <div>Error loading violations</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create DMCA Takedown Notice</h1>
      
      <form onSubmit={handleImport} className="mb-8">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="flex-grow"
            accept=".csv"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            disabled={!importFile || importViolationsMutation.isLoading}
          >
            <Upload size={18} className="mr-2" />
            {importViolationsMutation.isLoading ? 'Importing...' : 'Import Violations'}
          </button>
        </div>
      </form>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="violation" className="block mb-1 font-medium">Select Violation</label>
          <select
            id="violation"
            value={selectedViolation || ''}
            onChange={(e) => setSelectedViolation(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select a violation</option>
            {violations.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.url} - {v.criteria} ({v.date_detected})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="backdatedDate" className="block mb-1 font-medium">Backdate Notice (Optional)</label>
          <div className="flex items-center">
            <Calendar size={18} className="mr-2" />
            <input
              type="date"
              id="backdatedDate"
              value={backdatedDate}
              onChange={(e) => setBackdatedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          disabled={!selectedViolation || createNoticeMutation.isLoading}
        >
          <Send size={18} className="mr-2" />
          {createNoticeMutation.isLoading ? 'Sending...' : 'Send Notice'}
        </button>
      </form>
      {createNoticeMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          Notice sent successfully!
        </div>
      )}
      {createNoticeMutation.isError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error sending notice. Please try again.
        </div>
      )}
    </div>
  );
};

export default NoticeForm;