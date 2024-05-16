import { describe, test, expect } from "vitest";
import { calculateDistance } from "../utils"

describe("Distance calculator", () => {
    test.each([
        [0, 0, 0, 1, 1],
        [3, 4, 0, 0, 5],
        [1, 1, 4, 5, 5],
    ])("Positive integers", (x1, y1, x2, y2, expected) => {
        expect(calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 })).equal(expected)
    });

    test.each([
        [0, 0, 0, -1, 1],
        [-3, -4, 0, 0, 5],
        [-1, -1, -4, -5, 5],
    ])("Negative integers", (x1, y1, x2, y2, expected) => {
        expect(calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 })).equal(expected)
    });

    test.each([
        [1.234, 2.345, 3.456, 4.567, 3.14238],
        [1.234, 2.345, 0, 0, 2.6499],
        [1, 2, 3, 4, 2.83],
    ])("Positive floats", (x1, y1, x2, y2, expected) => {
        expect(calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 })).toBeCloseTo(expected)
    });

    test.each([
        [-1.234, -2.345, -3.456, -4.567, 3.14238],
        [-1.234, -2.345, 0, 0, 2.6499],
        [-1, 2, -3, 4, 2.83]
    ])("Negative floats", (x1, y1, x2, y2, expected) => {
        expect(calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 })).toBeCloseTo(expected)
    });
});
