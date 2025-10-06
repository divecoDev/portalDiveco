# Guía de Despliegue - Herramienta de Explosión de Materiales

## Resumen

Esta documentación proporciona una guía completa para el despliegue, configuración y mantenimiento de la herramienta de Explosión de Materiales en diferentes entornos.

## Requisitos Previos

### 1. Herramientas Necesarias

#### Desarrollo
```bash
# Node.js (versión 18 o superior)
node --version  # v18.17.0+

# npm (versión 9 o superior)
npm --version   # 9.6.7+

# AWS CLI (versión 2)
aws --version   # aws-cli/2.11.0+

# Azure CLI (versión 2.40 o superior)
az --version    # azure-cli/2.40.0+

# Git
git --version   # git version 2.40.0+
```

#### Herramientas Adicionales
```bash
# AWS Amplify CLI
npm install -g @aws-amplify/cli

# Nuxt CLI
npm install -g nuxi

# Docker (opcional, para contenedores)
docker --version

# Terraform (opcional, para IaC)
terraform --version
```

### 2. Cuentas y Permisos

#### AWS
- Cuenta AWS con permisos de administrador
- Configuración de AWS CLI con credenciales válidas
- Acceso a servicios: Lambda, DynamoDB, S3, CloudFront, API Gateway, Cognito

#### Azure
- Cuenta Azure con suscripción activa
- Configuración de Azure CLI con credenciales válidas
- Acceso a: Data Factory, SQL Server, Blob Storage, Key Vault

#### GitHub
- Repositorio del proyecto
- Acceso a GitHub Actions (para CI/CD)
- Permisos para crear secrets y variables

## Configuración de Entornos

### 1. Variables de Entorno

#### Frontend (.env)
```bash
# Amplify Configuration
NEXT_PUBLIC_AMPLIFY_CONFIG_URL=https://your-api-url/graphql
NEXT_PUBLIC_AMPLIFY_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_AMPLIFY_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_AMPLIFY_USER_POOL_CLIENT_ID=your-client-id

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url
NEXT_PUBLIC_API_KEY=your-api-key

# Environment
NODE_ENV=production
NUXT_PUBLIC_APP_ENV=production
```

#### Backend (Amplify)
```bash
# Azure Configuration
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_DATA_FACTORY_NAME=your-data-factory-name

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Database Configuration
DATABASE_URL=your-database-connection-string

# S3 Configuration
S3_BUCKET_NAME=explosion-materiales-uts
CLOUDFRONT_DISTRIBUTION_ID=E1234567890123
```

### 2. Configuración de AWS

#### Configurar AWS CLI
```bash
aws configure
# AWS Access Key ID: your-access-key
# AWS Secret Access Key: your-secret-key
# Default region name: us-east-1
# Default output format: json
```

#### Configurar Amplify
```bash
amplify configure
# Seleccionar región
# Configurar usuario IAM
# Configurar roles
```

#### Crear Secretos en AWS Secrets Manager
```bash
# Crear secretos para Azure
aws secretsmanager create-secret \
  --name "explosion-materiales/azure-credentials" \
  --description "Azure credentials for Data Factory" \
  --secret-string '{
    "AZURE_TENANT_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "AZURE_CLIENT_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "AZURE_CLIENT_SECRET": "your-client-secret",
    "AZURE_SUBSCRIPTION_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "AZURE_DATA_FACTORY_NAME": "your-data-factory-name"
  }'
```

### 3. Configuración de Azure

#### Configurar Azure CLI
```bash
az login
az account set --subscription "your-subscription-id"
```

#### Crear Service Principal
```bash
az ad sp create-for-rbac \
  --name "explosion-materiales-sp" \
  --role "Data Factory Contributor" \
  --scopes "/subscriptions/your-subscription-id"
```

#### Configurar Data Factory
```bash
# Crear resource group
az group create \
  --name "ADF" \
  --location "East US"

# Crear Data Factory
az datafactory create \
  --name "your-data-factory-name" \
  --resource-group "ADF" \
  --location "East US"
```

## Proceso de Despliegue

### 1. Despliegue del Backend (AWS Amplify)

#### Paso 1: Inicializar Amplify
```bash
cd amplify
amplify init
```

#### Paso 2: Configurar Autenticación
```bash
amplify add auth
# Seleccionar: Email
# Configurar políticas de contraseña
# Habilitar MFA
```

#### Paso 3: Configurar Base de Datos
```bash
amplify add storage
# Seleccionar: DynamoDB
# Configurar esquemas
# Configurar índices globales
```

#### Paso 4: Configurar API
```bash
amplify add api
# Seleccionar: GraphQL
# Configurar esquema
# Configurar resolvers
```

#### Paso 5: Agregar Funciones Lambda
```bash
amplify add function
# Seleccionar: runPipeline
# Configurar permisos IAM
# Configurar variables de entorno

amplify add function
# Seleccionar: getStatusPipeline
# Configurar permisos IAM

amplify add function
# Seleccionar: boomFilesStore
# Configurar permisos S3
```

#### Paso 6: Configurar Storage S3
```bash
amplify add storage
# Seleccionar: S3
# Configurar bucket
# Configurar políticas de acceso
```

#### Paso 7: Configurar CloudFront
```bash
amplify add hosting
# Seleccionar: CloudFront
# Configurar distribución
# Configurar caché
```

#### Paso 8: Desplegar Backend
```bash
amplify push
# Revisar cambios
# Confirmar despliegue
# Esperar completación
```

### 2. Despliegue del Frontend (Nuxt 3)

#### Paso 1: Instalar Dependencias
```bash
cd app
npm install
```

#### Paso 2: Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con valores correctos
```

#### Paso 3: Build de Producción
```bash
npm run build
```

#### Paso 4: Generar Estáticos (si es necesario)
```bash
npm run generate
```

#### Paso 5: Desplegar a AWS S3/CloudFront
```bash
# Configurar AWS CLI
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"
```

### 3. Configuración de Pipelines de Azure Data Factory

#### Paso 1: Importar Pipelines
```bash
# Usar Azure CLI o portal web
az datafactory pipeline create \
  --factory-name "your-data-factory-name" \
  --resource-group "ADF" \
  --name "ExplocionarDesdePortal" \
  --pipeline-json-file "pipelines/ExplocionarDesdePortal.json"
```

#### Paso 2: Configurar Linked Services
```bash
# Configurar conexiones a SAP
# Configurar conexiones a SQL Server
# Configurar conexiones a Blob Storage
```

#### Paso 3: Configurar Datasets
```bash
# Crear datasets para archivos CSV
# Crear datasets para tablas SQL
# Configurar esquemas de datos
```

#### Paso 4: Probar Pipelines
```bash
# Ejecutar pipeline de prueba
# Verificar conectividad
# Validar transformaciones
```

## CI/CD Pipeline

### 1. GitHub Actions

#### Configuración (.github/workflows/deploy.yml)
```yaml
name: Deploy Explosion Materiales

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd app
          npm ci
      
      - name: Run tests
        run: |
          cd app
          npm run test
      
      - name: Run linting
        run: |
          cd app
          npm run lint

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd app
          npm ci
      
      - name: Build frontend
        run: |
          cd app
          npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: app/dist/

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Amplify CLI
        run: npm install -g @aws-amplify/cli
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy backend
        run: |
          cd amplify
          amplify push --yes

  deploy-frontend:
    needs: [build-frontend, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: app/dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync app/dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

#### Secrets de GitHub
```bash
# Configurar secrets en GitHub
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

### 2. Despliegue Manual

#### Script de Despliegue (deploy.sh)
```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue de Explosión de Materiales..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar prerequisitos
check_prerequisites() {
    log "Verificando prerequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
    fi
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI no está instalado"
    fi
    
    # Verificar Amplify CLI
    if ! command -v amplify &> /dev/null; then
        error "Amplify CLI no está instalado"
    fi
    
    log "✅ Prerequisitos verificados"
}

# Desplegar backend
deploy_backend() {
    log "Desplegando backend..."
    
    cd amplify
    
    # Verificar configuración
    if [ ! -f "amplify/backend/amplify-meta.json" ]; then
        error "Backend no está inicializado. Ejecutar 'amplify init' primero"
    fi
    
    # Push cambios
    amplify push --yes
    
    log "✅ Backend desplegado"
    cd ..
}

# Build frontend
build_frontend() {
    log "Construyendo frontend..."
    
    cd app
    
    # Instalar dependencias
    npm ci
    
    # Build
    npm run build
    
    log "✅ Frontend construido"
    cd ..
}

# Desplegar frontend
deploy_frontend() {
    log "Desplegando frontend..."
    
    # Obtener configuración de Amplify
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name amplify-portaldiveco-main \
        --query 'Stacks[0].Outputs[?OutputKey==`HostingBucketName`].OutputValue' \
        --output text)
    
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name amplify-portaldiveco-main \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionID`].OutputValue' \
        --output text)
    
    if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
        error "No se pudo obtener configuración de hosting"
    fi
    
    # Sync a S3
    aws s3 sync app/dist/ s3://$BUCKET_NAME --delete
    
    # Invalidar CloudFront
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*"
    
    log "✅ Frontend desplegado"
}

# Función principal
main() {
    log "Iniciando proceso de despliegue..."
    
    check_prerequisites
    deploy_backend
    build_frontend
    deploy_frontend
    
    log "🎉 Despliegue completado exitosamente!"
}

# Ejecutar función principal
main "$@"
```

#### Uso del Script
```bash
chmod +x deploy.sh
./deploy.sh
```

## Configuración de Entornos

### 1. Desarrollo

#### Configuración Local
```bash
# Clonar repositorio
git clone https://github.com/your-org/portal-diveco.git
cd portal-diveco

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Inicializar Amplify (solo primera vez)
amplify init

# Iniciar servidor de desarrollo
npm run dev
```

#### Base de Datos Local
```bash
# Usar DynamoDB Local
npm install -g dynamodb-local
dynamodb-local --port 8000

# Configurar variables para local
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
export AWS_DEFAULT_REGION=us-east-1
```

### 2. Staging

#### Configuración
```bash
# Crear entorno de staging
amplify env add staging

# Configurar variables específicas de staging
amplify env checkout staging
amplify push
```

#### Variables de Entorno Staging
```bash
NODE_ENV=staging
NUXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_AMPLIFY_CONFIG_URL=https://staging-api-url/graphql
```

### 3. Producción

#### Configuración
```bash
# Crear entorno de producción
amplify env add production

# Configurar variables específicas de producción
amplify env checkout production
amplify push
```

#### Variables de Entorno Producción
```bash
NODE_ENV=production
NUXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_AMPLIFY_CONFIG_URL=https://api.portaldiveco.com/graphql
```

## Monitoreo y Logging

### 1. CloudWatch

#### Configurar Log Groups
```bash
# Crear log groups para funciones Lambda
aws logs create-log-group \
  --log-group-name "/aws/lambda/runPipeline"

aws logs create-log-group \
  --log-group-name "/aws/lambda/getStatusPipeline"

aws logs create-log-group \
  --log-group-name "/aws/lambda/boomFilesStore"
```

#### Configurar Alarmas
```bash
# Crear alarma para errores de Lambda
aws cloudwatch put-metric-alarm \
  --alarm-name "Lambda-Errors" \
  --alarm-description "Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### 2. Application Insights (Azure)

#### Configurar Application Insights
```bash
# Crear Application Insights
az monitor app-insights component create \
  --app "explosion-materiales-insights" \
  --location "East US" \
  --resource-group "ADF"
```

#### Configurar Alertas
```bash
# Crear alerta para errores de Data Factory
az monitor metrics alert create \
  --name "DataFactory-Errors" \
  --resource-group "ADF" \
  --scopes "/subscriptions/your-subscription-id/resourceGroups/ADF/providers/Microsoft.DataFactory/factories/your-data-factory-name" \
  --condition "count 'Microsoft.DataFactory/factories' PipelineFailedRuns > 5" \
  --description "Data Factory pipeline failures"
```

## Mantenimiento

### 1. Actualizaciones de Dependencias

#### Script de Actualización (update-deps.sh)
```bash
#!/bin/bash

echo "🔄 Actualizando dependencias..."

# Frontend
cd app
npm update
npm audit fix
cd ..

# Backend
cd amplify
npm update
npm audit fix
cd ..

echo "✅ Dependencias actualizadas"
```

### 2. Backup de Datos

#### Script de Backup (backup.sh)
```bash
#!/bin/bash

echo "💾 Iniciando backup de datos..."

# Backup de DynamoDB
aws dynamodb create-backup \
  --table-name "Boom" \
  --backup-name "boom-backup-$(date +%Y%m%d)"

# Backup de S3
aws s3 sync s3://explosion-materiales-uts s3://explosion-materiales-backup/$(date +%Y%m%d)

echo "✅ Backup completado"
```

### 3. Limpieza de Recursos

#### Script de Limpieza (cleanup.sh)
```bash
#!/bin/bash

echo "🧹 Limpiando recursos antiguos..."

# Limpiar backups antiguos (más de 30 días)
aws dynamodb list-backups \
  --table-name "Boom" \
  --query 'BackupSummaries[?BackupCreationDateTime<`'$(date -d '30 days ago' -u +%Y-%m-%dT%H:%M:%S.000Z)'`].BackupArn' \
  --output text | xargs -I {} aws dynamodb delete-backup --backup-arn {}

# Limpiar archivos temporales de S3
aws s3 rm s3://explosion-materiales-uts/temp/ --recursive

echo "✅ Limpieza completada"
```

## Troubleshooting

### 1. Problemas Comunes

#### Error de Autenticación AWS
```bash
# Verificar configuración
aws sts get-caller-identity

# Reconfigurar credenciales
aws configure
```

#### Error de Autenticación Azure
```bash
# Verificar login
az account show

# Re-login si es necesario
az login
```

#### Error de Permisos Amplify
```bash
# Verificar roles IAM
aws iam list-roles --query 'Roles[?contains(RoleName, `Amplify`)]'

# Actualizar permisos si es necesario
amplify update auth
```

### 2. Logs y Debugging

#### Ver Logs de Lambda
```bash
# Ver logs de función específica
aws logs tail /aws/lambda/runPipeline --follow

# Ver logs con filtro
aws logs filter-log-events \
  --log-group-name "/aws/lambda/runPipeline" \
  --filter-pattern "ERROR"
```

#### Ver Logs de Data Factory
```bash
# Ver ejecuciones de pipeline
az datafactory pipeline-run query-by-factory \
  --factory-name "your-data-factory-name" \
  --resource-group "ADF" \
  --last-updated-after "2024-01-01T00:00:00Z"
```

### 3. Rollback

#### Rollback de Backend
```bash
# Ver historial de despliegues
amplify env list

# Rollback a versión anterior
amplify env checkout previous-version
amplify push
```

#### Rollback de Frontend
```bash
# Revertir a commit anterior
git revert HEAD

# Re-desplegar
./deploy.sh
```

## Seguridad

### 1. Configuración de Seguridad

#### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction",
        "dynamodb:Query",
        "dynamodb:Scan",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:123456789012:function:runPipeline",
        "arn:aws:dynamodb:us-east-1:123456789012:table/Boom",
        "arn:aws:s3:::explosion-materiales-uts/*"
      ]
    }
  ]
}
```

#### CORS Configuration
```json
{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "POST", "OPTIONS"],
  "AllowedOrigins": [
    "https://portaldiveco.com",
    "https://staging.portaldiveco.com"
  ],
  "MaxAgeSeconds": 3600
}
```

### 2. Encriptación

#### Encriptación en Tránsito
- HTTPS obligatorio para todas las comunicaciones
- TLS 1.2+ para conexiones API
- Encriptación de datos en tránsito entre servicios

#### Encriptación en Reposo
- Encriptación automática de DynamoDB
- Encriptación de S3 con KMS
- Encriptación de secretos en AWS Secrets Manager

---

*Esta documentación proporciona una guía completa para el despliegue y mantenimiento de la herramienta de Explosión de Materiales en diferentes entornos.*
