document.addEventListener('DOMContentLoaded', () => {
  // Screen and Container Elements
  const selectionScreen = document.getElementById('selection-screen');
  const quizContainer = document.getElementById('quiz-container');
  const quizArea = document.getElementById('quiz-area');

  // Header/Title Elements
  const quizTitleEl = document.getElementById('quiz-title');

  // Button Elements
  const startTestExamenButton = document.getElementById('start-test-examen');
  const nextButton = document.getElementById('next-button');
  const restartButton = document.getElementById('restart-button');
  const backToSelectionButton = document.getElementById('back-to-selection-button');

  // Question and Options Elements
  const questionNumberEl = document.getElementById('question-number');
  const questionTextEl = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');

  // Feedback and Score Elements
  const feedbackArea = document.getElementById('feedback-area');
  const scoreArea = document.getElementById('score-area');
  const currentScoreDisplayEl = document.getElementById('current-score-display'); // The p tag
  const currentScoreEl = document.getElementById('current-score'); // The span inside
  const correctAnswersEl = document.getElementById('correct-answers');
  const totalQuestionsEl = document.getElementById('total-questions'); // For the old message, might remove or repurpose
  const totalQuestionsForMaxScoreEl = document.getElementById('total-questions-for-max-score');

  // Quiz State Variables
  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let shuffledQuestions = [];
  let currentQuizFile = '';
  let currentQuizName = '';

  // --- UI Navigation ---
  function showSelectionScreen() {
    selectionScreen.classList.remove('hidden');
    quizContainer.classList.add('hidden');
  }

  function showQuizContainer(quizName) {
    quizTitleEl.textContent = quizName;
    selectionScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    scoreArea.classList.add('hidden');
    quizArea.style.display = 'block';
    currentScoreDisplayEl.style.display = 'block'; // Show real-time score display
    nextButton.style.display = 'block';
  }

  // --- Core Quiz Logic ---
  async function fetchQuestions(filename, quizName) {
    currentQuizFile = filename;
    currentQuizName = quizName;
    try {
      const response = await fetch(filename);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} while fetching ${filename}`);
      }
      questions = await response.json();
      if (questions.length === 0) {
        displayError(`No se encontraron preguntas en el archivo: ${filename}`);
        return;
      }
      startQuiz(quizName);
    } catch (error) {
      console.error('Error al cargar las preguntas:', error);
      displayError(`Error al cargar ${quizName}. Por favor, revisa el archivo y la consola.`);
      // Optionally, navigate back to selection or show error prominently
      showSelectionScreen();
    }
  }

  function displayError(message) {
    // A more central error display might be good in the future
    // For now, log to console and maybe alter a part of the UI
    console.error('DISPLAY ERROR FUNCTION: ', message);
    alert(message); // Simple alert for now
    // Potentially: quizArea.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function updateCurrentScoreDisplay() {
    if (currentScoreEl) {
      currentScoreEl.textContent = score.toFixed(2);
    }
  }

  function startQuiz(quizNameToDisplay) {
    score = 0;
    currentQuestionIndex = 0;
    updateCurrentScoreDisplay();
    shuffledQuestions = shuffleArray([...questions]);

    showQuizContainer(quizNameToDisplay); // Handles visibility of containers

    feedbackArea.textContent = '';
    feedbackArea.className = 'feedback-area';
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

      const optionKeys = shuffleArray(Object.keys(question.options));

      optionKeys.forEach((key) => {
        if (question.options[key] !== null && question.options[key] !== undefined) {
          const button = document.createElement('button');
          button.textContent = `${key.toUpperCase()}) ${question.options[key]}`;
          button.setAttribute('aria-label', `Opción ${key}: ${question.options[key]}`);
          button.onclick = () => selectAnswer(key, question.correct_answer_key, question.correct_answer_text);
          optionsContainer.appendChild(button);
        }
      });
      nextButton.disabled = true;
      nextButton.textContent = 'Siguiente Pregunta';
    } else {
      showFinalScore();
    }
  }

  function selectAnswer(selectedKey, correctKey, correctAnswerText) {
    const buttons = optionsContainer.getElementsByTagName('button');
    let selectedButton = null; // Initialize to null

    for (let btn of buttons) {
      btn.disabled = true;
      // Ensure btn.textContent is not null and selectedKey is not null before calling startsWith
      if (btn.textContent && selectedKey && btn.textContent.startsWith(selectedKey.toUpperCase())) {
        selectedButton = btn;
      }
    }

    if (correctKey === null) {
      // Handle questions with no single correct answer key (e.g., informational)
      feedbackArea.textContent = `Información Adicional: ${correctAnswerText}`;
      feedbackArea.className = 'feedback-area'; // Neutral feedback style
      // No score change for these questions
    } else if (selectedKey === correctKey) {
      score++;
      if (selectedButton) selectedButton.classList.add('correct');
      feedbackArea.textContent = '¡Correcto!';
      feedbackArea.className = 'feedback-area correct';
    } else {
      score -= 0.25;
      if (selectedButton) selectedButton.classList.add('incorrect');
      feedbackArea.textContent = `Incorrecto. La respuesta correcta era: ${correctKey.toUpperCase()}) ${correctAnswerText}`;
      feedbackArea.className = 'feedback-area incorrect';

      // Highlight the correct answer if a correctKey exists
      for (let btn of buttons) {
        if (btn.textContent && correctKey && btn.textContent.startsWith(correctKey.toUpperCase())) {
          btn.classList.add('correct');
          break;
        }
      }
    }
    updateCurrentScoreDisplay();
    nextButton.disabled = false;
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      nextButton.textContent = 'Ver Resultados';
    }
  }

  function showFinalScore() {
    quizArea.style.display = 'none';
    currentScoreDisplayEl.style.display = 'none'; // Hide real-time score
    scoreArea.classList.remove('hidden');
    correctAnswersEl.textContent = score.toFixed(2);
    if (totalQuestionsForMaxScoreEl) totalQuestionsForMaxScoreEl.textContent = shuffledQuestions.length;
    // totalQuestionsEl might be removed if not used, or set to shuffledQuestions.length
    nextButton.style.display = 'none';
  }

  // --- Event Listeners ---
  if (startTestExamenButton) {
    startTestExamenButton.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
  });

  restartButton.addEventListener('click', () => {
    if (currentQuizFile && currentQuizName) {
      fetchQuestions(currentQuizFile, currentQuizName); // Re-fetch and start the same quiz
    }
  });

  backToSelectionButton.addEventListener('click', () => {
    showSelectionScreen();
  });

  // --- Initial Setup ---
  showSelectionScreen(); // Start by showing the selection screen
});
