// ==========================================================
// CAMPURAN PERKALIAN & PEMBAGIAN OPERATION MODULE - FINAL CORRECTION
// ==========================================================

const CampuranKaliBagiOperation = {
    // Operation Identity
    id: 'campuran_kali_bagi',
    name: 'Soal Perkalian Pembagian',
    description: 'Perkalian & Pembagian',
    icon: '×÷',
    
    // Operation Configuration
    type: 'campuran',
    numbers: 3,
    operators: ['×', '÷'],
    
    // Cache untuk mencegah pengulangan soal
    recentQuestions: new Map(),
    
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
        
        console.log(`📊 Level ${level.id} range: ${min}-${max}`);
        
        // PENGECUALIAN KHUSUS: Untuk level 6-10, pembagi acak dari 1-100
        const isHighLevel = level.id >= 6;
        
        let numbers, operators, correctAnswer;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Inisialisasi cache
        if (!this.recentQuestions.has(level.id)) {
            this.recentQuestions.set(level.id, new Set());
        }
        const levelCache = this.recentQuestions.get(level.id);
        
        do {
            attempts++;
            
            // Pilih pola operasi
            const pattern = Math.random() > 0.5 ? 'times_divide' : 'divide_times';
            
            if (pattern === 'times_divide') {
                // Pola: (a × b) ÷ c
                // a, b: dalam rentang level
                // c (pembagi): acak 1-100 untuk level tinggi
                numbers = this.generateTimesDividePattern(min, max, level.id, isHighLevel);
                operators = ['×', '÷'];
            } else {
                // Pola: (a ÷ b) × c
                // a, c: dalam rentang level
                // b (pembagi): acak 1-100 untuk level tinggi
                numbers = this.generateDivideTimesPattern(min, max, level.id, isHighLevel);
                operators = ['÷', '×'];
            }
            
            // Buat signature unik
            const questionSignature = `${numbers[0]},${numbers[1]},${numbers[2]},${operators[0]},${operators[1]}`;
            
            // Cek apakah soal sudah pernah muncul
            if (levelCache.has(questionSignature)) {
                continue;
            }
            
            // Debug
            console.log(`  Attempt ${attempts}: [${numbers.join(', ')}] ${operators.join(' ')}`);
            
            // Validasi 1: Rentang
            if (!this.validateNumbersRange(numbers, min, max, operators, isHighLevel)) {
                continue;
            }
            
            // Validasi 2: Unik
            if (!this.areNumbersUnique(numbers)) {
                continue;
            }
            
            // Validasi 3: Pembagi antara 1-100 untuk level tinggi
            if (isHighLevel) {
                const divisor = this.getDivisor(numbers, operators);
                if (divisor < 1 || divisor > 100) {
                    console.log(`    ❌ Divisor ${divisor} not in 1-100`);
                    continue;
                }
            }
            
            // Hitung jawaban
            correctAnswer = this.calculate(numbers, operators);
            
            // Validasi 4: Hasil integer positif
            if (!Number.isInteger(correctAnswer) || correctAnswer <= 0) {
                console.log(`    ❌ Invalid result: ${correctAnswer}`);
                continue;
            }
            
            // Validasi 5: Untuk level tinggi, hasil tidak terlalu besar
            if (isHighLevel && correctAnswer > max * 50) {
                console.log(`    ❌ Result too large: ${correctAnswer}`);
                continue;
            }
            
            // SUCCESS
            levelCache.add(questionSignature);
            if (levelCache.size > 100) {
                const first = Array.from(levelCache)[0];
                levelCache.delete(first);
            }
            
            console.log(`    ✅ Found after ${attempts} attempts`);
            break;
            
        } while (attempts < maxAttempts);
        
        // Fallback
        if (attempts >= maxAttempts) {
            console.log(`⚠️ Using fallback for level ${level.id}`);
            ({ numbers, operators, correctAnswer } = this.getSmartFallback(
                level.id, min, max, isHighLevel, levelCache
            ));
            
            const questionSignature = `${numbers[0]},${numbers[1]},${numbers[2]},${operators[0]},${operators[1]}`;
            levelCache.add(questionSignature);
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
        
        // Final logging
        console.log(`🎯 FINAL Level ${level.id}:`);
        console.log(`   ${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]} = ${this.formatNumber(correctAnswer)}`);
        
        if (isHighLevel) {
            const divisor = this.getDivisor(numbers, operators);
            console.log(`   Divisor: ${divisor} (${divisor >= 1 && divisor <= 100 ? '✅ 1-100' : '❌ Not 1-100'})`);
        }
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: numbers,
            operators: operators,
            level: level.id,
            type: this.id,
            range: `${min}-${max}`
        };
    },
    
    // Generate for (a × b) ÷ c pattern
    generateTimesDividePattern: function(min, max, levelId, isHighLevel) {
        // Untuk level tinggi: pembagi (c) acak 1-100
        // Untuk level rendah: pembagi dalam rentang level
        
        let a, b, c;
        let attempts = 0;
        
        do {
            attempts++;
            
            // Tentukan rentang untuk pembagi
            let divisorMin = Math.max(1, min);
            let divisorMax = max;
            
            if (isHighLevel) {
                // Untuk level tinggi, pembagi acak 1-100
                divisorMin = 1;
                divisorMax = 100;
            }
            
            // Pilih pembagi terlebih dahulu
            c = this.randomInRange(divisorMin, divisorMax);
            
            // Pilih quotient (hasil pembagian) secara acak
            let quotient;
            if (levelId <= 3) {
                quotient = this.randomInRange(2, 5);
            } else if (levelId <= 5) {
                quotient = this.randomInRange(3, 10);
            } else {
                // Untuk level tinggi, quotient lebih beragam
                quotient = this.randomInRange(2, 20);
            }
            
            // Hitung product yang diperlukan
            const requiredProduct = quotient * c;
            
            // Cari a dan b yang menghasilkan product ini dan dalam rentang
            const factors = this.findFactorPair(requiredProduct, min, max);
            
            if (factors) {
                [a, b] = factors;
                
                // Pastikan semua angka berbeda
                if (a !== b && a !== c && b !== c) {
                    return [a, b, c];
                }
            }
            
            // Alternate approach: pilih a dan b dulu
            if (attempts > 10) {
                a = this.randomInRange(min, max);
                b = this.randomInRange(min, max);
                
                // Pastikan a ≠ b
                while (b === a && attempts < 20) {
                    b = this.randomInRange(min, max);
                }
                
                const product = a * b;
                
                // Untuk level tinggi, cari pembagi 1-100 yang membagi habis
                if (isHighLevel) {
                    // Cari semua pembagi 1-100 yang membagi habis product
                    const validDivisors = [];
                    for (let d = 1; d <= 100; d++) {
                        if (product % d === 0 && d !== a && d !== b) {
                            validDivisors.push(d);
                        }
                    }
                    
                    if (validDivisors.length > 0) {
                        c = validDivisors[Math.floor(Math.random() * validDivisors.length)];
                        return [a, b, c];
                    }
                } else {
                    // Untuk level rendah, cari pembagi dalam rentang
                    c = this.findDivisor(product, Math.max(2, min), max, [a, b]);
                    if (c !== null) {
                        return [a, b, c];
                    }
                }
            }
            
        } while (attempts < 50);
        
        // Fallback
        return this.getTimesDivideFallback(levelId, isHighLevel);
    },
    
    // Generate for (a ÷ b) × c pattern
    generateDivideTimesPattern: function(min, max, levelId, isHighLevel) {
        // Untuk level tinggi: pembagi (b) acak 1-100
        // Untuk level rendah: pembagi dalam rentang level
        
        let a, b, c;
        let attempts = 0;
        
        do {
            attempts++;
            
            // Tentukan rentang untuk pembagi
            let divisorMin = Math.max(2, min);
            let divisorMax = max;
            
            if (isHighLevel) {
                // Untuk level tinggi, pembagi acak 1-100
                divisorMin = 1;
                divisorMax = 100;
            }
            
            // Pilih pembagi
            b = this.randomInRange(divisorMin, divisorMax);
            
            // Pilih quotient (hasil pembagian) secara acak
            let quotient;
            if (levelId <= 3) {
                quotient = this.randomInRange(2, 5);
            } else if (levelId <= 5) {
                quotient = this.randomInRange(3, 10);
            } else {
                quotient = this.randomInRange(2, 50);
            }
            
            // Hitung a yang diperlukan
            a = quotient * b;
            
            // Pastikan a dalam rentang
            if (a < min || a > max) {
                continue;
            }
            
            // Pilih c secara acak, berbeda dari a dan b
            c = this.randomInRange(min, max);
            let cAttempts = 0;
            while ((c === a || c === b) && cAttempts < 10) {
                c = this.randomInRange(min, max);
                cAttempts++;
            }
            
            // Verifikasi semua berbeda
            if (a !== b && a !== c && b !== c) {
                return [a, b, c];
            }
            
        } while (attempts < 50);
        
        // Fallback
        return this.getDivideTimesFallback(levelId, isHighLevel);
    },
    
    // Helper: Random number in range
    randomInRange: function(min, max) {
        if (min > max) [min, max] = [max, min];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Find factor pair
    findFactorPair: function(product, min, max) {
        if (product === 0) return null;
        
        const factors = [];
        const limit = Math.min(max, Math.sqrt(product));
        
        for (let i = Math.max(1, min); i <= limit; i++) {
            if (product % i === 0) {
                const j = product / i;
                if (j >= min && j <= max) {
                    factors.push([i, j]);
                }
            }
        }
        
        if (factors.length === 0) return null;
        return factors[Math.floor(Math.random() * factors.length)];
    },
    
    // Find divisor
    findDivisor: function(number, minDivisor, maxDivisor, exclude = []) {
        if (number === 0) return null;
        
        for (let d = Math.min(maxDivisor, number); d >= minDivisor; d--) {
            if (number % d === 0 && !exclude.includes(d)) {
                return d;
            }
        }
        
        return null;
    },
    
    // Validate numbers range
    validateNumbersRange: function(numbers, min, max, operators, isHighLevel) {
        const [a, b, c] = numbers;
        
        // Cek rentang dasar untuk a, b, c
        if (a < min || a > max) return false;
        if (c < min || c > max) return false;
        
        // Untuk b, perlakuan khusus:
        if (operators[0] === '÷') {
            // b adalah pembagi
            if (isHighLevel) {
                // Level tinggi: b harus 1-100
                if (b < 1 || b > 100) return false;
            } else {
                // Level rendah: b dalam rentang level
                if (b < Math.max(2, min) || b > max) return false;
            }
        } else {
            // b bukan pembagi, harus dalam rentang level
            if (b < min || b > max) return false;
        }
        
        return true;
    },
    
    // Check if numbers are unique
    areNumbersUnique: function(numbers) {
        const set = new Set(numbers);
        return set.size === 3;
    },
    
    // Get divisor
    getDivisor: function(numbers, operators) {
        if (operators[0] === '÷') return numbers[1];
        if (operators[1] === '÷') return numbers[2];
        return null;
    },
    
    // Calculate expression
    calculate: function(numbers, operators) {
        try {
            let result = numbers[0];
            
            for (let i = 0; i < operators.length; i++) {
                const next = numbers[i + 1];
                const op = operators[i];
                
                if (op === '×') {
                    result *= next;
                } else if (op === '÷') {
                    if (next === 0) return NaN;
                    if (result % next !== 0) return NaN;
                    result /= next;
                }
            }
            
            return result;
        } catch {
            return NaN;
        }
    },
    
    // Get times_divide fallback
    getTimesDivideFallback: function(levelId, isHighLevel) {
        const fallbacks = {
            1: [4, 3, 2],
            2: [6, 4, 3],
            3: [8, 6, 4],
            4: [24, 8, 6],
            5: [40, 15, 8],
            6: [120, 40, 30],  // 120×40÷30=160, divisor: 30 (1-100)
            7: [240, 80, 60],   // divisor: 60 (1-100)
            8: [480, 160, 80],  // divisor: 80 (1-100)
            9: [1200, 400, 100], // divisor: 100 (1-100)
            10: [2400, 800, 100] // divisor: 100 (1-100)
        };
        
        let numbers = fallbacks[levelId] || fallbacks[1];
        
        // Untuk level tinggi, pastikan pembagi 1-100
        if (isHighLevel) {
            // Pembagi adalah angka ketiga (c)
            if (numbers[2] < 1 || numbers[2] > 100) {
                numbers[2] = this.randomInRange(1, 100);
            }
        }
        
        return numbers;
    },
    
    // Get divide_times fallback
    getDivideTimesFallback: function(levelId, isHighLevel) {
        const fallbacks = {
            1: [6, 2, 3],
            2: [8, 4, 2],
            3: [12, 3, 4],
            4: [36, 12, 3],
            5: [72, 24, 3],
            6: [150, 10, 20],    // 150÷10×20=300, divisor: 10 (1-100)
            7: [300, 12, 25],    // divisor: 12 (1-100)
            8: [600, 16, 40],    // divisor: 16 (1-100)
            9: [3000, 25, 80],   // divisor: 25 (1-100)
            10: [9000, 15, 2500] // divisor: 15 (1-100)
        };
        
        let numbers = fallbacks[levelId] || fallbacks[1];
        
        // Untuk level tinggi, pastikan pembagi 1-100
        if (isHighLevel) {
            // Pembagi adalah angka kedua (b)
            if (numbers[1] < 1 || numbers[1] > 100) {
                numbers[1] = this.randomInRange(1, 100);
                // Sesuaikan a agar habis dibagi
                numbers[0] = numbers[1] * Math.floor(numbers[0] / numbers[1]);
            }
        }
        
        return numbers;
    },
    
    // Get smart fallback
    getSmartFallback: function(levelId, min, max, isHighLevel, cache) {
        // Coba beberapa pola
        const patterns = [
            () => {
                const numbers = this.getTimesDivideFallback(levelId, isHighLevel);
                return { numbers, operators: ['×', '÷'] };
            },
            () => {
                const numbers = this.getDivideTimesFallback(levelId, isHighLevel);
                return { numbers, operators: ['÷', '×'] };
            },
            () => {
                // Generate simple
                if (isHighLevel) {
                    const b = this.randomInRange(1, 100);
                    const quotient = this.randomInRange(3, 10);
                    const a = b * quotient;
                    const c = this.randomInRange(min, max);
                    return { numbers: [a, b, c], operators: ['÷', '×'] };
                } else {
                    const a = this.randomInRange(min, max);
                    const b = this.randomInRange(Math.max(2, min), max);
                    const c = this.randomInRange(min, max);
                    return { numbers: [a, b, c], operators: ['÷', '×'] };
                }
            }
        ];
        
        // Coba setiap pola sampai dapat yang belum digunakan
        for (const pattern of patterns) {
            const { numbers, operators } = pattern();
            const signature = `${numbers[0]},${numbers[1]},${numbers[2]},${operators[0]},${operators[1]}`;
            
            if (!cache.has(signature)) {
                const correctAnswer = this.calculate(numbers, operators);
                if (Number.isInteger(correctAnswer) && correctAnswer > 0) {
                    return { numbers, operators, correctAnswer };
                }
            }
        }
        
        // Default
        const numbers = [6, 2, 3];
        const operators = ['÷', '×'];
        const correctAnswer = this.calculate(numbers, operators);
        return { numbers, operators, correctAnswer };
    },
    
    // Clear cache
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
        this.clearCache(levelId);
        
        const questions = [];
        const divisors = new Set();
        
        for (let i = 1; i <= count; i++) {
            console.log(`\nQuestion ${i}:`);
            const question = this.generateQuestion({ id: levelId });
            questions.push(question);
            
            console.log(`  ${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} = ${this.formatNumber(question.correctAnswer)}`);
            
            if (levelId >= 6) {
                const divisor = this.getDivisor(question.numbers, question.operators);
                console.log(`  Divisor: ${divisor} (${divisor >= 1 && divisor <= 100 ? '✅' : '❌'})`);
                divisors.add(divisor);
            }
        }
        
        console.log(`\n📊 Summary for Level ${levelId}:`);
        console.log(`  Unique divisors: ${divisors.size}`);
        console.log(`  Divisors: ${Array.from(divisors).sort((a, b) => a - b).join(', ')}`);
        
        return questions;
    },
    
    formatNumber: function(num) {
        return num.toLocaleString('id-ID');
    },
    
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    getHint: function(numbers, operators) {
        const [a, b, c] = numbers;
        const [op1, op2] = operators;
        
        if (op1 === '×' && op2 === '÷') {
            return `Hitung: ${this.formatNumber(a)} × ${this.formatNumber(b)} = X, lalu X ÷ ${this.formatNumber(c)} = ?`;
        } else {
            return `Hitung: ${this.formatNumber(a)} ÷ ${this.formatNumber(b)} = X, lalu X × ${this.formatNumber(c)} = ?`;
        }
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[CampuranKaliBagiOperation.id] = CampuranKaliBagiOperation;
    console.log(`✅ Registered: ${CampuranKaliBagiOperation.name} (${CampuranKaliBagiOperation.id})`);
    console.log(`   Level 6-10: Divisor random 1-100`);
}

// Debug functions
if (typeof window !== 'undefined') {
    window.testHighLevelDivisor = function(levelId = 10, count = 10) {
        return CampuranKaliBagiOperation.testLevel(levelId, count);
    };
    
    window.clearCampuranCache = function(levelId) {
        CampuranKaliBagiOperation.clearCache(levelId);
    };
    
    window.demoHighLevelQuestions = function() {
        console.log("🎯 DEMO: High Level Questions (Level 6-10)");
        console.log("Rules: Divisor random 1-100, other numbers follow level range");
        
        for (let levelId = 6; levelId <= 10; levelId++) {
            console.log(`\n--- Level ${levelId} ---`);
            
            CampuranKaliBagiOperation.clearCache(levelId);
            
            for (let i = 1; i <= 3; i++) {
                const question = CampuranKaliBagiOperation.generateQuestion({ id: levelId });
                const divisor = CampuranKaliBagiOperation.getDivisor(question.numbers, question.operators);
                
                console.log(`${i}. ${question.numbers[0]} ${question.operators[0]} ${question.numbers[1]} ${question.operators[1]} ${question.numbers[2]} = ${CampuranKaliBagiOperation.formatNumber(question.correctAnswer)}`);
                console.log(`   Divisor: ${divisor} (${divisor >= 1 && divisor <= 100 ? '✅' : '❌'})`);
            }
        }
    };
}
