// File: hitung_benda.js
// Operasi Menghitung Benda
(function() {
    const operation = {
        id: 'hitung_benda',
        name: 'Menghitung Benda',
        icon: '🚗',
        description: 'Latihan berhitung dengan gambar benda sehari-hari',
        
        generateQuestion: function(level) {
            const objects = [
                '🚗', '✈️', '🚂', '🚲', '🛵', '🚌', '🚑', '🚒', '🚚', '🚛',
                '🏠', '🏢', '🏫', '🏥', '🏨', '🏦', '💡', '📱', '💻', '⌚',
                '📺', '📻', '🎮', '🎸', '🎺', '🎻', '🏀', '⚽', '🎾', '🏓',
                '📚', '📖', '✏️', '🖊️', '📎', '✂️', '📌', '📏', '📐', '🧮',
                '🍽️', '🍴', '🥄', '🥣', '🥤', '🍶', '🍼', '🧃', '🍩', '🍪',
                '👕', '👖', '👔', '👗', '👞', '👟', '🧦', '🧤', '🎩', '🧢',
                '🎈', '🎉', '🎁', '🎀', '🎄', '🎃', '🎂', '🍰', '🧁', '🍦',
                '🌳', '🌲', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '💐',
                '⏰', '🔑', '💎', '💍', '👑', '🎭', '🛍️', '🛒', '💰', '💵'
            ];
            
            const object = objects[Math.floor(Math.random() * objects.length)];
            const objectName = this.getObjectName(object);
            
            // Tentukan tipe soal berdasarkan level
            if (level.id <= 3) {
                // Level mudah: hitung sederhana (1-20)
                const count = Math.floor(Math.random() * (Math.min(level.max, 20) - level.min + 1)) + level.min;
                const showCount = Math.min(count, 10);
                
                return {
                    question: `<div class="object-question simple">
                        <div class="object-grid">
                            ${object.repeat(showCount)}
                        </div>
                        ${count > 10 ? `<div class="count-note">dan ${count - 10} lagi...</div>` : ''}
                        <div class="question-text">Ada berapa ${objectName} di atas?</div>
                    </div>`,
                    correctAnswer: count
                };
                
            } else if (level.id <= 6) {
                // Level menengah: dengan pengelompokan (hingga 100)
                const maxForGroup = Math.min(level.max, 100);
                const count = Math.floor(Math.random() * (maxForGroup - level.min + 1)) + level.min;
                
                const groups = Math.floor(Math.random() * 3) + 2; // 2-4 kelompok
                const perGroup = Math.floor(count / groups);
                const remainder = count % groups;
                
                return {
                    question: `<div class="object-question grouped">
                        <div class="group-display">
                            <div class="group">
                                <span class="object-icon">${object}</span>
                                <span class="group-count">×${perGroup}</span>
                            </div>
                            ${remainder > 0 ? `<div class="group remainder">
                                <span class="object-icon">${object}</span>
                                <span class="group-count">×${remainder}</span>
                            </div>` : ''}
                        </div>
                        <div class="question-text">
                            ${groups} kelompok ${objectName}.<br>
                            Setiap kelompok ada ${perGroup} ${objectName}${remainder > 0 ? ` dan ada ${remainder} tambahan` : ''}.<br>
                            Berapa total semua ${objectName}?
                        </div>
                    </div>`,
                    correctAnswer: count
                };
                
            } else {
                // Level sulit: dengan operasi matematika
                const operationTypes = ['penjumlahan', 'pengurangan', 'perkalian'];
                const opType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
                
                let questionHTML, correctAnswer;
                
                switch(opType) {
                    case 'penjumlahan': {
                        // a + b = ?
                        const num1 = Math.floor(Math.random() * (level.max/2 - level.min + 1)) + level.min;
                        const num2 = Math.floor(Math.random() * (level.max/2 - level.min + 1)) + level.min;
                        correctAnswer = num1 + num2;
                        
                        questionHTML = `<div class="object-question advanced">
                            <div class="operation-display">
                                ${object.repeat(Math.min(num1, 5))} 
                                <span style="font-size: 1.5rem; margin: 0 10px;">+</span>
                                ${object.repeat(Math.min(num2, 5))}
                            </div>
                            <div class="operation-text">
                                ${num1} ${objectName} + ${num2} ${objectName}
                            </div>
                            <div class="question-text">
                                Berapa total semua ${objectName}?
                            </div>
                        </div>`;
                        break;
                    }
                    
                    case 'pengurangan': {
                        // a - b = ? (pastikan a > b)
                        const a = Math.floor(Math.random() * (level.max - level.min*2 + 1)) + level.min*2;
                        const b = Math.floor(Math.random() * (a - level.min + 1)) + level.min;
                        correctAnswer = a - b;
                        
                        questionHTML = `<div class="object-question advanced">
                            <div class="operation-display">
                                ${object.repeat(Math.min(a, 8))}
                            </div>
                            <div class="operation-text">
                                Ada ${a} ${objectName}.<br>
                                Jika ${b} ${objectName} diambil,<br>
                                berapa sisa ${objectName}?
                            </div>
                            <div class="question-text">
                                ${a} - ${b} = ?
                            </div>
                        </div>`;
                        break;
                    }
                    
                    case 'perkalian': {
                        // a × b = ?
                        const a = Math.floor(Math.random() * (Math.min(10, level.max/10) - 1 + 1)) + 1;
                        const b = Math.floor(Math.random() * (Math.min(10, level.max/10) - 1 + 1)) + 1;
                        correctAnswer = a * b;
                        
                        questionHTML = `<div class="object-question advanced">
                            <div class="operation-display">
                                ${object.repeat(Math.min(a, 5))}
                            </div>
                            <div class="operation-text">
                                Ada ${a} kotak.<br>
                                Setiap kotak berisi ${b} ${objectName}.<br>
                                Berapa total semua ${objectName}?
                            </div>
                            <div class="question-text">
                                ${a} × ${b} = ?
                            </div>
                        </div>`;
                        break;
                    }
                }
                
                return {
                    question: questionHTML,
                    correctAnswer: correctAnswer
                };
            }
        },
        
        getObjectName: function(emoji) {
            const objectNames = {
                '🚗': 'mobil', '✈️': 'pesawat', '🚂': 'kereta api', '🚲': 'sepeda',
                '🛵': 'motor', '🚌': 'bis', '🚑': 'ambulans', '🚒': 'mobil pemadam',
                '🚚': 'truk', '🚛': 'truk kontainer', '🏠': 'rumah', '🏢': 'gedung',
                '🏫': 'sekolah', '🏥': 'rumah sakit', '🏨': 'hotel', '🏦': 'bank',
                '💡': 'lampu', '📱': 'ponsel', '💻': 'laptop', '⌚': 'jam tangan',
                '📺': 'televisi', '📻': 'radio', '🎮': 'game', '🎸': 'gitar',
                '🎺': 'terompet', '🎻': 'biola', '🏀': 'bola basket', '⚽': 'bola sepak',
                '🎾': 'bola tenis', '🏓': 'pingpong', '📚': 'buku', '📖': 'buku terbuka',
                '✏️': 'pensil', '🖊️': 'pulpen', '📎': 'klip', '✂️': 'gunting',
                '📌': 'pin', '📏': 'penggaris', '📐': 'segitiga', '🧮': 'sempoa',
                '🍽️': 'piring', '🍴': 'sendok garpu', '🥄': 'sendok', '🥣': 'mangkuk',
                '🥤': 'gelas', '🍶': 'botol sake', '🍼': 'botol susu', '🧃': 'kotak jus',
                '🍩': 'donat', '🍪': 'kue kering', '👕': 'kaos', '👖': 'celana jeans',
                '👔': 'dasi', '👗': 'gaun', '👞': 'sepatu kulit', '👟': 'sepatu olahraga',
                '🧦': 'kaos kaki', '🧤': 'sarung tangan', '🎩': 'topi', '🧢': 'topi baseball',
                '🎈': 'balon', '🎉': 'terompet', '🎁': 'kado', '🎀': 'pita',
                '🎄': 'pohon natal', '🎃': 'labu', '🎂': 'kue ulang tahun', '🍰': 'kue',
                '🧁': 'cupcake', '🍦': 'es krim', '🌳': 'pohon', '🌲': 'pohon cemara',
                '🌵': 'kaktus', '🌷': 'tulip', '🌸': 'bunga sakura', '🌹': 'mawar',
                '🌺': 'bunga', '🌻': 'bunga matahari', '🌼': 'bunga kecil', '💐': 'buket',
                '⏰': 'jam weker', '🔑': 'kunci', '💎': 'berlian', '💍': 'cincin',
                '👑': 'mahkota', '🎭': 'topeng', '🛍️': 'tas belanja', '🛒': 'keranjang belanja',
                '💰': 'uang', '💵': 'uang kertas'
            };
            return objectNames[emoji] || 'benda';
        },
        
        generateWrongAnswers: function(correctAnswer, level) {
            const wrongAnswers = new Set();
            const maxWrong = Math.min(level.max * 2, 1000);
            
            // Strategi untuk membuat jawaban salah yang masuk akal
            const strategies = [
                // 1. Kesalahan kecil (±1-3)
                () => correctAnswer + (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1),
                
                // 2. Kesalahan karena kelipatan
                () => {
                    if (correctAnswer > 10 && correctAnswer % 2 === 0) {
                        return correctAnswer / 2;
                    }
                    return null;
                },
                
                // 3. Kesalahan karena penambahan/pengurangan 10%
                () => {
                    const offset = Math.floor(correctAnswer * 0.1);
                    if (offset > 0) {
                        return correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                    }
                    return null;
                },
                
                // 4. Random offset yang lebih besar
                () => {
                    let offset;
                    if (correctAnswer <= 10) {
                        offset = Math.floor(Math.random() * 4) + 1;
                    } else if (correctAnswer <= 50) {
                        offset = Math.floor(Math.random() * 10) + 1;
                    } else {
                        offset = Math.floor(Math.random() * Math.max(5, correctAnswer * 0.15)) + 1;
                    }
                    return correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                }
            ];
            
            while (wrongAnswers.size < 5) {
                const strategy = strategies[Math.floor(Math.random() * strategies.length)];
                let wrong = strategy();
                
                // Validasi jawaban salah
                if (wrong !== null && 
                    wrong !== correctAnswer && 
                    wrong > 0 && 
                    wrong <= maxWrong &&
                    !wrongAnswers.has(wrong)) {
                    wrongAnswers.add(wrong);
                }
                
                // Fallback jika sulit mendapatkan jawaban salah
                if (wrongAnswers.size < 2 && wrongAnswers.size === 0) {
                    let simpleWrong;
                    do {
                        simpleWrong = correctAnswer + (Math.floor(Math.random() * 5) + 1);
                    } while (simpleWrong === correctAnswer || simpleWrong <= 0);
                    wrongAnswers.add(simpleWrong);
                }
            }
            
            return Array.from(wrongAnswers).slice(0, 3);
        }
    };
    
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[operation.id] = operation;
    console.log(`✅ Loaded operation: ${operation.name}`);
})();