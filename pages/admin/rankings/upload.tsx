import { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { withAuth, useLogout } from '@/utils/withAuth';

function AdminRankingUpload() {
  const router = useRouter();
  const logout = useLogout();
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.name.toLowerCase();
      
      if (!fileType.endsWith('.pdf') && !fileType.endsWith('.xlsx')) {
        setError('Please select a PDF or XLSX file');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !date) {
      setError('Please select both a file and date');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setPreviewData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);

    try {
      const response = await fetch('/api/rankings/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Successfully uploaded! Total participants: ${result.data.totalParticipants}`);
        setPreviewData(result.data);
        setFile(null);
        setDate('');
        
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Admin - Upload Rankings">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Upload Attendance Data
              </h1>
              <p className="text-slate-600">
                Upload Google Meet attendance files to generate rankings
              </p>
            </div>
          </div>

          {/* Upload Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (PDF or XLSX)
                </label>
                <div className="relative">
                  <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,.xlsx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    required
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file || !date}
                className="w-full bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload & Process'
                )}
              </button>
            </form>
          </div>

          {/* Preview Rankings */}
          {previewData && previewData.rankings && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Top 20 Preview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.rankings.map((ranking: any) => (
                      <tr key={ranking.rank} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{ranking.rank}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {ranking.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ranking.totalDurationFormatted}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ranking.sessionCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => router.push('/admin/rankings')}
                  className="flex-1 bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                >
                  View Full Rankings →
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin/rankings')}
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              ← Back to Rankings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminRankingUpload);
