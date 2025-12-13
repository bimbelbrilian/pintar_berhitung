// ==========================================================
// CAMPURAN PERKALIAN & PEMBAGIAN OPERATION MODULE
// ==========================================================

const CampuranKaliBagiOperation = {
    // Operation Identity
    id: 'campuran_kali_bagi',
    name: 'Campuran',
    description: 'Perkalian & Pembagian',
    icon: '×÷',
    
    // Operation Configuration
    type: 'campuran',
    numbers: 3,
    operators: ['×', '÷'], // Will be determined based on calculation
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Campuran Kali Bagi question for Level ${level.id}`);
        
        // Generate numbers for mixed operations
        let num1, num2, num3, operators, correctAnswer;
        
        // Randomly choose pattern: (a × b) ÷ c or (a ÷ b) × c
        const pattern = Math.random() > 0.5 ? 'times_divide' : 'divide_times';
        
        if (pattern === 'times_divide') {
            // Pattern: (a × b) ÷ c
            num1 = this.randomNumber(2, 8);
            num2 = this.randomNumber(2, 8);
            num3 = this.randomNumber(2, 8);
            
            // Ensure division results in whole number
            const product = num1 * num2;
            while (product % num3 !== 0) {
                num3 = this.randomNumber(2, Math.min(10, product));
            }
            
            correctAnswer = product / num3;
            operators = ['×', '÷'];
        } else {
            // Pattern: (a ÷ b) × c
            num2 = this.randomNumber(2, 6); // divisor
            num1 = num2 * this.randomNumber(2, 6); // dividend (multiple of divisor)
            num3 = this.randomNumber(2, 6);
            
            correctAnswer = (num1 / num2) * num3;
            operators = ['÷', '×'];
        }
        
        // Ensure answer is within reasonable range
        if (correctAnswer > 100) {
            return this.generateQuestion(level); // Try again
        }
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">${operators[0]}</span>
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
            pattern: pattern,
            level: level.id,
            type: this.id
        };
    },
    
    // Generate wrong answers
    generateWrongAnswers: function(correctAnswer, level, numbers, operators) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            
            // Common mistakes in mixed operations
            if (Math.random() > 0.4) {
                // Wrong operation order
                const [num1, num2, num3] = numbers;
                const [op1, op2] = operators;
                
                if (op1 === '×' && op2 === '÷') {
                    // Common mistake: doing division first
                    wrongAnswer = Math.floor((num1 / num3) * num2);
                } else {
                    // Common mistake: doing multiplication first
                    wrongAnswer = Math.floor((num1 * num3) / num2);
                }
            } else {
                // Offset mistake
                const offset = Math.floor(Math.random() * Math.max(3, correctAnswer / 8)) + 1;
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
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
    getHint: function(numbers, operators) {
        if (numbers.length !== 3 || operators.length !== 2) return null;
        
        const [num1, num2, num3] = numbers;
        const [op1, op2] = operators;
        
        if (op1 === '×' && op2 === '÷') {
            return `Kalikan ${num1} × ${num2} = X, lalu X ÷ ${num3} = ?`;
        } else {
            return `Bagi ${num1} ÷ ${num2} = X, lalu X × ${num3} = ?`;
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
        difficulty: 'hard',
        category: 'mixed_operations',
        requiresOrderOfOperations: true
    },
    
    // Operation description
    getDescription: function() {
        return "Operasi campuran perkalian dan pembagian. Kerjakan dari kiri ke kanan. Contoh: 8 × 3 ÷ 4 = 6";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "12 ÷ 3 × 2 = ...",
            numbers: [12, 3, 2],
            operators: ['÷', '×'],
            answer: 8,
            explanation: "12 ÷ 3 = 4, 4 × 2 = 8"
        };
    },
    
    // Teaching about operation order
    getOrderRule: function() {
        return "Ingat: Untuk perkalian dan pembagian, kerjakan dari kiri ke kanan.";
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranKaliBagiOperation.id] = CampuranKaliBagiOperation;
    console.log(`✅ Registered operation: ${CampuranKaliBagiOperation.name} (${CampuranKaliBagiOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testCampuranKaliBagi = function() {
        console.log("🧪 Testing Campuran Kali Bagi");
        
        const testLevel = { id: 8, min: 1, max: 50 };
        const question = CampuranKaliBagiOperation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}