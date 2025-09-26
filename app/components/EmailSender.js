'use client';

import { useState, useMemo } from 'react';
import { generatePreviewTemplate } from '../../lib/emailTemplate';

export default function EmailSender({ applications, onApplicationsChange }) {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [cvPath, setCvPath] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [previewEmail, setPreviewEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, applied, pending
  const [countFilter, setCountFilter] = useState('all'); // all, 0, 1, 2+
  const [excludeHrReplied, setExcludeHrReplied] = useState(true); // Filter out HR replied emails
  const [nameFilter, setNameFilter] = useState('all'); // all, has_name, no_name
  const [batchSize, setBatchSize] = useState(5); // Number of emails to send per batch
  const [delayBetweenBatches, setDelayBetweenBatches] = useState(30); // Delay in seconds between batches
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, batch: 0, totalBatches: 0 });

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Apply HR replied filter (exclude HR replied emails by default)
    if (excludeHrReplied) {
      filtered = filtered.filter(app => !app.hrReplied);
    }

    // Apply status filter
    if (statusFilter === 'applied') {
      filtered = filtered.filter(app => app.isApplied);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(app => !app.isApplied);
    }

    // Apply count filter
    if (countFilter === '0') {
      filtered = filtered.filter(app => (app.applicationCount || 0) === 0);
    } else if (countFilter === '1') {
      filtered = filtered.filter(app => (app.applicationCount || 0) === 1);
    } else if (countFilter === '2+') {
      filtered = filtered.filter(app => (app.applicationCount || 0) >= 2);
    }

    // Apply name filter
    if (nameFilter === 'has_name') {
      filtered = filtered.filter(app => app.name && app.name.trim() !== '');
    } else if (nameFilter === 'no_name') {
      filtered = filtered.filter(app => !app.name || app.name.trim() === '');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.name && app.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [applications, statusFilter, countFilter, searchTerm, excludeHrReplied, nameFilter]);

  const handleSelectEmail = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredApplications.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredApplications.map(app => app.email));
    }
  };

  const handleRowClick = (email, event) => {
    // Don't trigger row click if clicking on checkbox or preview button
    if (event.target.type === 'checkbox' || event.target.textContent === 'Preview') {
      return;
    }
    handleSelectEmail(email);
  };

  const handleSendEmails = async () => {
    if (selectedEmails.length === 0) {
      setMessage('❌ Please select at least one email to send to.');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const emailsToSend = applications.filter(app => 
        selectedEmails.includes(app.email)
      ).map(app => ({
        ...app,
        email: app.email.replace(/^"(.*)"$/, '$1') // Remove extra quotes
      }));

      // Split emails into batches
      const batches = [];
      for (let i = 0; i < emailsToSend.length; i += batchSize) {
        batches.push(emailsToSend.slice(i, i + batchSize));
      }

      setSendingProgress({
        current: 0,
        total: emailsToSend.length,
        batch: 0,
        totalBatches: batches.length
      });

      let totalSent = 0;
      let totalFailed = 0;
      const failedEmails = [];

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        setSendingProgress(prev => ({
          ...prev,
          batch: batchIndex + 1
        }));

        setMessage(`📤 Sending batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)...`);

        try {
          const response = await fetch('/api/emails/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              emails: batch,
              cvPath: cvPath || null
            }),
          });

          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            setMessage(`❌ Server returned invalid response for batch ${batchIndex + 1}. Status: ${response.status}`);
            totalFailed += batch.length;
            failedEmails.push(...batch.map(app => app.email));
            continue;
          }

          if (response.ok) {
            totalSent += data.totalSent || 0;
            totalFailed += data.totalFailed || 0;
            if (data.failedEmails) {
              failedEmails.push(...data.failedEmails);
            }
          } else {
            setMessage(`❌ Error in batch ${batchIndex + 1}: ${data.error || 'Unknown error occurred'}`);
            totalFailed += batch.length;
            failedEmails.push(...batch.map(app => app.email));
          }

          setSendingProgress(prev => ({
            ...prev,
            current: prev.current + batch.length
          }));

        } catch (error) {
          console.error(`Error sending batch ${batchIndex + 1}:`, error);
          setMessage(`❌ Error sending batch ${batchIndex + 1}: ${error.message}`);
          totalFailed += batch.length;
          failedEmails.push(...batch.map(app => app.email));
        }

        // Add delay between batches (except for the last batch)
        if (batchIndex < batches.length - 1) {
          setMessage(`⏳ Waiting ${delayBetweenBatches} seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches * 1000));
        }
      }

      // Final results
      if (totalFailed === 0) {
        setMessage(`✅ All emails sent successfully! Sent: ${totalSent}, Failed: ${totalFailed}`);
      } else {
        setMessage(`⚠️ Batch sending completed. Sent: ${totalSent}, Failed: ${totalFailed}. Failed emails: ${failedEmails.join(', ')}`);
      }

      setSelectedEmails([]);
      onApplicationsChange();

    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSending(false);
      setSendingProgress({ current: 0, total: 0, batch: 0, totalBatches: 0 });
    }
  };

  const generatePreview = (emailData) => {
    const greeting = emailData.name ? `Dear ${emailData.name},` : 'Dear Hiring Manager,';
    
    return {
      subject: 'Application for Frontend Developer Position',
      greeting,
      htmlBody: generatePreviewTemplate(emailData.name)
    };
  };

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl text-black font-semibold mb-4">Email Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              CV File Path (Optional)
            </label>
            <input
              type="text"
              value={cvPath}
              onChange={(e) => setCvPath(e.target.value)}
              placeholder="Leave empty to use default CV: Prashant cv new.pdf"
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-green-600 font-medium">✓ CV will be automatically attached:</span> Prashant cv new.pdf
              <br />
              <span className="text-blue-600 font-medium">Note:</span> CV is automatically attached from public folder. Leave empty to use default.
            </p>
          </div>

          {/* Batch Configuration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-3">⚠️ Gmail Safety Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">
                  Batch Size (emails per batch)
                </label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-black border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value={3}>3 emails (Safest)</option>
                  <option value={5}>5 emails (Recommended)</option>
                  <option value={10}>10 emails (Moderate)</option>
                  <option value={15}>15 emails (Risky)</option>
                </select>
                <p className="text-xs text-yellow-600 mt-1">
                  Smaller batches = safer for Gmail
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">
                  Delay Between Batches (seconds)
                </label>
                <select
                  value={delayBetweenBatches}
                  onChange={(e) => setDelayBetweenBatches(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-black border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value={15}>15 seconds (Fast)</option>
                  <option value={30}>30 seconds (Recommended)</option>
                  <option value={60}>1 minute (Safe)</option>
                  <option value={120}>2 minutes (Very Safe)</option>
                </select>
                <p className="text-xs text-yellow-600 mt-1">
                  Longer delays = less likely to be blocked
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-yellow-700">
              <p><strong>Gmail Limits:</strong> Free accounts: ~100 emails/day, ~500 emails/day for paid accounts</p>
              <p><strong>Tip:</strong> Start with small batches and gradually increase if no issues occur</p>
            </div>
          </div>

          {/* Gmail Safety Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">📧 Gmail Safety Tips</h3>
            <div className="text-xs text-blue-700 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">1.</span>
                <div>
                  <strong>Warm up your account:</strong> Start with 5-10 emails per day for the first week, then gradually increase
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <div>
                  <strong>Use different subjects:</strong> Vary your email subjects to avoid spam detection
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">3.</span>
                <div>
                  <strong>Personalize content:</strong> Use names and company-specific details to avoid generic templates
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">4.</span>
                <div>
                  <strong>Monitor delivery:</strong> Check your "Sent" folder and watch for bounce notifications
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">5.</span>
                <div>
                  <strong>Use professional email:</strong> Consider using a business email instead of personal Gmail for better deliverability
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      

      {/* Email Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-black font-semibold">
              Select Emails to Send ({selectedEmails.length} selected)
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                {selectedEmails.length === filteredApplications.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleSendEmails}
                disabled={sending || selectedEmails.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending 
                  ? `Sending... (${sendingProgress.current}/${sendingProgress.total})` 
                  : `Send to ${selectedEmails.length} emails (${Math.ceil(selectedEmails.length / batchSize)} batches)`
                }
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({applications.length})</option>
                <option value="pending">Pending ({applications.filter(app => !app.isApplied).length})</option>
                <option value="applied">Applied ({applications.filter(app => app.isApplied).length})</option>
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

            {/* Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name Status</label>
              <select
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Names</option>
                <option value="has_name">Has Name ({applications.filter(app => app.name && app.name.trim() !== '').length})</option>
                <option value="no_name">No Name ({applications.filter(app => !app.name || app.name.trim() === '').length})</option>
              </select>
            </div>

            {/* HR Reply Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR Reply Filter</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={excludeHrReplied}
                  onChange={(e) => setExcludeHrReplied(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Exclude HR Replied ({applications.filter(app => app.hrReplied).length} replied)
                </span>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCountFilter('all');
                  setNameFilter('all');
                  setExcludeHrReplied(true);
                }}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length} emails
          </div>
        </div>

        {message && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className={`p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-700' : message.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {sending && sendingProgress.total > 0 && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">
                  Batch {sendingProgress.batch} of {sendingProgress.totalBatches}
                </span>
                <span className="text-sm text-blue-600">
                  {sendingProgress.current} / {sendingProgress.total} emails
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                {sendingProgress.totalBatches > 1 && (
                  <span>Next batch in {delayBetweenBatches} seconds...</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEmails.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
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
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HR Replied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr 
                  key={app.id}
                  onClick={(e) => handleRowClick(app.email, e)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedEmails.includes(app.email) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(app.email)}
                      onChange={() => handleSelectEmail(app.email)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setPreviewEmail(app)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No emails found matching your filters.
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">To:</label>
                  <p className="text-sm text-gray-900">{previewEmail.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject:</label>
                  <p className="text-sm text-gray-900">{generatePreview(previewEmail).subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <div 
                      className="text-sm text-gray-900"
                      dangerouslySetInnerHTML={{ __html: generatePreview(previewEmail).htmlBody }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attachments:</label>
                  <p className="text-sm text-gray-900">
                    📎 CV: Prashant cv new.pdf (automatically attached)
                  </p>
                 
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

