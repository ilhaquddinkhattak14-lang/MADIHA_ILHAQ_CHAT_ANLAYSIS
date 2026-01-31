import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError('');
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
                setError('Please upload a .txt file exported from WhatsApp');
                return;
            }
            setSelectedFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        multiple: false,
        accept: {
            'text/plain': ['.txt']
        }
    });

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
    };

    const handleAnalyze = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    return (
        <div className="w-full">
            <div 
                {...getRootProps()} 
                className={`
                    relative p-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer text-center group
                    ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'}
                    ${selectedFile ? 'border-indigo-500 bg-indigo-50/50' : ''}
                    shadow-sm hover:shadow-md
                `}
            >
                <input {...getInputProps()} />
                
                {selectedFile ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedFile.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        
                        <div className="flex gap-4">
                            <Button onClick={handleAnalyze} isLoading={isLoading} className="px-8 shadow-indigo-500/20">
                                Analyze Chat
                            </Button>
                            <button 
                                onClick={handleRemoveFile}
                                className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors flex items-center justify-center mb-6">
                            <Upload className="w-10 h-10 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {isDragActive ? 'Drop your file here' : 'Upload WhatsApp Chat'}
                        </h3>
                        <p className="text-slate-500 max-w-sm mx-auto text-base">
                            Drag & drop your exported <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-sm ml-1">.txt</code> file here, or click to browse
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-4 text-sm font-medium text-red-500 text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
            )}
        </div>
    );
};

export default FileUpload;
