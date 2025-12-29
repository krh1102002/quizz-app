import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subtopic from './models/Subtopic.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config(); // defaults to .env in current dir

const seedFormulas = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Area Formulas
    const areaFormulas = [
      {
        title: "Square",
        content: "Area = Side²\nPerimeter = 4 × Side\nDiagonal = Side × √2",
        example: "If side = 5cm, Area = 25cm²"
      },
      {
        title: "Rectangle",
        content: "Area = Length × Breadth\nPerimeter = 2(Length + Breadth)\nDiagonal = √(Length² + Breadth²)",
        example: "If L=10, B=8, Area = 80"
      },
      {
        title: "Triangle",
        content: "Area = ½ × Base × Height\nArea = √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2",
        example: "Base=12, Height=9, Area = 54"
      },
      {
        title: "Circle",
        content: "Area = πr²\nCircumference = 2πr\nDiameter = 2r",
        example: "r=7, Area = (22/7)×49 = 154"
      }
    ];

    // 2. Clocks Formulas
    const clockFormulas = [
      {
        title: "Angle Between Hands",
        content: "Angle = |(30 × H) - (5.5 × M)|\nWhere H = Hour, M = Minute",
        example: "At 3:25, Angle = |(30×3) - (5.5×25)| = 47.5°"
      },
      {
        title: "Coincide (0°)",
        content: "Hands coincide 11 times in 12 hours (22 times in a day).\nFormula to find time between H and H+1: t = (60/55) × 5H",
        example: "Between 3 and 4: (60/55) × 15 = 16 4/11 min past 3"
      },
      {
        title: "Right Angle (90°)",
        content: "Hands are at 90° 22 times in 12 hours (44 times a day).\nTwo positions: (5H + 15) and (5H - 15) minute spaces.",
        example: ""
      },
      {
        title: "Opposite (180°)",
        content: "Hands are opposite 11 times in 12 hours (22 times a day).\nTime = (60/55) × (5H ± 30)",
        example: ""
      }
    ];

    // Update Area
    const areaSubtopic = await Subtopic.findOne({ name: { $regex: /area/i } });
    if (areaSubtopic) {
        areaSubtopic.formulas = areaFormulas;
        await areaSubtopic.save();
        console.log('Updated Area formulas');
    } else {
        console.log('Area subtopic not found');
    }

    // Update Clocks
    const clockSubtopic = await Subtopic.findOne({ name: { $regex: /clock/i } });
    if (clockSubtopic) {
        clockSubtopic.formulas = clockFormulas;
        await clockSubtopic.save();
        console.log('Updated Clock formulas');
    } else {
        console.log('Clock subtopic not found');
    }

    console.log('Seeding completed');
    process.exit();
  } catch (error) {
    console.error('Error seeding formulas:', error);
    process.exit(1);
  }
};

seedFormulas();
