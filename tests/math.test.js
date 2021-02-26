const {
  calculateTip,
  celsiusTofahrenheits,
  fahrenheitsToCelsius,
} = require("../src/math");

test("should calculate total with tip", () => {
  const total = calculateTip(10, 0.3);
  expect(total).toBe(13);
});

test("to convert fzhrenheists to celsius", () => {
  const temp = fahrenheitsToCelsius(32);
  expect(temp).toBe(0);
});
test("to convert  celsius to  fzhrenheists", () => {
  const temp = celsiusTofahrenheits(0);
  expect(temp).toBe(32);
});
