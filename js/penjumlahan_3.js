// ==========================================================
// PENJUMLAHAN 3 BILANGAN OPERATION MODULE
// ==========================================================

const Penjumlahan3Operation = {
    // Operation Identity
    id: 'penjumlahan_3',
    name: 'Soal Penjumlahan Ganda',
    description: '3 Bilangan',
    icon: '++',
    
    // Operation Configuration
    type: 'penjumlahan',
    numbers: 3,
    operators: ['+', '+'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Penjumlahan 3 Bilangan question for Level ${level.id}`);
        
        // Generate three random numbers based on level range
        const num1 = this.randomNumber(level.min, level.max);
        const num2 = this.randomNumber(level.min, level.max);
        const num3 = this.randomNumber(level.min, level.max);
        
        // Calculate correct answer
        const correctAnswer = num1 + num2 + num3;
        
        // Create question HTML with proper styling
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">+</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="operator">+</span>
            <span class="number">${this.formatNumber(num3)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2, num3],
            operators: ['+', '+'],
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
            const offset = Math.floor(Math.random() * Math.max(5, level.max / 5)) + 1;
            
            // Randomly add or subtract offset
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(1, correctAnswer - offset);
            }
            
            // Ensure wrong answer is within reasonable bounds
            const maxLimit = level.max * 3;
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
        if (numbers.length !== 3) return null;
        
        const [num1, num2, num3] = numbers;
        return `Jumlahkan ketiga bilangan: ${num1} + ${num2} + ${num3} = ?`;
    },
    
    // Helper: Generate random number
    randomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Helper: Format number with Indonesian thousands separator
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    // Operation statistics
    stats: {
        difficulty: 'medium',
        category: 'basic_arithmetic',
        requiresCarry: true
    },
    
    // Operation description for help
    getDescription: function() {
        return "Menjumlahkan tiga bilangan bulat positif. Contoh: 5 + 3 + 2 = 10";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "4 + 7 + 3 = ...",
            numbers: [4, 7, 3],
            answer: 14,
            explanation: "4 ditambah 7 sama dengan 11, ditambah 3 sama dengan 14"
        };
    },
    
    // Additional method for teaching strategy
    getStrategyTip: function() {
        return "Tips: Cari pasangan bilangan yang mudah dijumlahkan dulu, misalnya angka yang jika dijumlahkan menjadi 10.";
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[Penjumlahan3Operation.id] = Penjumlahan3Operation;
    console.log(`✅ Registered operation: ${Penjumlahan3Operation.name} (${Penjumlahan3Operation.id})`);
}

// ==========================================================
// UTILITY FUNCTIONS
// ==========================================================

const Penjumlahan3Utils = {
    // Check optimal order for addition (commutative property)
    suggestOptimalOrder: function(numbers) {
        return [...numbers].sort((a, b) => a - b); // Urutkan dari terkecil ke terbesar
    },
    
    // Calculate partial sums for teaching
    calculatePartialSums: function(numbers) {
        const partials = [];
        let sum = 0;
        numbers.forEach((num, index) => {
            sum += num;
            partials.push({
                step: index + 1,
                operation: `${index === 0 ? '' : ' + '}${num}`,
                totalSoFar: sum
            });
        });
        return partials;
    }
};

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPenjumlahan3 = function() {
        console.log("🧪 Testing Penjumlahan 3 Bilangan");
        
        const testLevel = { id: 3, min: 1, max: 15 };
        const question = Penjumlahan3Operation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}
