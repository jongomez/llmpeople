import { describe, expect, it } from '@jest/globals';
import { getInfluence } from "../utils";
  
describe("utils tests", () => {
  describe("getInfluence tests", () => {
    it("should be 0 when going from 0 -> 1 and duration is very large", () => {
      const startMilliseconds = Date.now();
      const durationMilliseconds = 999999;
      const influenceFrom = 0;
      const influenceTo = 1;
 
      const influence = getInfluence(startMilliseconds, durationMilliseconds, influenceFrom, influenceTo);

      expect(influence).toBe(0);
    }); 

    it("should be 1 when going from 1 -> 0 and duration is very large", () => {
      const startMilliseconds = Date.now();
      const durationMilliseconds = 999999;
      const influenceFrom = 1;
      const influenceTo = 0;

      const influence = getInfluence(startMilliseconds, durationMilliseconds, influenceFrom, influenceTo);

      expect(influence).toBe(1);
    }); 

    it("should be 0.4 when going from 0.4 -> 1 and duration is very large", () => {
      const startMilliseconds = Date.now();
      const durationMilliseconds = 999999;
      const influenceFrom = 0.4;
      const influenceTo = 1;

      const influence = getInfluence(startMilliseconds, durationMilliseconds, influenceFrom, influenceTo);

      expect(influence).toBe(0.4);
    }); 

    it("should be 0.8 when going from 0.4 -> 0.8 and has gone over duration", async () => {
      const startMilliseconds = Date.now();
      const durationMilliseconds = 1; // 1 millisecond - TINY
      const influenceFrom = 0.4;
      const influenceTo = 0.8;

      await new Promise(resolve => setTimeout(resolve, 500));

      const influence = getInfluence(startMilliseconds, durationMilliseconds, influenceFrom, influenceTo);

      expect(influence).toBe(0.8);
    }); 
  });
});