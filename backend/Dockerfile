FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install pipenv
RUN pip install pipenv

# Copy Pipfile
COPY Pipfile ./

# Install dependencies
RUN pipenv install --system --deploy --ignore-pipfile || pipenv install --system

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/submissions

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "main.py"]
