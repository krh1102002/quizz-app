import fs from 'fs';
import path from 'path';

/**
 * Parse markdown file containing questions in the format:
 * ### Q1.
 * Question text
 * A) option1
 * B) option2
 * C) option3
 * D) option4
 * **Answer:** B
 * **Explanation:**
 * Explanation text
 */

export function parseMarkdownQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = [];
  const fileName = path.basename(filePath).toLowerCase();
  
  // Determine chart type based on file name
  let defaultChartType = null;
  if (fileName.includes('pie')) defaultChartType = 'pie';
  else if (fileName.includes('bar')) defaultChartType = 'bar';
  else if (fileName.includes('line')) defaultChartType = 'line';
  else if (fileName.includes('table')) defaultChartType = 'table';

  const lines = content.split('\n');
  let currentSetData = null;
  let currentSetType = defaultChartType;
  let currentBlock = [];
  let isInQuestion = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect Set Header
    if (line.startsWith('## Set')) {
      isInQuestion = false;
      // Extract data block if any
      let nextIdx = i + 1;
      let dataLines = [];
      while (nextIdx < lines.length && !lines[nextIdx].startsWith('### Q')) {
        const nextLine = lines[nextIdx].trim();
        if (nextLine && !nextLine.startsWith('##')) {
          dataLines.push(nextLine);
        }
        nextIdx++;
      }
      currentSetData = parseDataBlock(dataLines);
      continue;
    }

    // Detect Question Header
    if (line.startsWith('### Q')) {
      if (currentBlock.length > 0) {
        const q = parseQuestionBlock(currentBlock.join('\n'), questions.length + 1);
        if (q) {
          q.chartData = currentSetData;
          q.chartType = currentSetType;
          questions.push(q);
        }
      }
      currentBlock = [];
      isInQuestion = true;
      continue;
    }

    if (isInQuestion) {
      currentBlock.push(lines[i]);
    }
  }

  // Last question
  if (currentBlock.length > 0) {
    const q = parseQuestionBlock(currentBlock.join('\n'), questions.length + 1);
    if (q) {
      q.chartData = currentSetData;
      q.chartType = currentSetType;
      questions.push(q);
    }
  }

  return questions;
}

function parseDataBlock(lines) {
  if (lines.length === 0) return null;

  // Check for Table
  if (lines.some(l => l.includes('|'))) {
    const tableLines = lines.filter(l => l.includes('|') && !l.includes('---'));
    if (tableLines.length < 2) return null;
    
    const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
    const data = [];
    
    for (let i = 1; i < tableLines.length; i++) {
      const row = tableLines[i].split('|').map(r => r.trim()).filter(r => r);
      if (row.length === headers.length) {
        let entry = {};
        headers.forEach((h, idx) => {
          const val = row[idx];
          // Try to convert to number if possible
          entry[h] = isNaN(val) ? val : parseFloat(val);
        });
        data.push(entry);
      }
    }
    return data;
  }

  // Check for List (Key: Value)
  const listData = [];
  for (const line of lines) {
    if (line.startsWith('*') || line.startsWith('-')) {
      const match = line.match(/[*|-]\s*([^:]+):\s*([\d.%₹,]+)/);
      if (match) {
        const name = match[1].trim();
        let valueStr = match[2].trim().replace(/[%,₹]/g, '').replace(/,/g, '');
        const value = parseFloat(valueStr);
        if (!isNaN(value)) {
          listData.push({ name, value });
        }
      }
    }
  }

  return listData.length > 0 ? listData : null;
}

function parseQuestionBlock(block, questionNumber) {
  const lines = block.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length < 5) {
    return null;
  }
  
  let questionText = '';
  let options = [];
  let correctAnswer = null;
  let explanation = '';
  
  let currentSection = 'question';
  let collectingExplanation = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '---' || line.startsWith('---')) continue;
    
    if (line.startsWith('**Problem:**')) {
      questionText += (questionText ? ' ' : '') + line.replace('**Problem:**', '').trim();
      currentSection = 'question';
      continue;
    }

    if (/^[A-D][.\)]/.test(line)) {
      const optionText = line.substring(2).trim();
      options.push(optionText);
      currentSection = 'options';
      continue;
    }
    
    if (line.startsWith('**Answer:**')) {
      const answerMatch = line.match(/\*\*Answer:\*\*\s*([A-D])/i);
      if (answerMatch) {
        correctAnswer = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      }
      currentSection = 'answer';
      continue;
    }
    
    if (line.startsWith('**Explanation:**')) {
      collectingExplanation = true;
      currentSection = 'explanation';
      const explMatch = line.match(/\*\*Explanation:\*\*\s*(.*)/i);
      if (explMatch && explMatch[1]) {
        explanation = explMatch[1].trim();
      }
      continue;
    }
    
    if (currentSection === 'question') {
      questionText += (questionText ? ' ' : '') + line;
    } else if (collectingExplanation) {
      explanation += (explanation ? '\n' : '') + line;
    }
  }
  
  if (!questionText || options.length !== 4 || correctAnswer === null) {
    return null;
  }
  
  return {
    question: questionText,
    options,
    correctAnswer,
    explanation: explanation || 'No explanation provided.',
    points: 1
  };
}

export function createQuestionHash(question) {
  const normalized = question.question.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 100);
  return normalized;
}

export function findDuplicates(questions) {
  const hashes = new Map();
  const duplicates = [];
  
  questions.forEach((q, index) => {
    const hash = createQuestionHash(q);
    if (hashes.has(hash)) {
      duplicates.push({
        index1: hashes.get(hash),
        index2: index,
        question: q.question.substring(0, 100)
      });
    } else {
      hashes.set(hash, index);
    }
  });
  
  return duplicates;
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const testFile = process.argv[2];
  if (!testFile) {
    console.log('Usage: node question_parser.js <markdown-file>');
    process.exit(1);
  }
  
  console.log(`Parsing: ${testFile}`);
  const questions = parseMarkdownQuestions(testFile);
  console.log(`\nParsed ${questions.length} questions`);
  
  const duplicates = findDuplicates(questions);
  if (duplicates.length > 0) {
    console.log(`\n⚠️  Found ${duplicates.length} potential duplicates:`);
    duplicates.forEach(d => {
      console.log(`  Q${d.index1 + 1} ≈ Q${d.index2 + 1}: ${d.question}...`);
    });
  }
  
  // Show sample
  if (questions.length > 0) {
    console.log('\nSample question:');
    console.log(JSON.stringify(questions[0], null, 2));
  }
}
