const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById,executeSubmissions} = require("../utils/problemUtility");

const getResultMessage = (test) => test.compile_output || test.stderr || test.message || test.status?.description || 'Execution failed';

const submitCode = async (req,res)=>{
   
    // 
    try{
      
       const userId = req.result._id;
       const problemId = req.params.id;

       let {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      

      if(language==='cpp')
        language='c++'
      
      console.log(language);
      
    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
       if (!problem) return res.status(404).send("Problem is Missing");
    //    testcases(Hidden)
    
    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
     })

    //    Judge0 code ko submit karna hai
    
    const languageId = getLanguageById(language);
    if (!languageId) return res.status(400).send("Unsupported language");
   
    const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    
    const testResult = await executeSubmissions(submissions, {stopOnError: true});
    console.log("SUBMISSION RESULTS:", JSON.stringify(testResult, null, 2));
    

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = 'wrong'
            errorMessage = getResultMessage(test)
          }
          else{
            status = 'error'
            errorMessage = getResultMessage(test)
          }
        }
    }


    // Store the result in Database in Submission
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    // req.result == user Information

    if(status === 'accepted' && !req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }
    
    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      error: errorMessage,
      status
    });
       
    }
    catch(err){
      console.error('Submit execution failed:', err.message);
      res.status(err.statusCode || 500).json({
        accepted: false,
        error: err.isSubscription ? 'Judge0 subscription required. Subscribe to Judge0 CE in RapidAPI, update JUDGE0_KEY, then restart the backend.' : err.isRateLimit ? 'Judge0 rate limit reached. Please wait and try again.' : err.message,
        totalTestCases: 0,
        passedTestCases: 0
      });
    }
}


const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      let {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
      if (!problem) return res.status(404).send("Problem is Missing");
   //    testcases(Hidden)
      if(language==='cpp')
        language='c++'

   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);
   if (!languageId) return res.status(400).send("Unsupported language");

   const submissions = problem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const testResult = await executeSubmissions(submissions, {stopOnError: true});

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = getResultMessage(test)
          }
          else{
            status = false
            errorMessage = getResultMessage(test)
          }
        }
    }

   
  
   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory,
    error: testResult.find((test) => test.status_id !== 3) ? getResultMessage(testResult.find((test) => test.status_id !== 3)) : null
   });
      
   }
   catch(err){
     console.error('Run execution failed:', err.message);
     res.status(err.statusCode || 500).json({
       success: false,
       error: err.isSubscription ? 'Judge0 subscription required. Subscribe to Judge0 CE in RapidAPI, update JUDGE0_KEY, then restart the backend.' : err.isRateLimit ? 'Judge0 rate limit reached. Please wait and try again.' : err.message,
       testCases: []
     });
   }
}


module.exports = {submitCode,runCode};



//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',


// User.findByIdUpdate({
// })

//const user =  User.findById(id)
// user.firstName = "Mohit";
// await user.save();
