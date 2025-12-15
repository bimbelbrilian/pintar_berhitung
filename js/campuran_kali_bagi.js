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
    operators: ['×', '÷'],
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Campuran Kali Bagi question for Level ${level.id}`);
        
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
        
        // Ambil rentang untuk level ini
        const range = levelRanges[level.id] || levelRanges[1];
        const { min, max } = range;
        
        // PENGECUALIAN KHUSUS: Hanya pembagi yang harus ≤ 100 untuk level 6-10
        const MAX_DIVISOR = 100;
        const isHighLevel = level.id >= 6;
        
        let numbers, operators, correctAnswer;
        let attempts = 0;
        const maxAttempts = 50; // Lebih banyak percobaan
        
        do {
            attempts++;
            
            // Pilih pola operasi
            const pattern = Math.random() > 0.5 ? 'times_divide' : 'divide_times';
            
            if (pattern === 'times_divide') {
                // Pola: (a × b) ÷ c
                numbers = this.generateTimesDivideNumbersWithUniqueValues(min, max, level.id, isHighLevel, MAX_DIVISOR);
                operators = ['×', '÷'];
            } else {
                // Pola: (a ÷ b) × c
                numbers = this.generateDivideTimesNumbersWithUniqueValues(min, max, level.id, isHighLevel, MAX_DIVISOR);
                operators = ['÷', '×'];
            }
            
            // VALIDASI 1: Pastikan semua angka dalam rentang level
            const allInRange = this.validateNumbersInRange(numbers, min, max, isHighLevel, MAX_DIVISOR, operators);
            if (!allInRange) {
                console.log(`⚠️ Attempt ${attempts}: Numbers out of range`);
                continue;
            }
            
            // VALIDASI 2: Pastikan semua angka berbeda
            const allUnique = this.areAllNumbersUnique(numbers);
            if (!allUnique) {
                console.log(`⚠️ Attempt ${attempts}: Numbers not unique: ${numbers}`);
                continue;
            }
            
            // Hitung jawaban yang benar
            correctAnswer = this.calculateWithPEMDAS(numbers, operators);
            
            // VALIDASI 3: Harus bilangan bulat dan positif
            if (!Number.isInteger(correctAnswer) || correctAnswer <= 0) {
                console.log(`⚠️ Attempt ${attempts}: Non-integer result: ${correctAnswer}`);
                continue;
            }
            
            // VALIDASI 4: Untuk level tinggi, hasil tidak boleh terlalu ekstrem
            if (isHighLevel && correctAnswer > max * 20) {
                console.log(`⚠️ Attempt ${attempts}: Result too large: ${correctAnswer} > ${max * 20}`);
                continue;
            }
            
            // VALIDASI 5: Pastikan pembagi ≤ 100 untuk level tinggi
            if (isHighLevel) {
                const divisorInfo = this.getDivisorInfo(numbers, operators);
                if (divisorInfo.hasDivision && divisorInfo.divisor > MAX_DIVISOR) {
                    console.log(`⚠️ Attempt ${attempts}: Divisor ${divisorInfo.divisor} > ${MAX_DIVISOR}`);
                    continue;
                }
            }
            
            // SUCCESS: Found valid expression
            console.log(`✅ Attempt ${attempts}: Valid expression found`);
            break;
            
        } while (attempts < maxAttempts);
        
        // Fallback jika tidak menemukan ekspresi valid
        if (attempts >= maxAttempts || !Number.isInteger(correctAnswer)) {
            console.log(`⚠️ Using guaranteed expression for level ${level.id}`);
            ({ numbers, operators, correctAnswer } = this.getGuaranteedExpressionWithUniqueValues(
                level.id, 
                min, 
                max,
                isHighLevel,
                MAX_DIVISOR
            ));
        }
        
        // Final validasi
        const allInRange = this.validateNumbersInRange(numbers, min, max, isHighLevel, MAX_DIVISOR, operators);
        const allUnique = this.areAllNumbersUnique(numbers);
        const divisorInfo = this.getDivisorInfo(numbers, operators);
        
        if (!allInRange || !allUnique || (isHighLevel && divisorInfo.hasDivision && divisorInfo.divisor > MAX_DIVISOR)) {
            console.error(`❌ CRITICAL: Final validation failed for level ${level.id}`);
            console.error(`  In range: ${allInRange}, Unique: ${allUnique}, Divisor valid: ${!divisorInfo.hasDivision || divisorInfo.divisor <= MAX_DIVISOR}`);
            
            // Ultimate fallback
            numbers = [6, 2, 3];
            operators = ['×', '÷'];
            correctAnswer = this.calculateWithPEMDAS(numbers, operators);
        }
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(numbers[0])}</span>
            <span class="operator">${operators[0]}</span>
            <span class="number">${this.formatNumber(numbers[1])}</span>
            <span class="operator">${operators[1]}</span>
            <span class="number">${this.formatNumber(numbers[2])}</span>
            <span class="question-mark">= ...</span>
        `;
        
        // Log informasi lengkap
        console.log(`🎯 Level ${level.id} FINAL:`);
        console.log(`   Range: ${min}-${max}`);
        console.log(`   Numbers: ${numbers.map(n => this.formatNumber(n)).join(', ')}`);
        console.log(`   All unique: ${this.areAllNumbersUnique(numbers) ? '✅' : '❌'}`);
        console.log(`   All in range: ${this.validateNumbersInRange(numbers, min, max, isHighLevel, MAX_DIVISOR, operators) ? '✅' : '❌'}`);
        console.log(`   Expression: ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} = ${this.formatNumber(correctAnswer)}`);
        
        if (isHighLevel && divisorInfo.hasDivision) {
            console.log(`   Divisor: ${divisorInfo.divisor} ${divisorInfo.divisor <= MAX_DIVISOR ? '✅ ≤ 100' : '❌ > 100'}`);
        }
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: numbers,
            operators: operators,
            pattern: operators[0] === '×' ? 'times_divide' : 'divide_times',
            level: level.id,
            type: this.id,
            range: `${min}-${max}`,
            isIntegerResult: Number.isInteger(correctAnswer),
            numbersUnique: this.areAllNumbersUnique(numbers),
            numbersInRange: this.validateNumbersInRange(numbers, min, max, isHighLevel, MAX_DIVISOR, operators),
            divisorInfo: divisorInfo
        };
    },
    
    // Generate numbers for (a × b) ÷ c pattern with UNIQUE values
    generateTimesDivideNumbersWithUniqueValues: function(min, max, levelId, isHighLevel, maxDivisor) {
        let a, b, c;
        let attempts = 0;
        
        do {
            attempts++;
            
            // Generate a dan b yang UNIK dalam rentang level
            a = this.getRandomInRange(min, max);
            b = this.getRandomInRange(min, max);
            
            // Pastikan a ≠ b
            while (b === a && attempts < 10) {
                b = this.getRandomInRange(min, max);
                attempts++;
            }
            
            // Hitung product
            const product = a * b;
            
            // Tentukan batas untuk c
            let cMax = max;
            let cMin = Math.max(2, min);
            
            if (isHighLevel) {
                // Untuk level tinggi, c ≤ maxDivisor
                cMax = Math.min(max, maxDivisor);
            }
            
            // Cari c yang: membagi habis product, ≠ a, ≠ b, dan dalam rentang
            c = this.findDivisorForProduct(product, cMin, cMax, [a, b]);
            
            if (c !== null) {
                // Verifikasi c ≠ a dan c ≠ b
                if (c !== a && c !== b) {
                    break;
                }
            }
            
            // Fallback berdasarkan level
            if (attempts > 25) {
                return this.getDefaultTimesDivideNumbers(levelId, isHighLevel, maxDivisor);
            }
            
        } while (attempts < 30);
        
        return [a, b, c];
    },
    
    // Generate numbers for (a ÷ b) × c pattern with UNIQUE values
    generateDivideTimesNumbersWithUniqueValues: function(min, max, levelId, isHighLevel, maxDivisor) {
        let a, b, c;
        let attempts = 0;
        
        do {
            attempts++;
            
            // Pilih b (pembagi) - untuk level tinggi ≤ maxDivisor
            let bMax = max;
            let bMin = Math.max(2, min);
            
            if (isHighLevel) {
                bMax = Math.min(max, maxDivisor);
            }
            
            b = this.getRandomInRange(bMin, bMax);
            
            // Pilih a yang habis dibagi b, ≠ b, dan dalam rentang
            const maxMultiple = Math.floor(max / b);
            const minMultiple = Math.max(1, Math.ceil(min / b));
            
            if (maxMultiple >= minMultiple) {
                let multiple;
                do {
                    multiple = this.getRandomInRange(minMultiple, maxMultiple);
                    a = b * multiple;
                } while (a === b && attempts < 10);
                
                // Pilih c yang ≠ a, ≠ b, dan dalam rentang
                c = this.getRandomInRange(min, max);
                let cAttempts = 0;
                while ((c === a || c === b) && cAttempts < 10) {
                    c = this.getRandomInRange(min, max);
                    cAttempts++;
                }
                
                // Verifikasi semua unik dan dalam rentang
                if (a !== b && a !== c && b !== c && 
                    a >= min && a <= max && 
                    b >= bMin && b <= bMax && 
                    c >= min && c <= max) {
                    break;
                }
            }
            
            // Fallback berdasarkan level
            if (attempts > 25) {
                return this.getDefaultDivideTimesNumbers(levelId, isHighLevel, maxDivisor);
            }
            
        } while (attempts < 30);
        
        return [a, b, c];
    },
    
    // Default numbers for times_divide pattern
    getDefaultTimesDivideNumbers: function(levelId, isHighLevel, maxDivisor) {
        const defaults = {
            1: [4, 3, 2], // 4 × 3 ÷ 2 = 6
            2: [6, 4, 3], // 6 × 4 ÷ 3 = 8
            3: [8, 6, 4], // 8 × 6 ÷ 4 = 12
            4: [12, 8, 6], // 12 × 8 ÷ 6 = 16
            5: [20, 15, 10], // 20 × 15 ÷ 10 = 30
            6: [60, 40, 30], // 60 × 40 ÷ 30 = 80 (divisor: 30)
            7: [120, 80, 60], // 120 × 80 ÷ 60 = 160 (divisor: 60)
            8: [240, 160, 120], // 240 × 160 ÷ 120 = 320 (divisor: 120) - tapi 120 > 100!
            9: [600, 400, 300], // 600 × 400 ÷ 300 = 800 (divisor: 300) - tapi 300 > 100!
            10: [1200, 800, 600] // 1200 × 800 ÷ 600 = 1600 (divisor: 600) - tapi 600 > 100!
        };
        
        let numbers = defaults[levelId] || defaults[1];
        
        // Untuk level tinggi, sesuaikan pembagi agar ≤ maxDivisor
        if (isHighLevel && levelId >= 6) {
            const product = numbers[0] * numbers[1];
            const newDivisor = this.findDivisorForProduct(product, 2, maxDivisor, [numbers[0], numbers[1]]);
            if (newDivisor !== null) {
                numbers[2] = newDivisor;
            } else {
                // Jika tidak bisa, gunakan pembagi maksimal
                numbers[2] = maxDivisor;
            }
        }
        
        return numbers;
    },
    
    // Default numbers for divide_times pattern
    getDefaultDivideTimesNumbers: function(levelId, isHighLevel, maxDivisor) {
        const defaults = {
            1: [6, 2, 3], // 6 ÷ 2 × 3 = 9
            2: [8, 4, 2], // 8 ÷ 4 × 2 = 4
            3: [12, 3, 4], // 12 ÷ 3 × 4 = 16
            4: [24, 6, 3], // 24 ÷ 6 × 3 = 12
            5: [36, 4, 5], // 36 ÷ 4 × 5 = 45
            6: [150, 10, 20], // 150 ÷ 10 × 20 = 300 (divisor: 10)
            7: [300, 12, 25], // 300 ÷ 12 × 25 = 625 (divisor: 12)
            8: [600, 16, 40], // 600 ÷ 16 × 40 = 1500 (divisor: 16)
            9: [3000, 25, 80], // 3000 ÷ 25 × 80 = 9600 (divisor: 25)
            10: [9000, 15, 100] // 9000 ÷ 15 × 100 = 60000 (divisor: 15)
        };
        
        let numbers = defaults[levelId] || defaults[1];
        
        // Untuk level tinggi, sesuaikan pembagi agar ≤ maxDivisor
        if (isHighLevel && levelId >= 6 && numbers[1] > maxDivisor) {
            const dividend = numbers[0];
            const newDivisor = this.findDivisorForProduct(dividend, 2, maxDivisor, [numbers[0], numbers[2]]);
            if (newDivisor !== null) {
                numbers[1] = newDivisor;
                // Sesuaikan dividend agar tetap habis dibagi
                numbers[0] = numbers[1] * Math.floor(dividend / newDivisor);
            }
        }
        
        return numbers;
    },
    
    // Find divisor for a product within range, excluding certain values
    findDivisorForProduct: function(product, minDivisor, maxDivisor, excludeValues = []) {
        if (product === 0) return null;
        
        // Cari pembagi yang habis membagi product dan tidak dalam excludeValues
        for (let d = Math.min(maxDivisor, product); d >= minDivisor; d--) {
            if (product % d === 0 && !excludeValues.includes(d)) {
                return d;
            }
        }
        
        return null;
    },
    
    // Validate all numbers are in range
    validateNumbersInRange: function(numbers, min, max, isHighLevel, maxDivisor, operators) {
        for (let i = 0; i < numbers.length; i++) {
            const num = numbers[i];
            
            // Untuk level tinggi, periksa pembagi khusus
            if (isHighLevel) {
                if ((operators[0] === '÷' && i === 1) || (operators[1] === '÷' && i === 2)) {
                    // Ini adalah pembagi, harus ≤ maxDivisor
                    if (num > maxDivisor) {
                        console.log(`  ❌ Divisor ${num} > ${maxDivisor}`);
                        return false;
                    }
                    // Pembagi juga harus dalam rentang level
                    if (num < Math.max(2, min) || num > max) {
                        console.log(`  ❌ Divisor ${num} out of range ${min}-${max}`);
                        return false;
                    }
                    continue;
                }
            }
            
            // Untuk bilangan non-pembagi, harus dalam rentang level
            if (num < min || num > max) {
                console.log(`  ❌ Number ${num} out of range ${min}-${max}`);
                return false;
            }
        }
        
        return true;
    },
    
    // Check if all numbers are unique
    areAllNumbersUnique: function(numbers) {
        const uniqueSet = new Set(numbers);
        return uniqueSet.size === numbers.length;
    },
    
    // Get divisor information
    getDivisorInfo: function(numbers, operators) {
        let divisor = null;
        let hasDivision = false;
        
        if (operators[0] === '÷') {
            divisor = numbers[1];
            hasDivision = true;
        } else if (operators[1] === '÷') {
            divisor = numbers[2];
            hasDivision = true;
        }
        
        return {
            hasDivision: hasDivision,
            divisor: divisor,
            isValid: !hasDivision || divisor <= 100
        };
    },
    
    // Get guaranteed expression with UNIQUE values
    getGuaranteedExpressionWithUniqueValues: function(levelId, min, max, isHighLevel, maxDivisor) {
        const guaranteedExpressions = {
            1: { 
                numbers: [4, 3, 2], // Semua berbeda
                operators: ['×', '÷'],
                description: "4 × 3 ÷ 2 = 6"
            },
            2: { 
                numbers: [6, 4, 3], // Semua berbeda
                operators: ['×', '÷'],
                description: "6 × 4 ÷ 3 = 8"
            },
            3: { 
                numbers: [8, 6, 4], // Semua berbeda
                operators: ['÷', '×'],
                description: "8 ÷ 6 × 4 = 5 (dibulatkan)" // 8÷6 bukan integer, perlu penyesuaian
            },
            4: { 
                numbers: [24, 8, 6], // Semua berbeda
                operators: ['×', '÷'],
                description: "24 × 8 ÷ 6 = 32"
            },
            5: { 
                numbers: [36, 9, 4], // Semua berbeda
                operators: ['÷', '×'],
                description: "36 ÷ 9 × 4 = 16"
            },
            6: { 
                numbers: [150, 10, 20], // Semua berbeda, divisor: 10
                operators: ['÷', '×'],
                description: "150 ÷ 10 × 20 = 300"
            },
            7: { 
                numbers: [300, 12, 25], // Semua berbeda, divisor: 12
                operators: ['÷', '×'],
                description: "300 ÷ 12 × 25 = 625"
            },
            8: { 
                numbers: [600, 16, 40], // Semua berbeda, divisor: 16
                operators: ['÷', '×'],
                description: "600 ÷ 16 × 40 = 1500"
            },
            9: { 
                numbers: [3000, 25, 80], // Semua berbeda, divisor: 25
                operators: ['÷', '×'],
                description: "3000 ÷ 25 × 80 = 9600"
            },
            10: { 
                numbers: [9000, 15, 100], // Semua berbeda, divisor: 15
                operators: ['÷', '×'],
                description: "9000 ÷ 15 × 100 = 60000"
            }
        };
        
        let expression = guaranteedExpressions[levelId] || guaranteedExpressions[1];
        
        // Pastikan bilangan dalam rentang (dengan penyesuaian)
        const adjustedNumbers = expression.numbers.map(num => {
            if (num < min) return Math.max(min, 2);
            if (num > max) return Math.min(max, num);
            return num;
        });
        
        // Pastikan semua bilangan unik
        if (!this.areAllNumbersUnique(adjustedNumbers)) {
            // Buat unik dengan menyesuaikan
            const uniqueNumbers = this.makeNumbersUnique(adjustedNumbers, min, max);
            expression.numbers = uniqueNumbers;
        }
        
        // Untuk level tinggi, pastikan pembagi ≤ maxDivisor
        if (isHighLevel) {
            if (expression.operators[0] === '÷' && expression.numbers[1] > maxDivisor) {
                expression.numbers[1] = Math.min(maxDivisor, expression.numbers[1]);
            }
            if (expression.operators[1] === '÷' && expression.numbers[2] > maxDivisor) {
                expression.numbers[2] = Math.min(maxDivisor, expression.numbers[2]);
            }
        }
        
        const correctAnswer = this.calculateWithPEMDAS(expression.numbers, expression.operators);
        
        return {
            numbers: expression.numbers,
            operators: expression.operators,
            correctAnswer: correctAnswer
        };
    },
    
    // Make numbers unique by adjusting duplicates
    makeNumbersUnique: function(numbers, min, max) {
        const uniqueNumbers = [...numbers];
        const used = new Set();
        
        for (let i = 0; i < uniqueNumbers.length; i++) {
            while (used.has(uniqueNumbers[i]) || uniqueNumbers[i] < min || uniqueNumbers[i] > max) {
                // Tambahkan atau kurangi 1 sampai unik dan dalam rentang
                uniqueNumbers[i] = this.getRandomInRange(min, max);
            }
            used.add(uniqueNumbers[i]);
        }
        
        return uniqueNumbers;
    },
    
    // Calculate with PEMDAS
    calculateWithPEMDAS: function(numbers, operators) {
        try {
            let result = numbers[0];
            
            for (let i = 0; i < operators.length; i++) {
                const nextNum = numbers[i + 1];
                const operator = operators[i];
                
                if (operator === '×') {
                    result *= nextNum;
                } else if (operator === '÷') {
                    if (nextNum === 0) return NaN;
                    if (result % nextNum !== 0) return NaN;
                    result /= nextNum;
                }
                
                if (!Number.isInteger(result)) {
                    return NaN;
                }
            }
            
            return result;
        } catch (error) {
            console.error("Calculation error:", error);
            return NaN;
        }
    },
    
    // Generate wrong answers
    generateWrongAnswers: function(correctAnswer, level, numbers, operators) {
        const wrongAnswers = new Set();
        const maxAttempts = 30;
        
        const generateMistake = () => {
            const [a, b, c] = numbers;
            const [op1, op2] = operators;
            
            const mistakeTypes = [
                () => {
                    if (op1 === '×' && op2 === '÷') {
                        return Math.floor((a / c) * b);
                    } else {
                        return Math.floor((a * c) / b);
                    }
                },
                () => {
                    if (op1 === '×' && op2 === '÷') {
                        return Math.floor((a / b) * c);
                    } else {
                        return Math.floor((a * b) / c);
                    }
                },
                () => {
                    const offset = this.getOffsetForLevel(level.id, correctAnswer);
                    return correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                },
                () => {
                    return Math.random() > 0.5 ? 
                        Math.floor(correctAnswer * 1.5) : 
                        Math.floor(correctAnswer / 1.5);
                }
            ];
            
            const type = mistakeTypes[Math.floor(Math.random() * mistakeTypes.length)];
            const result = type();
            
            return Math.max(1, Math.floor(result));
        };
        
        let attempts = 0;
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            attempts++;
            
            let wrongAnswer = generateMistake();
            
            if (Number.isInteger(wrongAnswer) && 
                wrongAnswer > 0 && 
                wrongAnswer !== correctAnswer) {
                
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        while (wrongAnswers.size < 3) {
            const simpleWrong = Math.max(1, correctAnswer + Math.floor(Math.random() * 10) - 5);
            if (simpleWrong !== correctAnswer && simpleWrong > 0) {
                wrongAnswers.add(simpleWrong);
            }
        }
        
        return Array.from(wrongAnswers);
    },
    
    // Helper methods
    getOffsetForLevel: function(levelId, correctAnswer) {
        const levelFactors = {
            1: 1, 2: 2, 3: 3, 4: 5, 5: 10,
            6: 20, 7: 50, 8: 100, 9: 200, 10: 500
        };
        
        const factor = levelFactors[levelId] || 10;
        return Math.floor(Math.random() * factor) + 1;
    },
    
    getRandomInRange: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    getHint: function(numbers, operators) {
        if (numbers.length !== 3 || operators.length !== 2) return null;
        
        const [a, b, c] = numbers;
        const [op1, op2] = operators;
        
        if (op1 === '×' && op2 === '÷') {
            return `Kerjakan dari kiri ke kanan: ${this.formatNumber(a)} × ${this.formatNumber(b)} = X, lalu X ÷ ${this.formatNumber(c)} = ?`;
        } else {
            return `Kerjakan dari kiri ke kanan: ${this.formatNumber(a)} ÷ ${this.formatNumber(b)} = X, lalu X × ${this.formatNumber(c)} = ?`;
        }
    },
    
    // Test function untuk validasi lengkap
    testCompleteValidation: function(testsPerLevel = 5) {
        console.log(`🧪 COMPLETE VALIDATION TEST (${testsPerLevel} tests per level)`);
        
        const results = {};
        let allPassed = true;
        
        for (let levelId = 1; levelId <= 10; levelId++) {
            console.log(`\n📊 Level ${levelId}:`);
            results[levelId] = { passed: 0, failed: 0, details: [] };
            
            for (let i = 1; i <= testsPerLevel; i++) {
                const testLevel = { id: levelId, min: 1, max: 1000 };
                const question = this.generateQuestion(testLevel);
                
                // Check semua kriteria
                const range = this.getLevelRanges()[levelId];
                const [min, max] = range.split('-').map(n => parseInt(n.replace(',', '')));
                const isHighLevel = levelId >= 6;
                
                const checks = {
                    numbersInRange: this.validateNumbersInRange(question.numbers, min, max, isHighLevel, 100, question.operators),
                    numbersUnique: this.areAllNumbersUnique(question.numbers),
                    integerResult: Number.isInteger(question.correctAnswer),
                    divisorValid: !isHighLevel || !question.divisorInfo.hasDivision || question.divisorInfo.divisor <= 100
                };
                
                const allChecksPassed = Object.values(checks).every(check => check === true);
                
                if (allChecksPassed) {
                    results[levelId].passed++;
                    console.log(`  ✅ Test ${i}: All checks passed`);
                } else {
                    results[levelId].failed++;
                    results[levelId].details.push({
                        test: i,
                        numbers: question.numbers,
                        operators: question.operators,
                        checks: checks
                    });
                    console.log(`  ❌ Test ${i}: Failed checks:`);
                    Object.entries(checks).forEach(([checkName, passed]) => {
                        if (!passed) console.log(`     - ${checkName}`);
                    });
                    allPassed = false;
                }
            }
        }
        
        // Summary
        console.log(`\n📊 FINAL SUMMARY:`);
        for (let levelId = 1; levelId <= 10; levelId++) {
            const levelResults = results[levelId];
            const total = levelResults.passed + levelResults.failed;
            const passRate = total > 0 ? (levelResults.passed / total * 100).toFixed(1) : 0;
            console.log(`Level ${levelId}: ${levelResults.passed}/${total} (${passRate}%)`);
        }
        
        console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return {
            success: allPassed,
            results: results
        };
    },
    
    getLevelRanges: function() {
        return {
            1: "1-5",
            2: "1-10",
            3: "1-20",
            4: "11-50",
            5: "21-100",
            6: "50-200",
            7: "100-500",
            8: "200-1,000",
            9: "500-5,000",
            10: "1,000-10,000"
        };
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranKaliBagiOperation.id] = CampuranKaliBagiOperation;
    console.log(`✅ Registered operation: ${CampuranKaliBagiOperation.name} (${CampuranKaliBagiOperation.id})`);
    console.log(`   Features: 1) All numbers in level range, 2) All numbers unique, 3) Divisor ≤ 100 for levels 6-10`);
}

// Debug functions
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testCompleteValidation = function(tests = 3) {
        return CampuranKaliBagiOperation.testCompleteValidation(tests);
    };
    
    window.generateSampleQuestions = function() {
        console.log("🎯 SAMPLE QUESTIONS FOR ALL LEVELS:");
        
        for (let levelId = 1; levelId <= 10; levelId++) {
            console.log(`\n📊 Level ${levelId} (${CampuranKaliBagiOperation.getLevelRanges()[levelId]}):`);
            
            for (let i = 1; i <= 2; i++) {
                const testLevel = { id: levelId, min: 1, max: 1000 };
                const question = CampuranKaliBagiOperation.generateQuestion(testLevel);
                
                const status = question.numbersUnique && question.numbersInRange ? '✅' : '❌';
                console.log(`  ${status} ${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} = ${CampuranKaliBagiOperation.formatNumber(question.correctAnswer)}`);
                
                if (!question.numbersUnique) {
                    console.log(`     Warning: Numbers not unique!`);
                }
                if (!question.numbersInRange) {
                    console.log(`     Warning: Numbers out of range!`);
                }
            }
        }
    };
    
    console.log("🧪 Debug functions loaded:");
    console.log("  - testCompleteValidation(3) - Run complete validation tests");
    console.log("  - generateSampleQuestions() - Generate sample questions for all levels");
}