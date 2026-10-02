@description('Azure region for the deployment.')
param location string = resourceGroup().location

@description('Globally unique Azure Container Registry name.')
param acrName string

@description('App Service plan name.')
param planName string

@description('Linux App Service name.')
param webAppName string

@description('Container image repository, for example tilepos.')
param imageRepository string = 'tilepos'

@description('Immutable image tag to deploy.')
param imageTag string = 'latest'

@description('App Service plan SKU.')
@allowed([
  'B1'
  'P1v3'
  'P2v3'
])
param planSku string = 'B1'

var acrLoginServer = '${acrName}.azurecr.io'
var imageName = '${acrLoginServer}/${imageRepository}:${imageTag}'

resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: planSku
    tier: planSku == 'B1' ? 'Basic' : 'PremiumV3'
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: planSku != 'B1'
      linuxFxVersion: 'DOCKER|${imageName}'
      acrUseManagedIdentityCreds: true
    }
  }
}

output acrLoginServer string = acrLoginServer
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output image string = imageName
