// ==========================================================
// CORE GAME SCRIPT - STATE, NAVIGATION, UTILITIES
// ==========================================================

// Game Configuration
const TOTAL_QUESTIONS = 10;
const TOTAL_TIME = 600; // 10 minutes in seconds
const POINTS_PER_CORRECT = 10;

// Level Definitions
const LEVELS = [
    { id: 1, range: "1 sampai 5", min: 1, max: 5 },
    { id: 2, range: "1 sampai  10", min: 1, max: 10 },
    { id: 3, range: "1 sampai  20", min: 1, max: 20 },
    { id: 4, range: "11 sampai  50", min: 11, max: 50 },
    { id: 5, range: "21 sampai  100", min: 21, max: 100 },
    { id: 6, range: "50 sampai  200", min: 50, max: 200 },
    { id: 7, range: "100 sampai  500", min: 100, max: 500 },
    { id: 8, range: "200 sampai  1.000", min: 200, max: 1000 },
    { id: 9, range: "500 sampai  5.000", min: 500, max: 5000 },
    { id: 10, range: "1.000 sampai  10.000", min: 1000, max: 10000 }
];

// Game State
const gameState = {
    // Navigation
    currentScreen: 'menu',
    
    // Selection
    selectedOperation: null,
    selectedLevel: null,
    
    // Game Progress
    score: 0,
    currentQuestion: 1,
    timeLeft: TOTAL_TIME,
    correctAnswers: 0,
    selectedAnswers: [],
    
    // Game Status
    isPlaying: false,
    soundEnabled: true,
    timerInterval: null
};

// Operations Registry (akan diisi oleh module operations)
window.gameOperations = window.gameOperations || {};

// ==========================================================
// A. SCREEN MANAGEMENT - PERBAIKAN UTAMA DISINI
// ==========================================================

let navigationTimeout = null;

function showScreen(screenId) {
    console.log(`🔄 Switching to: ${screenId}`);
    
    // Cancel pending navigation
    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
        navigationTimeout = null;
    }
    
    // Update game state
    gameState.currentScreen = screenId.replace('Screen', '');
    
    // Hide all screens dengan animasi yang lebih smooth
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.classList.add('fading-out');
            setTimeout(() => {
                screen.classList.remove('active', 'fading-out');
            }, 150);
        } else {
            screen.classList.remove('active');
        }
    });
    
    // Show requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        // Delay sedikit untuk animasi
        setTimeout(() => {
            targetScreen.classList.add('active');
            console.log(`✅ ${screenId} is now active`);
            
            // Set focus untuk accessibility
            const firstFocusable = targetScreen.querySelector('button, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 160);
    } else {
        console.error(`❌ ${screenId} not found in DOM!`);
        showScreen('menuScreen'); // Fallback
    }
}

// PERBAIKAN: Fungsi goBackToLevelSelection diperbaiki untuk TIDAK reset operation
function goBackToLevelSelection() {
    console.log("🔙 goBackToLevelSelection() called");
    
    // Clear semua timeout dan interval
    clearInterval(gameState.timerInterval);
    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
        navigationTimeout = null;
    }
    if (window.nextQuestionTimeout) {
        clearTimeout(window.nextQuestionTimeout);
        window.nextQuestionTimeout = null;
    }
    
    gameState.isPlaying = false;
    gameState.timerInterval = null;
    
    // Reset level selection saja, JANGAN reset operation
    resetSelections('level'); // PERBAIKAN: Hanya reset level
    
    // Tampilkan level screen
    showScreen('levelScreen');
    
    // Setelah screen loaded, update title dengan operation yang benar
    setTimeout(() => {
        if (gameState.selectedOperation) {
            updateOperationTitleForLevelScreen(gameState.selectedOperation);
        }
    }, 100);
    
    console.log("✅ Back to level selection successful");
}

// PERBAIKAN: Fungsi goBackToMenu untuk reset semua
function goBackToMenu() {
    console.log("🏠 goBackToMenu() called");
    
    // Clear semua timeout dan interval
    clearInterval(gameState.timerInterval);
    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
        navigationTimeout = null;
    }
    if (window.nextQuestionTimeout) {
        clearTimeout(window.nextQuestionTimeout);
        window.nextQuestionTimeout = null;
    }
    
    gameState.isPlaying = false;
    gameState.timerInterval = null;
    
    // Reset state lebih lengkap
    resetGameState();
    resetSelections('all'); // Reset semua
    
    showScreen('menuScreen');
    console.log("✅ Back to menu successful");
}

// PERBAIKAN: Fungsi resetSelections dengan parameter
function resetSelections(type = 'all') {
    console.log(`🔄 resetSelections(${type}) called`);
    
    if (type === 'all' || type === 'level') {
        // Reset UI selections untuk level
        document.querySelectorAll('.level-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Reset state level
        gameState.selectedLevel = null;
        console.log("✅ Level selection reset");
    }
    
    if (type === 'all') {
        // Reset UI selections untuk operation (hanya jika reset all)
        document.querySelectorAll('.operation-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Reset state operation
        gameState.selectedOperation = null;
        console.log("✅ Operation selection reset");
    }
}

// PERBAIKAN: Fungsi baru untuk update title di level screen
function updateOperationTitleForLevelScreen(operationId) {
    const titleElement = document.getElementById('selectedOperationTitle');
    const headerElement = document.querySelector('#levelScreen .screen-header h1');
    
    if (titleElement) {
        const operation = window.gameOperations[operationId];
        const operationName = operation?.name || getOperationNameFromId(operationId);
        titleElement.textContent = operationName;
        console.log(`✅ Updated level screen title to: ${operationName}`);
    }
    
    if (headerElement) {
        const operation = window.gameOperations[operationId];
        const operationName = operation?.name || getOperationNameFromId(operationId);
        headerElement.textContent = `Pilih Level - ${operationName}`;
    }
    
    // Simpan operation di state
    gameState.selectedOperation = operationId;
    console.log(`🔧 Selected operation restored: ${operationId}`);
}

function resetGameState() {
    // Reset semua state game ke default
    gameState.score = 0;
    gameState.currentQuestion = 1;
    gameState.timeLeft = TOTAL_TIME;
    gameState.correctAnswers = 0;
    gameState.selectedAnswers = [];
    gameState.isPlaying = false;
    gameState.currentQuestionData = null;
}

// ==========================================================
// B. GAME FLOW
// ==========================================================

function selectOperationInMenu(operationId) {
    console.log(`🎮 SELECT OPERATION: ${operationId}`);
    console.log(`   Type of operationId:`, typeof operationId);
    console.log(`   Value of operationId:`, operationId);
    
    // Debug 1: Cek apakah operation terdaftar
    console.log(`   Operation registered?`, !!window.gameOperations[operationId]);
    console.log(`   All registered operations:`, Object.keys(window.gameOperations));
    
    if (!window.gameOperations[operationId]) {
        console.error(`❌ Operation ${operationId} not registered`);
        console.error(`   Looking for: "${operationId}"`);
        console.error(`   Available:`, Object.keys(window.gameOperations));
        playSound('wrong');
        return;
    }
    
    playSound('click');
    
    // Debug 2: Reset previous selection
    console.log(`   Resetting previous selection...`);
    const allCards = document.querySelectorAll('#menuScreen .operation-card');
    console.log(`   Found ${allCards.length} cards total`);
    
    allCards.forEach((card, index) => {
        if (card.classList.contains('selected')) {
            console.log(`   Card ${index} was selected:`, card.dataset.operation);
            card.classList.remove('selected');
            card.classList.add('deselecting');
            setTimeout(() => {
                card.classList.remove('deselecting');
            }, 200);
        }
    });
    
    // Debug 3: Cari card yang diklik
    console.log(`   Looking for card with data-operation="${operationId}"`);
    const selector = `#menuScreen [data-operation="${operationId}"]`;
    console.log(`   Selector: "${selector}"`);
    
    const selectedCard = document.querySelector(selector);
    
    if (!selectedCard) {
        console.error(`❌ Card with data-operation="${operationId}" not found!`);
        console.error(`   Available cards:`, Array.from(document.querySelectorAll('#menuScreen .operation-card')).map(c => c.dataset.operation));
        return;
    }
    
    console.log(`   Found card:`, selectedCard);
    console.log(`   Card dataset:`, selectedCard.dataset);
    
    selectedCard.classList.add('selected');
    gameState.selectedOperation = operationId;
    
    // Get operation name safely
    const operation = window.gameOperations[operationId];
    const operationName = operation?.name || getOperationNameFromId(operationId);
    
    // Update operation title
    updateOperationTitle(operationName);
    
    // PERUBAHAN: Buat ulang level cards berdasarkan operasi yang dipilih
    setTimeout(() => {
        console.log(`   Creating level cards for operation: ${operationId}`);
        createLevelCards();
        
        // Update title di level screen juga
        if (gameState.selectedOperation) {
            updateOperationTitleForLevelScreen(gameState.selectedOperation);
        }
    }, 100);
    
    // Switch to level screen dengan delay
    if (navigationTimeout) clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
        console.log(`   Switching to level screen...`);
        showScreen('levelScreen');
        navigationTimeout = null;
    }, 350);
}

function getOperationNameFromId(operationId) {
    const nameMap = {
        'hitung_buah': 'Menghitung Buah',
        'hitung_hewan': 'Menghitung Hewan',
        'hitung_benda': 'Menghitung Benda',
        'penjumlahan_2': 'Penjumlahan 2 Bilangan',
        'pengurangan_2': 'Pengurangan 2 Bilangan',
        'perkalian_2': 'Perkalian 2 Bilangan',
        'pembagian_2': 'Pembagian 2 Bilangan',
        'penjumlahan_3': 'Penjumlahan 3 Bilangan',
        'pengurangan_3': 'Pengurangan 3 Bilangan',
        'campuran_plus_minus': 'Campuran + & -',
        'campuran_kali_bagi': 'Campuran × & ÷',
        'campuran_semua': 'Campuran Semua'
    };
    return nameMap[operationId] || operationId;
}

function updateOperationTitle(operationName) {
    const titleElement = document.getElementById('selectedOperationTitle');
    const headerElement = document.querySelector('#levelScreen .screen-header h1');
    
    if (titleElement) {
        titleElement.textContent = operationName;
        console.log(`✅ Updated title to: ${operationName}`);
    }
    
    // Also update header if exists
    if (headerElement) {
        headerElement.textContent = `Pilih Level - ${operationName}`;
    }
}

function selectLevel(levelId) {
    console.log("🎯 ========== selectLevel() CALLED ==========");
    console.log("   levelId:", levelId);
    console.log("   Selected Operation:", gameState.selectedOperation);
    
    if (!gameState.selectedOperation) {
        console.error("❌ No operation selected! Returning to menu.");
        showScreen('menuScreen');
        return;
    }
    
    const levelIdNum = parseInt(levelId, 10);
    console.log("   Parsed levelId:", levelIdNum);
    
    // Cari level dari LEVELS array
    const level = LEVELS.find(l => l.id === levelIdNum);
    if (!level) {
        console.error(`❌ Level ${levelIdNum} not found in LEVELS`);
        console.log("   Available LEVELS:", LEVELS.map(l => l.id));
        return;
    }
    
    console.log("   Found level:", level);
    
    // Update gameState
    gameState.selectedLevel = level;
    
    // Update UI selection
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-level-id="${levelIdNum}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        playSound('click');
    }
    
    console.log("✅ Level selected:", gameState.selectedLevel);
    
    // Debug: Cek operation module
    const operation = window.gameOperations[gameState.selectedOperation];
    console.log("🔍 Operation module check:");
    console.log("   Operation ID:", gameState.selectedOperation);
    console.log("   Module exists:", !!operation);
    console.log("   Has generateQuestion:", operation ? typeof operation.generateQuestion : 'N/A');
    
    if (!operation || typeof operation.generateQuestion !== 'function') {
        console.error("❌ Operation module invalid or missing generateQuestion!");
        alert(`Modul operasi "${gameState.selectedOperation}" tidak valid. Pilih operasi lain.`);
        showScreen('menuScreen');
        return;
    }
    
    // Start game dengan delay
    setTimeout(() => {
        console.log("⏰ Calling startGame()...");
        startGame();
    }, 500);
}

function startGame() {
    console.log("🎮 ========== startGame() CALLED ==========");
    console.log("   Selected Operation:", gameState.selectedOperation);
    console.log("   Selected Level:", gameState.selectedLevel);
    console.log("   Operation module:", window.gameOperations[gameState.selectedOperation]);
    
    if (!gameState.selectedLevel || !gameState.selectedOperation) {
        console.error("❌ Cannot start: Missing level or operation");
        console.error("   Level:", gameState.selectedLevel);
        console.error("   Operation:", gameState.selectedOperation);
        
        // Force back to menu
        setTimeout(() => {
            showScreen('menuScreen');
        }, 100);
        return;
    }
    
    const operation = window.gameOperations[gameState.selectedOperation];
    if (!operation) {
        console.error(`❌ Operation ${gameState.selectedOperation} not found in registry!`);
        console.log("   Available operations:", Object.keys(window.gameOperations));
        
        alert(`Operasi "${gameState.selectedOperation}" tidak ditemukan.`);
        showScreen('menuScreen');
        return;
    }
    
    if (typeof operation.generateQuestion !== 'function') {
        console.error(`❌ Operation ${gameState.selectedOperation} has no generateQuestion function!`);
        alert(`Operasi "${gameState.selectedOperation}" tidak memiliki fungsi pembuat soal.`);
        showScreen('menuScreen');
        return;
    }
    
    // Reset game state
    gameState.score = 0;
    gameState.currentQuestion = 1;
    gameState.timeLeft = TOTAL_TIME;
    gameState.correctAnswers = 0;
    gameState.selectedAnswers = [];
    gameState.isPlaying = true;
    gameState.currentQuestionData = null;
    
    console.log("🔄 Game state reset");
    
    // Update UI
    document.getElementById('scoreDisplay').textContent = '0 pts';
    document.getElementById('progressDisplay').textContent = '1/10';
    document.getElementById('timerDisplay').textContent = '10:00';
    document.getElementById('timerDisplay').style.color = '';
    
    // Update header
    updateGameHeader();
    
    // Hide result popup
    hideResultPopup();
    
    // Clear existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Reset option boxes
    resetOptionBoxes();
    
    // Generate first question
    console.log("🔁 Generating first question...");
    const success = generateQuestion();
    
    console.log("   generateQuestion() returned:", success);
    
    if (!success) {
        console.error("❌ Failed to generate first question");
        
        // Show user-friendly error
        const questionDisplay = document.getElementById('questionDisplay');
        if (questionDisplay) {
            questionDisplay.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Gagal Memuat Soal</h3>
                    <p>Operasi: ${gameState.selectedOperation}</p>
                    <p>Level: ${gameState.selectedLevel.range}</p>
                    <button onclick="goBackToMenu()" 
                            style="margin-top: 10px; padding: 8px 16px; 
                                   background: #4D96FF; color: white; 
                                   border: none; border-radius: 8px;">
                        Kembali ke Menu
                    </button>
                </div>
            `;
        }
        
        // Don't show game screen if question failed
        return;
    }
    
    // Show game screen
    console.log("🔄 Switching to game screen...");
    showScreen('gameScreen');
    
    // Start timer
    setTimeout(() => {
        startTimer();
        console.log("✅ Game started successfully!");
    }, 100);
}

function updateGameHeader() {
    const headerElement = document.getElementById('gameHeader');
    if (!headerElement) {
        console.warn("⚠️ gameHeader element not found");
        return;
    }
    
    if (!gameState.selectedLevel || !gameState.selectedOperation) {
        headerElement.textContent = "Math Game";
        return;
    }
    
    const level = gameState.selectedLevel;
    const operation = window.gameOperations[gameState.selectedOperation];
    const operationName = operation?.name || getOperationNameFromId(gameState.selectedOperation);
    
    headerElement.textContent = `${operationName} - Level ${level.id}`;
}

function startTimer() {
    // Clear existing timer
    clearInterval(gameState.timerInterval);
    
    // Update immediately
    updateTimerDisplay();
    
    // Start new interval
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPlaying) {
            clearInterval(gameState.timerInterval);
            return;
        }
        
        gameState.timeLeft--;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame();
            return;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (timerDisplay) {
        timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning colors
        if (gameState.timeLeft <= 60) {
            timerDisplay.style.color = '#ff0844';
        } else if (gameState.timeLeft <= 120) {
            timerDisplay.style.color = '#ffa726';
        } else {
            timerDisplay.style.color = '';
        }
    }
}

// ==========================================================
// C. QUESTION & ANSWER LOGIC
// ==========================================================

function generateQuestion() {
    console.log(`🔁 ========== generateQuestion() CALLED ==========`);
    console.log(`   Question ${gameState.currentQuestion}/${TOTAL_QUESTIONS}`);
    console.log(`   Operation: ${gameState.selectedOperation}`);
    console.log(`   Level: ${gameState.selectedLevel?.range}`);
    
    if (!gameState.selectedLevel || !gameState.selectedOperation) {
        console.error("❌ Missing level or operation in generateQuestion()");
        return false;
    }
    
    const level = gameState.selectedLevel;
    const operationId = gameState.selectedOperation;
    const operation = window.gameOperations[operationId];
    
    console.log(`   Operation module:`, operation);
    
    if (!operation) {
        console.error(`❌ Operation ${operationId} not found!`);
        console.log(`   Available operations:`, Object.keys(window.gameOperations));
        return false;
    }
    
    if (typeof operation.generateQuestion !== 'function') {
        console.error(`❌ generateQuestion is not a function for ${operationId}`);
        return false;
    }
    
    try {
        console.log(`   Calling operation.generateQuestion()...`);
        const questionData = operation.generateQuestion(level);
        
        console.log(`   Question data returned:`, questionData);
        
        if (!questionData) {
            console.error(`❌ operation.generateQuestion() returned null/undefined`);
            return false;
        }
        
        if (!questionData.question || questionData.correctAnswer === undefined) {
            console.error(`❌ Invalid question structure:`, questionData);
            return false;
        }
        
        console.log(`   Question: "${questionData.question}"`);
        console.log(`   Correct answer: ${questionData.correctAnswer}`);
        
        // Update display
        displayQuestion(questionData.question);
        
        // Generate options
        console.log(`   Generating options...`);
        const options = generateOptions(questionData.correctAnswer, operationId, level);
        console.log(`   Options generated:`, options);
        
        // Display options
        displayOptions(options, questionData.correctAnswer);
        
        // Store current question data
        gameState.currentQuestionData = questionData;
        
        console.log(`✅ Question generated successfully`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error in generateQuestion():`, error);
        console.error(error.stack);
        return false;
    }
}

function showQuestionError(message) {
    displayQuestion(`
        <div style="color: #ff6b6b; text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Terjadi Kesalahan</h3>
            <p>${message}</p>
            <button onclick="goBackToMenu()" 
                    style="margin-top: 10px; padding: 8px 16px; 
                           background: #4D96FF; color: white; 
                           border: none; border-radius: 8px; cursor: pointer;">
                Kembali ke Menu
            </button>
        </div>
    `);
}

function displayQuestion(questionHTML) {
    const questionDisplay = document.getElementById('questionDisplay');
    if (!questionDisplay) {
        console.error("❌ questionDisplay element not found");
        return;
    }
    
    // Gunakan callback pada flipQuestion untuk update setelah animasi
    flipQuestion(questionHTML, function() {
        // Ini callback yang dijalankan SETELAH animasi flip selesai
        questionDisplay.innerHTML = questionHTML;
        adjustQuestionFontSize(questionDisplay);
    });
}

// Fungsi baru untuk adjust font size
function adjustQuestionFontSize(questionElement) {
    if (!questionElement) return;
    
    // Reset dulu
    questionElement.style.fontSize = '';
    questionElement.style.lineHeight = '';
    questionElement.style.wordBreak = '';
    questionElement.style.overflow = 'visible';
    questionElement.style.whiteSpace = 'normal';
    
    // Hitung panjang teks (tanpa tag HTML)
    const textContent = questionElement.textContent || '';
    const textLength = textContent.length;
    
    // Debug info
    console.log(`📏 Question display check:`);
    console.log(`   Text: "${textContent.substring(0, 50)}${textLength > 50 ? '...' : ''}"`);
    console.log(`   Length: ${textLength} chars`);
    console.log(`   Screen width: ${window.innerWidth}px`);
    console.log(`   Element width: ${questionElement.offsetWidth}px`);
    console.log(`   Scroll width: ${questionElement.scrollWidth}px`);
    
    // Responsive font size
    if (window.innerWidth < 500) { // Mobile
        if (textLength > 60) {
            questionElement.style.fontSize = 'clamp(1rem, 2.8vw, 1.6rem)';
            questionElement.style.lineHeight = '1.3';
        } else if (textLength > 40) {
            questionElement.style.fontSize = 'clamp(1.1rem, 3vw, 1.8rem)';
            questionElement.style.lineHeight = '1.4';
        } else if (textLength > 25) {
            questionElement.style.fontSize = 'clamp(1.3rem, 3.2vw, 2.2rem)';
            questionElement.style.lineHeight = '1.5';
        } else if (textLength > 15) {
            questionElement.style.fontSize = 'clamp(1.5rem, 3.5vw, 2.5rem)';
        } else {
            questionElement.style.fontSize = 'clamp(1.8rem, 4vw, 3rem)';
        }
    } else { // Desktop/Tablet
        if (textLength > 80) {
            questionElement.style.fontSize = 'clamp(1.5rem, 2.5vw, 2.2rem)';
            questionElement.style.lineHeight = '1.3';
        } else if (textLength > 50) {
            questionElement.style.fontSize = 'clamp(1.7rem, 3vw, 2.5rem)';
            questionElement.style.lineHeight = '1.4';
        } else if (textLength > 30) {
            questionElement.style.fontSize = 'clamp(2rem, 3.5vw, 3rem)';
            questionElement.style.lineHeight = '1.5';
        } else if (textLength > 15) {
            questionElement.style.fontSize = 'clamp(2.3rem, 4vw, 3.5rem)';
        } else {
            questionElement.style.fontSize = 'clamp(2.5rem, 5vw, 4rem)';
        }
    }
    
    // Force reflow untuk pastikan ukuran diterapkan
    void questionElement.offsetWidth;
    
    // Cek apakah teks masih terpotong
    if (questionElement.scrollWidth > questionElement.offsetWidth) {
        console.warn("⚠️ Text might be truncated, adjusting further...");
        const currentSize = parseFloat(window.getComputedStyle(questionElement).fontSize);
        questionElement.style.fontSize = (currentSize * 0.9) + 'px';
    }
}

function generateOptions(correctAnswer, operationId, level) {
    console.log(`   Generating options for correct answer: ${correctAnswer}`);
    
    const options = [correctAnswer];
    const operation = window.gameOperations[operationId];
    
    try {
        // Try operation-specific wrong answer generator
        if (operation && operation.generateWrongAnswers) {
            const wrongAnswers = operation.generateWrongAnswers(correctAnswer, level);
            
            if (Array.isArray(wrongAnswers) && wrongAnswers.length >= 3) {
                // Filter valid wrong answers
                const validWrongAnswers = wrongAnswers.filter(answer => 
                    typeof answer === 'number' && 
                    !isNaN(answer) && 
                    answer !== correctAnswer
                ).slice(0, 3);
                
                if (validWrongAnswers.length >= 3) {
                    options.push(...validWrongAnswers);
                    console.log(`   Using custom wrong answers: ${validWrongAnswers}`);
                    return shuffleArray(options);
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️ Custom wrong answer generator failed:`, error);
    }
    
    // Fallback to default
    return generateDefaultWrongAnswers(correctAnswer, level);
}

function generateDefaultWrongAnswers(correctAnswer, level) {
    const options = [correctAnswer];
    const generated = new Set([correctAnswer]);
    
    // Determine number range based on operation type
    let maxRange;
    if (gameState.selectedOperation.includes('perkalian') || 
        gameState.selectedOperation.includes('pembagian')) {
        maxRange = Math.max(100, level.max * 2);
    } else {
        maxRange = Math.max(50, level.max * 1.5);
    }
    
    // Strategy 1: Use offsets (±1 to ±10)
    const offsets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1, -2, -3, -4, -5];
    for (let offset of offsets) {
        if (options.length >= 4) break;
        
        const wrongAnswer = correctAnswer + offset;
        if (wrongAnswer > 0 && wrongAnswer <= maxRange && !generated.has(wrongAnswer)) {
            options.push(wrongAnswer);
            generated.add(wrongAnswer);
        }
    }
    
    // Strategy 2: Random numbers in range
    if (options.length < 4) {
        const attempts = 50;
        for (let i = 0; i < attempts && options.length < 4; i++) {
            const wrongAnswer = randomNumber(Math.max(1, level.min), maxRange);
            if (!generated.has(wrongAnswer) && wrongAnswer !== correctAnswer) {
                options.push(wrongAnswer);
                generated.add(wrongAnswer);
            }
        }
    }
    
    // Strategy 3: Last resort - use multiples or divisors
    if (options.length < 4) {
        const candidates = [
            correctAnswer * 2,
            correctAnswer + 1,
            Math.max(1, correctAnswer - 1),
            Math.floor(correctAnswer / 2) || 1,
            correctAnswer + 10
        ];
        
        for (let candidate of candidates) {
            if (options.length >= 4) break;
            if (candidate > 0 && candidate <= maxRange && !generated.has(candidate)) {
                options.push(candidate);
                generated.add(candidate);
            }
        }
    }
    
    console.log(`   Generated options: ${options}`);
    return shuffleArray(options);
}

function displayOptions(options, correctAnswer) {
    console.log(`   Displaying ${options.length} options`);
    
    const container = document.getElementById('optionsGrid');
    if (!container) {
        console.error("❌ optionsGrid not found!");
        return;
    }
    
    // Clear with fade effect
    container.style.opacity = '0.5';
    
    setTimeout(() => {
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        options.forEach((option, index) => {
            const optionBox = document.createElement('div');
            optionBox.className = 'option-box';
            optionBox.textContent = formatNumber(option);
            optionBox.dataset.value = option;
            optionBox.dataset.index = index;
            
            // Reset styles
            optionBox.classList.remove('correct', 'wrong', 'selected');
            optionBox.style.pointerEvents = 'auto';
            optionBox.style.opacity = '1';
            optionBox.style.transform = 'none';
            
            // Add click handler
            optionBox.addEventListener('click', () => {
                checkAnswer(option, correctAnswer, optionBox);
            });
            
            fragment.appendChild(optionBox);
        });
        
        container.appendChild(fragment);
        container.style.opacity = '1';
        
        console.log(`✅ Options displayed`);
    }, 150);
}

function checkAnswer(selectedAnswer, correctAnswer, optionBox) {
    console.log(`🎯 ========== checkAnswer() CALLED ==========`);
    console.log(`   Question: ${gameState.currentQuestion}/${TOTAL_QUESTIONS}`);
    console.log(`   isPlaying: ${gameState.isPlaying}`);
    console.log(`   Selected: ${selectedAnswer}, Correct: ${correctAnswer}`);
    
    if (!gameState.isPlaying) {
        console.log("⚠️ Game not playing, ignoring click");
        return;
    }
    
    // Prevent multiple clicks
    gameState.isPlaying = false;
    
    const isCorrect = selectedAnswer === correctAnswer;
    console.log(`   Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
    
    // Disable all options
    document.querySelectorAll('.option-box').forEach(opt => {
        opt.style.pointerEvents = 'none';
        const optValue = parseInt(opt.dataset.value, 10);
        
        if (optValue === correctAnswer) {
            opt.classList.add('correct');
        } else if (opt === optionBox && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    // Mark selected option
    if (optionBox) {
        optionBox.classList.add('selected');
    }
    
    // Update game state
    gameState.selectedAnswers.push({
        question: gameState.currentQuestion,
        selected: selectedAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect,
        timestamp: Date.now(),
        timeLeft: gameState.timeLeft
    });
    
    console.log(`   Total answers: ${gameState.selectedAnswers.length}`);
    
    if (isCorrect) {
        gameState.score += POINTS_PER_CORRECT;
        gameState.correctAnswers++;
        playSound('correct');
        console.log(`   Score: ${gameState.score}, Correct: ${gameState.correctAnswers}`);
    } else {
        playSound('wrong');
    }
    
    // Update score display dengan animasi
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.textContent = `${gameState.score} pts`;
        if (isCorrect) {
            scoreDisplay.classList.add('score-updated');
            setTimeout(() => scoreDisplay.classList.remove('score-updated'), 300);
        }
    }
    
    // Clear existing timeout
    if (window.nextQuestionTimeout) {
        clearTimeout(window.nextQuestionTimeout);
    }
    
    // Schedule next question
    window.nextQuestionTimeout = setTimeout(() => {
        console.log(`⏱️ Next question timeout triggered`);
        
        if (gameState.currentQuestion >= TOTAL_QUESTIONS) {
            console.log("🏁 Game completed! Calling endGame()");
            endGame();
            return;
        }
        
        // Increment question
        gameState.currentQuestion++;
        
        // Reset playing state
        gameState.isPlaying = true;
        
        // Update progress
        const progressDisplay = document.getElementById('progressDisplay');
        if (progressDisplay) {
            progressDisplay.textContent = `${gameState.currentQuestion}/${TOTAL_QUESTIONS}`;
            progressDisplay.classList.add('progress-updated');
            setTimeout(() => progressDisplay.classList.remove('progress-updated'), 300);
        }
        
        // Generate next question
        try {
            generateQuestion();
        } catch (error) {
            console.error("💥 Error generating next question:", error);
            alert("Gagal memuat soal berikutnya. Game akan restart.");
            goBackToMenu();
        }
        
        window.nextQuestionTimeout = null;
        
    }, 1500);
}

function resetOptionBoxes() {
    console.log("🔄 Resetting option boxes...");
    const container = document.getElementById('optionsGrid');
    if (container) {
        container.querySelectorAll('.option-box').forEach(box => {
            box.classList.remove('correct', 'wrong', 'selected');
            box.style.pointerEvents = 'auto';
            box.style.opacity = '1';
            box.style.transform = 'none';
        });
    }
}

function flipQuestion(newQuestionText) {
    const questionBox = document.querySelector('.question-box');
    const questionElement = document.getElementById('questionDisplay');
    
    if (!questionBox || !questionElement) {
        console.error("❌ Question box or display not found!");
        return;
    }
    
    // Add flip-out class
    questionBox.classList.add('flip-out');
    
    // Change text at midpoint
    setTimeout(() => {
        questionElement.innerHTML = newQuestionText;
        questionBox.classList.remove('flip-out');
        questionBox.classList.add('flip-in');
        
        setTimeout(() => {
            questionBox.classList.remove('flip-in');
        }, 300);
    }, 300);
}

// ==========================================================
// D. GAME END AND RESULTS
// ==========================================================

function endGame() {
    console.log("🎮 endGame() called");
    
    // Clear semua interval dan timeout
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
    
    if (window.nextQuestionTimeout) {
        clearTimeout(window.nextQuestionTimeout);
        window.nextQuestionTimeout = null;
    }
    
    gameState.isPlaying = false;
    
    const accuracy = (gameState.correctAnswers / TOTAL_QUESTIONS) * 100;
    const operation = window.gameOperations[gameState.selectedOperation];
    const level = gameState.selectedLevel;
    
    console.log("📊 Final stats:", {
        score: gameState.score,
        correct: gameState.correctAnswers,
        total: TOTAL_QUESTIONS,
        accuracy: `${accuracy.toFixed(1)}%`,
        operation: operation?.name,
        level: level?.range
    });
    
    // Update result popup
    updateResultStats();
    updateResultMessage(accuracy);
    
    // Tampilkan popup dengan delay
    setTimeout(() => {
        showResultPopup();
    }, 800);
}

function updateResultStats() {
    // Update semua statistik
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctAnswers').textContent = 
        `${gameState.correctAnswers}/${TOTAL_QUESTIONS}`;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timeLeft').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update level dan operation info
    const level = gameState.selectedLevel;
    const operation = window.gameOperations[gameState.selectedOperation];
    
    if (level) {
        document.getElementById('levelPlayed').textContent = level.id;
    }
    
    // Update title dan subtitle
    updateResultPopupText(operation, level);
}

function updateResultMessage(accuracy) {
    let message = '';
    let emoji = '';
    
    if (accuracy >= 90) {
        message = 'Luar biasa! pertahankan prestasimu!';
        emoji = '🏆';
    } else if (accuracy >= 70) {
        message = 'Hebat! ayo tingkatkan lagi belajarmu!';
        emoji = '⭐';
    } else if (accuracy >= 50) {
        message = 'Jangan menyerah! Terus berlatih untuk hasil yang lebih baik!';
        emoji = '✨';
    } else {
        message = 'Ayo semangat! Belajar lagi dan jadilah lebih baik!';
        emoji = '💪';
    }
    
    const messageElement = document.getElementById('resultMessage');
    if (messageElement) {
        messageElement.textContent = `${emoji} ${message}`;
    }
}

function updateResultPopupText(operation, level) {
    console.log("🔄 updateResultPopupText called");
    
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    
    if (resultTitle) {
        resultTitle.textContent = 'HASIL PENCAPAIAN';
    }
    
    if (resultSubtitle && level && gameState.selectedOperation) {
        let operationName = '';
        if (operation && operation.name) {
            operationName = operation.name;
        } else {
            operationName = getOperationNameFromId(gameState.selectedOperation);
        }
        resultSubtitle.textContent = `${operationName} - ${level.range}`;
        console.log("✅ Result subtitle:", resultSubtitle.textContent);
    }
}

// ==========================================================
// E. UI COMPONENTS CREATION
// ==========================================================

let levelClickHandler = null;

function createLevelCards() {
    const container = document.getElementById('levelsGrid');
    if (!container) {
        console.error("❌ levelsGrid not found!");
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Remove old event listener jika ada
    if (levelClickHandler) {
        container.removeEventListener('click', levelClickHandler);
        levelClickHandler = null;
    }
    
    // Tentukan jumlah level berdasarkan operasi yang dipilih
    let levelsToShow = LEVELS;
    let isSpecialOperation = false;
    
    // PERUBAHAN: Cek operasi yang hanya memerlukan 5 level
    if (gameState.selectedOperation) {
        const specialOperations = ['hitung_buah', 'hitung_hewan', 'hitung_benda'];
        
        if (specialOperations.includes(gameState.selectedOperation)) {
            // Hanya tampilkan 5 level pertama untuk operasi khusus
            levelsToShow = LEVELS.slice(0, 5);
            isSpecialOperation = true;
            console.log(`🔢 Showing only 5 levels for operation: ${gameState.selectedOperation}`);
        } else {
            // Tampilkan semua 10 level untuk operasi lain
            levelsToShow = LEVELS;
            console.log(`🔢 Showing all 10 levels for operation: ${gameState.selectedOperation}`);
        }
    }
    
    // Create level cards
    levelsToShow.forEach(level => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.dataset.levelId = level.id;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        
        // TENTUKAN TEKS LEVEL BERDASARKAN OPERASI
        let levelText = level.range; // Default text
        
        // PERUBAHAN: Untuk operasi pembagian_2, gunakan deskripsi khusus
        if (gameState.selectedOperation === 'pembagian_2') {
            const divisionLevels = {
                1: "1 sampai 10",
                2: "1 sampai 20", 
                3: "11 sampai 20",
                4: "21 sampai 50",
                5: "50 sampai 100",
                6: "100 sampai 250",
                7: "250 sampai 1.000",
                8: "1.000 sampai 2.500",
                9: "2.500 sampai 5.000",
                10: "5.000 sampai 10.000"
            };
            
            levelText = divisionLevels[level.id] || level.range;
        }
        
        card.setAttribute('aria-label', `Level ${level.id}: ${levelText}`);
        
        card.innerHTML = `
            <div class="level-number">LEVEL ${level.id}</div>
            <div class="level-range">${levelText}</div>
        `;
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectLevel(level.id);
            }
        });
        
        container.appendChild(card);
    });
    
    // SOLUSI: Atur layout grid berdasarkan jumlah level
    if (isSpecialOperation) {
        // Untuk 5 level: 1 kolom vertikal
        container.style.gridTemplateColumns = '1fr'; // Hanya 1 kolom
        container.style.gridTemplateRows = `repeat(${levelsToShow.length}, 1fr)`; // 5 row
        container.style.maxWidth = '350px'; // Lebar lebih sempit
        container.style.margin = '0 auto';
        container.style.gap = '12px';
        
        // Buat card lebih tinggi untuk vertikal layout
        container.querySelectorAll('.level-card').forEach(card => {
            card.style.minHeight = '80px';
            card.style.flexDirection = 'row';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.padding = '15px 20px';
        });
    } else {
        // Untuk 10 level: grid 2x5 atau 5x2
        container.style.gridTemplateColumns = 'repeat(2, 1fr)'; // 2 kolom
        container.style.gridTemplateRows = `repeat(${Math.ceil(levelsToShow.length / 2)}, 1fr)`; // 5 row
        container.style.maxWidth = '600px';
        container.style.gap = '15px';
        
        // Reset card styling
        container.querySelectorAll('.level-card').forEach(card => {
            card.style.minHeight = '';
            card.style.flexDirection = '';
            card.style.justifyContent = '';
            card.style.alignItems = '';
            card.style.padding = '';
        });
    }
    
    console.log(`✅ Created ${levelsToShow.length} level cards`);
    
    // Setup event delegation
    levelClickHandler = (e) => {
        const card = e.target.closest('.level-card');
        if (card && !card.classList.contains('selected')) {
            const levelId = card.dataset.levelId;
            console.log("🎯 Level card clicked via delegation:", levelId);
            selectLevel(levelId);
        }
    };
    
    container.addEventListener('click', levelClickHandler);
}

// Function untuk reset semua UI components
function resetAllUIComponents() {
    // Reset operation cards
    document.querySelectorAll('.operation-card').forEach(card => {
        card.classList.remove('selected', 'deselecting');
    });
    
    // Reset level cards
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected', 'deselecting');
    });
    
    // Reset question display
    const questionDisplay = document.getElementById('questionDisplay');
    if (questionDisplay) {
        questionDisplay.innerHTML = '';
        questionDisplay.style.fontSize = '';
    }
    
    // Reset options grid
    const optionsGrid = document.getElementById('optionsGrid');
    if (optionsGrid) {
        optionsGrid.innerHTML = '';
        optionsGrid.style.opacity = '1';
    }
}

// ==========================================================
// F. MODAL FUNCTIONS
// ==========================================================

let modalTimeout = null;

// Fungsi untuk result popup
function showResultPopup() {
    const popup = document.getElementById('resultPopup');
    if (popup) {
        // Reset animation
        popup.classList.remove('active', 'fade-in');
        
        // Force reflow
        void popup.offsetWidth;
        
        // Add classes
        popup.classList.add('active', 'fade-in');
        
        // Focus first button untuk accessibility
        setTimeout(() => {
            const firstButton = popup.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }, 100);
        
        console.log("✅ Result popup shown");
    }
}

function hideResultPopup() {
    const popup = document.getElementById('resultPopup');
    if (popup) {
        popup.classList.remove('active', 'fade-in');
        popup.classList.add('fade-out');
        
        // Remove from DOM flow setelah animasi
        if (modalTimeout) clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            popup.classList.remove('fade-out');
            modalTimeout = null;
        }, 300);
    }
}

// ===== FUNGSI UNTUK MODAL MENU UTAMA =====
function showCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        // Pause game timer
        if (gameState.isPlaying && gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Show modal
        modal.classList.remove('active', 'fade-in');
        void modal.offsetWidth;
        modal.classList.add('active', 'fade-in');
        
        // Focus cancel button by default
        setTimeout(() => {
            const cancelBtn = document.getElementById('modalCancel');
            if (cancelBtn) {
                cancelBtn.focus();
            }
        }, 100);
    }
}

function hideCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active', 'fade-in');
        modal.classList.add('fade-out');
        
        // Resume timer jika game sedang berjalan
        if (gameState.isPlaying && !gameState.timerInterval) {
            startTimer();
        }
        
        // Cleanup
        if (modalTimeout) clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            modal.classList.remove('fade-out');
            modalTimeout = null;
        }, 300);
    }
}

// ===== FUNGSI UNTUK MODAL PILIH LEVEL =====
function showLevelModal() {
    const modal = document.getElementById('levelModal');
    if (modal) {
        // Pause game timer
        if (gameState.isPlaying && gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Show modal
        modal.classList.remove('active', 'fade-in');
        void modal.offsetWidth;
        modal.classList.add('active', 'fade-in');
        
        // Update modal message
        const modalMessage = document.getElementById('levelModalMessage');
        if (modalMessage) {
            modalMessage.textContent = 'Apakah Anda yakin ingin kembali ke pemilihan level? Progress saat ini akan hilang.';
        }
        
        // Focus cancel button by default
        setTimeout(() => {
            const cancelBtn = document.getElementById('levelModalCancel');
            if (cancelBtn) {
                cancelBtn.focus();
            }
        }, 100);
    }
}

function hideLevelModal() {
    const modal = document.getElementById('levelModal');
    if (modal) {
        modal.classList.remove('active', 'fade-in');
        modal.classList.add('fade-out');
        
        // Resume timer jika game sedang berjalan
        if (gameState.isPlaying && !gameState.timerInterval) {
            startTimer();
        }
        
        // Cleanup
        if (modalTimeout) clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            modal.classList.remove('fade-out');
            modalTimeout = null;
        }, 300);
    }
}

// ==========================================================
// G. SOUND FUNCTIONS
// ==========================================================

let audioContext = null;
let audioInitialized = false;
const soundBuffers = new Map();

function initAudio() {
    if (audioInitialized || !window.AudioContext) {
        return;
    }
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioInitialized = true;
        console.log("🔊 Audio context initialized");
    } catch (error) {
        console.error("❌ Failed to initialize audio:", error);
        audioContext = null;
    }
}

function enableAudio() {
    if (!audioContext && window.AudioContext) {
        initAudio();
    }
    
    // Resume audio context jika suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("🔊 Audio context resumed");
        }).catch(error => {
            console.error("❌ Failed to resume audio:", error);
        });
    }
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    
    const icon = document.querySelector('#soundButton i');
    const text = document.querySelector('#soundButton span');
    
    if (icon && text) {
        if (gameState.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            text.textContent = 'Sound ON';
            console.log("🔊 Sound: ON");
            
            // Initialize audio jika di-enable
            enableAudio();
        } else {
            icon.className = 'fas fa-volume-mute';
            text.textContent = 'Sound OFF';
            console.log("🔇 Sound: OFF");
        }
        
        // Play feedback sound
        if (gameState.soundEnabled) {
            playSound('click');
        }
    }
    
    // Save preference ke localStorage
    try {
        localStorage.setItem('mathGame_soundEnabled', gameState.soundEnabled);
    } catch (e) {
        // Ignore localStorage errors
    }
}

function playSound(type) {
    // Check jika sound disabled atau audio tidak available
    if (!gameState.soundEnabled || !window.AudioContext) {
        return;
    }
    
    // Ensure audio context initialized
    if (!audioContext) {
        initAudio();
        if (!audioContext) return;
    }
    
    // Resume jika suspended (diperlukan untuk mobile browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
    }
    
    try {
        switch (type) {
            case 'correct':
                playCorrectSound();
                break;
            case 'wrong':
                playWrongSound();
                break;
            case 'click':
                playClickSound();
                break;
            case 'levelComplete':
                playLevelCompleteSound();
                break;
        }
    } catch (error) {
        console.error("❌ Error playing sound:", error);
        // Fallback ke Web Audio API basic
        try {
            playToneBasic(type);
        } catch (e) {
            // Silent fail
        }
    }
}

function playCorrectSound() {
    const now = audioContext.currentTime;
    
    // C major chord: C, E, G
    const frequencies = [523.25, 659.25, 783.99];
    const durations = [0.1, 0.1, 0.15];
    
    frequencies.forEach((freq, i) => {
        setTimeout(() => {
            playTone(freq, durations[i], 0.15);
        }, i * 100);
    });
}

function playWrongSound() {
    // Descending minor third
    playTone(392.00, 0.2, 0.2); // G
    setTimeout(() => {
        playTone(349.23, 0.25, 0.2); // F
    }, 150);
}

function playClickSound() {
    playTone(784.00, 0.05, 0.1); // G5
}

function playLevelCompleteSound() {
    // Victory fanfare
    const notes = [
        { freq: 523.25, duration: 0.1 }, // C
        { freq: 659.25, duration: 0.1 }, // E
        { freq: 783.99, duration: 0.1 }, // G
        { freq: 1046.50, duration: 0.2 } // C6
    ];
    
    notes.forEach((note, i) => {
        setTimeout(() => {
            playTone(note.freq, note.duration, 0.15);
        }, i * 120);
    });
}

function playTone(frequency, duration, volume = 0.1) {
    if (!audioContext || audioContext.state !== 'running') {
        return;
    }
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Smooth envelope
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
        
    } catch (error) {
        console.warn("⚠️ Failed to play tone:", error);
    }
}

function playToneBasic(type) {
    // Fallback menggunakan Web Audio API tanpa envelope
    if (!audioContext || audioContext.state !== 'running') return;
    
    try {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        
        switch (type) {
            case 'correct':
                oscillator.frequency.value = 523.25;
                break;
            case 'wrong':
                oscillator.frequency.value = 392.00;
                break;
            case 'click':
                oscillator.frequency.value = 784.00;
                break;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silent fail
    }
}

// Initialize audio pada user interaction pertama
document.addEventListener('click', function initAudioOnInteraction() {
    if (!audioInitialized && gameState.soundEnabled) {
        enableAudio();
    }
    // Remove listener setelah dijalankan
    document.removeEventListener('click', initAudioOnInteraction);
}, { once: true });

// ==========================================================
// H. UTILITY FUNCTIONS
// ==========================================================

function formatNumber(num) {
    // Handle non-number input
    if (typeof num !== 'number' || isNaN(num)) {
        console.warn("⚠️ formatNumber received non-number:", num);
        return '0';
    }
    
    // Untuk angka besar, gunakan pemisah ribuan
    if (num >= 1000) {
        return num.toLocaleString('id-ID');
    }
    
    return num.toString();
}

function shuffleArray(array) {
    if (!Array.isArray(array)) {
        console.error("❌ shuffleArray expects array, got:", typeof array);
        return [];
    }
    
    // Return copy untuk immutability
    const newArray = [...array];
    
    // Fisher-Yates shuffle algorithm
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
}

function randomNumber(min, max) {
    // Validasi input
    min = Math.ceil(min);
    max = Math.floor(max);
    
    if (min > max) {
        console.warn(`⚠️ randomNumber: min (${min}) > max (${max}), swapping`);
        [min, max] = [max, min];
    }
    
    if (min === max) return min;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper untuk debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper untuk throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format waktu dari detik ke MM:SS
function formatTime(seconds) {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Calculate accuracy percentage
function calculateAccuracy(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

// ==========================================================
// I. EVENT LISTENERS SETUP - PERBAIKAN UTAMA DISINI
// ==========================================================

let eventListeners = [];

function setupEventListeners() {
    console.log("🔌 Setting up event listeners...");
    
    // Cleanup existing listeners
    cleanupEventListeners();
    
    // Setup operation cards
    setupOperationCards();
    
    // ============ TOMBOL UTAMA ============
    
    // Sound toggle
    const soundBtn = document.getElementById('soundButton');
    if (soundBtn) {
        const handler = () => toggleSound();
        soundBtn.addEventListener('click', handler);
        eventListeners.push({ element: soundBtn, type: 'click', handler });
        
        // Keyboard support
        soundBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSound();
            }
        });
    }
    
    // Menu button in game screen
    const menuBtn = document.getElementById('menuButton');
    if (menuBtn) {
        const handler = () => showCustomModal();
        menuBtn.addEventListener('click', handler);
        eventListeners.push({ element: menuBtn, type: 'click', handler });
        
        // Keyboard support
        menuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    }
    
    // ============ TOMBOL FOOTER ============
    
    const backToLevelBtn = document.getElementById('backToLevelButton');
    if (backToLevelBtn) {
        console.log("🔍 Found backToLevelButton, setting up event listener...");
        const handler = () => {
            console.log("🎯 Tombol Kembali ke Level diklik");
            
            if (gameState.isPlaying) {
                console.log("   Game sedang berjalan, tampilkan konfirmasi");
                showLevelModal(); // Tampilkan modal konfirmasi
            } else {
                console.log("   Game tidak berjalan, langsung kembali");
                goBackToLevelSelection();
            }
        };
        
        backToLevelBtn.addEventListener('click', handler);
        eventListeners.push({ element: backToLevelBtn, type: 'click', handler: handler });
        
        // Keyboard support
        backToLevelBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
        
        console.log("✅ Tombol Kembali ke Level setup complete");
    } else {
        console.error("❌ backToLevelButton NOT FOUND in DOM!");
    }
    
    // Tombol "Bantuan"
    const helpBtn = document.getElementById('helpButton');
    if (helpBtn) {
        const handler = () => {
            alert("Game Matematika untuk Anak\n\n• Pilih operasi matematika\n• Pilih level kesulitan\n• Jawab soal dengan benar\n• Dapatkan poin tertinggi!");
        };
        helpBtn.addEventListener('click', handler);
        eventListeners.push({ element: helpBtn, type: 'click', handler });
    }
    
    // Tombol "Ulangi"
    const restartBtn = document.getElementById('restartGameButton');
    if (restartBtn) {
        const handler = () => {
            if (confirm("Apakah Anda yakin ingin mengulangi level ini?")) {
                startGame(); // Restart game dengan level yang sama
            }
        };
        restartBtn.addEventListener('click', handler);
        eventListeners.push({ element: restartBtn, type: 'click', handler });
    }
    
    // Back buttons
    setupBackButtons();
    
    // Modal buttons (sudah termasuk modal baru)
    setupModalButtons();
    
    // Result popup buttons
    setupResultButtons();
    
    // Overlay clicks (perlu ditambah untuk modal baru)
    setupOverlayClicks();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Window events
    setupWindowEvents();
    
    console.log(`✅ ${eventListeners.length} event listeners setup complete`);
}

function setupOperationCards() {
    const operationCards = document.querySelectorAll('#menuScreen .operation-card[data-operation]');
    console.log(`🎴 Found ${operationCards.length} operation cards in HTML`);
    
    operationCards.forEach(card => {
        const operationId = card.getAttribute('data-operation');
        
        const clickHandler = () => {
            console.log(`📱 HTML Card clicked: ${operationId}`);
            selectOperationInMenu(operationId);
        };
        
        card.addEventListener('click', clickHandler);
        eventListeners.push({ element: card, type: 'click', handler: clickHandler });
        
        // Keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                clickHandler();
            }
        });
        
        // Add tooltip
        const operation = window.gameOperations[operationId];
        if (operation && operation.description) {
            card.title = operation.description;
            card.setAttribute('aria-label', `${operation.name || operationId}: ${operation.description}`);
        }
    });
}

function setupBackButtons() {
    // Back to Menu button (jika ada)
    const backMenuBtn = document.getElementById('backToMenuButton');
    if (backMenuBtn) {
        const handler = () => {
            console.log("🔙 Back to Menu button clicked");
            goBackToMenu();
        };
        
        backMenuBtn.addEventListener('click', handler);
        eventListeners.push({ element: backMenuBtn, type: 'click', handler });
    }
}

function setupModalButtons() {
    // ===== MODAL LAMA: MENU UTAMA (customModal) =====
    const modalConfirm = document.getElementById('modalConfirm');
    if (modalConfirm) {
        const handler = () => {
            hideCustomModal();
            hideResultPopup();
            goBackToMenu();
        };
        
        modalConfirm.addEventListener('click', handler);
        eventListeners.push({ element: modalConfirm, type: 'click', handler });
    }
    
    const modalCancel = document.getElementById('modalCancel');
    if (modalCancel) {
        const handler = () => hideCustomModal();
        modalCancel.addEventListener('click', handler);
        eventListeners.push({ element: modalCancel, type: 'click', handler });
        
        // ESC key untuk close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('customModal')?.classList.contains('active')) {
                handler();
            }
        });
    }
    
    // ===== MODAL BARU: KEMBALI KE LEVEL (levelModal) =====
    const levelModalConfirm = document.getElementById('levelModalConfirm');
    if (levelModalConfirm) {
        const handler = () => {
            hideLevelModal();
            goBackToLevelSelection(); // PERBAIKAN: Kembali ke level selection
        };
        
        levelModalConfirm.addEventListener('click', handler);
        eventListeners.push({ element: levelModalConfirm, type: 'click', handler });
    }
    
    const levelModalCancel = document.getElementById('levelModalCancel');
    if (levelModalCancel) {
        const handler = () => hideLevelModal();
        levelModalCancel.addEventListener('click', handler);
        eventListeners.push({ element: levelModalCancel, type: 'click', handler });
        
        // ESC key untuk close modal level
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('levelModal')?.classList.contains('active')) {
                handler();
            }
        });
    }
}

function setupResultButtons() {
    const playAgainBtn = document.getElementById('playAgainButton');
    if (playAgainBtn) {
        const handler = () => {
            hideResultPopup();
            setTimeout(() => startGame(), 300);
        };
        
        playAgainBtn.addEventListener('click', handler);
        eventListeners.push({ element: playAgainBtn, type: 'click', handler });
    }
    
    const newLevelBtn = document.getElementById('newLevelButton');
    if (newLevelBtn) {
        const handler = () => {
            hideResultPopup();
            showScreen('levelScreen');
        };
        
        newLevelBtn.addEventListener('click', handler);
        eventListeners.push({ element: newLevelBtn, type: 'click', handler });
    }
    
    const goMenuBtn = document.getElementById('goMenuButton');
    if (goMenuBtn) {
        const handler = () => {
            hideResultPopup();
            goBackToMenu();
        };
        
        goMenuBtn.addEventListener('click', handler);
        eventListeners.push({ element: goMenuBtn, type: 'click', handler });
    }
}

function setupOverlayClicks() {
    const customModal = document.getElementById('customModal');
    if (customModal) {
        const handler = (e) => {
            if (e.target === customModal) {
                hideCustomModal();
            }
        };
        customModal.addEventListener('click', handler);
        eventListeners.push({ element: customModal, type: 'click', handler });
    }
    
    // Tambah untuk modal level
    const levelModal = document.getElementById('levelModal');
    if (levelModal) {
        const handler = (e) => {
            if (e.target === levelModal) {
                hideLevelModal();
            }
        };
        levelModal.addEventListener('click', handler);
        eventListeners.push({ element: levelModal, type: 'click', handler });
    }
    
    const resultPopup = document.getElementById('resultPopup');
    if (resultPopup) {
        const handler = (e) => {
            if (e.target === resultPopup) {
                hideResultPopup();
                goBackToMenu();
            }
        };
        resultPopup.addEventListener('click', handler);
        eventListeners.push({ element: resultPopup, type: 'click', handler });
    }
}

function setupKeyboardShortcuts() {
    const keyHandler = (e) => {
        // Skip jika di input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'Escape':
                if (gameState.isPlaying) {
                    showCustomModal();
                } else if (gameState.currentScreen === 'level') {
                    goBackToMenu();
                }
                break;
                
            case 'm':
            case 'M':
                if (e.ctrlKey) {
                    toggleSound();
                }
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
                if (gameState.isPlaying && gameState.currentScreen === 'game') {
                    const index = parseInt(e.key) - 1;
                    const option = document.querySelectorAll('.option-box')[index];
                    if (option && option.style.pointerEvents !== 'none') {
                        option.click();
                    }
                }
                break;
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    eventListeners.push({ element: document, type: 'keydown', handler: keyHandler });
}

function setupWindowEvents() {
    // Handle page visibility change
    const visibilityHandler = () => {
        if (document.hidden && gameState.isPlaying && gameState.timerInterval) {
            // Pause timer ketika tab tidak aktif
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        } else if (!document.hidden && gameState.isPlaying && !gameState.timerInterval) {
            // Resume timer ketika tab aktif kembali
            startTimer();
        }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    eventListeners.push({ element: document, type: 'visibilitychange', handler: visibilityHandler });
    
    // Handle resize untuk responsive adjustments
    const resizeHandler = debounce(() => {
        if (gameState.currentScreen === 'game') {
            const questionDisplay = document.getElementById('questionDisplay');
            if (questionDisplay) {
                // Adjust font size on resize
                const textLength = questionDisplay.textContent.length;
                if (window.innerWidth < 500 && textLength > 15) {
                    questionDisplay.style.fontSize = 'clamp(1.5rem, 3.5vw, 3rem)';
                }
            }
        }
    }, 250);
    
    window.addEventListener('resize', resizeHandler);
    eventListeners.push({ element: window, type: 'resize', handler: resizeHandler });
}

function cleanupEventListeners() {
    console.log(`🧹 Cleaning up ${eventListeners.length} event listeners...`);
    
    eventListeners.forEach(({ element, type, handler }) => {
        if (element && handler) {
            element.removeEventListener(type, handler);
        }
    });
    
    eventListeners = [];
}

// ==========================================================
// J. INITIALIZATION
// ==========================================================

let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

function init() {
    console.log("🚀 Initializing Math Game...");
    
    initializationAttempts++;
    
    try {
        // Tampilkan loading state
        showLoadingState(true);
        
        // 1. Load saved preferences
        loadSavedPreferences();
        
        // 2. Debug: Check loaded operations
        debugLoadedOperations();
        
        // 3. Validate critical elements exist
        if (!validateRequiredElements()) {
            throw new Error('Required HTML elements not found');
        }
        
        // 4. Create UI components
        createLevelCards();
        
        // 5. Setup operation cards from HTML
        setupOperationCards();
        
        // 6. Setup all event listeners
        setupEventListeners();
        
        // 7. Initialize audio
        if (gameState.soundEnabled) {
            enableAudio();
        }
        
        // 8. Hide loading and show menu
        setTimeout(() => {
            showLoadingState(false);
            showScreen('menuScreen');
            console.log("🎮 Game initialized successfully.");
            
            // Reset attempts counter
            initializationAttempts = 0;
            
            // Play welcome sound
            if (gameState.soundEnabled) {
                setTimeout(() => playSound('click'), 500);
            }
        }, 500);
        
    } catch (error) {
        console.error("💥 Error during initialization:", error);
        
        // Tampilkan error di UI
        showErrorState(error);
        
        // Coba init lagi jika belum max attempts
        if (initializationAttempts < MAX_INIT_ATTEMPTS) {
            console.log(`🔄 Retrying initialization (${initializationAttempts}/${MAX_INIT_ATTEMPTS})...`);
            setTimeout(init, 1000 * initializationAttempts);
        } else {
            console.error(`❌ Failed to initialize after ${MAX_INIT_ATTEMPTS} attempts`);
            showFatalError();
        }
    }
}

function showLoadingState(show) {
    const loadingElement = document.getElementById('loadingScreen') || createLoadingScreen();
    
    if (show) {
        loadingElement.style.display = 'flex';
        loadingElement.classList.add('active');
    } else {
        loadingElement.classList.remove('active');
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 300);
    }
}

function createLoadingScreen() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingScreen';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
        font-family: Arial, sans-serif;
        transition: opacity 0.3s ease;
    `;
    
    loadingDiv.innerHTML = `
        <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 20px;
        "></div>
        <h2 style="margin-bottom: 10px;">Memuat Game...</h2>
        <p id="loadingMessage" style="opacity: 0.8;">Menyiapkan permainan matematika</p>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

function loadSavedPreferences() {
    try {
        // Load sound preference
        const savedSound = localStorage.getItem('mathGame_soundEnabled');
        if (savedSound !== null) {
            gameState.soundEnabled = JSON.parse(savedSound);
            
            // Update UI
            const icon = document.querySelector('#soundButton i');
            const text = document.querySelector('#soundButton span');
            if (icon && text) {
                if (gameState.soundEnabled) {
                    icon.className = 'fas fa-volume-up';
                    text.textContent = 'Sound ON';
                } else {
                    icon.className = 'fas fa-volume-mute';
                    text.textContent = 'Sound OFF';
                }
            }
        }
        
        // Load other preferences jika ada
        const savedLevel = localStorage.getItem('mathGame_lastLevel');
        if (savedLevel) {
            console.log("📊 Last played level:", savedLevel);
        }
        
    } catch (error) {
        console.warn("⚠️ Could not load saved preferences:", error);
        // Use defaults
    }
}

function debugLoadedOperations() {
    console.log("🔍 DEBUG: Checking loaded operations...");
    const allOps = Object.keys(window.gameOperations);
    console.log("Total operations loaded:", allOps.length);
    
    if (allOps.length === 0) {
        console.warn("⚠️ No operations loaded! Check operation modules.");
        
        // Create emergency fallback operations
        createFallbackOperations();
        console.log("🆘 Created fallback operations");
    }
    
    // Check specific operations
    const requiredOps = ['hitung_buah', 'hitung_hewan', 'hitung_benda', 
                         'penjumlahan_2', 'pengurangan_2', 'perkalian_2', 'pembagian_2', 'campuran_plus_minus', 'campuran_kali_bagi','campuran_semua'];
    
    requiredOps.forEach(opId => {
        const loaded = !!window.gameOperations[opId];
        console.log(`${opId}: ${loaded ? '✅ Loaded' : '❌ NOT LOADED'}`);
        
        if (loaded) {
            const op = window.gameOperations[opId];
            console.log(`   Name: ${op.name || 'N/A'}, Icon: ${op.icon || 'N/A'}`);
            console.log(`   Has generateQuestion: ${!!op.generateQuestion}`);
            console.log(`   Has generateWrongAnswers: ${!!op.generateWrongAnswers}`);
        }
    });
}

function createFallbackOperations() {
    // Basic addition as fallback
    window.gameOperations['penjumlahan-fallback'] = {
        name: 'Penjumlahan',
        icon: 'plus',
        description: 'Penjumlahan dasar',
        generateQuestion: function(level) {
            const a = randomNumber(level.min, level.max);
            const b = randomNumber(level.min, level.max);
            return {
                question: `${a} + ${b} = ?`,
                correctAnswer: a + b
            };
        },
        generateWrongAnswers: function(correctAnswer, level) {
            const offsets = [1, 2, 3, 5, 10, -1, -2, -3];
            const wrongAnswers = new Set();
            
            while (wrongAnswers.size < 3) {
                const offset = offsets[Math.floor(Math.random() * offsets.length)];
                const wrong = correctAnswer + offset;
                if (wrong > 0 && wrong !== correctAnswer) {
                    wrongAnswers.add(wrong);
                }
            }
            
            return Array.from(wrongAnswers);
        }
    };
}

function validateRequiredElements() {
    const requiredElements = [
        'menuScreen',
        'levelScreen', 
        'gameScreen',
        'menuOperationsGrid',
        'levelsGrid',
        'questionDisplay',
        'optionsGrid'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.error("❌ Missing required elements:", missingElements);
        return false;
    }
    
    return true;
}

function showErrorState(error) {
    showLoadingState(false);
    
    const menuGrid = document.getElementById('menuOperationsGrid');
    if (menuGrid) {
        menuGrid.innerHTML = `
            <div style="grid-column: span 4; text-align: center; padding: 30px; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Initialization Error</h3>
                <p style="margin-bottom: 20px; font-family: monospace; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 5px;">
                    ${error.message}
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="location.reload()" 
                            style="padding: 10px 20px; background: #4D96FF; color: white; border: none; border-radius: 10px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Reload Game
                    </button>
                    <button onclick="init()" 
                            style="padding: 10px 20px; background: #6c5ce7; color: white; border: none; border-radius: 10px; cursor: pointer;">
                        <i class="fas fa-play"></i> Try Again
                    </button>
                </div>
                <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.7;">
                    Attempt ${initializationAttempts} of ${MAX_INIT_ATTEMPTS}
                </p>
            </div>
        `;
    }
}

function showFatalError() {
    const appContainer = document.querySelector('.container') || document.body;
    appContainer.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; max-width: 600px; margin: 0 auto;">
            <i class="fas fa-sad-tear" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 20px;"></i>
            <h1 style="color: #333; margin-bottom: 15px;">Game Failed to Load</h1>
            <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                We're sorry, but the game could not be loaded after several attempts. 
                This might be due to a network issue or browser compatibility.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <button onclick="location.reload()" 
                        style="padding: 12px 24px; background: #4D96FF; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1em;">
                    <i class="fas fa-redo"></i> Reload Full Page
                </button>
                <button onclick="clearCacheAndReload()" 
                        style="padding: 12px 24px; background: #00b894; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1em;">
                    <i class="fas fa-trash"></i> Clear Cache & Reload
                </button>
                <a href="/" style="margin-top: 20px; color: #6c5ce7; text-decoration: none;">
                    <i class="fas fa-home"></i> Return to Home
                </a>
            </div>
            <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: left;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">Troubleshooting:</p>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Check your internet connection</li>
                    <li>Try using a different browser</li>
                    <li>Disable browser extensions</li>
                    <li>Update your browser to the latest version</li>
                </ul>
            </div>
        </div>
    `;
}

// Helper function untuk clear cache
window.clearCacheAndReload = function() {
    try {
        // Clear localStorage
        localStorage.clear();
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Force reload without cache
        location.reload(true);
    } catch (e) {
        location.reload();
    }
};

// ==========================================================
// K. DEBUG FUNCTIONS (optional)
// ==========================================================

window.debugGameState = function() {
    console.log("🔍 ========== GAME STATE DEBUG ==========");
    console.log("Current Screen:", gameState.currentScreen);
    console.log("Selected Operation:", gameState.selectedOperation);
    console.log("Selected Level:", gameState.selectedLevel);
    console.log("isPlaying:", gameState.isPlaying);
    console.log("Score:", gameState.score);
    console.log("Current Question:", gameState.currentQuestion);
    console.log("========================================");
};

// ==========================================================
// L. GLOBAL ERROR HANDLER
// ==========================================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error("💥 Global Error:", {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// ==========================================================
// M. START GAME WHEN DOM IS READY
// ==========================================================

let domReady = false;
let initCalled = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM Content Loaded");
    domReady = true;
    
    // Cek jika operation modules sudah loaded
    checkModulesAndInit();
});

// Function untuk cek modules dan init
function checkModulesAndInit() {
    // Cegah multiple initialization
    if (initCalled) {
        console.log("⚠️ init() already called, skipping...");
        return;
    }
    
    // Tunggu sebentar untuk pastikan semua resource loaded
    setTimeout(() => {
        // Cek jika operation modules sudah loaded
        const operationsLoaded = Object.keys(window.gameOperations).length > 0;
        
        if (operationsLoaded) {
            init();
            initCalled = true;
        } else {
            console.warn("⚠️ Operation modules not loaded yet, waiting...");
            
            // Coba lagi setelah delay
            setTimeout(() => {
                if (!initCalled) {
                    console.log("🔄 Retrying initialization after delay...");
                    init();
                    initCalled = true;
                }
            }, 1000);
        }
    }, 100);
}

// Fallback: Jika semua event gagal, init saat script loaded
(function() {
    // Jika document sudah ready saat script load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
            if (!initCalled) {
                console.log("⚡ Initializing on script load (document already ready)");
                init();
                initCalled = true;
            }
        }, 0);
    }
})();

// Export untuk testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        LEVELS,
        showScreen,
        startGame,
        generateQuestion,
        checkAnswer,
        endGame,
        init,
        goBackToLevelSelection, // PERBAIKAN: Export fungsi baru
        goBackToMenu
    };
}
