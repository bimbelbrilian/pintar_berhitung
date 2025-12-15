// File: hitung_buah.js - PERBAIKAN DENGAN ATURAN BARIS DINAMIS
(function() {
    const operation = {
        id: 'hitung_buah',
        name: 'Menghitung Buah',
        icon: '🍎',
        description: 'Latihan berhitung dengan gambar buah-buahan',
        
        // Konfigurasi level
        getLevelConfig: function(levelNumber) {
            const configs = [
                // Level 1: 1-5 buah, jawaban 1-5
                { min: 1, max: 5, answerMin: 1, answerMax: 5 },
                // Level 2: 5-10 buah, jawaban 5-10
                { min: 5, max: 10, answerMin: 5, answerMax: 10 },
                // Level 3: 10-15 buah, jawaban 10-15
                { min: 10, max: 15, answerMin: 10, answerMax: 15 },
                // Level 4: 11-20 buah, jawaban 15-20
                { min: 11, max: 20, answerMin: 15, answerMax: 20 },
                // Level 5: 20-30 buah, jawaban 20-30
                { min: 20, max: 30, answerMin: 20, answerMax: 30 }
            ];
            
            return configs[levelNumber - 1] || configs[0];
        },
        
        // ATURAN BARIS BARU:
        // 1-5 icon = 1 baris
        // 6-10 icon = 2 baris  
        // 11-15 icon = 3 baris
        // 16-30 icon = 4 baris
        
        // Fungsi untuk menghitung jumlah baris berdasarkan jumlah icon
        calculateRows: function(count) {
            if (count <= 5) return 1;      // 1-5 icon = 1 baris
            if (count <= 10) return 2;     // 6-10 icon = 2 baris
            if (count <= 15) return 3;     // 11-15 icon = 3 baris
            return 4;                      // 16-30 icon = 4 baris
        },
        
        // Fungsi untuk menghitung icon per baris
        calculateIconsPerRow: function(count, rows) {
            return Math.ceil(count / rows);
        },
        
        generateQuestion: function(level) {
            const levelNumber = level.id || 1;
            const config = this.getLevelConfig(levelNumber);
            
            // Daftar semua buah
            const fruits = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🥭', '🍑', '🍒'];
            
            // Generate jumlah buah sesuai level
            const count = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
            
            // Pilih buah secara acak untuk ditampilkan
            const fruit = fruits[Math.floor(Math.random() * fruits.length)];
            
            // Hitung jumlah baris berdasarkan aturan baru
            const rows = this.calculateRows(count);
            const iconsPerRow = this.calculateIconsPerRow(count, rows);
            
            console.log(`🎯 ATURAN BARIS: ${count} icon = ${rows} baris, ${iconsPerRow} icon/baris`);
            
            // Generate tampilan buah dengan baris
            let fruitDisplay = '';
            let remainingFruits = count;
            
            for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                // Jumlah buah di baris ini
                const fruitsInThisRow = Math.min(iconsPerRow, remainingFruits);
                
                // Buat string buah untuk baris ini
                let rowContent = '';
                for (let iconIndex = 0; iconIndex < fruitsInThisRow; iconIndex++) {
                    rowContent += `<span class="counting-icon">${fruit}</span>`;
                }
                
                fruitDisplay += `<div class="counting-row row-${rowIndex + 1}">${rowContent}</div>`;
                remainingFruits -= fruitsInThisRow;
            }
            
            // Tentukan ukuran font berdasarkan jumlah baris
            let fontSize;
            switch(rows) {
                case 1: // 1 baris (1-5 icon)
                    fontSize = '5vw';
                    break;
                case 2: // 2 baris (6-10 icon)
                    fontSize = '4.5vw';
                    break;
                case 3: // 3 baris (11-15 icon)
                    fontSize = '4vw';
                    break;
                case 4: // 4 baris (16-30 icon)
                default:
                    fontSize = '3.5vw';
                    break;
            }
            
            // Tambah class untuk jumlah baris
            const rowsClass = `rows-${rows}`;
            
            return {
                question: `<div class="counting-question level-${levelNumber} ${rowsClass}">
                    <div class="counting-display" style="font-size: ${fontSize};">
                        ${fruitDisplay}
                    </div>
                </div>`,
                correctAnswer: count,
                levelNumber: levelNumber,
                rows: rows,
                iconsPerRow: iconsPerRow
            };
        },
        
        generateWrongAnswers: function(correctAnswer, level) {
            // Dapatkan levelNumber dari parameter level
            let levelNumber;
            let config;
            
            // Handle berbagai format parameter level
            if (typeof level === 'number') {
                levelNumber = level;
                config = this.getLevelConfig(levelNumber);
            } else if (level && level.id) {
                levelNumber = level.id;
                config = this.getLevelConfig(levelNumber);
            } else if (level && level.min && level.max) {
                // Jika level adalah object {min, max}, coba estimasi levelNumber
                levelNumber = this.estimateLevelNumber(level);
                config = this.getLevelConfig(levelNumber);
            } else {
                // Fallback ke level 1
                levelNumber = 1;
                config = this.getLevelConfig(levelNumber);
            }
            
            console.log(`Level: ${levelNumber}, Correct: ${correctAnswer}, Range: ${config.answerMin}-${config.answerMax}`);
            
            const wrongAnswers = new Set();
            const maxAttempts = 50; // Batasi percobaan
            
            // Method 1: Coba angka dalam rentang yang berdekatan dengan jawaban benar
            let attempts = 0;
            while (wrongAnswers.size < 3 && attempts < maxAttempts) {
                attempts++;
                
                // Tentukan offset maksimum berdasarkan level
                let maxOffset;
                if (levelNumber === 1) maxOffset = 3;
                else if (levelNumber === 2) maxOffset = 4;
                else if (levelNumber === 3) maxOffset = 4;
                else if (levelNumber === 4) maxOffset = 5;
                else maxOffset = 6; // Level 5
                
                const offset = Math.floor(Math.random() * maxOffset) + 1;
                const direction = Math.random() > 0.5 ? 1 : -1;
                
                let wrong = correctAnswer + (offset * direction);
                
                // Pastikan wrong dalam rentang answerMin - answerMax
                wrong = Math.max(config.answerMin, Math.min(config.answerMax, wrong));
                
                // Pastikan tidak sama dengan correctAnswer dan unik
                if (wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
                    wrongAnswers.add(wrong);
                }
            }
            
            // Method 2: Jika masih belum cukup, gunakan angka acak dalam rentang
            if (wrongAnswers.size < 3) {
                const availableNumbers = [];
                for (let i = config.answerMin; i <= config.answerMax; i++) {
                    if (i !== correctAnswer && !wrongAnswers.has(i)) {
                        availableNumbers.push(i);
                    }
                }
                
                // Acak array availableNumbers
                for (let i = availableNumbers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
                }
                
                // Tambahkan dari availableNumbers sampai cukup 3
                while (wrongAnswers.size < 3 && availableNumbers.length > 0) {
                    wrongAnswers.add(availableNumbers.pop());
                }
            }
            
            // Method 3: Final fallback - gunakan angka tetap dalam rentang
            if (wrongAnswers.size < 3) {
                const fallbackNumbers = [];
                
                if (levelNumber === 1) fallbackNumbers.push(2, 3, 4);
                else if (levelNumber === 2) fallbackNumbers.push(6, 7, 8, 9);
                else if (levelNumber === 3) fallbackNumbers.push(11, 12, 13, 14);
                else if (levelNumber === 4) fallbackNumbers.push(16, 17, 18, 19);
                else if (levelNumber === 5) fallbackNumbers.push(22, 24, 26, 28);
                
                for (let num of fallbackNumbers) {
                    if (num !== correctAnswer && !wrongAnswers.has(num) && wrongAnswers.size < 3) {
                        wrongAnswers.add(num);
                    }
                }
            }
            
            const result = Array.from(wrongAnswers);
            console.log(`Wrong answers: ${result}`);
            return result;
        },
        
        // Helper untuk estimasi level dari min/max
        estimateLevelNumber: function(level) {
            const avg = Math.round((level.min + level.max) / 2);
            
            if (avg <= 5) return 1;      // 1-5
            if (avg <= 10) return 2;     // 5-10
            if (avg <= 15) return 3;     // 10-15
            if (avg <= 20) return 4;     // 11-20
            return 5;                    // 20-30
        }
    };
    
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[operation.id] = operation;
    console.log(`✅ Loaded operation: ${operation.name} (Dynamic Row System)`);
})();