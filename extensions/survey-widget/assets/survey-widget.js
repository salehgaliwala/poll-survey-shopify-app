(function() {
  const container = document.getElementById('shopify-survey-app');
  if (!container) return;

  const surveyId = container.dataset.surveyId;
  const customerId = container.dataset.customerId;
  const customerEmail = container.dataset.customerEmail;

  if (!surveyId) {
    console.error('Shopify Survey App: Survey ID is missing');
    return;
  }

  async function init() {
    try {
      const response = await fetch(`/apps/surveys/api/survey/${surveyId}`);
      const survey = await response.json();
      renderSurvey(survey);
    } catch (error) {
      console.error('Shopify Survey App: Failed to load survey', error);
    }
  }

  function renderSurvey(survey) {
    container.innerHTML = `
      <div style="background: ${survey.backgroundColor}; color: ${survey.textColor}; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 500px;">
        <h3 style="margin-top: 0;">${survey.title}</h3>
        <p>${survey.description || ''}</p>
        <form id="survey-form">
          ${survey.questions.map((q, i) => `
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">${q.title}${q.required ? ' *' : ''}</label>
              ${renderQuestionInput(q)}
            </div>
          `).join('')}
          <button type="submit" style="background: ${survey.primaryColor}; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;">
            Submit
          </button>
        </form>
      </div>
    `;

    document.getElementById('survey-form').addEventListener('submit', handleSubmit);
  }

  function renderQuestionInput(q) {
    switch (q.type) {
      case 'TEXT_INPUT':
        return `<input type="text" name="q_${q.id}" ${q.required ? 'required' : ''} style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">`;
      case 'MULTIPLE_CHOICE':
        return q.options.map(opt => `
          <div style="margin-bottom: 5px;">
            <label><input type="radio" name="q_${q.id}" value="${opt}" ${q.required ? 'required' : ''}> ${opt}</label>
          </div>
        `).join('');
      case 'STAR_RATING':
        return `<select name="q_${q.id}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>`;
      case 'NPS':
        return `<div style="display: flex; justify-content: space-between;">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `
            <label style="text-align: center;">
              <input type="radio" name="q_${q.id}" value="${n}" ${q.required ? 'required' : ''}><br>${n}
            </label>
          `).join('')}
        </div>`;
      default:
        return '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('q_')) {
        answers.push({
          questionId: key.replace('q_', ''),
          value: value
        });
      }
    }

    try {
      const response = await fetch('/apps/surveys/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          customerId,
          customerEmail,
          answers
        })
      });

      const result = await response.json();
      if (result.success) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3>Thank you for your feedback!</h3>
            ${result.discountCode ? `
              <p>As a thank you, use this code for your next purchase:</p>
              <div style="background: #f4f4f4; padding: 10px; font-size: 1.2em; font-weight: bold; border: 1px dashed #333;">
                ${result.discountCode}
              </div>
            ` : ''}
          </div>
        `;
      }
    } catch (error) {
      console.error('Shopify Survey App: Submission failed', error);
      alert('Something went wrong. Please try again.');
    }
  }

  init();
})();
