const { createCanvas } = require('canvas');
const fs = require('fs');


function randomCaptcha(math_obj, outputPath, options = {}) {
    text = math_obj.math_str;
    answer = math_obj.answer;
    try {
        if (typeof text !== 'string' || !text.trim()) {
            throw new Error('Invalid input: text must be a non-empty string.');
        }

        // Default options
        const {
            width = 400,
            height = 200,
            font = '30px Arial',
            textColor = '#000000',
            backgroundColor = '#FFFFFF'
        } = options;

        // Create a canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw text
        ctx.font = font;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        // Save to file
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);



        console.log(`Image saved to ${outputPath}`);
        return {outputPath , answer}
    } catch (err) {
        console.error('Error creating image:', err.message);
    }

}


function randomMathString(){
    const number1 = Math.floor(Math.random() * 10) + 1 
    const number2 = Math.floor(Math.random() * 10) + 1 

    const math_str = number1.toString() + '+' + number2.toString();
    const answer = number1 + number2

    return {math_str , answer}
}

const captcha1 = randomCaptcha(randomMathString(), 'output.png');

console.log(captcha1);

// console.log(randomMathString());