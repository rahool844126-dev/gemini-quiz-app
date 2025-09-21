GoogleGenerativeAI
// This is the main function Netlify will run
exports.handler = async function (event, context) {
  try {
    // Get the data the app sent (category, difficulty)
    const { category, difficulty } = JSON.parse(event.body);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate one '${difficulty}' difficulty multiple-choice quiz question about '${category}'. Provide your response as a valid JSON object with these exact keys: "question", "options" (an array of 4 strings), and "correctAnswer" (a string matching one of the options).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace('```json', '').replace('```', '');
    const jsonObj = JSON.parse(text);

    // Send the question back to the app
    return {
      statusCode: 200,
      body: JSON.stringify(jsonObj),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate question." }),
    };
  }
};
