// Component under test
import { monthsBetween, yyyymmdd } from "./dateUtils";

describe("dateUtils", () => {
  it("monthsBetween should return an array of months between 2 dates", () => {
    let monthsBetweenTest = monthsBetween(new Date("11/01/2016"), new Date("03/01/2017"));

    let monthsBetweenCorrect = [
      new Date("11/01/2016"),
      new Date("12/01/2016"),
      new Date("01/01/2017"),
      new Date("02/01/2017"),
      new Date("03/01/2017")
    ];

    expect(monthsBetweenTest).toEqual(monthsBetweenCorrect);
  });
});

describe("yyyymmdd", () => {
  test("yyyymmdd should return a 'YYYY/MM/DD' formatted string", () => {
    const expected = "1995/12/17";
    const result = yyyymmdd(new Date("December 17, 1995"));

    expect(expected).toEqual(result);
  });
});
