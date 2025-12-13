// File: hitung_buah.js
(function() {
    const operation = {
        id: 'hitung_buah',
        name: 'Menghitung Buah',
        icon: '🍎',
        description: 'Latihan berhitung dengan gambar buah-buahan',
        
        generateQuestion: function(level) {
            const fruits = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🥭', '🍑', '🍒'];
            const count = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
            const fruit = fruits[Math.floor(Math.random() * fruits.length)];
            
            return {
                question: `<div class="fruit-question">
                    <span class="fruit-icon">${fruit.repeat(Math.min(count, 10))}</span>
                    ${count > 10 ? `<span class="fruit-count">×${count}</span>` : ''}
                    <div class="question-text">Berapa jumlah buah di atas?</div>
                </div>`,
                correctAnswer: count
            };
        },
        
        generateWrongAnswers: function(correctAnswer, level) {
            const wrongAnswers = [];
            const maxWrong = Math.min(level.max * 2, 1000);
            
            while (wrongAnswers.length < 5) {
                let offset;
                if (correctAnswer <= 5) {
                    offset = Math.floor(Math.random() * 3) + 1;
                } else if (correctAnswer <= 20) {
                    offset = Math.floor(Math.random() * 5) + 1;
                } else {
                    offset = Math.floor(Math.random() * Math.max(5, correctAnswer * 0.1)) + 1;
                }
                
                let wrong = Math.random() > 0.5 ? 
                    correctAnswer + offset : 
                    Math.max(1, correctAnswer - offset);
                
                if (wrong !== correctAnswer && 
                    !wrongAnswers.includes(wrong) && 
                    wrong > 0 && 
                    wrong <= maxWrong) {
                    wrongAnswers.push(wrong);
                }
            }
            
            return wrongAnswers.slice(0, 3);
        }
    };
    
    window.gameOperations = window.gameOperations || {};
    window.gameOperations[operation.id] = operation;
    console.log(`✅ Loaded operation: ${operation.name}`);
})();