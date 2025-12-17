# Local Application Test Script
# Tests if the application code is properly configured

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         LOCAL APPLICATION CONFIGURATION TEST                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test 1: Check backend directory structure
Write-Host "Test 1: Backend Directory Structure" -ForegroundColor Yellow
if (Test-Path "backend/app/main.py") {
    Write-Host "  ✓ backend/app/main.py exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ✗ backend/app/main.py missing" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Check frontend directory structure
Write-Host ""
Write-Host "Test 2: Frontend Directory Structure" -ForegroundColor Yellow
if (Test-Path "frontend/src/main.tsx") {
    Write-Host "  ✓ frontend/src/main.tsx exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ✗ frontend/src/main.tsx missing" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Check Dockerfiles
Write-Host ""
Write-Host "Test 3: Docker Configuration" -ForegroundColor Yellow
if (Test-Path "frontend/Dockerfile") {
    $frontendDockerContent = Get-Content "frontend/Dockerfile" -Raw
    if ($frontendDockerContent -match "EXPOSE 3001") {
        Write-Host "  ✓ frontend/Dockerfile configured for port 3001" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ frontend/Dockerfile port configuration incorrect" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ frontend/Dockerfile missing" -ForegroundColor Red
    $testsFailed++
}

if (Test-Path "backend/Dockerfile") {
    $backendDockerContent = Get-Content "backend/Dockerfile" -Raw
    if ($backendDockerContent -match "EXPOSE 80") {
        Write-Host "  ✓ backend/Dockerfile configured for port 80" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ backend/Dockerfile port configuration incorrect" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ backend/Dockerfile missing" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Check buildspec files
Write-Host ""
Write-Host "Test 4: CI/CD Configuration" -ForegroundColor Yellow
if (Test-Path "frontend/buildspec.yml") {
    $frontendBuildspec = Get-Content "frontend/buildspec.yml" -Raw
    if ($frontendBuildspec -match "cd frontend") {
        Write-Host "  ✓ frontend/buildspec.yml has 'cd frontend' command" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ frontend/buildspec.yml missing 'cd frontend' command" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ frontend/buildspec.yml missing" -ForegroundColor Red
    $testsFailed++
}

if (Test-Path "backend/buildspec.yml") {
    $backendBuildspec = Get-Content "backend/buildspec.yml" -Raw
    if ($backendBuildspec -match "cd backend") {
        Write-Host "  ✓ backend/buildspec.yml has 'cd backend' command" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ backend/buildspec.yml missing 'cd backend' command" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ backend/buildspec.yml missing" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Check requirements.txt
Write-Host ""
Write-Host "Test 5: Backend Dependencies" -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    $requirements = Get-Content "backend/requirements.txt" -Raw
    if ($requirements -match "gunicorn") {
        Write-Host "  ✓ gunicorn found in requirements.txt" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ gunicorn missing from requirements.txt" -ForegroundColor Red
        $testsFailed++
    }
    if ($requirements -match "fastapi") {
        Write-Host "  ✓ fastapi found in requirements.txt" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ fastapi missing from requirements.txt" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ backend/requirements.txt missing" -ForegroundColor Red
    $testsFailed += 2
}

# Test 6: Check package.json
Write-Host ""
Write-Host "Test 6: Frontend Dependencies" -ForegroundColor Yellow
if (Test-Path "frontend/package.json") {
    $packageJson = Get-Content "frontend/package.json" -Raw
    if ($packageJson -match "react") {
        Write-Host "  ✓ react found in package.json" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ react missing from package.json" -ForegroundColor Red
        $testsFailed++
    }
    if ($packageJson -match "vite") {
        Write-Host "  ✓ vite found in package.json" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ vite missing from package.json" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ frontend/package.json missing" -ForegroundColor Red
    $testsFailed += 2
}

# Test 7: Check nginx configuration
Write-Host ""
Write-Host "Test 7: Nginx Configuration" -ForegroundColor Yellow
if (Test-Path "frontend/nginx.conf") {
    $nginxConf = Get-Content "frontend/nginx.conf" -Raw
    if ($nginxConf -match "listen 3001") {
        Write-Host "  ✓ nginx configured to listen on port 3001" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ nginx port configuration incorrect" -ForegroundColor Red
        $testsFailed++
    }
    if ($nginxConf -match "location /health") {
        Write-Host "  ✓ nginx health check endpoint configured" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ nginx health check endpoint missing" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ frontend/nginx.conf missing" -ForegroundColor Red
    $testsFailed += 2
}

# Test 8: Check health endpoints in backend
Write-Host ""
Write-Host "Test 8: Backend Health Endpoints" -ForegroundColor Yellow
if (Test-Path "backend/app/main.py") {
    $mainPy = Get-Content "backend/app/main.py" -Raw
    if ($mainPy -match "/health") {
        Write-Host "  ✓ /health endpoint found in main.py" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ /health endpoint missing from main.py" -ForegroundColor Red
        $testsFailed++
    }
    if ($mainPy -match "/health/live") {
        Write-Host "  ✓ /health/live endpoint found in main.py" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ /health/live endpoint missing from main.py" -ForegroundColor Red
        $testsFailed++
    }
    if ($mainPy -match "/health/ready") {
        Write-Host "  ✓ /health/ready endpoint found in main.py" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ /health/ready endpoint missing from main.py" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ✗ backend/app/main.py missing" -ForegroundColor Red
    $testsFailed += 3
}

# Test 9: Check .dockerignore files
Write-Host ""
Write-Host "Test 9: Docker Build Optimization" -ForegroundColor Yellow
if (Test-Path "frontend/.dockerignore") {
    Write-Host "  ✓ frontend/.dockerignore exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ✗ frontend/.dockerignore missing" -ForegroundColor Red
    $testsFailed++
}

if (Test-Path "backend/.dockerignore") {
    Write-Host "  ✓ backend/.dockerignore exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ✗ backend/.dockerignore missing" -ForegroundColor Red
    $testsFailed++
}

# Test 10: Check documentation
Write-Host ""
Write-Host "Test 10: Documentation" -ForegroundColor Yellow
$docs = @("DEPLOYMENT_GUIDE.md", "APPLICATION_ARCHITECTURE.md", "DEPLOYMENT_CHECKLIST.md", "DEPLOYMENT_READINESS_REPORT.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "  ✓ $doc exists" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ✗ $doc missing" -ForegroundColor Red
        $testsFailed++
    }
}

# Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      TEST SUMMARY                             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

$totalTests = $testsPassed + $testsFailed
$successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)

Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 95) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✓ ALL TESTS PASSED - CODE IS PROPERLY CONFIGURED!           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your application is properly configured and ready for deployment!" -ForegroundColor Green
    Write-Host "To test locally, follow the LOCAL_TESTING_GUIDE.md" -ForegroundColor Cyan
} else {
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ✗ SOME TESTS FAILED - PLEASE FIX THE ISSUES ABOVE           ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
}

Write-Host ""
Write-Host "Note: This script tests configuration files only." -ForegroundColor Yellow
Write-Host "To test the running application, start the backend and frontend" -ForegroundColor Yellow
Write-Host "servers and follow the LOCAL_TESTING_GUIDE.md" -ForegroundColor Yellow

