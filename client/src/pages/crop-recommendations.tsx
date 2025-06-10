import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sprout, TrendingUp, Info, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface CropRecommendationRequest {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

interface CropRecommendationResponse {
  id: number;
  predicted_crop: string;
  confidence: number;
  top_predictions: Array<[string, number]>;
  feature_importance: Array<[string, number]>;
  crop_info: {
    description: string;
    growing_season: string;
    soil_requirements: string;
    climate: string;
  };
}

async function getCropRecommendation(data: CropRecommendationRequest): Promise<CropRecommendationResponse> {
  const response = await fetch('/api/crop-recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get crop recommendation');
  }

  return response.json();
}

export default function CropRecommendation() {
  const [formData, setFormData] = useState<CropRecommendationRequest>({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  } as any);
  const [result, setResult] = useState<CropRecommendationResponse | null>(null);

  const mutation = useMutation({
    mutationFn: getCropRecommendation,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      console.error('Crop recommendation error:', error);
    },
  });

  const handleInputChange = (field: keyof CropRecommendationRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty strings to 0 and validate
    const submissionData = Object.entries(formData).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value === '' ? 0 : parseFloat(String(value))
    }), {} as CropRecommendationRequest);
    
    // Validation
    const errors = [];
    if (submissionData.nitrogen < 0 || submissionData.nitrogen > 200) errors.push("Nitrogen should be 0-200 kg/ha");
    if (submissionData.phosphorus < 0 || submissionData.phosphorus > 150) errors.push("Phosphorus should be 0-150 kg/ha");
    if (submissionData.potassium < 0 || submissionData.potassium > 200) errors.push("Potassium should be 0-200 kg/ha");
    if (submissionData.temperature < 0 || submissionData.temperature > 50) errors.push("Temperature should be 0-50°C");
    if (submissionData.humidity < 0 || submissionData.humidity > 100) errors.push("Humidity should be 0-100%");
    if (submissionData.ph < 0 || submissionData.ph > 14) errors.push("pH should be 0-14");
    if (submissionData.rainfall < 0 || submissionData.rainfall > 500) errors.push("Rainfall should be 0-500 mm");

    if (errors.length > 0) {
      alert(errors.join(", "));
      return;
    }

    mutation.mutate(submissionData);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.7) return "Good";
    if (confidence >= 0.6) return "Moderate";
    return "Low";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold agro-text mb-4">
            <Sprout className="inline-block mr-3 agro-green" size={40} />
            Smart Crop Recommendation
          </h1>
          <p className="text-lg text-muted-foreground">
            Get AI-powered crop recommendations based on your soil and climate conditions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-agro-green text-white">
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={24} />
                Soil & Climate Analysis
              </CardTitle>
              <CardDescription className="text-green-50">
                Enter your soil test results and local climate data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Soil Nutrients */}
                <div>
                  <h3 className="text-lg font-semibold agro-green mb-3">Soil Nutrients (kg/ha)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                      <Input
                        id="nitrogen"
                        type="number"
                        step="0.1"
                        min="0"
                        max="200"
                        value={formData.nitrogen}
                        onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                        placeholder="e.g., 90"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-200</p>
                    </div>
                    <div>
                      <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        step="0.1"
                        min="0"
                        max="150"
                        value={formData.phosphorus}
                        onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                        placeholder="e.g., 42"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-150</p>
                    </div>
                    <div>
                      <Label htmlFor="potassium">Potassium (K)</Label>
                      <Input
                        id="potassium"
                        type="number"
                        step="0.1"
                        min="0"
                        max="200"
                        value={formData.potassium}
                        onChange={(e) => handleInputChange('potassium', e.target.value)}
                        placeholder="e.g., 43"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-200</p>
                    </div>
                  </div>
                </div>

                {/* Soil Properties */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">Soil Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ph">pH Level</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={formData.ph}
                        onChange={(e) => handleInputChange('ph', e.target.value)}
                        placeholder="e.g., 6.5"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-14</p>
                    </div>
                    <div>
                      <Label htmlFor="humidity">Humidity (%)</Label>
                      <Input
                        id="humidity"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.humidity}
                        onChange={(e) => handleInputChange('humidity', e.target.value)}
                        placeholder="e.g., 82"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-100%</p>
                    </div>
                  </div>
                </div>

                {/* Climate Conditions */}
                <div>
                  <h3 className="text-lg font-semibold agro-orange mb-3">Climate Conditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        value={formData.temperature}
                        onChange={(e) => handleInputChange('temperature', e.target.value)}
                        placeholder="e.g., 21"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-50°C</p>
                    </div>
                    <div>
                      <Label htmlFor="rainfall">Rainfall (mm)</Label>
                      <Input
                        id="rainfall"
                        type="number"
                        step="0.1"
                        min="0"
                        max="500"
                        value={formData.rainfall}
                        onChange={(e) => handleInputChange('rainfall', e.target.value)}
                        placeholder="e.g., 203"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Range: 0-500 mm</p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-agro-green hover:bg-agro-green-light"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Get Crop Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle className="flex items-center">
                  <Sprout className="mr-2" size={24} />
                  Recommended Crop
                </CardTitle>
                <CardDescription className="text-green-50">
                  AI-powered analysis results
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Main Recommendation */}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h2 className="text-3xl font-bold agro-green capitalize mb-2">
                      {result.predicted_crop}
                    </h2>
                    <div className={`text-xl font-semibold ${getConfidenceColor(result.confidence)}`}>
                      {(result.confidence * 100).toFixed(1)}% Confidence
                      <span className="text-sm ml-2">({getConfidenceText(result.confidence)})</span>
                    </div>
                  </div>

                  {/* Crop Information */}
                  {result.crop_info && result.crop_info.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold agro-text">Crop Information</h3>
                      <p className="text-sm text-muted-foreground">{result.crop_info.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {result.crop_info.growing_season && (
                          <div>
                            <span className="font-medium">Growing Season:</span>
                            <p className="text-muted-foreground">{result.crop_info.growing_season}</p>
                          </div>
                        )}
                        {result.crop_info.climate && (
                          <div>
                            <span className="font-medium">Climate:</span>
                            <p className="text-muted-foreground">{result.crop_info.climate}</p>
                          </div>
                        )}
                        {result.crop_info.soil_requirements && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Soil Requirements:</span>
                            <p className="text-muted-foreground">{result.crop_info.soil_requirements}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alternative Recommendations */}
                  {result.top_predictions && result.top_predictions.length > 1 && (
                    <div>
                      <h3 className="font-semibold agro-text mb-3">Alternative Recommendations</h3>
                      <div className="space-y-2">
                        {result.top_predictions.slice(0, 3).map(([crop, confidence], index) => (
                          <div key={crop} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="capitalize font-medium">{crop}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-400'}`}
                                  style={{ width: `${confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {(confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Importance */}
                  {result.feature_importance && result.feature_importance.length > 0 && (
                    <div>
                      <h3 className="font-semibold agro-text mb-3">Key Factors Analysis</h3>
                      <div className="space-y-2">
                        {result.feature_importance.slice(0, 5).map(([feature, importance]) => (
                          <div key={feature} className="flex justify-between items-center">
                            <span className="capitalize text-sm">{feature}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full bg-agro-green"
                                  style={{ width: `${importance * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-12">
                                {(importance * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      These recommendations are based on the provided parameters. 
                      Consider local conditions and consult agricultural experts for best results.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Need Help with Parameters?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold agro-green mb-2">Soil Testing Tips:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Get soil tested from agricultural lab</li>
                  <li>• Collect samples from multiple field points</li>
                  <li>• Test at 6-8 inch depth for nutrients</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Climate Data Sources:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Local weather station data</li>
                  <li>• Agricultural extension services</li>
                  <li>• Online weather portals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}