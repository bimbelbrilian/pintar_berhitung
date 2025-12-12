// ==========================================================
// CORE GAME SCRIPT - STATE, NAVIGATION, UTILITIES
// ==========================================================

// Game Configuration
const TOTAL_QUESTIONS = 10;
const TOTAL_TIME = 600; // 10 minutes in seconds
const POINTS_PER_CORRECT = 10;

// Level Definitions
const LEVELS = [
    { id: 1, range: "Bilangan 1 - 5", min: 1, max: 5 },
    { id: 2, range: "Bilangan 1 - 10", min: 1, max: 10 },
    { id: 3, range: "Bilangan 1 - 20", min: 1, max: 20 },
    { id: 4, range: "Bilangan 11 - 50", min: 11, max: 50 },
    { id: 5, range: "Bilangan 21 - 100", min: 21, max: 100 },
    { id: 6, range: "Bilangan 50 - 200", min: 50, max: 200 },
    { id: 7, range: "Bilangan 100 - 500", min: 100, max: 500 },
    { id: 8, range: "Bilangan 200 - 1.000", min: 200, max: 1000 },
    { id: 9, range: "Bilangan 500 - 5.000", min: 500, max: 5000 },
    { id: 10, range: "Bilangan 1.000 - 10.000", min: 1000, max: 10000 }
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
// A. SCREEN MANAGEMENT
// ==========================================================

function showScreen(screenId) {
    console.log(`🔄 Switching to: ${screenId}`);
    
    // Update game state
    gameState.currentScreen = screenId.replace('Screen', '');
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`✅ ${screenId} is now active`);
    } else {
        console.error(`❌ ${screenId} not found in DOM!`);
    }
}

function goBackToMenu() {
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    resetSelections();
    showScreen('menuScreen');
}

function goBackToLevelSelection() {
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    showScreen('levelScreen');
}

function resetSelections() {
    document.querySelectorAll('.operation-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    gameState.selectedLevel = null;
    gameState.selectedOperation = null;
}

// ==========================================================
// B. GAME FLOW
// ==========================================================

function selectOperationInMenu(operationId) {
    console.log(`🎮 SELECT OPERATION: ${operationId}`);
    
    // Play sound
    playSound('click');
    
    // Remove previous selection
    document.querySelectorAll('#menuScreen .operation-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`#menuScreen [data-operation="${operationId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        gameState.selectedOperation = operationId;
        
        // Update operation title in level screen
        const operation = window.gameOperations[operationId];
        if (operation) {
            const titleElement = document.getElementById('selectedOperationTitle');
            if (titleElement) {
                titleElement.textContent = operation.name;
                console.log(`✅ Updated title to: ${operation.name}`);
            }
        }
        
        // Switch to level screen
        setTimeout(() => {
            showScreen('levelScreen');
        }, 300);
    }
}

function selectLevel(levelId) {
    console.log(`🎮 SELECT LEVEL: ${levelId}`);
    
    if (!gameState.selectedOperation) {
        console.error("❌ No operation selected! Returning to menu.");
        showScreen('menuScreen');
        return;
    }
    
    // Update visual selection
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-level-id="${levelId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        gameState.selectedLevel = LEVELS.find(l => l.id === levelId);
        
        console.log("✅ Level selected:", gameState.selectedLevel);
        playSound('click');
        
        // Start game after delay
        setTimeout(() => {
            startGame();
        }, 500);
    }
}

function startGame() {
    if (!gameState.selectedLevel || !gameState.selectedOperation) {
        console.error("❌ Cannot start: Missing level or operation");
        showScreen('menuScreen');
        return;
    }
    
    console.log("🎮 STARTING GAME:", {
        level: gameState.selectedLevel.id,
        operation: gameState.selectedOperation
    });
    
    // Reset game state
    gameState.score = 0;
    gameState.currentQuestion = 1;
    gameState.timeLeft = TOTAL_TIME;
    gameState.correctAnswers = 0;
    gameState.selectedAnswers = [];
    gameState.isPlaying = true;
    
    // Update UI
    document.getElementById('scoreDisplay').textContent = '0 pts';
    document.getElementById('progressDisplay').textContent = '1/10';
    document.getElementById('timerDisplay').textContent = '10:00';
    document.getElementById('timerDisplay').style.color = '';
    
    // Update header
    updateGameHeader();
    
    // Hide result popup if visible
    hideResultPopup();
    
    // Start timer
    startTimer();
    
    // Generate first question
    generateQuestion();
    
    // Show game screen
    showScreen('gameScreen');
}

function updateGameHeader() {
    const headerElement = document.getElementById('gameHeader');
    if (headerElement && gameState.selectedLevel && gameState.selectedOperation) {
        const level = gameState.selectedLevel;
        const operation = window.gameOperations[gameState.selectedOperation];
        headerElement.textContent = `${operation.name} Level ${level.id}`;
    }
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (gameState.timeLeft <= 60) {
            document.getElementById('timerDisplay').style.color = '#ff0844';
        }
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ==========================================================
// C. QUESTION & ANSWER LOGIC
// ==========================================================

function generateQuestion() {
    const level = gameState.selectedLevel;
    const operationId = gameState.selectedOperation;
    const operation = window.gameOperations[operationId];
    
    if (!operation) {
        console.error(`❌ Operation ${operationId} not found in registry!`);
        return;
    }
    
    // Use operation-specific question generator
    const questionData = operation.generateQuestion(level);
    
    if (!questionData) {
        console.error(`❌ Failed to generate question for ${operationId}`);
        return;
    }
    
    // Update question display
    displayQuestion(questionData.question);
    
    // Generate and display options
    const options = generateOptions(questionData.correctAnswer, operationId, level);
    displayOptions(options, questionData.correctAnswer);
    
    // Store current question data
    gameState.currentQuestionData = questionData;
    
    console.log(`❓ Question ${gameState.currentQuestion}: ${questionData.question} = ${questionData.correctAnswer}`);
}

function displayQuestion(questionHTML) {
    const questionDisplay = document.getElementById('questionDisplay');
    if (questionDisplay) {
        // Gunakan efek flip
        flipQuestion(questionHTML);
        
        // Juga update questionDisplay untuk backup
        questionDisplay.innerHTML = questionHTML;
        
        // Check if question is too long for mobile
        const totalLength = questionDisplay.textContent.length;
        if (totalLength > 15 && window.innerWidth < 500) {
            questionDisplay.style.fontSize = 'clamp(1.5rem, 3.5vw, 3rem)';
        } else {
            questionDisplay.style.fontSize = 'clamp(1.8rem, 4vw, 4rem)';
        }
    }
}

function generateOptions(correctAnswer, operationId, level) {
    const options = [correctAnswer];
    const operation = window.gameOperations[operationId];
    
    // Use operation-specific wrong answer generator if available
    if (operation.generateWrongAnswers) {
        const wrongAnswers = operation.generateWrongAnswers(correctAnswer, level);
        options.push(...wrongAnswers.slice(0, 3));
    } else {
        // Default wrong answer generation
        while (options.length < 4) {
            let wrongAnswer;
            const offset = Math.floor(Math.random() * Math.max(5, level.max / 20)) + 1;
            
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(1, correctAnswer - offset);
            }
            
            const maxLimit = (operationId.includes('perkalian') || operationId.includes('pembagian')) ? 
                            Math.max(100, level.max * 2) : 
                            level.max * 3;
                            
            if (!options.includes(wrongAnswer) && wrongAnswer > 0 && wrongAnswer <= maxLimit) {
                options.push(wrongAnswer);
            }
        }
    }
    
    return shuffleArray(options);
}

function displayOptions(options, correctAnswer) {
    const container = document.getElementById('optionsGrid');
    if (!container) {
        console.error("❌ optionsGrid not found!");
        return;
    }
    
    container.innerHTML = '';
    
    options.forEach((option) => {
        const optionBox = document.createElement('div');
        optionBox.className = 'option-box';
        optionBox.textContent = formatNumber(option);
        optionBox.dataset.value = option;
        
        // Reset styles
        optionBox.classList.remove('correct', 'wrong');
        optionBox.style.pointerEvents = 'auto';
        
        optionBox.addEventListener('click', () => checkAnswer(option, correctAnswer, optionBox));
        
        container.appendChild(optionBox);
    });
}

function checkAnswer(selectedAnswer, correctAnswer, optionBox) {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Disable all options and show visual feedback
    document.querySelectorAll('.option-box').forEach(opt => {
        opt.style.pointerEvents = 'none';
        const optValue = parseInt(opt.dataset.value);
        
        if (optValue === correctAnswer) {
            opt.classList.add('correct');
        } else if (opt === optionBox && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    // Update game state
    gameState.selectedAnswers.push({
        question: gameState.currentQuestion,
        selected: selectedAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect
    });
    
    if (isCorrect) {
        gameState.score += POINTS_PER_CORRECT;
        gameState.correctAnswers++;
        playSound('correct');
    } else {
        playSound('wrong');
    }
    
    // Update score display
    document.getElementById('scoreDisplay').textContent = `${gameState.score} pts`;
    
    // Move to next question or end game
    setTimeout(() => {
        if (gameState.currentQuestion < TOTAL_QUESTIONS) {
            gameState.currentQuestion++;
            gameState.isPlaying = true;
            
            document.getElementById('progressDisplay').textContent = 
                `${gameState.currentQuestion}/${TOTAL_QUESTIONS}`;
            
            generateQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

// Function untuk trigger flip effect
function flipQuestion(newQuestionText) {
    const questionBox = document.querySelector('.question-box');
    const questionElement = document.getElementById('questionDisplay'); // Ganti dari .question
    
    if (!questionBox || !questionElement) {
        console.error("❌ Question box or display not found!");
        return;
    }
    
    // 1. Tambahkan class flip-out
    questionBox.classList.add('flip-out');
    
    // 2. Setelah setengah animasi (300ms), ganti teks
    setTimeout(() => {
        questionElement.innerHTML = newQuestionText;
    }, 300);
    
    // 3. Hapus class setelah animasi selesai
    setTimeout(() => {
        questionBox.classList.remove('flip-out');
    }, 600);
}

// Contoh penggunaan:
// Saat jawaban benar atau waktu habis:
// flipQuestion("5 + 3 = ?");

// ==========================================================
// D. GAME END AND RESULTS
// ==========================================================

function endGame() {
    console.log("🎮 endGame() called");
    
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    
    const accuracy = (gameState.correctAnswers / TOTAL_QUESTIONS) * 100;
    const operation = window.gameOperations[gameState.selectedOperation];
    const level = gameState.selectedLevel;
    
    console.log("📊 Operation:", operation?.name);
    console.log("📊 Level:", level?.range);
    
    // Update statistik
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctAnswers').textContent = 
        `${gameState.correctAnswers}/${TOTAL_QUESTIONS}`;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timeLeft').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('levelPlayed').textContent = level.id;
    
    // =============== PERBAIKAN: Update title dan subtitle ===============
    // Tunggu sedikit untuk memastikan DOM siap
    setTimeout(() => {
        updateResultPopupText(operation, level);
    }, 10);
    // =============== END PERBAIKAN ===============
    
    // Set pesan
    let message = '';
    if (accuracy >= 90) {
        message = 'Luar biasa! Jawabanmu hampir sempurna! 🏆';
    } else if (accuracy >= 70) {
        message = 'Hebat! Kamu sudah menguasai materi ini! ⭐';
    } else if (accuracy >= 50) {
        message = 'Bagus! Terus berlatih untuk hasil yang lebih baik! ✨';
    } else {
        message = 'Jangan menyerah! Coba lagi dan kamu akan lebih baik! 💪';
    }
    
    document.getElementById('resultMessage').textContent = message;
    
    // Tampilkan popup
    setTimeout(() => {
        showResultPopup();
    }, 500);
}

// =============== FUNGSI BARU: Update text popup ===============
function updateResultPopupText(operation, level) {
    console.log("🔄 updateResultPopupText called");
    
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    
    console.log("🔍 resultTitle found:", !!resultTitle);
    console.log("🔍 resultSubtitle found:", !!resultSubtitle);
    
    if (resultTitle) {
        resultTitle.textContent = 'HASIL PENCAPAIAN';
        console.log("✅ Updated resultTitle");
    }
    
    if (resultSubtitle && operation && level) {
        resultSubtitle.textContent = `Soal "${operation.name} ${level.range}" dari Bimbel Brilian`;
        console.log("✅ Updated resultSubtitle:", resultSubtitle.textContent);
    }
}

// ==========================================================
// E. UI COMPONENTS CREATION
// ==========================================================

function createMenuOperationCards() {
    const container = document.getElementById('menuOperationsGrid');
    if (!container) {
        console.error("❌ menuOperationsGrid not found!");
        return;
    }
    
    container.innerHTML = '';
    
    // Get all registered operations
    const operations = Object.values(window.gameOperations);
    
    if (operations.length === 0) {
        console.error("❌ No operations registered!");
        container.innerHTML = '<div class="error-message">Operasi belum tersedia</div>';
        return;
    }
    
    operations.forEach(operation => {
        const card = document.createElement('div');
        card.className = 'operation-card';
        card.dataset.operation = operation.id;
        
        card.innerHTML = `
            <div class="operation-icon">${operation.icon}</div>
            <div class="operation-name">${operation.name}</div>
            ${operation.description ? `<div class="operation-description">${operation.description}</div>` : ''}
        `;
        
        card.addEventListener('click', () => {
            console.log(`📱 Selected: ${operation.name}`);
            selectOperationInMenu(operation.id);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ Created ${operations.length} operation cards`);
}

function createLevelCards() {
    const container = document.getElementById('levelsGrid');
    if (!container) {
        console.error("❌ levelsGrid not found!");
        return;
    }
    
    container.innerHTML = '';
    
    LEVELS.forEach(level => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.dataset.levelId = level.id;
        
        card.innerHTML = `
            <div class="level-number">LEVEL ${level.id}</div>
            <div class="level-range">${level.range}</div>
        `;
        
        card.addEventListener('click', () => {
            console.log("🎯 Level clicked:", level.id);
            selectLevel(level.id);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ Created ${LEVELS.length} level cards`);
}

// ==========================================================
// F. MODAL FUNCTIONS
// ==========================================================

function showResultPopup() {
    const popup = document.getElementById('resultPopup');
    if (popup) {
        popup.classList.add('active');
        console.log("✅ Result popup shown");
    }
}

function hideResultPopup() {
    const popup = document.getElementById('resultPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function showCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.add('active');
        if (gameState.isPlaying && gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
    }
}

function hideCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active');
        if (gameState.isPlaying) {
            startTimer();
        }
    }
}

// ==========================================================
// G. SOUND FUNCTIONS
// ==========================================================

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = document.querySelector('#soundButton i');
    const text = document.querySelector('#soundButton span');
    
    if (icon && text) {
        if (gameState.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            text.textContent = 'Sound ON';
            console.log("🔊 Sound: ON");
        } else {
            icon.className = 'fas fa-volume-mute';
            text.textContent = 'Sound OFF';
            console.log("🔇 Sound: OFF");
        }
    }
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'correct') {
            playTone(audioContext, 523.25, 0.1);
            setTimeout(() => playTone(audioContext, 659.25, 0.1), 100);
            setTimeout(() => playTone(audioContext, 783.99, 0.15), 200);
        } else if (type === 'wrong') {
            playTone(audioContext, 392.00, 0.2);
            setTimeout(() => playTone(audioContext, 349.23, 0.25), 150);
        } else if (type === 'click') {
            playTone(audioContext, 784.00, 0.05);
        }
    } catch (e) {
        console.log("Web Audio API not supported");
    }
}

function playTone(audioContext, frequency, duration) {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silent fail
    }
}

// ==========================================================
// H. UTILITY FUNCTIONS
// ==========================================================

function formatNumber(num) {
    return num.toLocaleString('id-ID');
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================================
// I. EVENT LISTENERS SETUP
// ==========================================================

function setupEventListeners() {
    console.log("🔌 Setting up event listeners...");
    
    // Sound toggle
    const soundBtn = document.getElementById('soundButton');
    if (soundBtn) {
        soundBtn.addEventListener('click', toggleSound);
    }
    
    // Menu button in game screen
    const menuBtn = document.getElementById('menuButton');
    if (menuBtn) {
        menuBtn.addEventListener('click', showCustomModal);
    }
    
    // Back to Level Selection button
    const backLevelBtn = document.getElementById('backLevelButton');
    if (backLevelBtn) {
        backLevelBtn.addEventListener('click', function() {
            if (gameState.isPlaying) {
                showCustomModal();
            } else {
                goBackToLevelSelection();
            }
        });
    }
    
    // Modal buttons
    const modalConfirm = document.getElementById('modalConfirm');
    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            hideCustomModal();
            hideResultPopup();
            goBackToMenu();
        });
    }
    
    const modalCancel = document.getElementById('modalCancel');
    if (modalCancel) {
        modalCancel.addEventListener('click', hideCustomModal);
    }
    
    // Result popup buttons
    const playAgainBtn = document.getElementById('playAgainButton');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', function() {
            hideResultPopup();
            startGame();
        });
    }
    
    const newLevelBtn = document.getElementById('newLevelButton');
    if (newLevelBtn) {
        newLevelBtn.addEventListener('click', function() {
            hideResultPopup();
            showScreen('levelScreen');
        });
    }
    
    const goMenuBtn = document.getElementById('goMenuButton');
    if (goMenuBtn) {
        goMenuBtn.addEventListener('click', function() {
            hideResultPopup();
            goBackToMenu();
        });
    }
    
    // Modal overlay clicks
    const customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === customModal) {
                hideCustomModal();
            }
        });
    }
    
    const resultPopup = document.getElementById('resultPopup');
    if (resultPopup) {
        resultPopup.addEventListener('click', function(e) {
            if (e.target === resultPopup) {
                hideResultPopup();
                goBackToMenu();
            }
        });
    }
    
    console.log("✅ All event listeners setup complete");
}

// ==========================================================
// J. INITIALIZATION
// ==========================================================

function init() {
    console.log("🚀 Initializing Math Game...");
    
    // Wait for operation modules to load
    setTimeout(() => {
        // Check if operations are loaded
        const operationCount = Object.keys(window.gameOperations).length;
        console.log(`📊 Loaded ${operationCount} operation modules`);
        
        if (operationCount === 0) {
            console.error("❌ No operation modules loaded!");
            alert("Error: Operation modules failed to load. Please refresh.");
            return;
        }
        
        // Create operation and level cards
        createMenuOperationCards();
        createLevelCards();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log("🎮 Game initialized successfully.");
    }, 500); // Give time for operation modules to load
}

// ==========================================================
// K. DEBUG FUNCTIONS
// ==========================================================

// Debug function to check screen status
window.debugScreens = function() {
    console.log("=== DEBUG SCREENS ===");
    const screenIds = ['menuScreen', 'levelScreen', 'gameScreen'];
    screenIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const style = window.getComputedStyle(el);
            console.log(`${id}:`, {
                display: style.display,
                activeClass: el.classList.contains('active'),
                gameState: gameState.currentScreen
            });
        } else {
            console.log(`${id}: NOT FOUND`);
        }
    });
    console.log("=== END DEBUG ===");
};

// Force navigation for testing
window.testNavigation = function() {
    console.log("=== TEST NAVIGATION ===");
    console.log("1. Clicking first operation card...");
    const firstCard = document.querySelector('#menuScreen .operation-card');
    if (firstCard) {
        firstCard.click();
    }
};

// ==========================================================
// L. GLOBAL ERROR HANDLER
// ==========================================================

window.addEventListener('error', function(e) {
    console.error("💥 Global Error:", e.message, e.filename, e.lineno);
});

// ==========================================================
// M. START GAME WHEN DOM IS READY
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM Content Loaded");
    
    // Wait a bit for CSS and operation modules to load
    setTimeout(() => {
        init();
    }, 1000);
});
