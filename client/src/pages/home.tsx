import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Microscope, TrendingUp, Brain, Smartphone, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="agro-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with agricultural field image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        <div className="absolute inset-0 hero-gradient opacity-80" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Smart Agriculture for{' '}
            <span className="text-green-300">Tomorrow</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Empowering farmers with AI-powered plant disease detection and intelligent crop recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/disease-detection">
              <Button size="lg" className="bg-agro-green hover:bg-agro-green/90 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all shadow-lg">
                <Microscope className="mr-2 h-5 w-5" />
                Detect Plant Diseases
              </Button>
            </Link>
            <Link href="/crop-recommendations">
              <Button size="lg" className="bg-agro-orange hover:bg-agro-orange/90 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all shadow-lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Get Crop Recommendations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Plant Disease Detection Card */}
          <Card className="feature-card overflow-hidden hover:shadow-2xl">
            <div 
              className="h-64 bg-gradient-to-br from-agro-green to-agro-green-light relative overflow-hidden"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-agro-green/60 to-transparent" />
            </div>
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="bg-agro-green/10 p-3 rounded-full mr-4">
                  <Microscope className="text-agro-green h-6 w-6" />
                </div>
                <CardTitle className="text-2xl agro-text">Plant Disease Detection</CardTitle>
              </div>
              <CardDescription className="text-gray-600 leading-relaxed">
                Upload photos of your plants and get instant AI-powered disease identification with detailed treatment recommendations. Our advanced system recognizes over 30,000 plant species and diseases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-green rounded-full mr-3" />
                  <span>Instant disease identification</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-green rounded-full mr-3" />
                  <span>Treatment recommendations</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-green rounded-full mr-3" />
                  <span>Prevention strategies</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-green rounded-full mr-3" />
                  <span>Expert-verified results</span>
                </div>
              </div>
              <Link href="/disease-detection">
                <Button className="w-full bg-agro-green hover:bg-agro-green/90 text-white">
                  Start Detection
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Crop Recommendations Card */}
          <Card className="feature-card overflow-hidden hover:shadow-2xl">
            <div 
              className="h-64 bg-gradient-to-br from-agro-orange to-yellow-500 relative overflow-hidden"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-agro-orange/60 to-transparent" />
            </div>
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="bg-agro-orange/10 p-3 rounded-full mr-4">
                  <TrendingUp className="text-agro-orange h-6 w-6" />
                </div>
                <CardTitle className="text-2xl agro-text">Crop Recommendations</CardTitle>
              </div>
              <CardDescription className="text-gray-600 leading-relaxed">
                Get personalized crop suggestions based on your soil conditions, climate, and farming parameters. Our machine learning model analyzes multiple factors to optimize your harvest potential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-orange rounded-full mr-3" />
                  <span>Soil-based recommendations</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-orange rounded-full mr-3" />
                  <span>Climate optimization</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-orange rounded-full mr-3" />
                  <span>Yield predictions</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-agro-orange rounded-full mr-3" />
                  <span>Market analysis integration</span>
                </div>
              </div>
              <Link href="/crop-recommendations">
                <Button className="w-full bg-agro-orange hover:bg-agro-orange/90 text-white">
                  Get Recommendations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold agro-text mb-4">Why Choose AgroSense?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Advanced agricultural technology meets practical farming solutions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-agro-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-agro-green h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 agro-text">AI-Powered Analysis</h3>
              <p className="text-gray-600">Advanced machine learning algorithms provide accurate disease identification and crop optimization</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-agro-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-agro-orange h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 agro-text">Mobile Ready</h3>
              <p className="text-gray-600">Access powerful agricultural insights from any device, anywhere in the field</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-agro-green-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-agro-green-light h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 agro-text">Expert Support</h3>
              <p className="text-gray-600">Backed by agricultural experts and continuously updated with latest research</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
