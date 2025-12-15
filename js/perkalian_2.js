// ==========================================================
// PERKALIAN OPERATION MODULE
// ==========================================================

const PerkalianOperation = {
    // Operation Identity
    id: 'perkalian',
    name: 'Perkalian',
    description: '2 Bilangan',
    icon: '×',
    
    // Operation Configuration
    type: 'perkalian',
    numbers: 2,
    operators: ['×'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Perkalian question for Level ${level.id}`);
        
        // Generate numbers based on level
        let num1, num2;
        
        // Adjust ranges based on level
        if (level.id <= 3) {
            // Level 1-3: small numbers (1-5)
            num1 = this.randomNumber(1, 5);
            num2 = this.randomNumber(1, 5);
        } else if (level.id <= 6) {
            // Level 4-6: medium numbers (1-10)
            num1 = this.randomNumber(1, 10);
            num2 = this.randomNumber(1, 10);
        } else {
            // Level 7+: larger numbers
            num1 = this.randomNumber(1, 12);
            num2 = this.randomNumber(1, 12);
        }
        
        // Calculate correct answer
        const correctAnswer = num1 * num2;
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">×</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2],
            operators: ['×'],
            level: level.id,
            type: this.id
        };
    },
    
    // Generate wrong answers
    generateWrongAnswers: function(correctAnswer, level) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            
            // Common multiplication mistakes
            if (Math.random() > 0.5) {
                // Offset mistake
                const offset = Math.floor(Math.random() * Math.max(3, correctAnswer / 10)) + 1;
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
            } else {
                // Common mistake: addition instead of multiplication
                const [num1, num2] = [correctAnswer / 2, 2]; // Example
                wrongAnswer = num1 + num2;
            }
            
            if (wrongAnswer > 0 && 
                wrongAnswer <= 144 && // Max 12×12
                !wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== correctAnswer) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    },
    
    // Validate answer
    validateAnswer: function(userAnswer, correctAnswer) {
        return parseInt(userAnswer) === correctAnswer;
    },
    
    // Get hint
    getHint: function(numbers) {
        if (numbers.length !== 2) return null;
        
        const [num1, num2] = numbers;
        return `Kalikan ${num1} dengan ${num2}. ${num1} × ${num2} = ?`;
    },
    
    // Helper functions
    randomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    // Operation statistics
    stats: {
        difficulty: 'medium',
        category: 'multiplication',
        requiresTables: true
    },
    
    // Operation description
    getDescription: function() {
        return "Mengalikan dua bilangan. Contoh: 4 × 3 = 12";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "6 × 4 = ...",
            numbers: [6, 4],
            answer: 24,
            explanation: "6 dikali 4 sama dengan 24"
        };
    },
    
    // Multiplication table helper
    getMultiplicationTable: function(number) {
        const table = [];
        for (let i = 1; i <= 12; i++) {
            table.push(`${number} × ${i} = ${number * i}`);
        }
        return table;
    },
    
    // Check if it's a square number
    isSquareNumber: function(numbers) {
        return numbers[0] === numbers[1];
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[PerkalianOperation.id] = PerkalianOperation;
    console.log(`✅ Registered operation: ${PerkalianOperation.name} (${PerkalianOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPerkalian = function() {
        console.log("🧪 Testing Perkalian");
        
        const testLevel = { id: 6, min: 1, max: 10 };
        const question = PerkalianOperation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}