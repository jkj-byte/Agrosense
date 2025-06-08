import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";
import { Microscope, AlertTriangle, Shield, Pill, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DiseaseDetectionResult {
  id: number;
  diseaseName: string;
  confidence: number;
  description: string;
  treatments: string[];
  preventionMethods: string[];
}

export default function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const { toast } = useToast();

  const detectDiseaseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/detect-disease', formData);
      return response.json();
    },
    onSuccess: (data: DiseaseDetectionResult) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Plant disease detection completed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze plant disease. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      detectDiseaseMutation.mutate(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen agro-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold agro-text mb-4">Plant Disease Detection</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a clear photo of your plant to get instant disease identification and treatment recommendations
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center agro-text">
              <Microscope className="mr-2 h-5 w-5" />
              Upload Plant Image
            </CardTitle>
            <CardDescription>
              Drag and drop your image here, or click to browse. Supports JPG, PNG files up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
            />
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold agro-text">Selected Image</h4>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <img 
                      src={previewUrl} 
                      alt="Plant preview" 
                      className="max-w-full max-h-64 mx-auto rounded object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <Button 
                className="bg-agro-green hover:bg-agro-green/90 text-white px-8 py-4 font-semibold transform hover:scale-105 transition-all shadow-lg"
                onClick={handleAnalyze}
                disabled={!selectedFile || detectDiseaseMutation.isPending}
              >
                {detectDiseaseMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-5 w-5" />
                    Analyze Plant
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {detectDiseaseMutation.isPending && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-agro-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold agro-text mb-2">Analyzing Your Plant...</h3>
                <p className="text-gray-600 mb-4">Our AI is examining the image for disease identification</p>
                <Progress value={75} className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Disease Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl agro-text">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-red-800 mb-2">{result.diseaseName}</h4>
                    <p className="text-red-700 mb-3">{result.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-red-700">Confidence Level</span>
                        <span className="text-sm font-bold text-red-800">{result.confidence}%</span>
                      </div>
                      <Progress value={result.confidence} className="h-2" />
                    </div>
                  </div>
                </Alert>
              </CardContent>
            </Card>

            {/* Treatment Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center agro-text">
                  <Pill className="mr-3 h-5 w-5" />
                  Treatment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.treatments.map((treatment, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-agro-green rounded-full mt-2 mr-3 flex-shrink-0" />
                        <p className="text-gray-700">{treatment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prevention Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center agro-text">
                  <Shield className="mr-3 h-5 w-5" />
                  Prevention Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.preventionMethods.map((method, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">{method}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-x-4">
              <Button 
                onClick={handleReset}
                className="bg-agro-green hover:bg-agro-green/90 text-white px-8 py-3 font-semibold"
              >
                Analyze Another Plant
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3 font-semibold"
                onClick={() => {
                  toast({
                    title: "Report Generated",
                    description: "Analysis report is ready for download.",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
