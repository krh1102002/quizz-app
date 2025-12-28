$baseUrl = "http://localhost:5000/api"

function Test-Flow {
    try {
        # 1. Login Admin
        Write-Host "🔑 Logging in as Admin..." -ForegroundColor Cyan
        $adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="admin@quiz.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
        
        # Debug
        Write-Host "Login Response Type: $($adminLogin.GetType().Name)"
        Write-Host "Token: $($adminLogin.token)"

        $adminToken = $adminLogin.token
        
        # Debug
        Write-Host "Token: $($adminToken.Substring(0, 10))..."
        
        $authHeader = @{ Authorization = ("Bearer {0}" -f $adminToken.Trim()) }

        # 2. Login User
        Write-Host "🔑 Logging in as User..." -ForegroundColor Cyan
        $userLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="user@quiz.com"; password="user123"} | ConvertTo-Json) -ContentType "application/json"
        $userToken = $userLogin.token
        Write-Host "✅ User Logged In" -ForegroundColor Green

        # 3. Get First Topic
        Write-Host "📂 Fetching Topics..." -ForegroundColor Cyan
        $topics = Invoke-RestMethod -Uri "$baseUrl/topics" -Headers $authHeader
        if (!$topics) { throw "No topics found" }
        $topicId = $topics[0]._id
        Write-Host "✅ Using Topic: $($topics[0].name)" -ForegroundColor Green

        # 4. Create New Quiz
        Write-Host "✨ Creating New Quiz..." -ForegroundColor Cyan
        $quizBody = @{
            title = "E2E Test Quiz"
            description = "Created via automation script"
            topic = $topicId
            difficulty = "medium"
            timeLimit = 600
            quizType = "short"
            questions = @(
                @{
                    question = "What is 2 + 2?"
                    options = @("3", "4", "5", "6")
                    correctAnswer = 1
                    explanation = "Simple arithmetic"
                    points = 10
                },
                @{
                    question = "What is the capital of France?"
                    options = @("Berlin", "Madrid", "London", "Paris")
                    correctAnswer = 3
                    explanation = "Paris is the capital"
                    points = 10
                }
            )
        } | ConvertTo-Json -Depth 5

        $newQuiz = Invoke-RestMethod -Uri "$baseUrl/quizzes" -Method Post -Headers $authHeader -Body $quizBody -ContentType "application/json"
        
        if (!$newQuiz._id) {
           Write-Host "Create Quiz Response: $($newQuiz | ConvertTo-Json -Depth 2)"
           throw "Failed to create quiz"
        }
        Write-Host "✅ Quiz Created: ID $quizId" -ForegroundColor Green

        # 5. User Submits Quiz
        Write-Host "📝 User Submitting Quiz..." -ForegroundColor Cyan
        $answers = @(
            @{ selectedOption = 1 }, # Correct
            @{ selectedOption = 2 }  # Wrong (Correct is 3)
        )
        $submitBody = @{
            quizId = $quizId
            answers = $answers
            timeTaken = 50
        } | ConvertTo-Json -Depth 5

        $result = Invoke-RestMethod -Uri "$baseUrl/attempts" -Method Post -Headers @{Authorization="Bearer $userToken"} -Body $submitBody -ContentType "application/json"
        
        # 6. Verify Results
        Write-Host "`n📊 RESULT VERIFICATION" -ForegroundColor Yellow
        Write-Host "----------------------"
        Write-Host "Score: $($result.attempt.score) / $($result.attempt.totalPoints)"
        Write-Host "Correct Answers: $($result.correctAnswers.Count)"
        
        if ($result.attempt.score -eq 10) {
            Write-Host "✅ TEST PASSED: Score matches expected (10/20)" -ForegroundColor Green
        } else {
            Write-Host "❌ TEST FAILED: Score mismatch" -ForegroundColor Red
        }

    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Response: $($reader.ReadToEnd())"
        }
    }
}

Test-Flow
