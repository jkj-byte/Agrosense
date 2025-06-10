<<<<<<< HEAD
# AgroSense 🌱

An intelligent agricultural platform that combines AI-powered plant disease detection and smart crop recommendations to help farmers make data-driven decisions.

## Features 🚀

### 1. Plant Disease Detection
- Upload plant images for instant disease identification
- Powered by Plant.ID API with support for 30,000+ plant species
- Get detailed disease information and treatment recommendations
- Prevention strategies for better plant health

### 2. Crop Recommendations
- AI-powered crop suggestions based on soil and climate data
- Analysis of key parameters:
  - Soil nutrients (N, P, K)
  - Temperature
  - Rainfall
  - pH levels
  - Humidity
- Confidence scores for recommendations
- Alternative crop suggestions
- Feature importance analysis

## Tech Stack 💻

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- Vite as build tool

### Backend
- Node.js server
- Python for ML models
- Plant.ID API integration
- Machine Learning models for crop recommendations

## Getting Started 🏁

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/agrosense.git
cd agrosense
```

2. Install frontend dependencies
```bash
npm install
```

3. Install Python dependencies
```bash
cd server
pip install -r requirements.txt
```

4. Set up environment variables
Create a `.env` file in the root directory:
```env
PLANT_ID_API_KEY=your_api_key_here
```

### Running the Application

1. Start the frontend development server
```bash
npm run dev
```

2. Start the backend server (in a separate terminal)
```bash
cd server
npm run start
```

The application will be available at `http://localhost:5173`

## Project Structure 📁

```
agrosense/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── ...
├── server/              # Backend Node.js server
│   ├── routes/         # API routes
│   ├── ml_model.py     # Machine learning model
│   └── ...
├── shared/             # Shared types and utilities
└── uploads/           # Temporary storage for uploaded images
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Plant.ID API for plant disease detection
- Shadcn/ui for beautiful components
- All contributors who helped with the project 
=======
# Agrosense
"AI-powered agricultural platform that combines plant disease detection and crop recommendation systems. Features Plant.ID integration for disease identification across 30,000+ plant species and ML-based crop recommendations using soil and climate data."
>>>>>>> ee45bb97a6a192b1f5d5c73dc868d1ca6de379c5
