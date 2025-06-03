document.addEventListener('DOMContentLoaded', () => {
  const quizArea = document.getElementById('quiz-area');
  const questionNumberEl = document.getElementById('question-number');
  const questionTextEl = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const nextButton = document.getElementById('next-button');
  const feedbackArea = document.getElementById('feedback-area');
  const scoreArea = document.getElementById('score-area');
  const correctAnswersEl = document.getElementById('correct-answers');
  const totalQuestionsEl = document.getElementById('total-questions');
  const restartButton = document.getElementById('restart-button');

  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let shuffledQuestions = [];

  async function fetchQuestions() {
    try {
      const response = await fetch('test.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      questions = await response.json();
      if (questions.length === 0) {
        displayError('No se encontraron preguntas en el archivo.');
        return;
      }
      startQuiz();
    } catch (error) {
      console.error('Error al cargar las preguntas:', error);
      displayError(
        "Error al cargar las preguntas. Por favor, asegúrate de que el archivo 'test.json' existe y es accesible.",
      );
    }
  }

  function displayError(message) {
    quizArea.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    shuffledQuestions = shuffleArray([...questions]);
    scoreArea.style.display = 'none';
    quizArea.style.display = 'block'; // Make sure quiz area is visible
    feedbackArea.textContent = '';
    feedbackArea.className = 'feedback-area'; // Reset feedback class
    nextButton.style.display = 'block';
    displayQuestion();
  }

  function displayQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length) {
      const question = shuffledQuestions[currentQuestionIndex];
      questionNumberEl.textContent = `Pregunta ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
      questionTextEl.textContent = question.question_text;
      optionsContainer.innerHTML = '';
      feedbackArea.textContent = '';
      feedbackArea.className = 'feedback-area';

      // Shuffle options for each question
      const optionKeys = shuffleArray(Object.keys(question.options));

      optionKeys.forEach((key) => {
        if (question.options[key]) {
          // Ensure option exists
          const button = document.createElement('button');
          button.textContent = `${key.toUpperCase()}) ${question.options[key]}`;
          button.setAttribute('aria-label', `Opción ${key}: ${question.options[key]}`);
          button.onclick = () => selectAnswer(key, question.correct_answer_key, question.correct_answer_text);
          optionsContainer.appendChild(button);
        }
      });
      nextButton.disabled = true; // Disable next button until an answer is selected
      nextButton.textContent = 'Siguiente Pregunta';
    } else {
      showScore();
    }
  }

  function selectAnswer(selectedKey, correctKey, correctAnswerText) {
    const buttons = optionsContainer.getElementsByTagName('button');
    let selectedButton;

    for (let btn of buttons) {
      btn.disabled = true; // Disable all option buttons
      if (btn.textContent.startsWith(selectedKey.toUpperCase())) {
        selectedButton = btn;
      }
    }

    if (selectedKey === correctKey) {
      score++;
      selectedButton.classList.add('correct');
      feedbackArea.textContent = '¡Correcto!';
      feedbackArea.className = 'feedback-area correct';
    } else {
      selectedButton.classList.add('incorrect');
      feedbackArea.textContent = `Incorrecto. La respuesta correcta era: ${correctKey.toUpperCase()}) ${correctAnswerText}`;
      feedbackArea.className = 'feedback-area incorrect';
      // Highlight the correct answer
      for (let btn of buttons) {
        if (btn.textContent.startsWith(correctKey.toUpperCase())) {
          btn.classList.add('correct');
          break;
        }
      }
    }
    nextButton.disabled = false;
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      nextButton.textContent = 'Ver Resultados';
    }
  }

  function showScore() {
    quizArea.style.display = 'none';
    scoreArea.style.display = 'block';
    correctAnswersEl.textContent = score;
    totalQuestionsEl.textContent = shuffledQuestions.length;
    nextButton.style.display = 'none';
  }

  nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
  });

  restartButton.addEventListener('click', startQuiz);

  // Iniciar el quiz al cargar la página
  fetchQuestions();
});
