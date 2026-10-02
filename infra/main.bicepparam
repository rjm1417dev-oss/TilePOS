using './main.bicep'

param acrName = readEnvironmentVariable('AZURE_ACR_NAME')
param planName = readEnvironmentVariable('AZURE_PLAN_NAME')
param webAppName = readEnvironmentVariable('AZURE_WEBAPP_NAME')
param location = readEnvironmentVariable('AZURE_LOCATION', 'centralindia')
param imageRepository = readEnvironmentVariable('AZURE_IMAGE_REPOSITORY', 'tilepos')
param imageTag = readEnvironmentVariable('IMAGE_TAG', 'latest')