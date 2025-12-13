// ==========================================================
// PENJUMLAHAN 2 BILANGAN OPERATION MODULE
// ==========================================================

const Penjumlahan2Operation = {
    // Operation Identity
    id: 'penjumlahan_2',
    name: 'Penjumlahan',
    description: '2 Bilangan',
    icon: '+',
    
    // Operation Configuration
    type: 'penjumlahan',
    numbers: 2,
    operators: ['+'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Penjumlahan 2 Bilangan question for Level ${level.id}`);
        
        // Generate two random numbers based on level range
        const num1 = this.randomNumber(level.min, level.max);
        const num2 = this.randomNumber(level.min, level.max);
        
        // Calculate correct answer
        const correctAnswer = num1 + num2;
        
        // Create question HTML with proper styling
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">+</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2],
            operators: ['+'],
            level: level.id,
            type: this.id
        };
    },
    
    // Generate wrong answers for this operation
    generateWrongAnswers: function(correctAnswer, level) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            const offset = Math.floor(Math.random() * Math.max(3, level.max / 10)) + 1;
            
            // Randomly add or subtract offset
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(1, correctAnswer - offset);
            }
            
            // Ensure wrong answer is within reasonable bounds
            const maxLimit = level.max * 2;
            if (wrongAnswer > 0 && 
                wrongAnswer <= maxLimit && 
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
        return `Coba jumlahkan ${num1} dengan ${num2}. ${num1} + ${num2} = ?`;
    },
    
    // Helper: Generate random number
    randomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Helper: Format number with Indonesian thousands separator
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    // Operation statistics (optional)
    stats: {
        difficulty: 'easy',
        category: 'basic_arithmetic',
        requiresCarry: false
    },
    
    // Operation description for help
    getDescription: function() {
        return "Menjumlahkan dua bilangan bulat positif. Contoh: 5 + 3 = 8";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "7 + 5 = ...",
            numbers: [7, 5],
            answer: 12,
            explanation: "7 ditambah 5 sama dengan 12"
        };
    }
};

// ==========================================================
// REGISTER OPERATION TO GLOBAL REGISTRY
// ==========================================================

// Check if gameOperations registry exists
if (typeof window !== 'undefined') {
    // Initialize registry if it doesn't exist
    window.gameOperations = window.gameOperations || {};
    
    // Register this operation
    window.gameOperations[Penjumlahan2Operation.id] = Penjumlahan2Operation;
    
    console.log(`✅ Registered operation: ${Penjumlahan2Operation.name} (${Penjumlahan2Operation.id})`);
    
    // Optional: Verify registration
    if (window.gameOperations['penjumlahan_2']) {
        console.log(`✅ Verification: penjumlahan_2 successfully registered`);
    } else {
        console.error(`❌ Failed to register penjumlahan_2 operation`);
    }
} else {
    console.error("❌ Window object not available. Cannot register operation.");
}

// ==========================================================
// EXPORT FOR MODULE SYSTEM (if using ES6 modules)
// ==========================================================

// Uncomment if using ES6 modules:
// export default Penjumlahan2Operation;

// ==========================================================
// OPERATION SPECIFIC UTILITY FUNCTIONS
// ==========================================================

// Additional utility functions specific to penjumlahan
const Penjumlahan2Utils = {
    // Check if operation might require carry (for educational purposes)
    checkForCarry: function(num1, num2) {
        const sum = num1 + num2;
        const maxDigit = Math.max(
            this.getDigitCount(num1),
            this.getDigitCount(num2)
        );
        return this.getDigitCount(sum) > maxDigit;
    },
    
    // Count digits in a number
    getDigitCount: function(number) {
        return number.toString().length;
    },
    
    // Decompose number for teaching (e.g., 15 = 10 + 5)
    decomposeNumber: function(number) {
        if (number < 10) return [number];
        
        const tens = Math.floor(number / 10) * 10;
        const ones = number % 10;
        return [tens, ones];
    }
};

// ==========================================================
// DEBUG HELPER
// ==========================================================

// Debug function to test operation generation
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPenjumlahan2 = function() {
        console.log("🧪 Testing Penjumlahan 2 Bilangan Operation");
        
        const testLevel = {
            id: 2,
            min: 1,
            max: 10,
            range: "1-10"
        };
        
        // Test question generation
        const question = Penjumlahan2Operation.generateQuestion(testLevel);
        console.log("Generated Question:", question);
        
        // Test wrong answer generation
        const wrongAnswers = Penjumlahan2Operation.generateWrongAnswers(question.correctAnswer, testLevel);
        console.log("Generated Wrong Answers:", wrongAnswers);
        
        // Test hint
        const hint = Penjumlahan2Operation.getHint(question.numbers);
        console.log("Hint:", hint);
        
        return {
            success: true,
            operation: Penjumlahan2Operation.id,
            question: question,
            wrongAnswers: wrongAnswers,
            hint: hint
        };
    };
    
    console.log("🧪 Penjumlahan 2 debug functions loaded. Call testPenjumlahan2() to test.");
}