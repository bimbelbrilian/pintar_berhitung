// ==========================================================
// PENJUMLAHAN 2 BILANGAN OPERATION MODULE
// ==========================================================

const Penjumlahan2Operation = {
    // Operation Identity
    id: 'penjumlahan_2',
    name: 'Soal Penjumlahan',
    description: '2 Bilangan',
    icon: '+',
    
    // Operation Configuration
    type: 'penjumlahan',
    numbers: 2,
    operators: ['+'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Penjumlahan 2 Bilangan question for Level ${level.id}`);
        
        // Tentukan batas minimum jawaban berdasarkan level
        const minAnswerByLevel = {
            1: 1,    // Level 1: tidak ada perubahan
            2: 6,    // Level 2: jawaban > 5
            3: 11,   // Level 3: jawaban > 10
            4: 21,   // Level 4: jawaban > 20
            5: 41,   // Level 5: jawaban > 40
            6: 101,  // Level 6: jawaban > 100
            7: 201,  // Level 7: jawaban > 200
            8: 401,  // Level 8: jawaban > 400
            9: 1001, // Level 9: jawaban > 1000
            10: 2001 // Level 10: jawaban > 2000
        };
        
        // Ambil batas minimum jawaban untuk level ini
        const minAnswer = minAnswerByLevel[level.id] || 1;
        
        let num1, num2, correctAnswer;
        let attempts = 0;
        const maxAttempts = 50; // Batas maksimal percobaan untuk menghindari infinite loop
        
        // Generate angka sampai jawaban memenuhi syarat minimal
        do {
            num1 = this.randomNumber(level.min, level.max);
            num2 = this.randomNumber(level.min, level.max);
            correctAnswer = num1 + num2;
            attempts++;
            
            // Jika sudah terlalu banyak percobaan, gunakan angka yang dijamin menghasilkan jawaban minimal
            if (attempts >= maxAttempts) {
                console.log(`⚠️ Max attempts reached for level ${level.id}. Using guaranteed numbers.`);
                
                // Pastikan jawaban memenuhi syarat minimal
                if (correctAnswer < minAnswer) {
                    // Sesuaikan salah satu angka agar jawaban memenuhi syarat
                    const needed = minAnswer - correctAnswer;
                    if (num1 + needed <= level.max) {
                        num1 += needed;
                    } else if (num2 + needed <= level.max) {
                        num2 += needed;
                    } else {
                        // Jika tidak bisa, atur angka minimum yang mungkin
                        num1 = Math.max(level.min, Math.floor(minAnswer / 2));
                        num2 = minAnswer - num1;
                        
                        // Pastikan tidak melebihi batas maksimum
                        if (num2 > level.max) {
                            num2 = level.max;
                            num1 = minAnswer - num2;
                        }
                    }
                    correctAnswer = num1 + num2;
                }
                break;
            }
        } while (correctAnswer < minAnswer);
        
        console.log(`✅ Generated: ${num1} + ${num2} = ${correctAnswer} (min: ${minAnswer}, attempts: ${attempts})`);
        
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
            type: this.id,
            minAnswerRequired: minAnswer // Informasi tambahan untuk debugging
        };
    },
    
    // Generate wrong answers for this operation
    generateWrongAnswers: function(correctAnswer, level) {
        const wrongAnswers = [];
        const maxAttempts = 10;
        
        // Tentukan batas minimal untuk level ini
        const minAnswerByLevel = {
            1: 1, 2: 6, 3: 11, 4: 21, 5: 41, 
            6: 101, 7: 201, 8: 401, 9: 1001, 10: 2001
        };
        const minAnswer = minAnswerByLevel[level.id] || 1;
        
        while (wrongAnswers.length < 3 && maxAttempts > 0) {
            let wrongAnswer;
            const offset = Math.floor(Math.random() * Math.max(3, level.max / 10)) + 1;
            
            // Randomly add or subtract offset
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(minAnswer, correctAnswer - offset); // Pastikan tidak kurang dari minimum
            }
            
            // Ensure wrong answer is within reasonable bounds
            const maxLimit = level.max * 2;
            if (wrongAnswer >= minAnswer && // Pastikan jawaban salah juga memenuhi batas minimal
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
        
        // Test untuk semua level
        for (let levelId = 1; levelId <= 10; levelId++) {
            console.log(`\n📊 Testing Level ${levelId}`);
            
            const testLevel = {
                id: levelId,
                min: 1,
                max: levelId * 100 // Maksimum meningkat sesuai level
            };
            
            // Test question generation
            const question = Penjumlahan2Operation.generateQuestion(testLevel);
            console.log(`Generated: ${question.numbers[0]} + ${question.numbers[1]} = ${question.correctAnswer}`);
            console.log(`Min answer required: ${question.minAnswerRequired}`);
            
            // Verifikasi bahwa jawaban memenuhi syarat
            const minAnswerByLevel = {
                1: 1, 2: 6, 3: 11, 4: 21, 5: 41, 
                6: 101, 7: 201, 8: 401, 9: 1001, 10: 2001
            };
            const minRequired = minAnswerByLevel[levelId];
            
            if (question.correctAnswer >= minRequired) {
                console.log(`✅ PASS: Answer ${question.correctAnswer} >= ${minRequired}`);
            } else {
                console.log(`❌ FAIL: Answer ${question.correctAnswer} < ${minRequired}`);
            }
        }
        
        // Test wrong answer generation untuk level tertentu
        console.log("\n🧪 Testing wrong answers for Level 5");
        const testLevel5 = {
            id: 5,
            min: 1,
            max: 100
        };
        const question = Penjumlahan2Operation.generateQuestion(testLevel5);
        const wrongAnswers = Penjumlahan2Operation.generateWrongAnswers(question.correctAnswer, testLevel5);
        console.log("Correct answer:", question.correctAnswer);
        console.log("Wrong answers:", wrongAnswers);
        
        return {
            success: true,
            operation: Penjumlahan2Operation.id,
            message: "Test completed. Check console for details."
        };
    };
    
    console.log("🧪 Penjumlahan 2 debug functions loaded. Call testPenjumlahan2() to test.");
}
