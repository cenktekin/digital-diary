
import React, { useState, useCallback } from 'react';
import { AnalyzeIcon, LoadingIcon, UploadIcon, FileIcon, TrashIcon } from './icons';

interface HistoryInputProps {
  onAnalyze: (historyData: string) => void;
  isLoading: boolean;
}

const HistoryInput: React.FC<HistoryInputProps> = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert('Lütfen sadece .csv formatında bir dosya seçin.');
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onAnalyze(content);
      } else {
        alert('Dosya okunamadı veya boş.');
      }
    };
    reader.onerror = () => {
      alert('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-slate-200">1. Geçmiş Dosyanızı Yükleyin (.csv)</h2>
      
      {!file ? (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 bg-slate-900 hover:bg-slate-800'}`}
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
            <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
            <p className="font-semibold text-slate-300">Dosyayı buraya sürükleyin veya seçmek için tıklayın</p>
            <p className="text-sm text-slate-500">Sadece CSV formatı desteklenmektedir</p>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileIcon className="w-8 h-8 text-cyan-400 flex-shrink-0"/>
            <div className="flex flex-col overflow-hidden">
              <span className="text-slate-200 font-medium truncate">{file.name}</span>
              <span className="text-slate-400 text-sm">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          <button 
            onClick={removeFile}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors duration-200 disabled:opacity-50"
            aria-label="Dosyayı kaldır"
          >
            <TrashIcon className="w-6 h-6"/>
          </button>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading || !file}
          className="h-12 w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold px-4 rounded-lg transition-all duration-300 transform active:scale-95 shadow-lg shadow-cyan-900/50"
        >
          {isLoading ? (
            <>
              <LoadingIcon className="w-5 h-5 animate-spin" />
              <span>Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <AnalyzeIcon className="w-5 h-5" />
              <span>Günümü Analiz Et</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HistoryInput;
