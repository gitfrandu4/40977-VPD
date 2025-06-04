document.addEventListener('DOMContentLoaded', () => {
  // Screen and Container Elements
  const selectionScreen = document.getElementById('selection-screen');
  const quizContainer = document.getElementById('quiz-container');
  const quizArea = document.getElementById('quiz-area');

  // Header/Title Elements
  const quizTitleEl = document.getElementById('quiz-title');

  // Button Elements
  const startTestExamenButton = document.getElementById('start-test-examen');
  const startTestP1Button = document.getElementById('start-test-p1');
  const startTestP2Button = document.getElementById('start-test-p2');
  const startTestP3Button = document.getElementById('start-test-p3');
  const startTestP4Button = document.getElementById('start-test-p4');
  const startTestP5Button = document.getElementById('start-test-p5');
  const startTestP6Button = document.getElementById('start-test-p6');
  const startTestT1Button = document.getElementById('start-test-t1');
  const startTestT2Button = document.getElementById('start-test-t2');
  const startTestT3Button = document.getElementById('start-test-t3');
  const startTestT4Button = document.getElementById('start-test-t4');

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
  let correctAnswers = 0;
  let incorrectAnswers = 0;

  // --- Storage System for Quiz History ---
  function initializeStorage() {
    if (!localStorage.getItem('quizHistory')) {
      localStorage.setItem('quizHistory', JSON.stringify([]));
    }
    updateTestSelectionWithHistory();
    renderHistorySection();
  }

  function saveQuizResult(quizFile, quizName, finalScore, totalQuestions, correct, incorrect) {
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    const timestamp = new Date().toISOString();
    const quizResult = {
      id: Date.now(), // Unique identifier for the entry
      timestamp,
      quizFile,
      quizName,
      finalScore,
      totalQuestions,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    quizHistory.push(quizResult);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    return quizResult;
  }

  function getQuizHistory() {
    return JSON.parse(localStorage.getItem('quizHistory')) || [];
  }

  function getQuizStats(quizFile) {
    const history = getQuizHistory();
    const quizAttempts = history.filter((entry) => entry.quizFile === quizFile);

    if (quizAttempts.length === 0) return null;

    const totalAttempts = quizAttempts.length;
    const bestScore = Math.max(...quizAttempts.map((attempt) => attempt.finalScore));
    const averageScore = quizAttempts.reduce((sum, attempt) => sum + attempt.finalScore, 0) / totalAttempts;
    const lastAttempt = quizAttempts[quizAttempts.length - 1];

    return {
      totalAttempts,
      bestScore,
      averageScore,
      lastAttempt,
    };
  }

  function updateTestSelectionWithHistory() {
    const testCards = document.querySelectorAll('.test-card');
    testCards.forEach((card) => {
      const testFile = card.dataset.testfile;
      const stats = getQuizStats(testFile);

      // Remove any existing stats elements
      const existingStats = card.querySelector('.test-stats');
      if (existingStats) existingStats.remove();

      if (stats) {
        const statsElement = document.createElement('div');
        statsElement.className = 'test-stats';
        statsElement.innerHTML = `
          <p>Intentos: ${stats.totalAttempts}</p>
          <p>Mejor: ${stats.bestScore.toFixed(2)}</p>
          <p>Último: ${stats.lastAttempt.finalScore.toFixed(2)} (${stats.lastAttempt.date})</p>
        `;
        card.appendChild(statsElement);
      }
    });
  }

  function generatePerformanceFeedback(result) {
    const percentageScore = (result.finalScore / result.totalQuestions) * 100;
    const correctPercentage = (result.correctAnswers / result.totalQuestions) * 100;

    let feedbackMessage = '';
    let performanceLevel = '';

    if (percentageScore >= 90) {
      feedbackMessage = '¡Excelente! Dominas este tema completamente.';
      performanceLevel = 'excellent';
    } else if (percentageScore >= 75) {
      feedbackMessage = 'Muy bien. Tienes un buen conocimiento del tema.';
      performanceLevel = 'good';
    } else if (percentageScore >= 60) {
      feedbackMessage = 'Bien. Tienes conocimientos sólidos, pero hay áreas para mejorar.';
      performanceLevel = 'okay';
    } else if (percentageScore >= 40) {
      feedbackMessage = 'Puedes mejorar. Repasa los conceptos clave de este tema.';
      performanceLevel = 'needs-improvement';
    } else {
      feedbackMessage = 'Necesitas estudiar más este tema. No te desanimes, ¡sigue practicando!';
      performanceLevel = 'struggling';
    }

    // Add specific feedback based on incorrect/correct ratio
    if (result.incorrectAnswers > result.correctAnswers) {
      feedbackMessage += ' Presta atención a las explicaciones de los errores para mejorar.';
    }

    // Add comparison to previous attempts if available
    const stats = getQuizStats(result.quizFile);
    if (stats && stats.totalAttempts > 1) {
      if (result.finalScore > stats.averageScore) {
        feedbackMessage += ' Has mejorado respecto a tu promedio anterior.';
      } else if (result.finalScore < stats.averageScore) {
        feedbackMessage += ' Estás por debajo de tu promedio habitual.';
      }

      if (result.finalScore === stats.bestScore && stats.totalAttempts > 1) {
        feedbackMessage += ' ¡Has igualado tu mejor puntuación!';
      } else if (result.finalScore > stats.bestScore) {
        feedbackMessage += ' ¡Nueva mejor puntuación personal!';
      }
    }

    return {
      message: feedbackMessage,
      performanceLevel,
    };
  }

  // --- UI Navigation ---
  function showSelectionScreen() {
    selectionScreen.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    updateTestSelectionWithHistory();
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
    correctAnswers = 0; // Reset correct answers counter
    incorrectAnswers = 0; // Reset incorrect answers counter
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
      correctAnswers++;
      if (selectedButton) selectedButton.classList.add('correct');
      feedbackArea.innerHTML = marked.parse('¡Correcto!');
      feedbackArea.className = 'feedback-correct';
    } else {
      score -= 0.25;
      incorrectAnswers++;
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

    // Save quiz results to localStorage
    const quizResult = saveQuizResult(
      currentQuizFile,
      currentQuizName,
      score,
      shuffledQuestions.length,
      correctAnswers,
      incorrectAnswers,
    );

    // Generate and display performance feedback
    const feedback = generatePerformanceFeedback(quizResult);

    // Check if performance feedback element exists, if not create it
    let feedbackElement = document.getElementById('performance-feedback');
    if (!feedbackElement) {
      feedbackElement = document.createElement('div');
      feedbackElement.id = 'performance-feedback';
      scoreArea.appendChild(feedbackElement);
    }

    // Add performance feedback and styling
    feedbackElement.className = `feedback-${feedback.performanceLevel}`;
    feedbackElement.innerHTML = `<p>${feedback.message}</p>`;

    // Display a simple chart or statistics about performance
    let statsElement = document.getElementById('performance-stats');
    if (!statsElement) {
      statsElement = document.createElement('div');
      statsElement.id = 'performance-stats';
      scoreArea.appendChild(statsElement);
    }

    const quizStats = getQuizStats(currentQuizFile);
    statsElement.innerHTML = `
      <h3>Estadísticas</h3>
      <p>Respuestas correctas: ${correctAnswers} de ${shuffledQuestions.length} (${(
      (correctAnswers / shuffledQuestions.length) *
      100
    ).toFixed(0)}%)</p>
      <p>Respuestas incorrectas: ${incorrectAnswers}</p>
      <p>Total intentos: ${quizStats.totalAttempts}</p>
      <p>Mejor puntuación: ${quizStats.bestScore.toFixed(2)}</p>
      <p>Puntuación media: ${quizStats.averageScore.toFixed(2)}</p>
    `;

    // Render performance chart
    const performanceChartCanvas = document.getElementById('performance-chart');
    if (performanceChartCanvas) {
      // Check if chart instance exists and destroy it
      if (window.performanceChartInstance) {
        window.performanceChartInstance.destroy();
      }

      window.performanceChartInstance = new Chart(performanceChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Correctas', 'Incorrectas', 'Sin responder'],
          datasets: [
            {
              label: 'Resultados',
              data: [correctAnswers, incorrectAnswers, shuffledQuestions.length - questionsAnswered],
              backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(201, 203, 207, 0.7)'],
              borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(201, 203, 207, 1)'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }

    nextButton.style.display = 'none';
  }

  function renderHistorySection() {
    const historySection = document.getElementById('history-section');
    const historyChart = document.getElementById('history-chart');
    const historyDetails = document.getElementById('history-details');
    const toggleHistoryButton = document.getElementById('toggle-history-button');

    const quizHistory = getQuizHistory();

    if (quizHistory.length === 0) {
      historySection.classList.add('hidden');
      return;
    }

    // Show history section
    historySection.classList.remove('hidden');

    // Group quiz attempts by type
    const quizTypes = {};
    quizHistory.forEach((entry) => {
      if (!quizTypes[entry.quizFile]) {
        quizTypes[entry.quizFile] = {
          name: entry.quizName,
          attempts: [],
          color: getRandomColor(),
        };
      }
      quizTypes[entry.quizFile].attempts.push(entry);
    });

    // Render chart with last 10 attempts overall
    const recentAttempts = quizHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .reverse();

    // Prepare data for chart
    const labels = recentAttempts.map((_, index) => `Intento ${index + 1}`);
    const datasets = [];

    // Group data by quiz type
    const dataByQuiz = {};

    recentAttempts.forEach((attempt, index) => {
      if (!dataByQuiz[attempt.quizFile]) {
        dataByQuiz[attempt.quizFile] = {
          label: attempt.quizName,
          data: Array(recentAttempts.length).fill(null),
          borderColor: quizTypes[attempt.quizFile].color,
          backgroundColor: quizTypes[attempt.quizFile].color + '33', // Add transparency
          tension: 0.3,
        };
      }
      dataByQuiz[attempt.quizFile].data[index] = attempt.finalScore;
    });

    // Convert to array for Chart.js
    datasets.push(...Object.values(dataByQuiz));

    // Render chart if we have data
    if (historyChart) {
      // Check if chart instance already exists and destroy it
      if (window.historyChartInstance) {
        window.historyChartInstance.destroy();
      }

      window.historyChartInstance = new Chart(historyChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Puntuación',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Intentos Recientes',
              },
            },
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
        },
      });
    }

    // Prepare detailed history
    let detailsHTML = '';
    const quizTypeKeys = Object.keys(quizTypes);

    // By default, show collapsed history
    detailsHTML = '<div class="history-summary">';
    quizTypeKeys.forEach((quizType) => {
      const quizData = quizTypes[quizType];
      const attempts = quizData.attempts.length;
      const bestScore = Math.max(...quizData.attempts.map((a) => a.finalScore));
      const avgScore = quizData.attempts.reduce((sum, a) => sum + a.finalScore, 0) / attempts;

      detailsHTML += `
        <div class="quiz-history-item">
          <h4>${quizData.name}</h4>
          <p>Total intentos: ${attempts}</p>
          <p>Mejor puntuación: ${bestScore.toFixed(2)}</p>
          <p>Puntuación media: ${avgScore.toFixed(2)}</p>
        </div>
      `;
    });
    detailsHTML += '</div>';

    // Add detailed history (initially hidden)
    detailsHTML += '<div class="history-details hidden">';
    quizHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach((entry) => {
        detailsHTML += `
        <div class="history-entry">
          <h4>${entry.quizName}</h4>
          <p>Fecha: ${entry.date} ${entry.time}</p>
          <p>Puntuación: ${entry.finalScore.toFixed(2)} / ${entry.totalQuestions}</p>
          <p>Correctas: ${entry.correctAnswers}, Incorrectas: ${entry.incorrectAnswers}</p>
        </div>
      `;
      });
    detailsHTML += '</div>';

    historyDetails.innerHTML = detailsHTML;

    // Toggle detailed history visibility
    toggleHistoryButton.addEventListener('click', () => {
      const historyDetailsElement = document.querySelector('.history-details');
      const isSummaryVisible = !historyDetailsElement.classList.contains('hidden');

      if (isSummaryVisible) {
        historyDetailsElement.classList.remove('hidden');
        document.querySelector('.history-summary').classList.add('hidden');
        toggleHistoryButton.textContent = 'Ver Resumen';
      } else {
        historyDetailsElement.classList.add('hidden');
        document.querySelector('.history-summary').classList.remove('hidden');
        toggleHistoryButton.textContent = 'Ver Historial Completo';
      }
    });
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // --- Event Listeners ---
  if (startTestExamenButton) {
    startTestExamenButton.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestP1Button) {
    startTestP1Button.addEventListener('click', function () {
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

  if (startTestP4Button) {
    startTestP4Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestP5Button) {
    startTestP5Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestP6Button) {
    startTestP6Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestT1Button) {
    startTestT1Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestT2Button) {
    startTestT2Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestT3Button) {
    startTestT3Button.addEventListener('click', function () {
      const testFile = this.dataset.testfile;
      const testName = this.querySelector('h3').textContent;
      fetchQuestions(testFile, testName);
    });
  }

  if (startTestT4Button) {
    startTestT4Button.addEventListener('click', function () {
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
    renderHistorySection(); // Update history when returning to selection screen
  });

  // Initialize history visibility toggle
  const toggleHistoryButton = document.getElementById('toggle-history-button');
  if (toggleHistoryButton) {
    toggleHistoryButton.addEventListener('click', function () {
      const historyDetails = document.querySelector('.history-details');
      const historySummary = document.querySelector('.history-summary');

      if (historyDetails.classList.contains('hidden')) {
        historyDetails.classList.remove('hidden');
        historySummary.classList.add('hidden');
        this.textContent = 'Ver Resumen';
      } else {
        historyDetails.classList.add('hidden');
        historySummary.classList.remove('hidden');
        this.textContent = 'Ver Historial Completo';
      }
    });
  }

  // History Management
  const clearHistoryButton = document.createElement('button');
  clearHistoryButton.id = 'clear-history-button';
  clearHistoryButton.className = 'button';
  clearHistoryButton.textContent = 'Borrar Historial';
  clearHistoryButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial de tests?')) {
      localStorage.removeItem('quizHistory');
      initializeStorage();
      alert('Historial borrado con éxito');
    }
  });
  selectionScreen.appendChild(clearHistoryButton);

  // --- Initial Setup ---
  initializeStorage(); // Initialize localStorage
  showSelectionScreen(); // Start by showing the selection screen
});
