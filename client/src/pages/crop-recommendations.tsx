import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, DollarSign, Clock, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  farmSize: z.number().min(1, "Farm size must be greater than 0"),
  soilType: z.enum(["clay", "sandy", "loam", "silt"], {
    required_error: "Please select a soil type",
  }),
  budget: z.enum(["low", "medium", "high"], {
    required_error: "Please select a budget range",
  }),
  experience: z.enum(["beginner", "intermediate", "expert"], {
    required_error: "Please select your experience level",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CropRecommendation {
  name: string;
  suitability: number;
  yield: string;
  season: string;
  profit: string;
  description: string;
}

interface RecommendationResult {
  id: number;
  recommendations: CropRecommendation[];
}

export default function CropRecommendations() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      farmSize: 0,
      soilType: undefined,
      budget: undefined,
      experience: undefined,
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/crop-recommendations', data);
      return response.json();
    },
    onSuccess: (data: RecommendationResult) => {
      setResult(data);
      toast({
        title: "Recommendations Generated",
        description: "Your crop recommendations are ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    generateRecommendationsMutation.mutate(data);
  };

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 90) return "bg-green-500";
    if (suitability >= 75) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getCropImage = (cropName: string) => {
    const images: Record<string, string> = {
      "Corn": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      "Soybeans": "https://images.unsplash.com/photo-1606868306217-dbf5046868d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      "Wheat": "https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      "Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    };
    return images[cropName] || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  };

  return (
    <div className="min-h-screen agro-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold agro-text mb-4">Crop Recommendations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized crop suggestions based on your location, soil conditions, and farming goals
          </p>
        </div>

        {/* Form Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl agro-text">Farm Information</CardTitle>
            <CardDescription>
              Please provide details about your farm to get the most accurate recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="farmSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm Size (acres)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 50" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="loam">Loam</SelectItem>
                            <SelectItem value="silt">Silt</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low ($1,000 - $5,000)</SelectItem>
                            <SelectItem value="medium">Medium ($5,000 - $15,000)</SelectItem>
                            <SelectItem value="high">High ($15,000+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farming Experience</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <label htmlFor="beginner">Beginner</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <label htmlFor="intermediate">Intermediate</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="expert" id="expert" />
                            <label htmlFor="expert">Expert</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center">
                  <Button 
                    type="submit"
                    className="bg-agro-orange hover:bg-agro-orange/90 text-white px-8 py-4 font-semibold transform hover:scale-105 transition-all shadow-lg"
                    disabled={generateRecommendationsMutation.isPending}
                  >
                    {generateRecommendationsMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Generate Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold agro-text mb-4">Recommended Crops for Your Farm</h2>
              <p className="text-gray-600">Based on your farm parameters, here are the best crop options</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.recommendations.map((crop, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={getCropImage(crop.name)} 
                      alt={`${crop.name} crop field`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getSuitabilityColor(crop.suitability)} text-white px-3 py-1 text-sm font-semibold`}>
                        {crop.suitability}% Match
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold agro-text mb-2">{crop.name}</h3>
                    <p className="text-gray-600 mb-4">{crop.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Expected Yield:
                        </span>
                        <span className="text-sm font-semibold">{crop.yield}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Growing Season:
                        </span>
                        <span className="text-sm font-semibold">{crop.season}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Profit Potential:
                        </span>
                        <span className="text-sm font-semibold text-green-600">{crop.profit}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-agro-green hover:bg-agro-green/90 text-white">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-x-4">
              <Button 
                className="bg-agro-orange hover:bg-agro-orange/90 text-white px-8 py-3 font-semibold"
                onClick={() => {
                  toast({
                    title: "Farming Plan Generated",
                    description: "Your personalized farming plan is ready for download.",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Farming Plan
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3 font-semibold"
                onClick={() => setResult(null)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modify Parameters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
