// ==========================================================
// CAMPURAN SEMUA OPERATOR OPERATION MODULE - FINAL CORRECTION v3
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
    
    // Cache untuk mencegah pengulangan soal
    recentQuestions: new Map(),
    
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
        
        // Ambil rentang untuk level ini
        const range = levelRanges[level.id] || levelRanges[1];
        const { min, max } = range;
        
        console.log(`📊 Level ${level.id} range: ${min}-${max}`);
        
        // Inisialisasi cache
        if (!this.recentQuestions.has(level.id)) {
            this.recentQuestions.set(level.id, new Set());
        }
        const levelCache = this.recentQuestions.get(level.id);
        
        let numbers, operators, correctAnswer;
        let attempts = 0;
        const maxAttempts = 150;
        
        // Untuk level 6 ke atas
        const isHighLevel = level.id >= 6;
        
        do {
            attempts++;
            
            // Pilih pola berdasarkan level
            const pattern = this.selectPattern(level.id);
            const generationResult = this.generatePattern(pattern, min, max, level.id, isHighLevel);
            
            if (!generationResult) continue;
            
            ({ numbers, operators } = generationResult);
            
            // Validasi 0: Semua operator harus BERBEDA
            if (!this.areAllOperatorsUnique(operators)) {
                console.log(`    ❌ Operators not unique: [${operators.join(', ')}]`);
                continue;
            }
            
            // Validasi 1: Pastikan semua angka UNIK
            if (!this.areAllNumbersUnique(numbers)) {
                console.log(`    ❌ Numbers not unique: [${numbers.join(', ')}]`);
                continue;
            }
            
            // Buat signature unik
            const questionSignature = this.createSignature(numbers, operators);
            
            // Cek apakah soal sudah pernah muncul
            if (levelCache.has(questionSignature)) {
                console.log(`    ⚠️ Duplicate question`);
                continue;
            }
            
            console.log(`  Attempt ${attempts}: [${numbers.join(', ')}] ${operators.join(' ')}`);
            
            // Validasi 2: Semua bilangan dalam rentang yang sesuai
            if (!this.validateNumbersRange(numbers, min, max, operators, isHighLevel)) {
                console.log(`    ❌ Numbers out of range`);
                continue;
            }
            
            // Validasi 3: Untuk level tinggi, pembagi maksimal 100
            if (isHighLevel && !this.validateDivisorLimit(numbers, operators)) {
                console.log(`    ❌ Divisor > 100 in high level`);
                continue;
            }
            
            // Validasi 4: Pastikan tidak ada pembagian dengan 0
            if (!this.validateNoDivisionByZero(numbers, operators)) {
                console.log(`    ❌ Division by zero`);
                continue;
            }
            
            // Hitung jawaban dengan PEMDAS
            correctAnswer = this.calculateWithPEMDAS(numbers, operators);
            
            // Validasi 5: Hasil integer positif
            if (!Number.isInteger(correctAnswer) || correctAnswer <= 0) {
                console.log(`    ❌ Invalid result: ${correctAnswer}`);
                continue;
            }
            
            // Validasi 6: Hasil tidak terlalu besar
            if (!this.validateResultSize(correctAnswer, min, max, level.id)) {
                console.log(`    ❌ Result too large: ${correctAnswer}`);
                continue;
            }
            
            // Validasi 7: Pastikan semua pembagian menghasilkan integer
            if (!this.validateAllIntegerDivisions(numbers, operators)) {
                console.log(`    ❌ Division not integer`);
                continue;
            }
            
            // Validasi 8: Hasil pembagian harus beragam (tidak sama terus)
            if (isHighLevel && !this.validateDivisionResultVariety(numbers, operators, levelCache)) {
                console.log(`    ⚠️ Division result not varied enough`);
                continue;
            }
            
            // SUCCESS
            levelCache.add(questionSignature);
            if (levelCache.size > 50) {
                const first = Array.from(levelCache)[0];
                levelCache.delete(first);
            }
            
            console.log(`    ✅ Found after ${attempts} attempts`);
            break;
            
        } while (attempts < maxAttempts);
        
        // Fallback jika gagal
        if (attempts >= maxAttempts) {
            console.log(`⚠️ Using smart fallback for level ${level.id}`);
            ({ numbers, operators, correctAnswer } = this.getSmartFallbackWithVariety(
                level.id, min, max, isHighLevel, levelCache
            ));
            
            const questionSignature = this.createSignature(numbers, operators);
            levelCache.add(questionSignature);
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
        
        // Final logging
        console.log(`🎯 FINAL Level ${level.id}:`);
        console.log(`   ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} ${operators[2]} ${numbers[3]} = ${this.formatNumber(correctAnswer)}`);
        console.log(`   All numbers unique: ${this.areAllNumbersUnique(numbers) ? '✅' : '❌'}`);
        console.log(`   All operators unique: ${this.areAllOperatorsUnique(operators) ? '✅' : '❌'}`);
        
        if (isHighLevel) {
            const divisors = this.getAllDivisors(numbers, operators);
            console.log(`   Divisors: ${divisors.map(d => `${d}${d <= 100 ? '✅' : '❌'}`).join(', ')}`);
        }
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: numbers,
            operators: operators,
            level: level.id,
            type: this.id,
            range: `${min}-${max}`,
            hasUniqueNumbers: this.areAllNumbersUnique(numbers),
            hasUniqueOperators: this.areAllOperatorsUnique(operators)
        };
    },
    
    // ============== PATTERN SELECTION ==============
    
    selectPattern: function(levelId) {
        // Pilih pola berdasarkan kemungkinan operator unik
        const patterns = [
            'divide_first',     // ÷ di awal
            'divide_middle',    // ÷ di tengah
            'divide_last',      // ÷ di akhir
            'multiply_first',   // × di awal
            'multiply_middle',  // × di tengah
            'multiply_last'     // × di akhir
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)];
    },
    
    generatePattern: function(pattern, min, max, levelId, isHighLevel) {
        switch (pattern) {
            case 'divide_first':
                return this.generateDivideFirst(min, max, levelId, isHighLevel);
            case 'divide_middle':
                return this.generateDivideMiddle(min, max, levelId, isHighLevel);
            case 'divide_last':
                return this.generateDivideLast(min, max, levelId, isHighLevel);
            case 'multiply_first':
                return this.generateMultiplyFirst(min, max, levelId, isHighLevel);
            case 'multiply_middle':
                return this.generateMultiplyMiddle(min, max, levelId, isHighLevel);
            case 'multiply_last':
                return this.generateMultiplyLast(min, max, levelId, isHighLevel);
            default:
                return this.generateDivideMiddle(min, max, levelId, isHighLevel);
        }
    },
    
    // ============== PATTERN GENERATORS ==============
    
    // Pattern: a ÷ b op2 c op3 d (÷, unique_op2, unique_op3)
    generateDivideFirst: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih operator yang semuanya berbeda
            operators = ['÷'];
            
            // Pilih operator kedua yang bukan ÷
            const availableForSecond = ['+', '−', '×'].filter(op => !operators.includes(op));
            operators.push(availableForSecond[Math.floor(Math.random() * availableForSecond.length)]);
            
            // Pilih operator ketiga yang bukan ÷ dan bukan operator kedua
            const availableForThird = ['+', '−', '×', '÷'].filter(op => !operators.includes(op));
            if (availableForThird.length === 0) continue;
            operators.push(availableForThird[Math.floor(Math.random() * availableForThird.length)]);
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // Pattern: a op1 b ÷ c op3 d (unique_op1, ÷, unique_op3)
    generateDivideMiddle: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih operator pertama (bukan ÷)
            const firstOps = ['+', '−', '×'];
            operators = [firstOps[Math.floor(Math.random() * firstOps.length)]];
            
            // Operator kedua adalah ÷
            operators.push('÷');
            
            // Pilih operator ketiga yang berbeda dari dua sebelumnya
            const availableForThird = ['+', '−', '×', '÷'].filter(op => !operators.includes(op));
            if (availableForThird.length === 0) continue;
            operators.push(availableForThird[Math.floor(Math.random() * availableForThird.length)]);
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // Pattern: a op1 b op2 c ÷ d (unique_op1, unique_op2, ÷)
    generateDivideLast: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih dua operator pertama yang berbeda dan bukan ÷
            operators = [];
            const firstTwoOps = ['+', '−', '×'];
            
            // Pilih operator pertama
            operators.push(firstTwoOps[Math.floor(Math.random() * firstTwoOps.length)]);
            
            // Pilih operator kedua yang berbeda dari pertama
            const availableForSecond = firstTwoOps.filter(op => op !== operators[0]);
            operators.push(availableForSecond[Math.floor(Math.random() * availableForSecond.length)]);
            
            // Operator ketiga adalah ÷
            operators.push('÷');
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // Pattern: a × b op2 c op3 d (×, unique_op2, unique_op3)
    generateMultiplyFirst: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih operator yang semuanya berbeda
            operators = ['×'];
            
            // Pilih operator kedua yang bukan ×
            const availableForSecond = ['+', '−', '÷'].filter(op => !operators.includes(op));
            operators.push(availableForSecond[Math.floor(Math.random() * availableForSecond.length)]);
            
            // Pilih operator ketiga yang bukan × dan bukan operator kedua
            const availableForThird = ['+', '−', '×', '÷'].filter(op => !operators.includes(op));
            if (availableForThird.length === 0) continue;
            operators.push(availableForThird[Math.floor(Math.random() * availableForThird.length)]);
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // Pattern: a op1 b × c op3 d (unique_op1, ×, unique_op3)
    generateMultiplyMiddle: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih operator pertama (bukan ×)
            const firstOps = ['+', '−', '÷'];
            operators = [firstOps[Math.floor(Math.random() * firstOps.length)]];
            
            // Operator kedua adalah ×
            operators.push('×');
            
            // Pilih operator ketiga yang berbeda dari dua sebelumnya
            const availableForThird = ['+', '−', '×', '÷'].filter(op => !operators.includes(op));
            if (availableForThird.length === 0) continue;
            operators.push(availableForThird[Math.floor(Math.random() * availableForThird.length)]);
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // Pattern: a op1 b op2 c × d (unique_op1, unique_op2, ×)
    generateMultiplyLast: function(min, max, levelId, isHighLevel) {
        let operators;
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Pilih dua operator pertama yang berbeda dan bukan ×
            operators = [];
            const firstTwoOps = ['+', '−', '÷'];
            
            // Pilih operator pertama
            operators.push(firstTwoOps[Math.floor(Math.random() * firstTwoOps.length)]);
            
            // Pilih operator kedua yang berbeda dari pertama
            const availableForSecond = firstTwoOps.filter(op => op !== operators[0]);
            operators.push(availableForSecond[Math.floor(Math.random() * availableForSecond.length)]);
            
            // Operator ketiga adalah ×
            operators.push('×');
            
            // Pastikan ketiganya berbeda
            if (new Set(operators).size !== 3) continue;
            
            // Generate numbers
            const numbersResult = this.generateNumbersForOperators(operators, min, max, levelId, isHighLevel);
            if (numbersResult) {
                return { numbers: numbersResult, operators };
            }
        }
        
        return null;
    },
    
    // ============== NUMBER GENERATION FOR OPERATORS ==============
    
    generateNumbersForOperators: function(operators, min, max, levelId, isHighLevel) {
        const numbers = new Array(4);
        let attempts = 0;
        
        while (attempts < 50) {
            attempts++;
            
            // Reset numbers
            numbers.fill(undefined);
            
            // Proses setiap operator secara berurutan
            let success = true;
            
            for (let i = 0; i < operators.length; i++) {
                const op = operators[i];
                
                if (op === '÷') {
                    // Generate untuk pembagian
                    if (!this.generateDivisionNumbers(numbers, i, min, max, isHighLevel)) {
                        success = false;
                        break;
                    }
                } else if (op === '×') {
                    // Generate untuk perkalian
                    if (!this.generateMultiplicationNumbers(numbers, i, min, max)) {
                        success = false;
                        break;
                    }
                } else {
                    // Generate untuk penjumlahan/pengurangan
                    if (!this.generateAdditionSubtractionNumbers(numbers, i, min, max)) {
                        success = false;
                        break;
                    }
                }
            }
            
            // Isi angka yang masih kosong
            for (let i = 0; i < numbers.length; i++) {
                if (numbers[i] === undefined) {
                    numbers[i] = this.randomInRange(min, max);
                }
            }
            
            // Validasi: semua angka unik
            if (!success || !this.areAllNumbersUnique(numbers)) {
                continue;
            }
            
            // Validasi tambahan untuk pembagian integer
            if (operators.includes('÷')) {
                // Simulasi perhitungan untuk validasi
                if (!this.simulateCalculationForValidation(numbers, operators)) {
                    continue;
                }
            }
            
            return numbers;
        }
        
        return null;
    },
    
    generateDivisionNumbers: function(numbers, opIndex, min, max, isHighLevel) {
        // opIndex: indeks operator dalam array operators
        // numbers[opIndex] dan numbers[opIndex + 1] adalah angka untuk pembagian
        
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Tentukan pembagi
            let divisor;
            if (isHighLevel) {
                divisor = this.randomInRange(2, 100); // Maksimal 100 untuk level tinggi
            } else {
                divisor = this.randomInRange(2, max);
            }
            
            // Tentukan pembilang
            let numerator;
            if (numbers[opIndex] !== undefined) {
                numerator = numbers[opIndex];
            } else if (numbers[opIndex + 1] !== undefined) {
                // Jika divisor sudah ada, cari numerator
                numerator = divisor * this.randomInRange(2, Math.floor(max / divisor));
            } else {
                // Keduanya belum ada
                const quotient = this.randomInRange(2, Math.min(10, Math.floor(max / divisor)));
                numerator = divisor * quotient;
            }
            
            // Pastikan dalam rentang
            if (numerator < min || numerator > max) continue;
            
            // Pastikan pembagian integer
            if (numerator % divisor !== 0) continue;
            
            // Set angka
            numbers[opIndex] = numerator;
            numbers[opIndex + 1] = divisor;
            
            return true;
        }
        
        return false;
    },
    
    generateMultiplicationNumbers: function(numbers, opIndex, min, max) {
        let attempts = 0;
        
        while (attempts < 20) {
            attempts++;
            
            // Tentukan angka untuk perkalian
            let a, b;
            
            if (numbers[opIndex] !== undefined) {
                a = numbers[opIndex];
                b = this.randomInRange(min, max);
            } else if (numbers[opIndex + 1] !== undefined) {
                b = numbers[opIndex + 1];
                a = this.randomInRange(min, max);
            } else {
                a = this.randomInRange(min, max);
                b = this.randomInRange(min, max);
            }
            
            // Pastikan dalam rentang
            if (a < min || a > max || b < min || b > max) continue;
            
            // Set angka
            numbers[opIndex] = a;
            numbers[opIndex + 1] = b;
            
            return true;
        }
        
        return false;
    },
    
    generateAdditionSubtractionNumbers: function(numbers, opIndex, min, max) {
        // Untuk penjumlahan/pengurangan, angka bisa apa saja
        if (numbers[opIndex] === undefined) {
            numbers[opIndex] = this.randomInRange(min, max);
        }
        
        if (numbers[opIndex + 1] === undefined) {
            numbers[opIndex + 1] = this.randomInRange(min, max);
        }
        
        return true;
    },
    
    simulateCalculationForValidation: function(numbers, operators) {
        // Simulasi perhitungan dengan PEMDAS untuk validasi
        try {
            const result = this.calculateWithPEMDAS(numbers, operators);
            return Number.isInteger(result) && result > 0;
        } catch {
            return false;
        }
    },
    
    // ============== VALIDATION METHODS ==============
    
    areAllOperatorsUnique: function(operators) {
        const set = new Set(operators);
        return set.size === 3;
    },
    
    areAllNumbersUnique: function(numbers) {
        const set = new Set(numbers);
        return set.size === 4;
    },
    
    validateNumbersRange: function(numbers, min, max, operators, isHighLevel) {
        for (let i = 0; i < numbers.length; i++) {
            const num = numbers[i];
            
            // Untuk bilangan yang bukan pembagi, harus dalam rentang
            if (!this.isDivisorAtPosition(i, operators)) {
                if (num < min || num > max) return false;
            } else {
                // Untuk pembagi: level tinggi maksimal 100
                if (isHighLevel) {
                    if (num > 100) return false;
                } else {
                    if (num < 2 || num > max) return false;
                }
            }
        }
        return true;
    },
    
    validateDivisorLimit: function(numbers, operators) {
        // Cek semua posisi pembagi
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷') {
                const divisor = numbers[i + 1];
                if (divisor > 100) return false;
            }
        }
        return true;
    },
    
    validateAllIntegerDivisions: function(numbers, operators) {
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷') {
                // Hitung hasil sementara sampai titik ini
                const partialNumbers = numbers.slice(0, i + 2);
                const partialOps = operators.slice(0, i + 1);
                const partialResult = this.calculateWithPEMDAS(partialNumbers, partialOps);
                
                if (!Number.isInteger(partialResult) || partialResult % numbers[i + 1] !== 0) {
                    return false;
                }
            }
        }
        return true;
    },
    
    validateDivisionResultVariety: function(numbers, operators, levelCache) {
        // Hitung hasil pembagian pertama
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷') {
                const numerator = numbers[i];
                const denominator = numbers[i + 1];
                const divisionResult = numerator / denominator;
                
                // Cek apakah hasil pembagian ini sudah sering muncul
                const divisionKey = `div_${divisionResult}`;
                let divisionCount = 0;
                
                for (const signature of levelCache) {
                    if (signature.includes(`div_${divisionResult}_`)) {
                        divisionCount++;
                    }
                }
                
                // Jika hasil pembagian sama muncul lebih dari 3 kali, coba yang lain
                if (divisionCount > 3) {
                    return false;
                }
                
                // Update signature dengan informasi pembagian
                const newSignature = this.createSignature(numbers, operators) + `_div_${divisionResult}`;
                levelCache.add(newSignature);
                
                break; // Cukup cek pembagian pertama
            }
        }
        return true;
    },
    
    validateNoDivisionByZero: function(numbers, operators) {
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷' && numbers[i + 1] === 0) {
                return false;
            }
        }
        return true;
    },
    
    validateResultSize: function(result, min, max, levelId) {
        const maxMultipliers = {
            1: 5, 2: 10, 3: 20, 4: 30, 5: 50,
            6: 100, 7: 200, 8: 300, 9: 500, 10: 1000
        };
        
        const multiplier = maxMultipliers[levelId] || 100;
        const maxAllowed = max * multiplier;
        
        return result > 0 && result <= maxAllowed;
    },
    
    // ============== HELPER METHODS ==============
    
    isDivisorAtPosition: function(position, operators) {
        // Cek apakah angka di posisi ini adalah pembagi
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷' && (i + 1) === position) {
                return true;
            }
        }
        return false;
    },
    
    getAllDivisors: function(numbers, operators) {
        const divisors = [];
        for (let i = 0; i < operators.length; i++) {
            if (operators[i] === '÷') {
                divisors.push(numbers[i + 1]);
            }
        }
        return divisors;
    },
    
    randomInRange: function(min, max) {
        if (min > max) [min, max] = [max, min];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    createSignature: function(numbers, operators) {
        return `${numbers.join(',')}|${operators.join(',')}`;
    },
    
    // ============== CALCULATION ==============
    
    calculateWithPEMDAS: function(numbers, operators) {
        try {
            let nums = [...numbers];
            let ops = [...operators];
            
            // Step 1: Process ALL multiplication and division
            let i = 0;
            while (i < ops.length) {
                if (ops[i] === '×' || ops[i] === '÷') {
                    const left = nums[i];
                    const right = nums[i + 1];
                    
                    if (ops[i] === '÷') {
                        if (right === 0) return NaN;
                        if (left % right !== 0) return NaN;
                    }
                    
                    const result = ops[i] === '×' ? left * right : left / right;
                    if (!Number.isInteger(result)) return NaN;
                    
                    nums.splice(i, 2, result);
                    ops.splice(i, 1);
                } else {
                    i++;
                }
            }
            
            // Step 2: Process ALL addition and subtraction
            let finalResult = nums[0];
            for (let j = 0; j < ops.length; j++) {
                const nextNum = nums[j + 1];
                
                if (ops[j] === '+') {
                    finalResult += nextNum;
                } else if (ops[j] === '−') {
                    finalResult -= nextNum;
                }
                
                if (!Number.isInteger(finalResult)) return NaN;
            }
            
            return finalResult;
            
        } catch (error) {
            console.error("PEMDAS calculation error:", error);
            return NaN;
        }
    },
    
    // ============== FALLBACK WITH VARIETY ==============
    
    getSmartFallbackWithVariety: function(levelId, min, max, isHighLevel, levelCache) {
        // Daftar fallback dengan semua operator berbeda
        const fallbacks = [
            // Contoh dengan semua operator berbeda
            { numbers: [6, 2, 4, 3], operators: ['÷', '+', '×'], desc: "6 ÷ 2 + 4 × 3 = 15" },
            { numbers: [8, 4, 6, 2], operators: ['÷', '+', '−'], desc: "8 ÷ 4 + 6 - 2 = 6" },
            { numbers: [9, 3, 5, 2], operators: ['÷', '−', '×'], desc: "9 ÷ 3 - 5 × 2 = -7 (tidak valid)" },
            { numbers: [12, 3, 8, 4], operators: ['÷', '+', '×'], desc: "12 ÷ 3 + 8 × 4 = 36" },
            { numbers: [15, 5, 10, 2], operators: ['÷', '−', '+'], desc: "15 ÷ 5 - 10 + 2 = -5 (tidak valid)" },
            
            { numbers: [6, 3, 2, 4], operators: ['×', '+', '÷'], desc: "6 × 3 + 2 ÷ 4 = 18.5 (tidak valid)" },
            { numbers: [8, 2, 4, 1], operators: ['×', '−', '÷'], desc: "8 × 2 - 4 ÷ 1 = 12" },
            { numbers: [10, 2, 5, 3], operators: ['×', '+', '−'], desc: "10 × 2 + 5 - 3 = 22" },
            { numbers: [12, 4, 3, 2], operators: ['×', '−', '+'], desc: "12 × 4 - 3 + 2 = 47" },
            { numbers: [15, 3, 5, 4], operators: ['×', '+', '÷'], desc: "15 × 3 + 5 ÷ 4 = 46.25 (tidak valid)" },
            
            // Level tinggi dengan pembagi ≤ 100
            { numbers: [120, 30, 50, 20], operators: ['÷', '+', '×'], desc: "120 ÷ 30 + 50 × 20 = 1004" },
            { numbers: [200, 50, 75, 25], operators: ['÷', '−', '+'], desc: "200 ÷ 50 - 75 + 25 = -46 (tidak valid)" },
            { numbers: [300, 60, 90, 30], operators: ['÷', '×', '+'], desc: "300 ÷ 60 × 90 + 30 = 480" },
            { numbers: [400, 80, 120, 40], operators: ['÷', '+', '−'], desc: "400 ÷ 80 + 120 - 40 = 85" },
            { numbers: [500, 100, 150, 50], operators: ['÷', '×', '−'], desc: "500 ÷ 100 × 150 - 50 = 700" }
        ];
        
        // Filter hanya yang valid
        const validFallbacks = [];
        
        for (const fallback of fallbacks) {
            // Cek: semua operator harus berbeda
            if (!this.areAllOperatorsUnique(fallback.operators)) continue;
            
            // Cek: untuk level tinggi, pembagi harus ≤ 100
            if (isHighLevel) {
                const divideIndex = fallback.operators.indexOf('÷');
                if (divideIndex !== -1) {
                    const divisor = fallback.numbers[divideIndex + 1];
                    if (divisor > 100) continue;
                }
            }
            
            // Hitung hasil
            const result = this.calculateWithPEMDAS(fallback.numbers, fallback.operators);
            if (Number.isInteger(result) && result > 0) {
                validFallbacks.push({ ...fallback, result });
            }
        }
        
        // Coba beberapa fallback secara acak
        for (let i = 0; i < 10; i++) {
            if (validFallbacks.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * validFallbacks.length);
            const fallback = validFallbacks[randomIndex];
            
            // Sesuaikan angka dengan rentang level
            const adjustedNumbers = fallback.numbers.map(num => {
                if (num < min) return this.randomInRange(min, max);
                if (num > max) return this.randomInRange(min, max);
                return num;
            });
            
            // Pastikan angka unik
            const uniqueNumbers = this.makeNumbersUnique(adjustedNumbers, min, max);
            if (!uniqueNumbers) continue;
            
            const signature = this.createSignature(uniqueNumbers, fallback.operators);
            
            // Cek apakah sudah pernah digunakan
            if (!levelCache.has(signature)) {
                const correctAnswer = this.calculateWithPEMDAS(uniqueNumbers, fallback.operators);
                
                if (Number.isInteger(correctAnswer) && correctAnswer > 0) {
                    return {
                        numbers: uniqueNumbers,
                        operators: fallback.operators,
                        correctAnswer: correctAnswer
                    };
                }
            }
        }
        
        // Ultimate fallback (dijamin valid)
        const numbers = [6, 2, 4, 3];
        const operators = ['÷', '+', '×'];
        const correctAnswer = this.calculateWithPEMDAS(numbers, operators);
        return { numbers, operators, correctAnswer };
    },
    
    makeNumbersUnique: function(numbers, min, max) {
        const uniqueNumbers = [...numbers];
        const used = new Set();
        
        for (let i = 0; i < uniqueNumbers.length; i++) {
            if (used.has(uniqueNumbers[i])) {
                // Cari angka baru yang belum digunakan
                let attempts = 0;
                let newNum;
                do {
                    newNum = this.randomInRange(min, max);
                    attempts++;
                } while (used.has(newNum) && attempts < 20);
                
                if (attempts >= 20) return null;
                
                uniqueNumbers[i] = newNum;
            }
            used.add(uniqueNumbers[i]);
        }
        
        return uniqueNumbers;
    },
    
    // ============== PUBLIC METHODS ==============
    
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    getHint: function(numbers, operators) {
        return "Gunakan aturan PEMDAS: Kerjakan Perkalian (×) dan Pembagian (÷) dulu, baru Penjumlahan (+) dan Pengurangan (−). Semua angka dan operator harus unik!";
    },
    
    clearCache: function(levelId = null) {
        if (levelId === null) {
            this.recentQuestions.clear();
        } else if (this.recentQuestions.has(levelId)) {
            this.recentQuestions.get(levelId).clear();
        }
    },
    
    // Test function
    testLevel: function(levelId, count = 10) {
        console.log(`🧪 Testing Level ${levelId} (${count} questions)`);
        console.log(`Rules: All numbers unique, All operators unique, ${levelId >= 6 ? 'divisor ≤ 100' : 'normal range'}`);
        this.clearCache(levelId);
        
        const questions = [];
        const divisionResults = new Set();
        const operatorCombinations = new Set();
        
        for (let i = 1; i <= count; i++) {
            console.log(`\nQuestion ${i}:`);
            const question = this.generateQuestion({ id: levelId });
            questions.push(question);
            
            console.log(`  ${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} ${question.operators[2]} ${question.numbers[3]} = ${this.formatNumber(question.correctAnswer)}`);
            console.log(`  Unique numbers: ${question.hasUniqueNumbers ? '✅' : '❌'}`);
            console.log(`  Unique operators: ${question.hasUniqueOperators ? '✅' : '❌'}`);
            
            // Catat kombinasi operator
            operatorCombinations.add(question.operators.join(''));
            
            // Catat hasil pembagian
            for (let j = 0; j < question.operators.length; j++) {
                if (question.operators[j] === '÷') {
                    const divResult = question.numbers[j] / question.numbers[j + 1];
                    divisionResults.add(divResult);
                    console.log(`  Division: ${question.numbers[j]} ÷ ${question.numbers[j + 1]} = ${divResult}`);
                }
            }
        }
        
        console.log(`\n📊 Summary for Level ${levelId}:`);
        console.log(`  Successful questions: ${questions.filter(q => q.correctAnswer > 0).length}/${count}`);
        console.log(`  All numbers unique: ${questions.every(q => q.hasUniqueNumbers) ? '✅' : '❌'}`);
        console.log(`  All operators unique: ${questions.every(q => q.hasUniqueOperators) ? '✅' : '❌'}`);
        console.log(`  Unique operator combinations: ${operatorCombinations.size}`);
        console.log(`  Operator combinations: ${Array.from(operatorCombinations).join(', ')}`);
        console.log(`  Unique division results: ${divisionResults.size}`);
        
        return questions;
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranSemuaOperation.id] = CampuranSemuaOperation;
    console.log(`✅ Registered: ${CampuranSemuaOperation.name} (${CampuranSemuaOperation.id})`);
    console.log(`   Rules: All numbers unique, All operators unique, divisor ≤ 100 for level 6+`);
}

// Debug functions
if (typeof window !== 'undefined') {
    window.testCampuranSemuaStrict = function(levelId = 5, count = 10) {
        console.log("🧪 Testing with STRICT rules (all operators must be different)");
        return CampuranSemuaOperation.testLevel(levelId, count);
    };
    
    window.showOperatorCombinations = function() {
        console.log("🎯 All possible unique operator combinations:");
        const allOps = ['+', '−', '×', '÷'];
        const combinations = [];
        
        // Generate all combinations of 3 unique operators
        for (let i = 0; i < allOps.length; i++) {
            for (let j = 0; j < allOps.length; j++) {
                for (let k = 0; k < allOps.length; k++) {
                    if (i !== j && i !== k && j !== k) {
                        const combo = [allOps[i], allOps[j], allOps[k]];
                        combinations.push(combo.join(''));
                    }
                }
            }
        }
        
        const uniqueCombos = [...new Set(combinations)];
        console.log(`Total unique combinations: ${uniqueCombos.length}`);
        console.log(`Combinations: ${uniqueCombos.join(', ')}`);
        
        return uniqueCombos;
    };
    
    window.clearAllCampuranCache = function() {
        CampuranSemuaOperation.clearCache();
        console.log("🧹 Cleared all cache for Campuran Semua");
    };
}
