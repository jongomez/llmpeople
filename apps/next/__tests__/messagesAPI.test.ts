import { describe, expect, it } from "@jest/globals";
import { cleanOpenAIMessage } from "../pages/api/chat";
// TODO: Fix the above import.

const crazyOpenAIResponse1 =
  "!\n" +
  "\n" +
  `As an AI language model, I don't have a physical form to say "hello" to the world. But through digital communication, I can greet you and assist you with any information or tasks you need. How may I help you today?`;

/*
const crazyOpenAIResponse2 =
  "!\n" +
  "\n!" +
  `As an AI language model, I don't have a physical form to say "hello" to the world. But through digital communication, I can greet you and assist you with any information or tasks you need. How may I help you today?`;
const crazyOpenAIResponse3 =
  "!\n" +
  "\n!%!!!#\n\n\n" +
  `As an AI language model, I don't have a physical form to say "hello" to the world. But through digital communication, I can greet you and assist you with any information or tasks you need. How may I help you today?`;
*/

describe("message API test", () => {
  it("should handle \n and ! at the start - case 1", () => {
    expect(cleanOpenAIMessage(crazyOpenAIResponse1)).toBe(
      'As an AI language model, I don\'t have a physical form to say "hello" to the world. But through digital communication, I can greet you and assist you with any information or tasks you need. How may I help you today?'
    );
  });
});
