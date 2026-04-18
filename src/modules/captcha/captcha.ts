// const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// Default captcha directory
const captchaDir = path.join(__dirname, "../../..", "src", "media", "captcha");

// function generateCaptcha() {
//   try {
//     // Generate random math problem
//     const number1 = Math.floor(Math.random() * 10) + 1;
//     const number2 = Math.floor(Math.random() * 10) + 1;
//     const text = number1.toString() + "+" + number2.toString();
//     const answer = number1 + number2;

//     // Create directory if it doesn't exist
//     if (!fs.existsSync(captchaDir)) {
//       fs.mkdirSync(captchaDir, { recursive: true });
//     }

//     // Default options
//     const width = 400;
//     const height = 200;
//     const font = "30px Arial";
//     const textColor = "#000000";
//     const backgroundColor = "#FFFFFF";

//     // Create a canvas
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext("2d");

//     // Fill background
//     ctx.fillStyle = backgroundColor;
//     ctx.fillRect(0, 0, width, height);

//     // Draw text
//     ctx.font = font;
//     ctx.fillStyle = textColor;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText(text, width / 2, height / 2);

//     // Generate unique filename with timestamp
//     const filename = `captcha_${Date.now()}.png`;
//     const outputPath = path.join(captchaDir, filename);

//     // Save to file
//     const buffer = canvas.toBuffer("image/png");
//     fs.writeFileSync(outputPath, buffer);

//     console.log(`Image saved to ${outputPath}`);
//     return { filename, answer };
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       console.error("Error creating image:", err.message);
//     } else {
//       console.error("Error creating image:", err);
//     }
//   }
// }

var svgCaptcha = require("svg-captcha");

const captcha = () => {
  return svgCaptcha.createMathExpr({
    mathMin: 2,
    mathMax: 7,
    mathOperator: "+",
  });
};
// Export the function for use anywhere in the app
export default captcha;
