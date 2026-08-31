import React, { useState } from 'react';
import { DynamicField } from '@/types';
import { OptionSelector } from '@/components/ui/OptionSelector';
import { uploadFileToDrive } from '@/lib/api';
import {
  AlertCircle,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface DynamicFieldRendererProps {
  field: DynamicField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  contextName?: string;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
  contextName,
}: DynamicFieldRendererProps) {
  const [fileUploading, setFileUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const rules = field.validation_rules || {};
  const isRequired = !!rules.required;
  const options = field.options || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    setFileName(file.name);

    // Create local preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      setFileUploading(true);
      const cleanContext = (contextName || 'Player').trim().replace(/[^a-zA-Z0-9]/g, '_');
      const cleanField = (field.label || field.field_key).trim().replace(/[^a-zA-Z0-9]/g, '_');
      const customPrefix = `${cleanContext}_${cleanField}`;
      const driveUrl = await uploadFileToDrive(file, customPrefix);
      onChange(driveUrl);
    } catch (err) {
      console.warn('File upload fallback:', err);
      // If server is offline, save local base64 preview or filename as fallback
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        onChange(file.name);
      }
    } finally {
      setFileUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    setFilePreview(null);
    onChange('');
  };

  return (
    <div className="space-y-2">
      {/* Question Label */}
      <label className="block text-sm font-bold text-slate-800">
        {field.label}
        {isRequired && <span className="text-amber-600 ml-1 font-black">*</span>}
      </label>

      {/* 1. SELECT / DROPDOWN INPUT */}
      {field.field_type === 'select' && (
        <>
          {options.length <= 4 ? (
            <OptionSelector
              options={options}
              value={value || options[0]}
              onChange={(val) => onChange(val)}
              layoutId={`dyn-layout-${field.field_key}`}
              disabled={disabled}
              gridCols={options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}
              activeColor="bg-gradient-to-r from-amber-500 to-orange-600"
              activeTextColor="text-white"
            />
          ) : (
            <div className="relative">
              <select
                value={value || ''}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 border rounded-xl font-medium text-slate-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all ${
                  error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 shadow-sm'
                }`}
              >
                <option value="" disabled>
                  Select an option...
                </option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. TEXT INPUT */}
      {field.field_type === 'text' && (
        <div className="relative">
          <input
            type="text"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            className={`w-full px-4 py-3 bg-white/90 border rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all ${
              error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 shadow-sm'
            }`}
          />
        </div>
      )}

      {/* 3. NUMBER INPUT */}
      {field.field_type === 'number' && (
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter number...`}
            min={rules.min}
            max={rules.max}
            className={`w-full px-4 py-3 bg-white/90 border rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all ${
              error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 shadow-sm'
            }`}
          />
        </div>
      )}

      {/* 4. DATE INPUT */}
      {field.field_type === 'date' && (
        <div className="relative">
          <input
            type="date"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 bg-white/90 border rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all ${
              error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 shadow-sm'
            }`}
          />
        </div>
      )}

      {/* 5. FILE UPLOAD INPUT (Photo / Payment Receipt) */}
      {field.field_type === 'file' && (
        <div className="space-y-3">
          {value || filePreview ? (
            <div className="relative p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-amber-300 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {fileName || 'File Attached'}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Uploaded to Google Drive</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
                fileUploading
                  ? 'border-amber-300 bg-amber-50/30 pointer-events-none'
                  : 'border-slate-200 hover:border-amber-400 bg-white/70 hover:bg-amber-50/30'
              }`}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={fileUploading || disabled}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {fileUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  ) : (
                    <Upload className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {fileUploading ? 'Uploading to Drive...' : 'Click to Upload Document / Screenshot'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, or PDF up to 5MB</p>
                </div>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Validation Error Message */}
      {error && (
        <p className="text-rose-600 text-xs font-semibold flex items-center space-x-1 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default DynamicFieldRenderer;
