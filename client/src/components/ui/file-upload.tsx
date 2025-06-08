import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileImage, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = ".jpg,.jpeg,.png", 
  maxSize = 10 * 1024 * 1024,
  className = ""
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
      } else if (error.code === 'file-invalid-type') {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG or PNG image file.",
          variant: "destructive",
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const getBorderColor = () => {
    if (isDragAccept) return "border-green-400";
    if (isDragReject) return "border-red-400";
    if (isDragActive) return "border-agro-green";
    return "border-gray-300";
  };

  return (
    <div
      {...getRootProps()}
      className={`
        file-upload-area border-2 border-dashed rounded-xl p-12 text-center 
        hover:border-agro-green/60 transition-all cursor-pointer
        ${getBorderColor()}
        ${isDragActive ? "bg-agro-bg" : "bg-gray-50"}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="upload-icon mb-6">
        <CloudUpload className="text-agro-green h-16 w-16 mx-auto" />
      </div>
      
      <h3 className="text-2xl font-semibold agro-text mb-2">Upload Plant Image</h3>
      
      {isDragActive ? (
        <p className="text-agro-green mb-4">Drop the image here...</p>
      ) : (
        <p className="text-gray-600 mb-4">Drag and drop your image here, or click to browse</p>
      )}
      
      <p className="text-sm text-gray-500">
        Supports JPG, PNG files up to {Math.round(maxSize / (1024 * 1024))}MB
      </p>
    </div>
  );
}
