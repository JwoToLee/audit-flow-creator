
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { AuditFinding } from '@/types/audit';
import { importFindingsFromCSV } from '@/utils/auditStorage';

const CSVUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processCSV = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const findings = parseCSVToFindings(csvData);
        
        importFindingsFromCSV(findings);
        
        toast.success(`Successfully imported ${findings.length} historical findings`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse CSV file. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const parseCSVToFindings = (csvData: string): AuditFinding[] => {
    const lines = csvData.split('\n');
    
    // Skip header row and filter out empty lines
    const dataRows = lines.slice(1).filter(line => line.trim().length > 0);
    
    return dataRows.map((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      // Expected format: auditRef, checklistItemId, finding, observation, year
      if (columns.length < 5) {
        throw new Error(`Invalid CSV format at line ${index + 2}`);
      }
      
      return {
        id: crypto.randomUUID(),
        auditRef: columns[0],
        checklistItemId: columns[1],
        finding: columns[2],
        observation: columns[3],
        year: columns[4],
        isHistorical: true
      };
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processCSV(file);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processCSV(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium">
          Drag and drop your CSV file here
        </p>
        <p className="text-xs text-gray-500 mt-1">
          The CSV should contain: auditRef, checklistItemId, finding, observation, year
        </p>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Button
          variant="outline"
          onClick={handleButtonClick}
          className="mt-4"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Select File'}
        </Button>
      </div>
      
      {fileName && (
        <div className="text-sm">
          <span className="font-medium">File: </span>
          {fileName}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
