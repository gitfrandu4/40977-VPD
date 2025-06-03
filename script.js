document.addEventListener('DOMContentLoaded', () => {
  // Screen and Container Elements
  const selectionScreen = document.getElementById('selection-screen');
  const quizContainer = document.getElementById('quiz-container');
  const quizArea = document.getElementById('quiz-area');

  // Header/Title Elements
  const quizTitleEl = document.getElementById('quiz-title');

  // Button Elements
  const startTestExamenButton = document.getElementById('start-test-examen');
  const startTestP2Button = document.getElementById('start-test-p2');
  const startTestP3Button = document.getElementById('start-test-p3');
  const nextButton = document.getElementById('next-button');
  const restartButton = document.getElementById('restart-button');
  const backToSelectionButton = document.getElementById('back-to-selection-button');

  // Question and Options Elements
  const questionNumberEl = document.getElementById('question-number');
  const questionTextEl = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');

  // Feedback, Explanation and Score Elements
  const feedbackArea = document.getElementById('feedback-area');
  const explanationArea = document.getElementById('explanation-area');
  const explanationTextEl = document.getElementById('explanation-text');
  const scoreArea = document.getElementById('score-area');
  const currentScoreDisplayContainerEl = document.getElementById('current-score-display'); // The <p> tag for styling
  const currentScoreTextEl = document.getElementById('current-score'); // The <span> for the score text
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
  let questionsAnswered = 0;

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
    if (currentScoreDisplayContainerEl) currentScoreDisplayContainerEl.style.display = 'block';
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
    if (currentScoreTextEl) {
      currentScoreTextEl.textContent = score.toFixed(2);
    }

    if (currentScoreDisplayContainerEl) {
      // Remove all existing score performance classes
      currentScoreDisplayContainerEl.classList.remove(
        'score-excellent',
        'score-good',
        'score-okay',
        'score-needs-improvement',
        'score-struggling',
      );

      if (questionsAnswered > 0) {
        const performanceRatio = score / questionsAnswered; // Max score for N answered questions is N*1 = N

        if (performanceRatio >= 0.75) {
          currentScoreDisplayContainerEl.classList.add('score-excellent');
        } else if (performanceRatio >= 0.5) {
          currentScoreDisplayContainerEl.classList.add('score-good');
        } else if (performanceRatio >= 0.25) {
          currentScoreDisplayContainerEl.classList.add('score-okay');
        } else if (performanceRatio >= 0) {
          // Includes zero, which can happen with a mix of correct/incorrect
          currentScoreDisplayContainerEl.classList.add('score-needs-improvement');
        } else {
          // performanceRatio < 0
          currentScoreDisplayContainerEl.classList.add('score-struggling');
        }
      }
      // If questionsAnswered is 0, no class is added, so it uses default styles defined in CSS.
    }
  }

  function startQuiz(quizNameToDisplay) {
    score = 0;
    currentQuestionIndex = 0;
    questionsAnswered = 0; // Reset for a new quiz session
    updateCurrentScoreDisplay(); // Initialize score display (will remove color classes due to questionsAnswered = 0)
    shuffledQuestions = shuffleArray([...questions]);

    showQuizContainer(quizNameToDisplay); // Handles visibility of containers

    feedbackArea.textContent = '';
    feedbackArea.className = 'feedback-area';
    explanationArea.classList.add('hidden'); // Hide explanation at start of quiz
    explanationTextEl.innerHTML = ''; // Clear previous explanation
    displayQuestion();
  }

  function displayQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length) {
      const question = shuffledQuestions[currentQuestionIndex];
      questionNumberEl.textContent = `Pregunta ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
      questionTextEl.innerHTML = marked.parse(question.question_text);
      optionsContainer.innerHTML = '';
      feedbackArea.textContent = '';
      feedbackArea.className = 'feedback-area';
      explanationArea.classList.add('hidden'); // Hide explanation for new question
      explanationTextEl.innerHTML = ''; // Clear previous explanation

      const optionKeys = shuffleArray(Object.keys(question.options));

      optionKeys.forEach((key) => {
        if (question.options[key] !== null && question.options[key] !== undefined) {
          const button = document.createElement('button');
          button.innerHTML = marked.parse(`${key.toUpperCase()}) ${question.options[key]}`);
          button.setAttribute('aria-label', `Opción ${key}: ${question.options[key]}`);
          button.onclick = () =>
            selectAnswer(key, question.correct_answer_key, question.correct_answer_text, question.question_explanation);
          optionsContainer.appendChild(button);
        }
      });
      nextButton.disabled = true;
      nextButton.textContent = 'Siguiente Pregunta';
    } else {
      showFinalScore();
    }
  }

  function selectAnswer(selectedKey, correctKey, correctAnswerText, questionExplanation) {
    const buttons = optionsContainer.getElementsByTagName('button');
    let selectedButton = null; // Initialize to null

    questionsAnswered++; // Increment here as an answer is being processed

    for (let btn of buttons) {
      btn.disabled = true;
      // Ensure btn.textContent is not null and selectedKey is not null before calling startsWith
      if (btn.textContent && selectedKey && btn.textContent.startsWith(selectedKey.toUpperCase())) {
        selectedButton = btn;
      }
    }

    if (correctKey === null) {
      // Handle questions with no single correct answer key (e.g., informational)
      feedbackArea.innerHTML = marked.parse(
        `**Información Adicional:** ${correctAnswerText || 'No hay una única respuesta correcta para esta pregunta.'}`,
      );
      feedbackArea.className = 'feedback-info'; // Special class for info
      // No score change for these questions
    } else if (selectedKey === correctKey) {
      score++;
      if (selectedButton) selectedButton.classList.add('correct');
      feedbackArea.innerHTML = marked.parse('¡Correcto!');
      feedbackArea.className = 'feedback-correct';
    } else {
      score -= 0.25;
      if (selectedButton) selectedButton.classList.add('incorrect');
      feedbackArea.innerHTML = marked.parse(
        `Incorrecto. La respuesta correcta era: **${correctKey.toUpperCase()})** ${correctAnswerText}`,
      );
      feedbackArea.className = 'feedback-incorrect';

      // Highlight the correct answer if a correctKey exists
      for (let btn of buttons) {
        if (btn.textContent && correctKey && btn.textContent.startsWith(correctKey.toUpperCase())) {
          btn.classList.add('correct');
          break;
        }
      }
    }
    updateCurrentScoreDisplay(); // Update score text and color based on performance

    // Display explanation if available
    if (questionExplanation && questionExplanation.trim() !== '') {
      explanationTextEl.innerHTML = marked.parse(questionExplanation);
      explanationArea.classList.remove('hidden');
    } else {
      explanationArea.classList.add('hidden');
      explanationTextEl.innerHTML = '';
    }

    nextButton.disabled = false;
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      nextButton.textContent = 'Ver Resultados';
    }
  }

  function showFinalScore() {
    quizArea.style.display = 'none';
    if (currentScoreDisplayContainerEl) currentScoreDisplayContainerEl.style.display = 'none';
    explanationArea.classList.add('hidden'); // Hide explanation on score screen
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

  if (startTestP2Button) {
    startTestP2Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestP3Button) {
    startTestP3Button.addEventListener('click', function () {
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
