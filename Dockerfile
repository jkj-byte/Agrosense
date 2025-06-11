FROM node:20-slim

WORKDIR /app

# Install Python and required packages
RUN apt-get update && \
    apt-get install -y python3-full python3-pip && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
    python3 -m pip install --no-cache-dir scikit-learn pandas numpy

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 5000

# Set Python environment variables
ENV PYTHONPATH=/usr/bin/python3
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["npm", "start"] 