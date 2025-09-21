document.addEventListener('DOMContentLoaded', () => {
    // --- Get all HTML elements ---
    const screens = document.querySelectorAll('.screen');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const scoreText = document.getElementById('score-text');
    
    // --- Buttons ---
    const categoryButtons = document.querySelectorAll('.category-list .glass-button');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const stopQuizBtn = document.getElementById('stop-quiz-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const customTopicInput = document.getElementById('custom-topic-input');

    // --- Game State Variables ---
    let score = 0, questionsAnswered = 0, difficulty = 'easy', correctStreak = 0;
    let currentCategory = '', currentQuestion = null, nextQuestion = null, isAnswered = false;

    // --- Functions ---
    const showScreen = (screenId) => {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    };

    const fetchQuestion = async (category, diff) => {
        questionText.textContent = 'Generating next question...';
        try {
            const response = await fetch('/.netlify/functions/generate-question', {
                method: 'POST',
                body: JSON.stringify({ category, difficulty: diff })
            });
            if (!response.ok) throw new Error('Network response not OK');
            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            questionText.textContent = "Oops! Couldn't get a question.";
            return null;
        }
    };
    
    const displayQuestion = (q) => {
        if (!q) { stopQuiz(); return; }
        currentQuestion = q;
        questionText.textContent = q.question;
        optionsContainer.innerHTML = '';
        q.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'glass-button';
            button.textContent = option;
            button.onclick = () => handleAnswer(option, button);
            optionsContainer.appendChild(button);
        });
        isAnswered = false;
    };

    const handleAnswer = async (selectedOption, selectedButton) => {
        if (isAnswered) return;
        isAnswered = true;
        const isCorrect = selectedOption === currentQuestion.correctAnswer;

        if (isCorrect) { score++; correctStreak++; selectedButton.classList.add('correct'); } 
        else { correctStreak = 0; selectedButton.classList.add('wrong'); }
        questionsAnswered++;

        if (correctStreak >= 2 && difficulty === 'easy') { difficulty = 'medium'; } 
        else if (correctStreak >= 2 && difficulty === 'medium') { difficulty = 'hard'; } 
        else if (!isCorrect && difficulty === 'hard') { difficulty = 'medium'; } 
        else if (!isCorrect && difficulty === 'medium') { difficulty = 'easy'; }
        
        if (!isCorrect) {
            Array.from(optionsContainer.children).forEach(btn => {
                if (btn.textContent === currentQuestion.correctAnswer) btn.classList.add('correct');
            });
        }

        setTimeout(async () => {
            displayQuestion(nextQuestion);
            nextQuestion = await fetchQuestion(currentCategory, difficulty);
        }, 1200);
    };

    const startQuiz = async (category) => {
        score = 0; questionsAnswered = 0; difficulty = 'easy'; correctStreak = 0;
        currentCategory = category;
        showScreen('quiz-screen');
        questionText.textContent = 'Getting your first question...';
        optionsContainer.innerHTML = '';
        
        currentQuestion = await fetchQuestion(currentCategory, difficulty);
        nextQuestion = await fetchQuestion(currentCategory, difficulty);
        displayQuestion(currentQuestion);
    };

    const stopQuiz = () => {
        scoreText.textContent = `Your final score is: ${score} / ${questionsAnswered}`;
        showScreen('score-screen');
    };

    // --- Event Listeners ---
    categoryButtons.forEach(button => button.addEventListener('click', () => startQuiz(button.dataset.category)));
    createQuizBtn.addEventListener('click', () => showScreen('create-screen'));
    backToMenuBtn.addEventListener('click', () => showScreen('menu-screen'));
    generateCustomBtn.addEventListener('click', () => {
        const topic = customTopicInput.value.trim();
        if (topic) startQuiz(topic);
    });
    stopQuizBtn.addEventListener('click', stopQuiz);
    playAgainBtn.addEventListener('click', () => showScreen('menu-screen'));
    
    showScreen('menu-screen'); // Start on the menu screen
});