// ==========================================================
// PENGURANGAN 3 BILANGAN OPERATION MODULE
// ==========================================================

const Pengurangan3Operation = {
    // Operation Identity
    id: 'pengurangan_3',
    name: 'Soal Pengurangan Ganda',
    description: '3 Bilangan',
    icon: '−−',
    
    // Operation Configuration
    type: 'pengurangan',
    numbers: 3,
    operators: ['−', '−'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Pengurangan 3 Bilangan question for Level ${level.id}`);
        
        // Generate three numbers ensuring positive result
        let num1, num2, num3;
        do {
            num1 = this.randomNumber(level.min + 10, level.max);
            num2 = this.randomNumber(level.min, Math.min(num1 - 5, level.max / 2));
            num3 = this.randomNumber(level.min, Math.min(num1 - num2 - 3, level.max / 2));
        } while (num1 - num2 - num3 <= 0);
        
        // Calculate correct answer
        const correctAnswer = num1 - num2 - num3;
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(num1)}</span>
            <span class="operator">−</span>
            <span class="number">${this.formatNumber(num2)}</span>
            <span class="operator">−</span>
            <span class="number">${this.formatNumber(num3)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [num1, num2, num3],
            operators: ['−', '−'],
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
            const offset = Math.floor(Math.random() * Math.max(4, level.max / 6)) + 1;
            
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(1, correctAnswer - offset);
            }
            
            if (wrongAnswer > 0 && 
                wrongAnswer <= level.max && 
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
        if (numbers.length !== 3) return null;
        
        const [num1, num2, num3] = numbers;
        return `Kurangi ${num1} dengan ${num2}, lalu kurangi hasilnya dengan ${num3}. (${num1} − ${num2}) − ${num3} = ?`;
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
        category: 'basic_arithmetic',
        requiresBorrowing: true
    },
    
    // Operation description
    getDescription: function() {
        return "Melakukan pengurangan berurutan dengan tiga bilangan. Contoh: 20 − 5 − 3 = 12";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "15 − 6 − 3 = ...",
            numbers: [15, 6, 3],
            answer: 6,
            explanation: "15 dikurangi 6 sama dengan 9, dikurangi 3 sama dengan 6"
        };
    },
    
    // Teaching strategy
    getStrategyTip: function() {
        return "Tips: Kerjakan pengurangan dari kiri ke kanan satu per satu.";
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[Pengurangan3Operation.id] = Pengurangan3Operation;
    console.log(`✅ Registered operation: ${Pengurangan3Operation.name} (${Pengurangan3Operation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPengurangan3 = function() {
        console.log("🧪 Testing Pengurangan 3 Bilangan");
        
        const testLevel = { id: 4, min: 1, max: 30 };
        const question = Pengurangan3Operation.generateQuestion(testLevel);
        console.log("Question:", question);
        
        return question;
    };
}
