// ==========================================================
// CAMPURAN PENJUMLAHAN & PENGURANGAN OPERATION MODULE
// ==========================================================

const CampuranPlusMinusOperation = {
    // Operation Identity
    id: 'campuran_plus_minus',
    name: 'Campuran',
    description: 'Penjumlahan & Pengurangan',
    icon: '±',
    
    // Operation Configuration
    type: 'campuran',
    numbers: 3,
    operators: ['+', '−'], // Will be randomized
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Campuran Plus Minus question for Level ${level.id}`);
        
        // Generate three numbers
        const num1 = this.randomNumber(level.min, level.max);
        const num2 = this.randomNumber(level.min, level.max);
        const num3 = this.randomNumber(level.min, level.max);
        
        // Randomize operators (first always +, second can be + or -)
        const secondOperator = Math.random() > 0.5 ? '+' : '−';
        const operators = ['+', secondOperator];
        
        // Calculate based on operators
        let correctAnswer;
        if (operators[1] === '+') {
            correctAnswer = num1 + num2 + num3;
        } else {
            // Ensure positive result for subtraction
            const temp = num1 + num2;
            if (temp < num3) {
                // Swap num2 and num3 if needed
                [num2, num3] = [num3, num2];
                operators[1] = Math.random() > 0.5 ? '+' : '−';
            }
            correctAnswer = num1 + num2 - num3;
        }
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">+</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="operator">${operators[1]}</span>
            <span class="number">${this.formatNumber(num3)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2, num3],
            operators: operators,
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
            const offset = Math.floor(Math.random() * Math.max(5, level.max / 4)) + 1;
            
            // Common mistakes: wrong operation order
            if (Math.random() > 0.3) {
                // Offset from correct answer
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
            } else {
                // Common mistake: doing operations in wrong order
                // e.g., for a + b - c, doing a - b + c
                wrongAnswer = level.max; // Placeholder
            }
            
            if (wrongAnswer > 0 && 
                wrongAnswer <= level.max * 2 && 
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
    getHint: function(numbers, operators) {
        if (numbers.length !== 3 || operators.length !== 2) return null;
        
        const [num1, num2, num3] = numbers;
        const [op1, op2] = operators;
        
        if (op2 === '+') {
            return `Jumlahkan ${num1} + ${num2} = X, lalu X + ${num3} = ?`;
        } else {
            return `Jumlahkan ${num1} + ${num2} = X, lalu X − ${num3} = ?`;
        }
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
        category: 'mixed_operations',
        requiresOrderOfOperations: true
    },
    
    // Operation description
    getDescription: function() {
        return "Operasi campuran penjumlahan dan pengurangan. Kerjakan dari kiri ke kanan. Contoh: 8 + 3 − 2 = 9";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "7 + 5 − 3 = ...",
            numbers: [7, 5, 3],
            operators: ['+', '−'],
            answer: 9,
            explanation: "7 + 5 = 12, 12 − 3 = 9"
        };
    },
    
    // Teaching about operation order
    getOrderRule: function() {
        return "Ingat: Kerjakan operasi dari kiri ke kanan untuk penjumlahan dan pengurangan.";
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranPlusMinusOperation.id] = CampuranPlusMinusOperation;
    console.log(`✅ Registered operation: ${CampuranPlusMinusOperation.name} (${CampuranPlusMinusOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testCampuranPlusMinus = function() {
        console.log("🧪 Testing Campuran Plus Minus");
        
        const testLevel = { id: 5, min: 1, max: 25 };
        const question = CampuranPlusMinusOperation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}