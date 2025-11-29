"use client";

import { useState, useMemo } from "react";

export default function EmailManager({ applications, onApplicationsChange }) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingEmail, setEditingEmail] = useState(null);
  const [editName, setEditName] = useState("");
  const [editingHrReply, setEditingHrReply] = useState(null);
  const [editHrReplyNotes, setEditHrReplyNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, applied, pending
  const [nameFilter, setNameFilter] = useState("all"); // all, set, not_set
  const [hrReplyFilter, setHrReplyFilter] = useState("all"); // all, replied, not_replied
  const [dateFilter, setDateFilter] = useState("all"); // all, latest, older

  const handleAddEmails = async () => {
    if (!emailInput.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      // Split emails by comma, newline, or semicolon
      const emails = emailInput
        .split(/[,;\n]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ ${data.message}. Added: ${data.newCount}, Duplicates: ${data.duplicateCount}, Gmail filtered: ${data.gmailFilteredCount}`
        );
        setEmailInput("");
        onApplicationsChange();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (email, newName) => {
    try {
      const response = await fetch(`/api/emails/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        onApplicationsChange();
        setEditingEmail(null);
        setEditName("");
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleUpdateHrReply = async (email, hrReplied, hrReplyNotes) => {
    try {
      const response = await fetch(`/api/emails/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hrReplied, hrReplyNotes }),
      });

      if (response.ok) {
        onApplicationsChange();
        setEditingHrReply(null);
        setEditHrReplyNotes("");
      }
    } catch (error) {
      console.error("Error updating HR reply:", error);
    }
  };

  const handleDeleteApplication = async (email) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`/api/emails/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onApplicationsChange();
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch("/api/excel/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `job_applications_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Apply status filter
    switch (statusFilter) {
      case "applied":
        filtered = filtered.filter((app) => app.isApplied);
        break;
      case "pending":
        filtered = filtered.filter((app) => !app.isApplied);
        break;
      default:
        // all - no status filtering
        break;
    }

    // Apply name filter
    switch (nameFilter) {
      case "set":
        filtered = filtered.filter((app) => app.name && app.name.trim() !== "");
        break;
      case "not_set":
        filtered = filtered.filter(
          (app) => !app.name || app.name.trim() === ""
        );
        break;
      default:
        // all - no name filtering
        break;
    }

    // Apply HR reply filter
    switch (hrReplyFilter) {
      case "replied":
        filtered = filtered.filter((app) => app.hrReplied);
        break;
      case "not_replied":
        filtered = filtered.filter((app) => !app.hrReplied);
        break;
      default:
        // all - no HR reply filtering
        break;
    }

    // Apply date filter
    switch (dateFilter) {
      case "latest":
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "older":
        filtered = filtered.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      default:
        // all - keep original order
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.name &&
            app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.hrReplyNotes &&
            app.hrReplyNotes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [
    applications,
    statusFilter,
    nameFilter,
    hrReplyFilter,
    dateFilter,
    searchTerm,
  ]);

  return (
    <div className="space-y-6">
      {/* Add Emails Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl text-black font-semibold mb-4">
          Add New Email Addresses
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Addresses (separate with commas, semicolons, or new lines)
            </label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="john.doe@company.com, jane.smith@startup.io&#10;hr@techcorp.com&#10;jobs@bigcompany.com"
              className="w-full h-32 px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-700 mt-1">
                Gmail addresses will be automatically filtered out. Duplicates
                will be removed.
              </p>
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ How to Extract Emails
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                On LinkedIn, perform a job search, filter by posts, and then run
                this command in the browser console to extract email addresses:
              </p>
              <pre className="bg-yellow-100 text-yellow-800 text-sm rounded-md p-2 overflow-x-auto">
                <code>
                  {`[...document.querySelectorAll('a[href^="mailto:"]')]
.map(a => a.href.replace("mailto:", ""));`}
                </code>
              </pre>
            </div>
          </div>

          <button
            onClick={handleAddEmails}
            disabled={loading || !emailInput.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Add Emails"}
          </button>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-black font-semibold">
              Applications ({applications.length})
            </h2>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Export to Excel
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email, name, or notes..."
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({applications.length})</option>
                <option value="pending">
                  Pending ({applications.filter((app) => !app.isApplied).length}
                  )
                </option>
                <option value="applied">
                  Applied ({applications.filter((app) => app.isApplied).length})
                </option>
              </select>
            </div>

            {/* Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name Status
              </label>
              <select
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Names</option>
                <option value="set">
                  Name Set (
                  {
                    applications.filter(
                      (app) => app.name && app.name.trim() !== ""
                    ).length
                  }
                  )
                </option>
                <option value="not_set">
                  Name Not Set (
                  {
                    applications.filter(
                      (app) => !app.name || app.name.trim() === ""
                    ).length
                  }
                  )
                </option>
              </select>
            </div>

            {/* HR Reply Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HR Reply
              </label>
              <select
                value={hrReplyFilter}
                onChange={(e) => setHrReplyFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({applications.length})</option>
                <option value="replied">
                  Replied ({applications.filter((app) => app.hrReplied).length})
                </option>
                <option value="not_replied">
                  Not Replied (
                  {applications.filter((app) => !app.hrReplied).length})
                </option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Order
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Default Order</option>
                <option value="latest">Latest First</option>
                <option value="older">Oldest First</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setNameFilter("all");
                  setHrReplyFilter("all");
                  setDateFilter("all");
                }}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length}{" "}
            applications
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  HR Replied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  HR Reply Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
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
                    {editingEmail === app.email ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateName(app.email, editName);
                            } else if (e.key === "Escape") {
                              setEditingEmail(null);
                              setEditName("");
                            }
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                          placeholder="Enter name"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateName(app.email, editName)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmail(null);
                            setEditName("");
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{app.name || "Not set"}</span>
                        <button
                          onClick={() => {
                            setEditingEmail(app.email);
                            setEditName(app.name || "");
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        app.isApplied
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.isApplied ? "Applied" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.appliedDate
                      ? new Date(app.appliedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={app.hrReplied || false}
                        onChange={(e) =>
                          handleUpdateHrReply(
                            app.email,
                            e.target.checked,
                            app.hrReplyNotes
                          )
                        }
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-xs text-gray-500">
                        {app.hrReplied ? "Yes" : "No"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {editingHrReply === app.email ? (
                      <div className="flex items-center space-x-2">
                        <textarea
                          value={editHrReplyNotes}
                          onChange={(e) => setEditHrReplyNotes(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleUpdateHrReply(
                                app.email,
                                app.hrReplied,
                                editHrReplyNotes
                              );
                            } else if (e.key === "Escape") {
                              setEditingHrReply(null);
                              setEditHrReplyNotes("");
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black resize-none"
                          placeholder="Enter HR reply notes..."
                          rows={2}
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            handleUpdateHrReply(
                              app.email,
                              app.hrReplied,
                              editHrReplyNotes
                            )
                          }
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingHrReply(null);
                            setEditHrReplyNotes("");
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 max-w-xs truncate">
                          {app.hrReplyNotes || "No notes"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingHrReply(app.email);
                            setEditHrReplyNotes(app.hrReplyNotes || "");
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteApplication(app.email)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {applications.length === 0
              ? "No applications found. Add some email addresses to get started."
              : "No applications found matching your filters."}
          </div>
        )}
      </div>
    </div>
  );
}
