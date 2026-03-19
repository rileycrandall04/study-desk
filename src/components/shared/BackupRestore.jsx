import { useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAllJournalEntries, importJournalEntriesCloud } from '../../firebase/sync';
import Modal from './Modal';

/**
 * Backup (JSON export) and Restore (JSON import) controls.
 */
export default function BackupRestore() {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [importData, setImportData] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

  async function handleExport() {
    if (!user) return;
    try {
      const entries = await fetchAllJournalEntries(user.uid);
      const payload = {
        version: 1,
        app: 'StudyDesk',
        exportedAt: new Date().toISOString(),
        entryCount: entries.length,
        entries,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: `Exported ${entries.length} entries` });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Export failed: ' + err.message });
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.entries || !Array.isArray(data.entries)) {
          setStatus({ type: 'error', msg: 'Invalid backup file: missing entries array' });
          return;
        }
        setImportData(data);
      } catch {
        setStatus({ type: 'error', msg: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function confirmImport() {
    if (!importData || !user) return;
    try {
      await importJournalEntriesCloud(user.uid, importData.entries);
      setStatus({ type: 'success', msg: `Imported ${importData.entries.length} entries` });
      setImportData(null);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Import failed: ' + err.message });
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download size={14} />
          Export Backup
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2">
          <Upload size={14} />
          Import Backup
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
      </div>

      {status && (
        <div className={`flex items-center gap-2 mt-3 text-sm font-sans ${
          status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {status.msg}
        </div>
      )}

      <Modal open={!!importData} onClose={() => setImportData(null)} title="Import Backup">
        <p className="text-sm text-ink-400 dark:text-parchment-400 mb-2">
          This will import <strong>{importData?.entries?.length || 0}</strong> journal entries into your cloud storage.
        </p>
        {importData?.exportedAt && (
          <p className="text-xs text-parchment-400 mb-4">
            Backup from: {new Date(importData.exportedAt).toLocaleString()}
          </p>
        )}
        <p className="text-xs text-ink-300 dark:text-parchment-500 mb-4">
          Entries will be added as new items in your cloud storage.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setImportData(null)} className="btn-secondary">Cancel</button>
          <button onClick={confirmImport} className="btn-primary">Import</button>
        </div>
      </Modal>
    </div>
  );
}
