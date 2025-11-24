"use client";

import { useCallback, useEffect, useState } from "react";
import ApiKeysTable from "./components/ApiKeysTable";
import CreateEditModal from "./components/CreateEditModal";
import DeleteModal from "./components/DeleteModal";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import ToastNotifications from "./components/ToastNotifications";
import { ApiKey, Toast } from "./types";

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      } else {
        showToast("Failed to fetch API keys", "error");
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      showToast("Failed to fetch API keys", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const validateForm = (): boolean => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name.trim() }),
      });

      if (response.ok) {
        const newKey = await response.json();
        await fetchApiKeys();
        setShowCreateModal(false);
        setFormData({ name: "" });
        setFormErrors({});
        showToast(`API key "${newKey.name}" created successfully`);
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to create API key", "error");
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      showToast("Failed to create API key", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/keys/${editingKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name.trim() }),
      });

      if (response.ok) {
        await fetchApiKeys();
        setShowCreateModal(false);
        setEditingKey(null);
        setFormData({ name: "" });
        setFormErrors({});
        showToast("API key updated successfully");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update API key", "error");
      }
    } catch (error) {
      console.error("Failed to update API key:", error);
      showToast("Failed to update API key", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingKeyId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/keys/${deletingKeyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchApiKeys();
        setShowDeleteModal(false);
        setDeletingKeyId(null);
        showToast("API key deleted successfully");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to delete API key", "error");
      }
    } catch (error) {
      console.error("Failed to delete API key:", error);
      showToast("Failed to delete API key", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      showToast("API key copied to clipboard");
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const openCreateModal = () => {
    setEditingKey(null);
    setFormData({ name: "" });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const openDeleteModal = (keyId: string) => {
    setDeletingKeyId(keyId);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setEditingKey(null);
    setDeletingKeyId(null);
    setFormData({ name: "" });
    setFormErrors({});
  };

  const handleFormInputChange = (name: string) => {
    setFormData({ name });
    if (formErrors.name) {
      setFormErrors({ ...formErrors, name: undefined });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 -mt-16 pt-0">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col transition-all">
        {/* Header with Toggle Button */}
        <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-2 text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900 lg:text-xl">Dashboard</h1>
        </div>

        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Plan, prioritize, and manage your API keys with ease.
            </p>
          </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add API Key
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards apiKeys={apiKeys} />

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : apiKeys.length === 0 ? (
          <EmptyState onCreateClick={openCreateModal} />
        ) : (
          <ApiKeysTable
            apiKeys={apiKeys}
            visibleKeys={visibleKeys}
            copiedKeyId={copiedKeyId}
            onToggleVisibility={toggleKeyVisibility}
            onCopy={copyToClipboard}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        )}

        {/* Modals */}
        <CreateEditModal
          isOpen={showCreateModal}
          editingKey={editingKey}
          formData={formData}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          onClose={closeModals}
          onSubmit={editingKey ? handleUpdate : handleCreate}
          onInputChange={handleFormInputChange}
        />

        <DeleteModal
          isOpen={showDeleteModal}
          isSubmitting={isSubmitting}
          onClose={closeModals}
          onConfirm={handleDelete}
        />

        {/* Toast Notifications */}
        <ToastNotifications toasts={toasts} />
        </div>
      </div>
    </div>
  );
}
