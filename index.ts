// main.js
import { Ollama } from 'ollama';

// Initialize the Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * Gets a classified (1, 0, or 2) response from an Ollama model.
 * @param {string} userPrompt - The question to ask the model.
 * @param {string} [modelName='llama3.2'] - The name of the ollama model to use.
 * @returns {Promise<number|null>} A promise that resolves to 1, 0, 2, or null.
 */
async function getClassifiedResponse(userPrompt, modelName = 'qwen3') {
    const systemPrompt = `
    You are a classification engine. Based on the user's question,
    respond with a single JSON object. Use {"result": 1} for a 'yes' or
    positive answer, {"result": 0} for a 'no' or negative answer, and
    {"result": 2} if the answer is unknown or subjective.
    Do not provide any other text or explanation.
    `;
    try {
        const response = await ollama.chat({
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            format: 'json', // Force JSON output
            options: { temperature: 0 }, // Ensure deterministic output
        });

        // The content is a JSON string, so we parse it
        const data = JSON.parse(response.message.content);
        const result = data.result;

        // Validate and return the result
        return [0, 1, 2].includes(result) ? result : null;
    } catch (error) {
        console.error("An error occurred:", error);
        return null;
    }
}

// --- Console App Logic ---
function printUsage() {
    console.log(`
Usage: ollama_boolean [options] "<user_prompt>" [model_name]

Arguments:
  user_prompt  The question or prompt to classify (required, must be quoted)
  model_name   The Ollama model to use (optional, defaults to 'qwen3')

Options:
  -q, --quiet  Output only the result number (0, 1, or 2)
  -h, --help   Show this help message

Examples:
  ollama_boolean "Is the sky blue?"
  ollama_boolean "Can pigs fly?" llama3.2
  ollama_boolean "Is this painting beautiful?" qwen3
  ollama_boolean --quiet "Is the sky blue?"
  ollama_boolean -q "Can pigs fly?" llama3.2

  # If running with bun:
  bun run index.ts "Is the sky blue?"
  bun run index.ts --quiet "Can pigs fly?"

Returns:
  1 - Yes/Positive answer
  0 - No/Negative answer  
  2 - Unknown/Subjective answer
  null - Error occurred (only in verbose mode)
`);
}

async function main() {
    const args = process.argv.slice(2);
    
    // Check if help is requested
    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }
    
    // Check for quiet mode
    const quietMode = args.includes('--quiet') || args.includes('-q');
    
    // Remove flags from args to get remaining arguments
    const filteredArgs = args.filter(arg => !arg.startsWith('-'));
    
    // Validate arguments
    if (filteredArgs.length === 0) {
        if (!quietMode) {
            console.error('Error: User prompt is required');
            printUsage();
        }
        process.exit(1);
    }
    
    const userPrompt = filteredArgs[0];
    const modelName = filteredArgs[1] || 'qwen3';
    
    if (!userPrompt || userPrompt.trim() === '') {
        if (!quietMode) {
            console.error('Error: User prompt cannot be empty');
        }
        process.exit(1);
    }
    
    if (!quietMode) {
        console.log(`Prompt: "${userPrompt}"`);
        console.log(`Model: ${modelName}`);
        console.log('Classifying...\n');
    }
    
    try {
        const result = await getClassifiedResponse(userPrompt, modelName);
        
        if (result === null) {
            if (!quietMode) {
                console.error('Error: Failed to get classification result');
            }
            process.exit(1);
        }
        
        if (quietMode) {
            // Only output the number
            console.log(result);
        } else {
            // Verbose output
            console.log(`Result: ${result}`);
            
            // Provide human-readable interpretation
            switch (result) {
                case 1:
                    console.log('Interpretation: Yes/Positive');
                    break;
                case 0:
                    console.log('Interpretation: No/Negative');
                    break;
                case 2:
                    console.log('Interpretation: Unknown/Subjective');
                    break;
            }
        }
        
    } catch (error) {
        if (!quietMode) {
            console.error('Error:', error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
    }
}

// Run the console app
main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});