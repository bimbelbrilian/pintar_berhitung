// ==========================================================
// CAMPURAN SEMUA OPERATOR OPERATION MODULE
// ==========================================================

const CampuranSemuaOperation = {
    // Operation Identity
    id: 'campuran_semua',
    name: 'Campuran',
    description: 'Semua Operator',
    icon: '±×÷',
    
    // Operation Configuration
    type: 'campuran',
    numbers: 4, // More numbers for complex operations
    operators: ['+', '−', '×', '÷'], // Will be selected randomly
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Campuran Semua question for Level ${level.id}`);
        
        let numbers, operators, correctAnswer;
        let attempts = 0;
        const maxAttempts = 5;
        
        do {
            attempts++;
            
            // Generate 4 numbers
            numbers = [
                this.randomNumber(1, 10),
                this.randomNumber(1, 10),
                this.randomNumber(1, 10),
                this.randomNumber(1, 10)
            ];
            
            // Randomly select 3 operators (avoid consecutive division)
            operators = [];
            const availableOps = ['+', '−', '×', '÷'];
            
            for (let i = 0; i < 3; i++) {
                let op;
                do {
                    op = availableOps[Math.floor(Math.random() * availableOps.length)];
                } while (i > 0 && operators[i-1] === '÷' && op === '÷'); // Avoid ÷ ÷
                
                operators.push(op);
            }
            
            // Calculate result following left-to-right rule
            correctAnswer = this.calculateExpression(numbers, operators);
            
        } while ((!Number.isInteger(correctAnswer) || correctAnswer <= 0 || correctAnswer > 100) && attempts < maxAttempts);
        
        // Fallback if no valid expression found
        if (attempts >= maxAttempts) {
            // Use a simpler guaranteed expression
            numbers = [6, 2, 3, 1];
            operators = ['×', '+', '−'];
            correctAnswer = this.calculateExpression(numbers, operators);
        }
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(numbers[0])}</span>
            <span class="operator">${operators[0]}</span>
            <span class="number">${this.formatNumber(numbers[1])}</span>
            <span class="operator">${operators[1]}</span>
            <span class="number">${this.formatNumber(numbers[2])}</span>
            <span class="operator">${operators[2]}</span>
            <span class="number">${this.formatNumber(numbers[3])}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: numbers,
            operators: operators,
            level: level.id,
            type: this.id,
            complexity: 'high'
        };
    },
    
    // Calculate expression left to right
    calculateExpression: function(numbers, operators) {
        let result = numbers[0];
        
        for (let i = 0; i < operators.length; i++) {
            const nextNumber = numbers[i + 1];
            const operator = operators[i];
            
            switch (operator) {
                case '+':
                    result += nextNumber;
                    break;
                case '−':
                    result -= nextNumber;
                    break;
                case '×':
                    result *= nextNumber;
                    break;
                case '÷':
                    if (nextNumber === 0) return NaN; // Avoid division by zero
                    if (result % nextNumber !== 0) return NaN; // Require whole number
                    result /= nextNumber;
                    break;
            }
            
            // If we get a non-integer or negative, return invalid
            if (!Number.isInteger(result) || result < 0) {
                return NaN;
            }
        }
        
        return result;
    },
    
    // Generate wrong answers
    generateWrongAnswers: function(correctAnswer, level, numbers, operators) {
        const wrongAnswers = [];
        const maxAttempts = 15;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            
            // Different types of common mistakes
            const mistakeType = Math.random();
            
            if (mistakeType < 0.3) {
                // Wrong order of operations (trying PEMDAS incorrectly)
                wrongAnswer = this.calculateWithPEMDAS(numbers, operators);
            } else if (mistakeType < 0.6) {
                // Simple offset
                const offset = Math.floor(Math.random() * Math.max(5, correctAnswer / 10)) + 1;
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
            } else {
                // Random wrong calculation
                wrongAnswer = this.randomNumber(1, 50);
            }
            
            if (wrongAnswer > 0 && 
                wrongAnswer <= 200 && 
                !wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== correctAnswer &&
                Number.isInteger(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    },
    
    // Calculate with PEMDAS (wrong for this game's left-to-right rule)
    calculateWithPEMDAS: function(numbers, operators) {
        try {
            // Create expression string
            let expression = '';
            for (let i = 0; i < numbers.length; i++) {
                expression += numbers[i];
                if (i < operators.length) {
                    expression += operators[i];
                }
            }
            
            // This would be wrong since game uses left-to-right, not PEMDAS
            return eval(expression);
        } catch {
            return NaN;
        }
    },
    
    // Validate answer
    validateAnswer: function(userAnswer, correctAnswer) {
        return parseInt(userAnswer) === correctAnswer;
    },
    
    // Get hint
    getHint: function(numbers, operators) {
        if (numbers.length !== 4 || operators.length !== 3) return null;
        
        return `Kerjakan dari kiri ke kanan: ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} ${operators[2]} ${numbers[3]}`;
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
        difficulty: 'very_hard',
        category: 'mixed_operations_all',
        requiresAdvancedThinking: true
    },
    
    // Operation description
    getDescription: function() {
        return "Operasi campuran dengan semua operator (+ − × ÷). Kerjakan dari kiri ke kanan. Contoh: 8 + 3 × 2 − 4 = ?";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "4 + 3 × 2 − 1 = ...",
            numbers: [4, 3, 2, 1],
            operators: ['+', '×', '−'],
            answer: 13, // (4+3)=7, 7×2=14, 14-1=13
            explanation: "Kerjakan dari kiri ke kanan: 4 + 3 = 7, 7 × 2 = 14, 14 − 1 = 13"
        };
    },
    
    // Important rule reminder
    getRule: function() {
        return "PENTING: Dalam game ini, semua operasi dikerjakan dari KIRI ke KANAN, bukan mengikuti aturan perkalian/pembagian dulu!";
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranSemuaOperation.id] = CampuranSemuaOperation;
    console.log(`✅ Registered operation: ${CampuranSemuaOperation.name} (${CampuranSemuaOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testCampuranSemua = function() {
        console.log("🧪 Testing Campuran Semua");
        
        const testLevel = { id: 9, min: 1, max: 100 };
        const question = CampuranSemuaOperation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}