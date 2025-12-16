// ==========================================================
// PEMBAGIAN OPERATION MODULE
// ==========================================================

const PembagianOperation = {
    // Operation Identity
    id: 'pembagian_2',
    name: 'Soal Pembagian',
    description: '2 Bilangan',
    icon: '÷',
    
    // Operation Configuration
    type: 'pembagian',
    numbers: 2,
    operators: ['÷'],
    
    // Get number ranges based on level
    getNumberRanges: function(level) {
        const ranges = {
            1: { 
                dividend: { min: 1, max: 10 },
                divisor: { min: 1, max: 5 }
            },
            2: { 
                dividend: { min: 1, max: 20 },
                divisor: { min: 1, max: 5 }
            },
            3: { 
                dividend: { min: 11, max: 20 },
                divisor: { min: 1, max: 5 }
            },
            4: { 
                dividend: { min: 21, max: 50 },
                divisor: { min: 2, max: 5 }
            },
            5: { 
                dividend: { min: 50, max: 100 },
                divisor: { min: 2, max: 10 }
            },
            6: { 
                dividend: { min: 100, max: 250 },
                divisor: { min: 5, max: 10 }
            },
            7: { 
                dividend: { min: 250, max: 1000 },
                divisor: { min: 10, max: 20 }
            },
            8: { 
                dividend: { min: 1000, max: 2500 },
                divisor: { min: 10, max: 25 }
            },
            9: { 
                dividend: { min: 2500, max: 5000 },
                divisor: { min: 10, max: 50 }
            },
            10: { 
                dividend: { min: 5000, max: 10000 },
                divisor: { min: 10, max: 50 }
            }
        };
        
        return ranges[level] || ranges[1];
    },
    
    // Store previously generated answers to avoid repetition
    previousAnswers: new Map(),
    
    // Generate question for this operation
    generateQuestion: function(level) {
        console.log(`🔢 Generating Pembagian question for Level ${level.id}`);
        
        const levelKey = level.id;
        const ranges = this.getNumberRanges(levelKey);
        const maxAttempts = 100;
        let attempts = 0;
        
        // Initialize previous answers for this level if not exists
        if (!this.previousAnswers.has(levelKey)) {
            this.previousAnswers.set(levelKey, new Set());
        }
        const levelPreviousAnswers = this.previousAnswers.get(levelKey);
        
        let divisor, quotient, dividend;
        let foundValidCombination = false;
        
        while (attempts < maxAttempts && !foundValidCombination) {
            attempts++;
            
            // Generate divisor within range
            divisor = this.randomNumber(ranges.divisor.min, ranges.divisor.max);
            
            // Calculate possible quotient range
            const minQuotient = Math.max(1, Math.ceil(ranges.dividend.min / divisor));
            const maxQuotient = Math.floor(ranges.dividend.max / divisor);
            
            // Ensure we have a valid range
            if (minQuotient > maxQuotient || maxQuotient < 1) {
                continue;
            }
            
            // Generate quotient
            if (levelKey <= 2) {
                // Level 1-2: simple numbers
                quotient = this.randomNumber(minQuotient, Math.min(10, maxQuotient));
            } else if (levelKey <= 4) {
                // Level 3-4: small to medium
                quotient = this.randomNumber(minQuotient, Math.min(20, maxQuotient));
            } else if (levelKey <= 6) {
                // Level 5-6: medium
                quotient = this.randomNumber(minQuotient, Math.min(50, maxQuotient));
            } else {
                // Level 7-10: larger numbers
                quotient = this.randomNumber(minQuotient, Math.min(200, maxQuotient));
            }
            
            // Calculate dividend
            dividend = divisor * quotient;
            
            // Validate dividend is within range
            if (dividend < ranges.dividend.min || dividend > ranges.dividend.max) {
                continue;
            }
            
            // Validate that division is exact
            if (dividend % divisor !== 0) {
                continue;
            }
            
            // Check if we've used this exact combination recently
            const answerKey = `${dividend}÷${divisor}`;
            
            if (!levelPreviousAnswers.has(answerKey)) {
                // Add to previous answers and limit history size
                levelPreviousAnswers.add(answerKey);
                if (levelPreviousAnswers.size > 30) {
                    // Remove oldest entries to prevent memory issues
                    const firstKey = Array.from(levelPreviousAnswers)[0];
                    levelPreviousAnswers.delete(firstKey);
                }
                
                foundValidCombination = true;
            }
        }
        
        // Fallback if no unique combination found
        if (!foundValidCombination) {
            console.warn(`Fallback for level ${levelKey} after ${attempts} attempts`);
            
            // Simple fallback strategy
            divisor = this.randomNumber(ranges.divisor.min, ranges.divisor.max);
            const minQuotient = Math.max(1, Math.ceil(ranges.dividend.min / divisor));
            const maxQuotient = Math.min(50, Math.floor(ranges.dividend.max / divisor));
            
            if (minQuotient <= maxQuotient) {
                quotient = this.randomNumber(minQuotient, maxQuotient);
                dividend = divisor * quotient;
            } else {
                // Ultimate fallback
                dividend = ranges.dividend.min;
                divisor = ranges.divisor.min;
                quotient = dividend / divisor;
            }
        }
        
        // Store this answer to avoid immediate repetition
        const answerKey = `${dividend}÷${divisor}`;
        if (!this.previousAnswers.has(levelKey)) {
            this.previousAnswers.set(levelKey, new Set());
        }
        this.previousAnswers.get(levelKey).add(answerKey);
        
        // Calculate correct answer (quotient)
        const correctAnswer = quotient;
        
        // Create question HTML
        const questionHTML = `
            <span class="number">${this.formatNumber(dividend)}</span>
            <span class="operator">÷</span>
            <span class="number">${this.formatNumber(divisor)}</span>
            <span class="question-mark">= ...</span>
        `;
        
        console.log(`Level ${levelKey}: ${dividend} ÷ ${divisor} = ${quotient} (Attempts: ${attempts})`);
        
        return {
            question: questionHTML,
            correctAnswer: correctAnswer,
            numbers: [dividend, divisor],
            originalNumbers: { dividend, divisor, quotient },
            operators: ['÷'],
            level: level.id,
            type: this.id
        };
    },
    
    // Generate wrong answers - IMPROVED VERSION
    generateWrongAnswers: function(correctAnswer, level, numbers) {
        const [dividend, divisor] = numbers || [correctAnswer * 2, 2];
        const wrongAnswers = new Set();
        
        // Tentukan range untuk wrong answers berdasarkan level dan correctAnswer
        let baseErrorRange;
        let maxMultiplier;
        
        if (level <= 3) {
            baseErrorRange = Math.max(1, Math.floor(correctAnswer * 0.3));
            maxMultiplier = 1.5;
        } else if (level <= 6) {
            baseErrorRange = Math.max(2, Math.floor(correctAnswer * 0.2));
            maxMultiplier = 2;
        } else {
            baseErrorRange = Math.max(5, Math.floor(correctAnswer * 0.15));
            maxMultiplier = 2.5;
        }
        
        // Minimum dan maximum range untuk wrong answers
        const minRange = Math.max(1, correctAnswer - baseErrorRange * 3);
        const maxRange = correctAnswer + baseErrorRange * 3;
        
        console.log(`Generating wrong answers for ${correctAnswer}, Level ${level}`);
        console.log(`Error range: ${baseErrorRange}, Min: ${minRange}, Max: ${maxRange}`);
        
        // Strategy 1: Simple offsets (very close to correct answer)
        const offset1 = Math.max(1, Math.floor(baseErrorRange * 0.5));
        const offset2 = Math.max(1, Math.floor(baseErrorRange * 0.8));
        const offset3 = baseErrorRange;
        
        // Create close wrong answers
        const closeOptions = [
            correctAnswer + offset1,
            correctAnswer - offset1,
            correctAnswer + offset2,
            correctAnswer - offset2,
            correctAnswer + offset3,
            correctAnswer - offset3
        ].filter(ans => ans >= minRange && ans <= maxRange && ans !== correctAnswer && ans > 0);
        
        // Strategy 2: Common multiplication mistakes
        const multiplicationMistakes = [
            Math.round(dividend / (divisor + 1)), // Divisor salah
            Math.round(dividend / (divisor - 1)),
            Math.round((dividend - 1) / divisor), // Dividend salah
            Math.round((dividend + 1) / divisor),
            Math.round(dividend / 2 / divisor), // Membagi dividend dulu
            Math.round(dividend / (divisor / 2)) // Membagi divisor dulu
        ].filter(ans => ans >= minRange && ans <= maxRange && ans !== correctAnswer && ans > 0);
        
        // Strategy 3: Rounding mistakes (for larger numbers)
        const roundingMistakes = [];
        if (correctAnswer >= 10) {
            const roundTo = level <= 3 ? 1 : (level <= 6 ? 5 : 10);
            roundingMistakes.push(
                Math.floor(correctAnswer / roundTo) * roundTo,
                Math.ceil(correctAnswer / roundTo) * roundTo,
                Math.round(correctAnswer / roundTo) * roundTo
            );
        }
        
        // Combine all possible wrong answers
        const allPossibleAnswers = [
            ...closeOptions,
            ...multiplicationMistakes,
            ...roundingMistakes.filter(ans => ans >= minRange && ans <= maxRange && ans !== correctAnswer && ans > 0)
        ];
        
        // Remove duplicates and ensure positive numbers
        const uniqueAnswers = [...new Set(allPossibleAnswers)]
            .filter(ans => ans > 0 && ans !== correctAnswer)
            .sort((a, b) => Math.abs(a - correctAnswer) - Math.abs(b - correctAnswer)); // Sort by closeness
        
        // Take the 3 closest wrong answers
        const closestWrongAnswers = uniqueAnswers.slice(0, 3);
        
        // If we don't have enough wrong answers, generate some simple ones
        if (closestWrongAnswers.length < 3) {
            const needed = 3 - closestWrongAnswers.length;
            for (let i = 0; i < needed; i++) {
                let newWrongAnswer;
                let attempts = 0;
                
                do {
                    attempts++;
                    const offset = (i + 1) * Math.max(1, Math.floor(baseErrorRange * 0.5));
                    newWrongAnswer = Math.random() > 0.5 ? 
                        correctAnswer + offset : 
                        Math.max(1, correctAnswer - offset);
                    
                    // Ensure it's within reasonable range
                    if (newWrongAnswer < minRange || newWrongAnswer > maxRange) {
                        newWrongAnswer = correctAnswer + (i + 1);
                    }
                    
                    if (attempts > 10) {
                        newWrongAnswer = correctAnswer + (i + 1) * 2;
                        break;
                    }
                } while (closestWrongAnswers.includes(newWrongAnswer) || newWrongAnswer === correctAnswer);
                
                closestWrongAnswers.push(newWrongAnswer);
            }
        }
        
        // Ensure all wrong answers are integers and positive
        const finalWrongAnswers = closestWrongAnswers
            .map(ans => Math.max(1, Math.round(ans)))
            .filter(ans => ans !== correctAnswer);
        
        // Remove duplicates
        const finalUniqueAnswers = [...new Set(finalWrongAnswers)].slice(0, 3);
        
        console.log(`Final wrong answers: ${finalUniqueAnswers.join(', ')}`);
        
        return finalUniqueAnswers;
    },
    
    // Validate answer
    validateAnswer: function(userAnswer, correctAnswer) {
        const userNum = parseInt(userAnswer);
        return !isNaN(userNum) && userNum === correctAnswer;
    },
    
    // Get hint
    getHint: function(numbers) {
        if (numbers.length !== 2) return null;
        
        const [dividend, divisor] = numbers;
        const quotient = dividend / divisor;
        
        return `Berapa kali ${this.formatNumber(divisor)} dikalikan untuk mendapatkan ${this.formatNumber(dividend)}? 
                ${this.formatNumber(divisor)} × ? = ${this.formatNumber(dividend)}
                Jawabannya adalah ${this.formatNumber(quotient)}.`;
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
        difficulty: 'hard',
        category: 'division',
        requiresRemainderCalculation: false
    },
    
    // Operation description
    getDescription: function() {
        return "Membagi bilangan yang habis dibagi (tanpa sisa). Contoh: 12 ÷ 3 = 4";
    },
    
    // Example for tutorial
    getExample: function() {
        return {
            question: "20 ÷ 5 = ...",
            numbers: [20, 5],
            answer: 4,
            explanation: "20 dibagi 5 sama dengan 4"
        };
    },
    
    // Check for exact division
    isExactDivision: function(dividend, divisor) {
        return dividend % divisor === 0;
    },
    
    // Get multiplication fact for division
    getRelatedMultiplication: function(dividend, divisor) {
        const quotient = dividend / divisor;
        return `${this.formatNumber(divisor)} × ${this.formatNumber(quotient)} = ${this.formatNumber(dividend)}`;
    },
    
    // Clear previous answers (useful for resetting)
    clearPreviousAnswers: function(level) {
        if (level) {
            this.previousAnswers.delete(level);
        } else {
            this.previousAnswers.clear();
        }
    }
};

// ==========================================================
// REGISTER OPERATION
// ==========================================================

if (typeof window !== 'undefined') {
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[PembagianOperation.id] = PembagianOperation;
    console.log(`✅ Registered operation: ${PembagianOperation.name} (${PembagianOperation.id})`);
}

// Debug function
if (typeof window !== 'undefined' && window.location.href.includes('debug')) {
    window.testPembagian = function() {
        console.log("🧪 Testing Pembagian Generation");
        
        // Clear previous answers for fresh test
        PembagianOperation.clearPreviousAnswers();
        
        // Test all levels
        for (let level = 1; level <= 10; level++) {
            console.log(`\n=== Level ${level} ===`);
            const ranges = PembagianOperation.getNumberRanges(level);
            console.log(`Dividend range: ${ranges.dividend.min} - ${ranges.dividend.max}`);
            console.log(`Divisor range: ${ranges.divisor.min} - ${ranges.divisor.max}`);
            
            // Test 5 questions per level
            for (let i = 0; i < 5; i++) {
                try {
                    const testLevel = { id: level };
                    const question = PembagianOperation.generateQuestion(testLevel);
                    const [dividend, divisor] = question.numbers;
                    const quotient = question.correctAnswer;
                    
                    console.log(`\nQ${i+1}: ${dividend} ÷ ${divisor} = ${quotient}`);
                    
                    // Validate ranges
                    const inDividendRange = dividend >= ranges.dividend.min && dividend <= ranges.dividend.max;
                    const inDivisorRange = divisor >= ranges.divisor.min && divisor <= ranges.divisor.max;
                    const isExact = dividend % divisor === 0;
                    const checkResult = dividend / divisor;
                    
                    console.log(`  Dividend: ${inDividendRange ? '✓' : '✗'} (${dividend})`);
                    console.log(`  Divisor: ${inDivisorRange ? '✓' : '✗'} (${divisor})`);
                    console.log(`  Exact division: ${isExact ? '✓' : '✗'} (${dividend} % ${divisor} = ${dividend % divisor})`);
                    console.log(`  Result: ${checkResult} (Expected: ${quotient})`);
                    
                    // Test wrong answers
                    const wrongAnswers = PembagianOperation.generateWrongAnswers(quotient, level, [dividend, divisor]);
                    console.log(`  Wrong answers: ${wrongAnswers.join(', ')}`);
                    
                    // Check closeness of wrong answers
                    wrongAnswers.forEach(wrong => {
                        const diff = Math.abs(wrong - quotient);
                        const percentage = ((diff / quotient) * 100).toFixed(1);
                        console.log(`    ${wrong} - Difference: ${diff} (${percentage}%)`);
                    });
                    
                } catch (error) {
                    console.error(`  Error: ${error.message}`);
                }
            }
        }
        
        return "Test completed!";
    };
}
