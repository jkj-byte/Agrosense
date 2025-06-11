FROM node:20-slim

WORKDIR /app

# Install Python and create virtual environment
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3-full python3-pip python3-venv && \
    python3 -m venv /opt/venv && \
    chmod -R 777 /opt/venv

# Activate virtual environment and install Python packages
ENV PATH="/opt/venv/bin:$PATH"
RUN . /opt/venv/bin/activate && \
    pip3 install --no-cache-dir --break-system-packages scikit-learn pandas numpy

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
ENV PYTHONPATH=/opt/venv/bin/python
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["npm", "start"] 