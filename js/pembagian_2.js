// ==========================================================
// PEMBAGIAN OPERATION MODULE
// ==========================================================

const PembagianOperation = {
    // Operation Identity
    id: 'pembagian',
    name: 'Pembagian',
    description: '2 Bilangan',
    icon: '÷',
    
    // Operation Configuration
    type: 'pembagian',
    numbers: 2,
    operators: ['÷'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Pembagian question for Level ${level.id}`);
        
        // Generate division problem (dividend ÷ divisor = quotient)
        let divisor, quotient, dividend;
        
        // Adjust difficulty based on level
        if (level.id <= 3) {
            // Level 1-3: small numbers, no remainder
            divisor = this.randomNumber(2, 5);
            quotient = this.randomNumber(1, 5);
        } else if (level.id <= 6) {
            // Level 4-6: medium numbers
            divisor = this.randomNumber(2, 10);
            quotient = this.randomNumber(1, 10);
        } else {
            // Level 7+: larger numbers
            divisor = this.randomNumber(2, 12);
            quotient = this.randomNumber(1, 12);
        }
        
        dividend = divisor * quotient;
        
        // Ensure dividend is within level range
        while (dividend > level.max) {
            divisor = this.randomNumber(2, Math.floor(level.max / 2));
            quotient = this.randomNumber(1, Math.floor(level.max / divisor));
            dividend = divisor * quotient;
        }
        
        // Calculate correct answer (quotient)
        const correctAnswer = quotient;
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(dividend)}</span>
            <span class="operator">÷</span>
            <span class="number">${this.formatNumber(divisor)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [dividend, divisor],
            originalNumbers: { dividend, divisor, quotient },
            operators: ['÷'],
            level: level.id,
            type: this.id
        };
    },
    
    // Generate wrong answers
    generateWrongAnswers: function(correctAnswer, level, numbers) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        const [dividend, divisor] = numbers || [correctAnswer * 2, 2];
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            
            // Common division mistakes
            if (Math.random() > 0.3) {
                // Offset mistake
                const offset = Math.floor(Math.random() * Math.max(2, correctAnswer / 5)) + 1;
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
            } else {
                // Common mistake: multiplication instead of division
                wrongAnswer = dividend * divisor;
            }
            
            if (wrongAnswer > 0 && 
                wrongAnswer <= 100 && 
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
        
        const [dividend, divisor] = numbers;
        return `Berapa kali ${divisor} masuk ke ${dividend}? ${dividend} ÷ ${divisor} = ?`;
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
        difficulty: 'hard',
        category: 'division',
        requiresRemainderCalculation: false
    },
    
    // Operation description
    getDescription: function() {
        return "Membagi bilangan yang habis dibagi (tanpa sisa). Contoh: 12 ÷ 3 = 4";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "20 ÷ 5 = ...",
            numbers: [20, 5],
            answer: 4,
            explanation: "20 dibagi 5 sama dengan 4"
        };
    },
    
    // Check for exact division
    isExactDivision: function(dividend, divisor) {
        return dividend % divisor === 0;
    },
    
    // Get multiplication fact for division
    getRelatedMultiplication: function(dividend, divisor) {
        return `${divisor} × ${dividend / divisor} = ${dividend}`;
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[PembagianOperation.id] = PembagianOperation;
    console.log(`✅ Registered operation: ${PembagianOperation.name} (${PembagianOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPembagian = function() {
        console.log("🧪 Testing Pembagian");
        
        const testLevel = { id: 7, min: 1, max: 50 };
        const question = PembagianOperation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}