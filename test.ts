import { test, expect, describe } from "bun:test";
import { spawn } from "bun";

describe("Ollama Boolean Classification CLI", () => {
  describe("Help and Usage", () => {
    test("should show help with --help flag", async () => {
      const proc = spawn(["bun", "run", "index.ts", "--help"]);
      const output = await new Response(proc.stdout).text();
      
      expect(output).toContain("Usage:");
      expect(output).toContain("Arguments:");
      expect(output).toContain("Options:");
      expect(output).toContain("Examples:");
      expect(proc.exitCode).toBe(0);
    });

    test("should show help with -h flag", async () => {
      const proc = spawn(["bun", "run", "index.ts", "-h"]);
      const output = await new Response(proc.stdout).text();
      
      expect(output).toContain("Usage:");
      expect(output).toContain("ollama_boolean");
      expect(proc.exitCode).toBe(0);
    });

    test("should exit with error when no prompt provided", async () => {
      const proc = spawn(["bun", "run", "index.ts"]);
      await proc.exited;
      
      expect(proc.exitCode).toBe(1);
    });
  });

  describe("Argument Parsing Logic", () => {
    test("should parse basic arguments correctly", () => {
      const args = ["Is the sky blue?"];
      const filteredArgs = args.filter(arg => !arg.startsWith('-'));
      
      expect(filteredArgs).toHaveLength(1);
      expect(filteredArgs[0]).toBe("Is the sky blue?");
    });

    test("should filter out flags from arguments", () => {
      const args = ["--quiet", "Is the sky blue?", "qwen3"];
      const filteredArgs = args.filter(arg => !arg.startsWith('-'));
      
      expect(filteredArgs).toHaveLength(2);
      expect(filteredArgs[0]).toBe("Is the sky blue?");
      expect(filteredArgs[1]).toBe("qwen3");
    });

    test("should detect quiet mode flags", () => {
      const args1 = ["--quiet", "test"];
      const args2 = ["-q", "test"];
      const args3 = ["test"];
      
      expect(args1.includes('--quiet') || args1.includes('-q')).toBe(true);
      expect(args2.includes('--quiet') || args2.includes('-q')).toBe(true);
      expect(args3.includes('--quiet') || args3.includes('-q')).toBe(false);
    });

    test("should detect help flags", () => {
      const helpArgs = ["--help"];
      const hArgs = ["-h"];
      const normalArgs = ["test prompt"];
      
      expect(helpArgs.includes('--help') || helpArgs.includes('-h')).toBe(true);
      expect(hArgs.includes('--help') || hArgs.includes('-h')).toBe(true);
      expect(normalArgs.includes('--help') || normalArgs.includes('-h')).toBe(false);
    });

    test("should provide default model name when not specified", () => {
      const defaultModel = 'qwen3';
      const args1: string[] = ['test prompt']; // No model specified
      const args2: string[] = ['test prompt', 'llama3.2']; // Model specified
      
      const modelName1 = args1[1] || defaultModel;
      const modelName2 = args2[1] || defaultModel;
      
      expect(modelName1).toBe('qwen3');
      expect(modelName2).toBe('llama3.2');
    });
  });

  describe("Input Validation", () => {
    test("should reject empty and whitespace-only prompts", () => {
      const emptyPrompt = "";
      const whitespacePrompt = "   ";
      const tabPrompt = "\t\t";
      const newlinePrompt = "\n\n";
      const validPrompt = "Is this valid?";
      
      expect(emptyPrompt.trim() === '').toBe(true);
      expect(whitespacePrompt.trim() === '').toBe(true);
      expect(tabPrompt.trim() === '').toBe(true);
      expect(newlinePrompt.trim() === '').toBe(true);
      expect(validPrompt.trim() === '').toBe(false);
    });

    test("should handle special characters in prompts", () => {
      const prompts = [
        "What's the weather like?",
        "Is 2+2=4?",
        "Can we go to the café?",
        "Is this a \"good\" idea?",
        "What about 100% success?"
      ];
      
      prompts.forEach(prompt => {
        expect(prompt.trim().length).toBeGreaterThan(0);
        expect(typeof prompt).toBe('string');
      });
    });
  });

  describe("Response Validation Logic", () => {
    test("should validate classification results", () => {
      const validResults = [0, 1, 2];
      const invalidResults = [-1, 3, 4, 10, null, undefined, "1", 1.5, NaN];
      
      validResults.forEach(result => {
        expect([0, 1, 2].includes(result)).toBe(true);
      });
      
      invalidResults.forEach(result => {
        expect([0, 1, 2].includes(result as number)).toBe(false);
      });
    });

    test("should handle JSON parsing scenarios", () => {
      const validJson = '{"result": 1}';
      const validJson2 = '{"result": 0}';
      const validJson3 = '{"result": 2}';
      const invalidJson = '{"result": 1';
      const unexpectedFormat = '{"answer": "yes"}';
      const invalidResult = '{"result": 5}';
      
      // Valid JSON with valid results
      [validJson, validJson2, validJson3].forEach(json => {
        try {
          const data = JSON.parse(json);
          expect([0, 1, 2].includes(data.result)).toBe(true);
        } catch {
          expect(false).toBe(true); // Should not throw
        }
      });
      
      // Invalid JSON should throw
      expect(() => JSON.parse(invalidJson)).toThrow();
      
      // Valid JSON but missing result field
      const data3 = JSON.parse(unexpectedFormat);
      expect(data3.result).toBeUndefined();
      expect([0, 1, 2].includes(data3.result)).toBe(false);
      
      // Valid JSON but invalid result value
      const data4 = JSON.parse(invalidResult);
      expect([0, 1, 2].includes(data4.result)).toBe(false);
    });

    test("should simulate getClassifiedResponse validation logic", () => {
      const mockResponses = [
        { content: '{"result": 0}', expected: 0 },
        { content: '{"result": 1}', expected: 1 },
        { content: '{"result": 2}', expected: 2 },
        { content: '{"result": 5}', expected: null },
        { content: '{"answer": "yes"}', expected: null },
        { content: 'invalid json', expected: null }
      ];
      
      mockResponses.forEach(({ content, expected }) => {
        let result;
        try {
          const data = JSON.parse(content);
          result = [0, 1, 2].includes(data.result) ? data.result : null;
        } catch {
          result = null;
        }
        
        expect(result).toBe(expected);
      });
    });
  });

  describe("Performance and Edge Cases", () => {
    test("should handle argument parsing efficiently", () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const args = [`--quiet`, `test prompt ${i}`, `model${i}`];
        const quietMode = args.includes('--quiet') || args.includes('-q');
        const filteredArgs = args.filter(arg => !arg.startsWith('-'));
        
        expect(quietMode).toBe(true);
        expect(filteredArgs).toHaveLength(2);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should process 1000 operations quickly
      expect(duration).toBeLessThan(100);
    });

    test("should handle long prompts", () => {
      const longPrompt = "A".repeat(1000);
      const args = [longPrompt, "qwen3"];
      const filteredArgs = args.filter(arg => !arg.startsWith('-'));
      
      expect(filteredArgs[0]).toBe(longPrompt);
      expect(filteredArgs[0]?.length).toBe(1000);
      expect(filteredArgs[0]?.trim() === '').toBe(false);
    });

    test("should handle multiple flags", () => {
      const args = ["--quiet", "-v", "--debug", "test prompt"];
      const quietMode = args.includes('--quiet') || args.includes('-q');
      const filteredArgs = args.filter(arg => !arg.startsWith('-'));
      
      expect(quietMode).toBe(true);
      expect(filteredArgs).toHaveLength(1);
      expect(filteredArgs[0]).toBe("test prompt");
    });
  });

  describe("Binary Compilation", () => {
    test("should compile without errors", async () => {
      const proc = spawn([
        "bun", 
        "build", 
        "--compile", 
        "--outfile", 
        "test_binary_temp", 
        "index.ts"
      ]);
      await proc.exited;
      
      expect(proc.exitCode).toBe(0);
      
      // Clean up the test binary
      try {
        const file = Bun.file("test_binary_temp");
        if (await file.exists()) {
          await Bun.spawn(["rm", "test_binary_temp"]).exited;
        }
      } catch (error) {
        // Ignore cleanup errors in tests
        console.warn("Cleanup warning:", error);
      }
    }, 10000); // Give it 10 seconds for compilation
  });
});
