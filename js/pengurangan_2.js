// ==========================================================
// PENGURANGAN 2 BILANGAN OPERATION MODULE
// ==========================================================

const Pengurangan2Operation = {
    // Operation Identity
    id: 'pengurangan_2',
    name: 'Pengurangan',
    description: '2 Bilangan',
    icon: '−',
    
    // Operation Configuration
    type: 'pengurangan',
    numbers: 2,
    operators: ['−'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Pengurangan 2 Bilangan question for Level ${level.id}`);
        
        // Generate two numbers where first >= second
        let num1, num2;
        if (level.max > 10) {
            // For higher levels, allow more range
            num1 = this.randomNumber(Math.max(level.min + 5, level.max / 2), level.max);
            num2 = this.randomNumber(level.min, num1 - 1);
        } else {
            // For lower levels, ensure positive result
            num1 = this.randomNumber(level.min + 2, level.max);
            num2 = this.randomNumber(level.min, num1 - 1);
        }
        
        // Calculate correct answer
        const correctAnswer = num1 - num2;
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">−</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2],
            operators: ['−'],
            level: level.id,
            type: this.id,
            note: `Pastikan ${num1} lebih besar dari ${num2} untuk hasil positif`
        };
    },
    
    // Generate wrong answers for this operation
    generateWrongAnswers: function(correctAnswer, level) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            const offset = Math.floor(Math.random() * Math.max(3, level.max / 8)) + 1;
            
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(0, correctAnswer - offset);
            }
            
            if (wrongAnswer >= 0 && 
                wrongAnswer <= level.max && 
                !wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== correctAnswer) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    },
    
    // Validate answer for this operation
    validateAnswer: function(userAnswer, correctAnswer) {
        return parseInt(userAnswer) === correctAnswer;
    },
    
    // Get hint for this operation
    getHint: function(numbers) {
        if (numbers.length !== 2) return null;
        
        const [num1, num2] = numbers;
        return `Kurangi ${num1} dengan ${num2}. ${num1} − ${num2} = ?`;
    },
    
    // Helper: Generate random number
    randomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Helper: Format number
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    // Operation statistics
    stats: {
        difficulty: 'easy',
        category: 'basic_arithmetic',
        requiresBorrowing: false
    },
    
    // Operation description
    getDescription: function() {
        return "Mengurangkan bilangan yang lebih kecil dari bilangan yang lebih besar. Contoh: 8 − 3 = 5";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "9 − 4 = ...",
            numbers: [9, 4],
            answer: 5,
            explanation: "9 dikurangi 4 sama dengan 5"
        };
    },
    
    // Check if operation requires borrowing (pinjam)
    checkForBorrowing: function(num1, num2) {
        const num1Str = num1.toString().padStart(2, '0');
        const num2Str = num2.toString().padStart(2, '0');
        
        for (let i = num1Str.length - 1; i >= 0; i--) {
            const digit1 = parseInt(num1Str[i]);
            const digit2 = parseInt(num2Str[i]);
            if (digit1 < digit2) return true;
        }
        return false;
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[Pengurangan2Operation.id] = Pengurangan2Operation;
    console.log(`✅ Registered operation: ${Pengurangan2Operation.name} (${Pengurangan2Operation.id})`);
}

// ==========================================================
// UTILITY FUNCTIONS
// ==========================================================

const Pengurangan2Utils = {
    // Decompose for borrowing teaching
    decomposeForSubtraction: function(num1, num2) {
        const decomposed = [];
        const num1Str = num1.toString().split('').reverse();
        const num2Str = num2.toString().split('').reverse();
        
        for (let i = 0; i < Math.max(num1Str.length, num2Str.length); i++) {
            const digit1 = parseInt(num1Str[i] || 0);
            const digit2 = parseInt(num2Str[i] || 0);
            
            if (digit1 < digit2) {
                decomposed.push({
                    position: i + 1,
                    needsBorrow: true,
                    before: digit1,
                    after: digit1 + 10,
                    borrowedFrom: i + 2
                });
            }
        }
        return decomposed;
    }
};

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPengurangan2 = function() {
        console.log("🧪 Testing Pengurangan 2 Bilangan");
        
        const testLevel = { id: 2, min: 1, max: 20 };
        const question = Pengurangan2Operation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}