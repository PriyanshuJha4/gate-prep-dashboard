"use client";

import { useState } from "react";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { resources } from "@/lib/gateData";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

type CustomResource = {
  id: string;
  label: string;
  url: string;
};

export default function ResourcesPage() {
  const { selectedUser } = useSelectedUser();
  const [customResources, saveCustomResources] = useLocalStorageValue<CustomResource[]>(
    selectedUser ? `gate-resources-${selectedUser.id}` : null,
    [],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [formError, setFormError] = useState("");

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setDraftTitle("");
    setDraftUrl("");
    setFormError("");
  };

  const openAddForm = () => {
    setEditingId(null);
    setDraftTitle("");
    setDraftUrl("");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (resource: CustomResource) => {
    setEditingId(resource.id);
    setDraftTitle(resource.label);
    setDraftUrl(resource.url);
    setFormError("");
    setIsFormOpen(true);
  };

  const saveResource = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;
    const label = draftTitle.trim();
    const typedUrl = draftUrl.trim();
    const candidateUrl = /^https?:\/\//i.test(typedUrl) ? typedUrl : `https://${typedUrl}`;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(candidateUrl);
    } catch {
      setFormError("Enter a valid website URL.");
      return;
    }
    if (!label || !["http:", "https:"].includes(parsedUrl.protocol)) {
      setFormError("Add a title and a valid HTTP or HTTPS URL.");
      return;
    }

    const resource: CustomResource = { id: editingId ?? crypto.randomUUID(), label, url: parsedUrl.toString() };
    const nextResources = editingId
      ? customResources.map((item) => item.id === editingId ? resource : item)
      : [...customResources, resource];
    saveCustomResources(nextResources);
    closeForm();
  };

  const deleteResource = (resource: CustomResource) => {
    if (!window.confirm(`Delete the custom resource “${resource.label}”?`)) return;
    saveCustomResources(customResources.filter((item) => item.id !== resource.id));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Free resources</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Study links</h2>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          disabled={!selectedUser}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add resource
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {resources.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-slate-100 transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{item.label}</span>
              <span className="text-cyan-300">Open →</span>
            </div>
          </a>
        ))}
        {customResources.map((item) => (
          <article key={item.id} className="rounded-lg border border-cyan-500/30 bg-slate-900/80 p-4 text-slate-100">
            <div className="flex items-start justify-between gap-3">
              <a href={item.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 font-medium hover:text-cyan-200">
                <span className="block break-words">{item.label}</span>
                <span className="mt-1 block break-all text-xs text-slate-400">{item.url}</span>
              </a>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => openEditForm(item)} className="text-sm text-cyan-200 hover:text-cyan-100">Edit</button>
                <button type="button" onClick={() => deleteResource(item)} className="text-sm text-rose-300 hover:text-rose-200">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="resource-form-title" className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 id="resource-form-title" className="text-xl font-semibold text-white">{editingId ? "Edit resource" : "Add resource"}</h3>
              <button type="button" onClick={closeForm} aria-label="Close" className="rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800">✕</button>
            </div>
            <form onSubmit={saveResource} className="space-y-4">
              <label className="block space-y-1 text-sm text-slate-300">
                <span className="block">Heading / title</span>
                <input autoFocus required maxLength={100} value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className={fieldClass} placeholder="e.g. GATE CS practice set" />
              </label>
              <label className="block space-y-1 text-sm text-slate-300">
                <span className="block">Website URL</span>
                <input required type="text" inputMode="url" value={draftUrl} onChange={(event) => setDraftUrl(event.target.value)} className={fieldClass} placeholder="https://example.com" />
              </label>
              {formError && <p role="alert" className="text-sm text-rose-300">{formError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Cancel</button>
                <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save resource</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

const fieldClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400";
