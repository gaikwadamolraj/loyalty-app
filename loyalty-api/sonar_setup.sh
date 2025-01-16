#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Define variables
SONARQUBE_VERSION="latest"
SONARQUBE_CONTAINER_NAME="sonarqube"
SONARQUBE_PORT="9000"
SONARQUBE_URL="http://localhost:${SONARQUBE_PORT}"
SONARQUBE_LOGIN="admin"
SONARQUBE_PASSWORD="admin"
PROJECT_KEY="my_project"
SOURCE_DIR="."
EXCLUSIONS="**/node_modules/**,**/dist/**,**/*.test.js,**/ignored-directory/**"

# Pull the latest SonarQube Docker image
echo "Pulling SonarQube Docker image..."
docker pull sonarqube:${SONARQUBE_VERSION}

# Run SonarQube container
echo "Running SonarQube container..."
docker run -d --name ${SONARQUBE_CONTAINER_NAME} -p ${SONARQUBE_PORT}:9000 sonarqube:${SONARQUBE_VERSION}

# Wait for SonarQube to start
echo "Waiting for SonarQube to start..."
until curl -s ${SONARQUBE_URL} > /dev/null; do
    sleep 5
    echo "Waiting..."
done
echo "SonarQube is up and running at ${SONARQUBE_URL}"

# Check if SonarScanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    echo "SonarScanner is not installed. Installing SonarScanner..."
    brew install sonar-scanner
fi

# Create sonar-project.properties file
echo "Creating sonar-project.properties file..."
cat <<EOL > sonar-project.properties
# Project identification
sonar.projectKey=${PROJECT_KEY}
sonar.projectName=My Project
sonar.projectVersion=1.0

# Source directories
sonar.sources=${SOURCE_DIR}

# Exclusions
sonar.exclusions=${EXCLUSIONS}

# SonarQube server details
sonar.host.url=${SONARQUBE_URL}
sonar.login=${SONARQUBE_LOGIN}
sonar.password=${SONARQUBE_PASSWORD}
EOL

# Run SonarScanner
echo "Running SonarScanner..."
sonar-scanner

echo "SonarQube scan completed."
