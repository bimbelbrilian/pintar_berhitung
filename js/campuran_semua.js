// ==========================================================
// CAMPURAN SEMUA OPERATOR OPERATION MODULE (WITH PEMDAS)
// ==========================================================

const CampuranSemuaOperation = {
    // Operation Identity
    id: 'campuran_semua',
    name: 'Campuran',
    description: 'Semua Operator (PEMDAS)',
    icon: '±×÷',
    
    // Operation Configuration
    type: 'campuran',
    numbers: 4,
    operators: ['+', '−', '×', '÷'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Campuran Semua question for Level ${level.id}`);
        
        // Tentukan rentang bilangan berdasarkan level
        const levelRanges = {
            1: { min: 1, max: 5 },
            2: { min: 1, max: 10 },
            3: { min: 1, max: 20 },
            4: { min: 11, max: 50 },
            5: { min: 21, max: 100 },
            6: { min: 50, max: 200 },
            7: { min: 100, max: 500 },
            8: { min: 200, max: 1000 },
            9: { min: 500, max: 5000 },
            10: { min: 1000, max: 10000 }
        };
        
        const range = levelRanges[level.id] || levelRanges[1];
        const { min, max } = range;
        
        let numbers, operators, correctAnswer;
        let attempts = 0;
        const maxAttempts = 30; // Lebih banyak percobaan untuk memastikan bilangan bulat
        
        do {
            attempts++;
            
            // Generate numbers with special considerations for integer results
            numbers = this.generateIntegerFriendlyNumbers(min, max, level.id);
            
            // Generate unique operators
            operators = this.generateUniqueOperators();
            if (!operators) continue;
            
            // Validate operators with numbers for integer results
            if (!this.validateOperatorsForIntegerResult(numbers, operators)) {
                continue;
            }
            
            // Calculate result
            correctAnswer = this.calculateWithPEMDAS(numbers, operators);
            
            // Validate: MUST be integer, positive, and reasonable size
            if (!Number.isInteger(correctAnswer) || correctAnswer <= 0) {
                continue;
            }
            
            // Additional validation for level-appropriate results
            if (!this.isResultAppropriateForLevel(correctAnswer, level.id, max)) {
                continue;
            }
            
            // SUCCESS: Found valid expression with integer result
            break;
            
        } while (attempts < maxAttempts);
        
        // FALLBACK: Use guaranteed integer expressions
        if (attempts >= maxAttempts || !Number.isInteger(correctAnswer)) {
            console.log(`⚠️ Using guaranteed integer expression for level ${level.id}`);
            ({ numbers, operators, correctAnswer } = this.getGuaranteedIntegerExpression(level.id, min, max));
        }
        
        // Final validation
        if (!Number.isInteger(correctAnswer)) {
            // Ultimate fallback
            numbers = [6, 2, 3, 1];
            operators = ['÷', '+', '×'];
            correctAnswer = this.calculateWithPEMDAS(numbers, operators);
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
        
        console.log(`✅ Level ${level.id}: Range ${min}-${max}`);
        console.log(`   Expression: ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} ${operators[2]} ${numbers[3]} = ${correctAnswer}`);
        console.log(`   Result: ${correctAnswer} (${Number.isInteger(correctAnswer) ? '✅ Integer' : '❌ Non-integer'})`);
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: numbers,
            operators: operators,
            level: level.id,
            type: this.id,
            complexity: 'high',
            range: `${min}-${max}`,
            calculationMethod: 'PEMDAS',
            operatorsUnique: [...new Set(operators)].length === 3,
            isIntegerResult: Number.isInteger(correctAnswer)
        };
    },
    
    // Generate numbers that are more likely to produce integer results
    generateIntegerFriendlyNumbers: function(min, max, levelId) {
        const numbers = [
            this.getRandomInRange(min, max),
            this.getRandomInRange(min, max),
            this.getRandomInRange(min, max),
            this.getRandomInRange(min, max)
        ];
        
        // Special adjustments for division to ensure integer results
        // If there might be division, make numbers divisible
        const hasDivision = Math.random() > 0.5;
        
        if (hasDivision && levelId <= 5) {
            // For lower levels, ensure divisibility for potential division
            const divisiblePairs = this.findDivisiblePairs(numbers);
            if (divisiblePairs.length > 0) {
                const pair = divisiblePairs[0];
                // Adjust to ensure clean division
                numbers[pair.index] = pair.numerator;
                numbers[pair.index + 1] = pair.denominator;
            }
        }
        
        return numbers;
    },
    
    // Find pairs that could be used for division
    findDivisiblePairs: function(numbers) {
        const pairs = [];
        
        for (let i = 0; i < numbers.length - 1; i++) {
            const a = numbers[i];
            const b = numbers[i + 1];
            
            // Find a divisor that divides a evenly
            if (b !== 0 && a % b === 0) {
                pairs.push({
                    index: i,
                    numerator: a,
                    denominator: b,
                    quotient: a / b
                });
            }
            // Or find a multiple of b
            else if (a !== 0 && b % a === 0) {
                pairs.push({
                    index: i,
                    numerator: b,
                    denominator: a,
                    quotient: b / a
                });
            }
        }
        
        return pairs;
    },
    
    // Validate that operators will produce integer result
    validateOperatorsForIntegerResult: function(numbers, operators) {
        // Check each division operation
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷') {
                // Simulate calculation up to this point
                const partialResult = this.simulateCalculationUpToIndex(numbers, operators, i);
                if (partialResult === null || !Number.isInteger(partialResult)) {
                    return false;
                }
                
                // Check if division will be integer
                const divisor = numbers[i + 1];
                if (divisor === 0 || partialResult % divisor !== 0) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Simulate calculation up to a specific index
    simulateCalculationUpToIndex: function(numbers, operators, stopIndex) {
        const simNumbers = numbers.slice(0, stopIndex + 2);
        const simOps = operators.slice(0, stopIndex + 1);
        
        try {
            return this.calculateWithPEMDAS(simNumbers, simOps);
        } catch {
            return null;
        }
    },
    
    // Check if result is appropriate for the level
    isResultAppropriateForLevel: function(result, levelId, max) {
        const maxMultipliers = {
            1: 3, 2: 4, 3: 5, 4: 6, 5: 8,
            6: 10, 7: 12, 8: 15, 9: 20, 10: 25
        };
        
        const multiplier = maxMultipliers[levelId] || 10;
        const maxAllowed = max * multiplier;
        
        return result > 0 && result <= maxAllowed;
    },
    
    // Get guaranteed integer expression for each level
    getGuaranteedIntegerExpression: function(levelId, min, max) {
        const guaranteedExpressions = {
            1: { 
                numbers: [4, 2, 3, 1], 
                operators: ['÷', '+', '−'],
                description: "4 ÷ 2 + 3 - 1 = 4"
            },
            2: { 
                numbers: [8, 4, 6, 2], 
                operators: ['÷', '+', '×'],
                description: "8 ÷ 4 + 6 × 2 = 14" // 2 + 12 = 14
            },
            3: { 
                numbers: [12, 3, 8, 4], 
                operators: ['÷', '+', '−'],
                description: "12 ÷ 3 + 8 - 4 = 8" // 4 + 8 - 4 = 8
            },
            4: { 
                numbers: [24, 6, 10, 5], 
                operators: ['÷', '+', '×'],
                description: "24 ÷ 6 + 10 × 5 = 54" // 4 + 50 = 54
            },
            5: { 
                numbers: [36, 4, 25, 10], 
                operators: ['÷', '+', '−'],
                description: "36 ÷ 4 + 25 - 10 = 24" // 9 + 25 - 10 = 24
            },
            6: { 
                numbers: [100, 5, 50, 25], 
                operators: ['÷', '+', '−'],
                description: "100 ÷ 5 + 50 - 25 = 45" // 20 + 50 - 25 = 45
            },
            7: { 
                numbers: [200, 4, 100, 50], 
                operators: ['÷', '+', '×'],
                description: "200 ÷ 4 + 100 × 50 = 5050" // 50 + 5000 = 5050
            },
            8: { 
                numbers: [400, 8, 200, 100], 
                operators: ['÷', '+', '−'],
                description: "400 ÷ 8 + 200 - 100 = 150" // 50 + 200 - 100 = 150
            },
            9: { 
                numbers: [1000, 5, 500, 200], 
                operators: ['÷', '+', '×'],
                description: "1000 ÷ 5 + 500 × 200 = 100200" // 200 + 100000 = 100200
            },
            10: { 
                numbers: [2000, 4, 1000, 500], 
                operators: ['÷', '+', '−'],
                description: "2000 ÷ 4 + 1000 - 500 = 1000" // 500 + 1000 - 500 = 1000
            }
        };
        
        const expression = guaranteedExpressions[levelId] || guaranteedExpressions[1];
        const correctAnswer = this.calculateWithPEMDAS(expression.numbers, expression.operators);
        
        // Adjust numbers to fit within level range if needed
        const adjustedNumbers = expression.numbers.map(num => {
            if (num < min) return min;
            if (num > max) return max;
            return num;
        });
        
        return {
            numbers: adjustedNumbers,
            operators: expression.operators,
            correctAnswer: correctAnswer
        };
    },
    
    // Generate 3 unique operators
    generateUniqueOperators: function() {
        const allOps = ['+', '−', '×', '÷'];
        const shuffled = [...allOps].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    },
    
    // Calculate with PEMDAS - ENHANCED to ensure integer results
    calculateWithPEMDAS: function(numbers, operators) {
        try {
            // Clone arrays
            let nums = [...numbers];
            let ops = [...operators];
            
            // Step 1: Process ALL multiplication and division from left to right
            let i = 0;
            while (i < ops.length) {
                if (ops[i] === '×' || ops[i] === '÷') {
                    const left = nums[i];
                    const right = nums[i + 1];
                    
                    if (ops[i] === '÷') {
                        // CRITICAL: Verify integer division
                        if (right === 0) return NaN;
                        if (left % right !== 0) return NaN;
                    }
                    
                    // Perform operation
                    const result = ops[i] === '×' ? left * right : left / right;
                    
                    // Verify result is integer
                    if (!Number.isInteger(result)) return NaN;
                    
                    // Replace
                    nums.splice(i, 2, result);
                    ops.splice(i, 1);
                } else {
                    i++;
                }
            }
            
            // Step 2: Process ALL addition and subtraction from left to right
            let finalResult = nums[0];
            for (let j = 0; j < ops.length; j++) {
                const nextNum = nums[j + 1];
                
                if (ops[j] === '+') {
                    finalResult += nextNum;
                } else if (ops[j] === '−') {
                    finalResult -= nextNum;
                }
                
                // Verify still integer
                if (!Number.isInteger(finalResult)) return NaN;
            }
            
            // Final validation
            if (!Number.isInteger(finalResult) || finalResult < 0) {
                return NaN;
            }
            
            return finalResult;
            
        } catch (error) {
            console.error("PEMDAS calculation error:", error);
            return NaN;
        }
    },
    
    // Generate wrong answers (ensuring they are integers too)
    generateWrongAnswers: function(correctAnswer, level, numbers, operators) {
        const wrongAnswers = new Set(); // Use Set to avoid duplicates
        const maxAttempts = 50;
        
        // Common integer mistakes
        const generateMistake = () => {
            const types = [
                () => this.calculateLeftToRight(numbers, operators),
                () => this.calculateAdditionFirst(numbers, operators),
                () => {
                    // Simple offset
                    const offset = Math.floor(Math.random() * Math.max(2, Math.floor(correctAnswer / 10))) + 1;
                    return correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                },
                () => {
                    // Double or half
                    return Math.random() > 0.5 ? 
                        Math.floor(correctAnswer * 2) : 
                        Math.floor(correctAnswer / 2);
                }
            ];
            
            const type = types[Math.floor(Math.random() * types.length)];
            return type();
        };
        
        let attempts = 0;
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            attempts++;
            
            let wrongAnswer = generateMistake();
            
            // Validate: must be integer, positive, different from correct, and not too extreme
            if (Number.isInteger(wrongAnswer) && 
                wrongAnswer > 0 && 
                wrongAnswer !== correctAnswer &&
                Math.abs(wrongAnswer - correctAnswer) < correctAnswer * 2) {
                
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        // If still not enough, generate simple integers
        while (wrongAnswers.size < 3) {
            const simpleWrong = Math.max(1, correctAnswer + Math.floor(Math.random() * 10) - 5);
            if (simpleWrong !== correctAnswer) {
                wrongAnswers.add(simpleWrong);
            }
        }
        
        return Array.from(wrongAnswers);
    },
    
    // Helper methods for wrong answer generation
    calculateLeftToRight: function(numbers, operators) {
        let result = numbers[0];
        for (let i = 0; i < operators.length; i++) {
            const op = operators[i];
            const next = numbers[i + 1];
            
            switch (op) {
                case '+': result += next; break;
                case '−': result -= next; break;
                case '×': result *= next; break;
                case '÷': 
                    if (next === 0 || result % next !== 0) return NaN;
                    result /= next; 
                    break;
            }
            
            if (!Number.isInteger(result)) return NaN;
        }
        return result;
    },
    
    calculateAdditionFirst: function(numbers, operators) {
        // Process + and - first, then × and ÷
        const nums = [...numbers];
        const ops = [...operators];
        
        // First pass: + and -
        for (let i = 0; i < ops.length; i++) {
            if (ops[i] === '+' || ops[i] === '−') {
                const left = nums[i];
                const right = nums[i + 1];
                const result = ops[i] === '+' ? left + right : left - right;
                
                if (!Number.isInteger(result) || result < 0) return NaN;
                
                nums.splice(i, 2, result);
                ops.splice(i, 1);
                i--;
            }
        }
        
        // Second pass: × and ÷
        let final = nums[0];
        for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            const next = nums[i + 1];
            
            if (op === '×') {
                final *= next;
            } else if (op === '÷') {
                if (next === 0 || final % next !== 0) return NaN;
                final /= next;
            }
            
            if (!Number.isInteger(final)) return NaN;
        }
        
        return final;
    },
    
    // Helper: Get random number in range
    getRandomInRange: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Helper: Format number
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    // Validate answer
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    // Get hint
    getHint: function(numbers, operators) {
        if (!numbers || !operators) return "Kerjakan dengan aturan PEMDAS!";
        
        let hint = "Aturan PEMDAS: ";
        hint += "1) Perkalian (×) dan Pembagian (÷) dulu, ";
        hint += "2) Penjumlahan (+) dan Pengurangan (−) kemudian.<br><br>";
        hint += `Soal: ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} ${operators[2]} ${numbers[3]}`;
        
        return hint;
    },
    
    // Operation info
    stats: {
        difficulty: 'very_hard',
        category: 'mixed_operations_all',
        requiresPEMDAS: true,
        requiresUniqueOperators: true,
        alwaysIntegerResult: true
    },
    
    getDescription: function() {
        return "Operasi campuran dengan 4 bilangan dan 3 operator berbeda (+ − × ÷). Gunakan aturan PEMDAS. Hasil selalu bilangan bulat.";
    },
    
    getExample: function() {
        return {
            question: "6 ÷ 2 + 4 × 3 = ...",
            numbers: [6, 2, 4, 3],
            operators: ['÷', '+', '×'],
            answer: 15,
            explanation: "PEMDAS: 6 ÷ 2 = 3, 4 × 3 = 12, 3 + 12 = 15"
        };
    },
    
    // Test function for integer results
    testIntegerResults: function(numTests = 20) {
        console.log(`🧪 Testing INTEGER RESULTS (${numTests} tests)`);
        
        let allInteger = true;
        const nonIntegerTests = [];
        
        for (let levelId = 1; levelId <= 10; levelId++) {
            console.log(`\n📊 Level ${levelId}:`);
            
            for (let i = 1; i <= Math.ceil(numTests / 10); i++) {
                const testLevel = { id: levelId, min: 1, max: 100 };
                const question = this.generateQuestion(testLevel);
                
                const isInteger = Number.isInteger(question.correctAnswer);
                const status = isInteger ? '✅' : '❌';
                
                console.log(`  ${status} Test ${i}: ${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} ${question.operators[2]} ${question.numbers[3]} = ${question.correctAnswer}`);
                
                if (!isInteger) {
                    allInteger = false;
                    nonIntegerTests.push({
                        level: levelId,
                        test: i,
                        expression: `${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} ${question.operators[2]} ${question.numbers[3]}`,
                        result: question.correctAnswer
                    });
                }
            }
        }
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`All results integer: ${allInteger ? '✅ YES' : '❌ NO'}`);
        
        if (nonIntegerTests.length > 0) {
            console.log(`Non-integer results found: ${nonIntegerTests.length}`);
            nonIntegerTests.forEach(test => {
                console.log(`  Level ${test.level}, Test ${test.test}: ${test.expression} = ${test.result}`);
            });
        }
        
        return {
            success: allInteger,
            totalTests: numTests,
            nonIntegerCount: nonIntegerTests.length,
            details: nonIntegerTests
        };
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranSemuaOperation.id] = CampuranSemuaOperation;
    console.log(`✅ Registered: ${CampuranSemuaOperation.name} (ALWAYS INTEGER RESULTS)`);
}

// Debug functions
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testCampuranInteger = function(tests = 10) {
        return CampuranSemuaOperation.testIntegerResults(tests);
    };
    
    console.log("🧪 Integer test loaded: testCampuranInteger(10)");
}