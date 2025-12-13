// File: hitung_hewan.js
// Operasi Menghitung Hewan
(function() {
    const operation = {
        id: 'hitung_hewan',
        name: 'Menghitung Hewan',
        icon: '🐘',
        description: 'Latihan berhitung dengan gambar hewan',
        
        generateQuestion: function(level) {
            const animals = [
                '🐘', '🦒', '🦁', '🐯', '🐼', '🐨', '🐰', '🐻', '🐵', '🦊',
                '🐶', '🐱', '🐭', '🐹', '🐻‍❄️', '🐷', '🐸', '🐔', '🐤', '🦆',
                '🦉', '🦜', '🐦', '🦅', '🐴', '🦓', '🦌', '🐮', '🐑', '🐐',
                '🐪', '🐫', '🦙', '🐘', '🦏', '🦛', '🐋', '🐬', '🐟', '🐠',
                '🐙', '🦑', '🦀', '🦐', '🦞', '🐌', '🦋', '🐞', '🐝', '🦂'
            ];
            
            const count = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
            
            // Pilih hewan acak
            const animal = animals[Math.floor(Math.random() * animals.length)];
            
            // Tentukan apakah akan menampilkan multiple animals atau single dengan multiplier
            let questionHTML;
            
            if (count <= 8) {
                // Untuk jumlah kecil, tampilkan semua emoji
                questionHTML = `<div class="animal-question">
                    <div class="question-image-container">
                        ${animal.repeat(count)}
                    </div>
                    <div class="question-text">Berapa jumlah hewan di atas?</div>
                </div>`;
            } else if (count <= 30) {
                // Untuk jumlah sedang, tampilkan beberapa + angka
                const showCount = Math.min(8, Math.floor(count / 3));
                questionHTML = `<div class="animal-question">
                    <div class="question-image-container">
                        ${animal.repeat(showCount)}
                        <div class="multiplier-indicator">...</div>
                    </div>
                    <div class="count-display">Ada ${count} ekor ${this.getAnimalName(animal)}</div>
                    <div class="question-text">Berapa total jumlah hewan?</div>
                </div>`;
            } else {
                // Untuk jumlah besar, gunakan representasi grid
                questionHTML = `<div class="animal-question">
                    <div class="question-image-container">
                        ${animal.repeat(4)}
                    </div>
                    <div class="grid-indicator">
                        <span class="grid-text">${animal} × ${Math.floor(count/4)} baris</span>
                    </div>
                    <div class="question-text">Jika setiap baris ada ${Math.floor(count/4)} ekor,<br>berapa total semua hewan?</div>
                </div>`;
            }
            
            return {
                question: questionHTML,
                correctAnswer: count
            };
        },
        
        getAnimalName: function(emoji) {
            const animalNames = {
                '🐘': 'gajah', '🦒': 'jerapah', '🦁': 'singa', '🐯': 'harimau',
                '🐼': 'panda', '🐨': 'koala', '🐰': 'kelinci', '🐻': 'beruang',
                '🐵': 'monyet', '🦊': 'rubah', '🐶': 'anjing', '🐱': 'kucing',
                '🐭': 'tikus', '🐹': 'hamster', '🐻‍❄️': 'beruang kutub', '🐷': 'babi',
                '🐸': 'katak', '🐔': 'ayam', '🐤': 'anak ayam', '🦆': 'bebek',
                '🦉': 'burung hantu', '🦜': 'burung nuri', '🐦': 'burung', '🦅': 'elang',
                '🐴': 'kuda', '🦓': 'zebra', '🦌': 'rusa', '🐮': 'sapi',
                '🐑': 'domba', '🐐': 'kambing', '🐪': 'unta', '🐫': 'unta berpunuk dua',
                '🦙': 'llama', '🦏': 'badak', '🦛': 'kuda nil', '🐋': 'paus',
                '🐬': 'lumba-lumba', '🐟': 'ikan', '🐠': 'ikan hias', '🐙': 'gurita',
                '🦑': 'cumi-cumi', '🦀': 'kepiting', '🦐': 'udang', '🦞': 'lobster',
                '🐌': 'siput', '🦋': 'kupu-kupu', '🐞': 'kepik', '🐝': 'lebah',
                '🦂': 'kalajengking'
            };
            return animalNames[emoji] || 'hewan';
        },
        
        generateWrongAnswers: function(correctAnswer, level) {
            const wrongAnswers = new Set();
            const maxWrong = Math.min(level.max * 2, 1000);
            
            // Strategi untuk membuat jawaban salah yang masuk akal
            const strategies = [
                // 1. Kesalahan kecil (±1-3)
                () => correctAnswer + (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1),
                
                // 2. Kesalahan karena kelipatan (misal: lupa mengalikan baris)
                () => {
                    if (correctAnswer > 8 && correctAnswer % 4 === 0) {
                        return correctAnswer / 4; // Hanya menghitung satu baris
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
                
                // 4. Kesalahan karena angka mirip (misal: 15 jadi 51)
                () => {
                    if (correctAnswer >= 10 && correctAnswer <= 99) {
                        const digits = correctAnswer.toString().split('');
                        if (digits[0] !== digits[1]) {
                            return parseInt(digits[1] + digits[0]);
                        }
                    }
                    return null;
                },
                
                // 5. Random offset yang lebih besar untuk angka besar
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