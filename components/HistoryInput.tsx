import React, { useState, useCallback } from 'react';
import { AnalyzeIcon, LoadingIcon, UploadIcon, FileIcon, TrashIcon, ClipboardIcon } from './icons';

interface HistoryInputProps {
  onAnalyze: (historyData: string) => void;
  isLoading: boolean;
  t: (key: string) => string;
}

type InputMode = 'file' | 'text';

const HistoryInput: React.FC<HistoryInputProps> = ({ onAnalyze, isLoading, t }) => {
  const [mode, setMode] = useState<InputMode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert(t('errorOnlyCsv'));
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleAnalyzeClick = () => {
    if (mode === 'file' && file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onAnalyze(content);
        } else {
          alert(t('errorFileReadEmpty'));
        }
      };
      reader.onerror = () => {
        alert(t('errorFileRead'));
      };
      reader.readAsText(file);
    } else if (mode === 'text' && text.trim()) {
      onAnalyze(text);
    }
  };
  
  const isAnalyzeDisabled = isLoading || (mode === 'file' && !file) || (mode === 'text' && !text.trim());

  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">{t('inputTitle')}</h2>
      
      <div className="flex border-b border-slate-300 dark:border-slate-700 mb-4">
        <button
          onClick={() => setMode('file')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            mode === 'file'
              ? 'border-cyan-500 text-cyan-500 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <UploadIcon className="w-5 h-5" />
          {t('uploadFile')}
        </button>
        <button
          onClick={() => setMode('text')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            mode === 'text'
              ? 'border-cyan-500 text-cyan-500 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardIcon className="w-5 h-5" />
          {t('pasteText')}
        </button>
      </div>

      {mode === 'file' && (
        <>
          {!file ? (
            <div
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-cyan-500 dark:border-cyan-400 bg-slate-200 dark:bg-slate-700/50' : 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInputChange}
                accept=".csv"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center text-center p-4 cursor-pointer">
                <UploadIcon className="w-10 h-10 mb-3 text-slate-400 dark:text-slate-400" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">{t('dragOrClick')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">{t('csvOnly')}</p>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full h-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400 flex-shrink-0"/>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{file.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>
              <button 
                onClick={removeFile}
                disabled={isLoading}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-900/50 rounded-full transition-colors duration-200 disabled:opacity-50"
                aria-label={t('removeFile')}
              >
                <TrashIcon className="w-6 h-6"/>
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'text' && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder={t('pastePlaceholder')}
            className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none"
          />
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzeDisabled}
          className="h-12 w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold px-4 rounded-lg transition-all duration-300 transform active:scale-95 shadow-lg shadow-cyan-500/30 dark:shadow-cyan-900/50"
        >
          {isLoading ? (
            <>
              <LoadingIcon className="w-5 h-5 animate-spin" />
              <span>{t('analyzing')}</span>
            </>
          ) : (
            <>
              <AnalyzeIcon className="w-5 h-5" />
              <span>{t('analyzeButton')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HistoryInput;