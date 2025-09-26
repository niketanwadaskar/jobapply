'use client';

import { useState, useEffect } from 'react';
import EmailManager from './components/EmailManager';
import ApplicationTracker from './components/ApplicationTracker';
import EmailSender from './components/EmailSender';

export default function Home() {
  const [activeTab, setActiveTab] = useState('manage');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'manage', label: 'Email Management', icon: '📧' },
    { id: 'track', label: 'Application Tracker', icon: '📊' },
    { id: 'send', label: 'Send Emails', icon: '📤' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Application Manager</h1>
              <p className="text-gray-600 mt-1">Manage your job applications and email campaigns</p>
            </div>
            <div className="text-sm text-gray-500">
              Total Applications: <span className="font-semibold">{applications.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'manage' && (
          <EmailManager 
            applications={applications} 
            onApplicationsChange={fetchApplications}
          />
        )}
        {activeTab === 'track' && (
          <ApplicationTracker 
            applications={applications} 
            onApplicationsChange={fetchApplications}
          />
        )}
        {activeTab === 'send' && (
          <EmailSender 
            applications={applications} 
            onApplicationsChange={fetchApplications}
          />
        )}
      </main>
    </div>
  );
}
