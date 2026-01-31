# Start All DLMS Services with Environment Variables temporarily set for the process
# INFO: This script sets secrets for the session. DO NOT COMMIT THIS FILE TO GIT.

$env:TIDB_URL = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?useSSL=true&requireSSL=true&verifyServerCertificate=true&serverSslCert=classpath:isrgrootx1.pem&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:TIDB_USER = "2AN1ZiqRicrFjYE.root"
$env:TIDB_PASSWORD = "1RTq6lH9yoeBjyfj"

$env:COURSE_MONGODB_URI = "mongodb+srv://sanjayadminmongo:sanjaymongopas@sanjaymongodb.5v1sffe.mongodb.net/course_service?appName=SanjayMongoDb"
$env:MEDIA_MONGODB_URI = "mongodb+srv://sanjayadminmongo:sanjaymongopas@sanjaymongodb.5v1sffe.mongodb.net/media_services?appName=SanjayMongoDb"

# Pinata IPFS Keys (Updated and Verified)
$env:PINATA_API_KEY = "23c8c69fe5e2e82067c9"
$env:PINATA_SECRET_API_KEY = "d9444a1b4a7dd31047154624e38d2740b321b8ea5c249b7b66a14375f73fd8d1"

Write-Host "Starting Eureka Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd EurekaServer; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 5

Write-Host "Starting API Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Gateway; .\mvnw.cmd spring-boot:run"

Write-Host "Starting AuthService (TiDB)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd AuthService; .\mvnw.cmd spring-boot:run"

Write-Host "Starting Enrollment Service (TiDB)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd enrollment-service; .\mvnw.cmd spring-boot:run"

Write-Host "Starting Course Service (Atlas)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd course-service; .\mvnw.cmd spring-boot:run"

Write-Host "Starting Media Service (Atlas)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd MediaService; .\mvnw.cmd spring-boot:run"

Write-Host "Starting Chatbot Service (FastAPI)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd fast-api; uvicorn main:app --reload --port 8000"

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd DLMSFrontend; npm start"

Write-Host "All start commands issued. Please check individual windows for logs."
