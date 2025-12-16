// ==========================================================
// PERKALIAN OPERATION MODULE
// ==========================================================

const PerkalianOperation = {
    // Operation Identity
    id: 'perkalian_2',
    name: 'Soal Perkalian',
    description: '2 Bilangan',
    icon: '×',
    
    // Operation Configuration
    type: 'perkalian',
    numbers: 2,
    operators: ['×'],
    
    // Get number range based on level
    getNumberRange: function(level) {
        const ranges = {
            1: { min: 1, max: 5 },
            2: { min: 1, max: 10 },
            3: { min: 1, max: 20 },
            4: { min: 11, max: 50 },
            5: { min: 20, max: 100 },
            6: { min: 50, max: 200 },
            7: { min: 100, max: 500 },
            8: { min: 200, max: 1000 },
            9: { min: 500, max: 5000 },
            10: { min: 1000, max: 10000 }
        };
        
        return ranges[level] || ranges[1];
    },
    
    // Strategi cerdas untuk generate angka
    generateNumbers: function(level) {
        const range = this.getNumberRange(level);
        
        // Tentukan batas maksimal hasil perkalian berdasarkan level
        let maxResult;
        switch(level) {
            case 1: maxResult = 25; break;      // 5×5
            case 2: maxResult = 100; break;     // 10×10
            case 3: maxResult = 400; break;     // 20×20
            case 4: maxResult = 2500; break;    // 50×50
            case 5: maxResult = 10000; break;   // 100×100
            case 6: maxResult = 40000; break;   // 200×200
            case 7: maxResult = 250000; break;  // 500×500
            case 8: maxResult = 1000000; break; // 1000×1000
            case 9: maxResult = 25000000; break;// 5000×5000
            case 10: maxResult = 100000000; break; // 10000×10000
            default: maxResult = 1000;
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Untuk level tinggi, gunakan strategi khusus
            if (level >= 9) {
                // Level 9-10: Satu angka besar, satu angka kecil/menengah
                const strategy = Math.random();
                if (strategy < 0.5) {
                    // 50%: Angka besar × angka kecil (1-10)
                    const num1 = this.randomNumber(range.min, range.max);
                    const num2 = this.randomNumber(1, Math.min(10, range.max));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                } else if (strategy < 0.8) {
                    // 30%: Dua angka menengah
                    const midRange = Math.floor((range.min + range.max) / 2);
                    const num1 = this.randomNumber(range.min, midRange);
                    const num2 = this.randomNumber(1, Math.min(20, midRange));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                } else {
                    // 20%: Dua angka relatif kecil dari rentang
                    const num1 = this.randomNumber(range.min, range.min * 5);
                    const num2 = this.randomNumber(1, Math.min(15, range.min * 3));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                }
            } 
            else if (level >= 7) {
                // Level 7-8: Variasi lebih banyak
                const strategy = Math.random();
                if (strategy < 0.4) {
                    // 40%: Angka besar × angka kecil
                    const num1 = this.randomNumber(range.min, range.max);
                    const num2 = this.randomNumber(1, Math.min(15, range.max));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                } else if (strategy < 0.7) {
                    // 30%: Dua angka menengah
                    const midPoint = Math.floor((range.min + range.max) / 2);
                    const num1 = this.randomNumber(range.min, midPoint);
                    const num2 = this.randomNumber(1, Math.min(25, midPoint));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                } else {
                    // 30%: Kedua angka dari range penuh
                    const num1 = this.randomNumber(range.min, range.max);
                    const num2 = this.randomNumber(1, Math.min(30, range.max));
                    if (num1 * num2 <= maxResult) {
                        return [num1, num2];
                    }
                }
            }
            else if (level >= 4) {
                // Level 4-6: Normal generation dengan faktor pembatas
                const num1 = this.randomNumber(range.min, range.max);
                const num2 = this.randomNumber(1, Math.min(50, range.max));
                if (num1 * num2 <= maxResult) {
                    return [num1, num2];
                }
            }
            else {
                // Level 1-3: Generate normal (hasil tidak akan terlalu besar)
                const num1 = this.randomNumber(range.min, range.max);
                const num2 = this.randomNumber(range.min, range.max);
                return [num1, num2]; // Tidak perlu cek maxResult untuk level rendah
            }
        }
        
        // Fallback jika semua gagal
        console.warn(`Fallback for level ${level} after ${maxAttempts} attempts`);
        const num1 = this.randomNumber(range.min, Math.min(range.max, 100));
        const num2 = this.randomNumber(1, Math.min(10, range.max));
        return [num1, num2];
    },
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Perkalian question for Level ${level.id}`);
        
        // Generate numbers using smart strategy
        const [num1, num2] = this.generateNumbers(level.id);
        
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
        const wrongAnswers = new Set();
        const maxAttempts = 30;
        let attempts = 0;
        
        // Determine error margin based on level
        let errorMargin;
        if (level <= 3) errorMargin = 5;
        else if (level <= 6) errorMargin = Math.max(10, correctAnswer * 0.1);
        else if (level <= 8) errorMargin = Math.max(20, correctAnswer * 0.15);
        else errorMargin = Math.max(50, correctAnswer * 0.2);
        
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            attempts++;
            
            const strategy = Math.random();
            let wrongAnswer;
            
            if (strategy < 0.3) {
                // Offset
                const offset = this.randomNumber(1, errorMargin);
                wrongAnswer = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
            } 
            else if (strategy < 0.6) {
                // Percentage mistake (10-30% off)
                const percentage = this.randomNumber(10, 30) / 100;
                wrongAnswer = Math.floor(correctAnswer * (1 + (Math.random() > 0.5 ? percentage : -percentage)));
            }
            else {
                // Rounding mistake
                const roundTo = this.randomNumber(10, 100);
                wrongAnswer = Math.round(correctAnswer / roundTo) * roundTo;
                wrongAnswer += this.randomNumber(-roundTo, roundTo);
            }
            
            // Validate the wrong answer
            if (wrongAnswer > 0 && 
                wrongAnswer !== correctAnswer && 
                Math.abs(wrongAnswer - correctAnswer) <= errorMargin * 3) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        // Fill remaining spots if needed
        const result = Array.from(wrongAnswers);
        while (result.length < 3) {
            const offset = this.randomNumber(1, 10);
            result.push(correctAnswer + offset * (result.length + 1));
        }
        
        return result.slice(0, 3);
    },
    
    // Validate answer
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    // Get hint
    getHint: function(numbers) {
        if (numbers.length !== 2) return null;
        
        const [num1, num2] = numbers;
        return `Kalikan ${this.formatNumber(num1)} dengan ${this.formatNumber(num2)}. Contoh: ${this.formatNumber(num1)} × ${this.formatNumber(num2)} = ${this.formatNumber(num1 * num2)}`;
    },
    
    // Helper functions
    randomNumber: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
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
        console.log("🧪 Testing Perkalian Generation");
        
        // Test all levels
        for (let level = 1; level <= 10; level++) {
            console.log(`\n--- Level ${level} ---`);
            
            const testLevel = { id: level };
            const range = PerkalianOperation.getNumberRange(level);
            console.log(`Range: ${range.min} - ${range.max}`);
            
            // Test 3 questions per level
            for (let i = 0; i < 3; i++) {
                try {
                    const question = PerkalianOperation.generateQuestion(testLevel);
                    const [num1, num2] = question.numbers;
                    const result = num1 * num2;
                    
                    console.log(`  Q${i+1}: ${num1} × ${num2} = ${result}`);
                    console.log(`    Numbers in range: ${num1 >= range.min && num1 <= range.max && num2 >= 1 && num2 <= range.max ? '✓' : '✗'}`);
                    
                    // Test wrong answers
                    const wrongAnswers = PerkalianOperation.generateWrongAnswers(result, level);
                    console.log(`    Wrong answers: ${wrongAnswers.join(', ')}`);
                } catch (error) {
                    console.error(`  Error generating question: ${error.message}`);
                }
            }
        }
        
        return "Test completed!";
    };
}
