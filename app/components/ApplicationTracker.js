'use client';

import { useState, useMemo } from 'react';

export default function ApplicationTracker({ applications, onApplicationsChange }) {
  const [filter, setFilter] = useState('all'); // all, applied, pending
  const [searchTerm, setSearchTerm] = useState('');
  const [hrReplyFilter, setHrReplyFilter] = useState('all'); // all, replied, not_replied
  const [countFilter, setCountFilter] = useState('all'); // all, 0, 1, 2+

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Apply status filter
    switch (filter) {
      case 'applied':
        filtered = filtered.filter(app => app.isApplied);
        break;
      case 'pending':
        filtered = filtered.filter(app => !app.isApplied);
        break;
      default:
        // all - no status filtering
        break;
    }

    // Apply HR reply filter
    switch (hrReplyFilter) {
      case 'replied':
        filtered = filtered.filter(app => app.hrReplied);
        break;
      case 'not_replied':
        filtered = filtered.filter(app => !app.hrReplied);
        break;
      default:
        // all - no HR reply filtering
        break;
    }

    // Apply count filter
    switch (countFilter) {
      case '0':
        filtered = filtered.filter(app => (app.applicationCount || 0) === 0);
        break;
      case '1':
        filtered = filtered.filter(app => (app.applicationCount || 0) === 1);
        break;
      case '2+':
        filtered = filtered.filter(app => (app.applicationCount || 0) >= 2);
        break;
      default:
        // all - no count filtering
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.name && app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.hrReplyNotes && app.hrReplyNotes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [applications, filter, hrReplyFilter, countFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter(app => app.isApplied).length;
    const pending = total - applied;
    const hrReplied = applications.filter(app => app.hrReplied).length;
    
    return { total, applied, pending, hrReplied };
  }, [applications]);

  const recentApplications = useMemo(() => {
    return applications
      .filter(app => app.isApplied)
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 5);
  }, [applications]);

  const applicationsByDate = useMemo(() => {
    const grouped = {};
    applications
      .filter(app => app.isApplied)
      .forEach(app => {
        const date = new Date(app.appliedDate).toDateString();
        grouped[date] = (grouped[date] || 0) + 1;
      });
    return grouped;
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applied</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.applied}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">💬</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">HR Replied</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.hrReplied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Applications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Application History</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('applied')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'applied'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Applied ({stats.applied})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending ({stats.pending})
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email, name, or notes..."
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* HR Reply Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR Reply</label>
              <select
                value={hrReplyFilter}
                onChange={(e) => setHrReplyFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({applications.length})</option>
                <option value="replied">Replied ({applications.filter(app => app.hrReplied).length})</option>
                <option value="not_replied">Not Replied ({applications.filter(app => !app.hrReplied).length})</option>
              </select>
            </div>

            {/* Count Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Count</label>
              <select
                value={countFilter}
                onChange={(e) => setCountFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Counts</option>
                <option value="0">Never Applied ({applications.filter(app => (app.applicationCount || 0) === 0).length})</option>
                <option value="1">Applied Once ({applications.filter(app => (app.applicationCount || 0) === 1).length})</option>
                <option value="2+">Applied 2+ Times ({applications.filter(app => (app.applicationCount || 0) >= 2).length})</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setHrReplyFilter('all');
                  setCountFilter('all');
                  setFilter('all');
                }}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                Showing {filteredApplications.length} of {applications.length} applications
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HR Replied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HR Reply Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.name || 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      app.isApplied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.isApplied ? 'Applied' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (app.applicationCount || 0) === 0 
                        ? 'bg-gray-100 text-gray-800'
                        : (app.applicationCount || 0) === 1
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {app.applicationCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      app.hrReplied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {app.hrReplied ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={app.hrReplyNotes || 'No notes'}>
                      {app.hrReplyNotes || 'No notes'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No applications found for the selected filter.
          </div>
        )}
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{app.email}</p>
                  <p className="text-xs text-gray-500">{app.name || 'No name set'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{new Date(app.appliedDate).toLocaleDateString()}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Applied
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications by Date */}
      {Object.keys(applicationsByDate).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Applications by Date</h3>
          <div className="space-y-2">
            {Object.entries(applicationsByDate)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 7)
              .map(([date, count]) => (
                <div key={date} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">{date}</span>
                  <span className="text-sm font-medium text-gray-900">{count} applications</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

