require('dotenv').config();

const mongoose = require('mongoose');
const Problem = require('../src/models/problem');
const User = require('../src/models/user');

const sampleProblem = {
  title: 'Square a Number',
  description: 'Given one integer n, print n multiplied by itself.\n\nInput: one integer n.\nOutput: n².',
  difficulty: 'easy',
  tags: 'array',
  visibleTestCases: [
    { input: '5', output: '25', explanation: '5 × 5 = 25.' },
    { input: '3', output: '9', explanation: '3 × 3 = 9.' }
  ],
  hiddenTestCases: [
    { input: '10', output: '100' },
    { input: '20', output: '400' },
    { input: '50', output: '2500' }
  ],
  startCode: [
    { 
      language: 'C++',
      initialCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  long long n;\n  cin >> n;\n\n  // Write your solution here.\n\n  return 0;\n}'
    },
    {
      language: 'Java',
      initialCode: 'import java.io.*;\n\nclass Main {\n  public static void main(String[] args) throws Exception {\n    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));\n    long n = Long.parseLong(reader.readLine().trim());\n\n    // Write your solution here.\n  }\n}'
    },
    {
      language: 'JavaScript',
      initialCode: "const fs = require('fs');\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconst n = Number(input);\n\n// Write your solution here."
    }
  ],
  referenceSolution: [
    {
      language: 'C++',
      completeCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  long long n;\n  cin >> n;\n  cout << n * n;\n  return 0;\n}'
    },
    {
      language: 'Java',
      completeCode: 'import java.io.*;\n\nclass Main {\n  public static void main(String[] args) throws Exception {\n    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));\n    long n = Long.parseLong(reader.readLine().trim());\n    System.out.print(n * n);\n  }\n}'
    },
    {
      language: 'JavaScript',
      completeCode: "const fs = require('fs');\n\nconst n = Number(fs.readFileSync(0, 'utf8').trim());\nconsole.log(n * n);"
    }
  ]
};

const createSampleProblem = async () => {
  await mongoose.connect(process.env.DB_CONNECT_STRING);

  const existing = await Problem.findOne({ title: sampleProblem.title }).select('_id');
  if (existing) {
    console.log(`Sample problem already exists: ${existing._id}`);
    return;
  }

  const admin = await User.findOne({ role: 'admin' }).select('_id');
  if (!admin) throw new Error('Create an admin user before adding the sample problem.');

  const problem = await Problem.create({ ...sampleProblem, problemCreator: admin._id });
  console.log(`Created sample problem: ${problem._id}`);
};

createSampleProblem()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
