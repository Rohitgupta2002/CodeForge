const {getLanguageById,executeSubmissions} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async (req,res)=>{
   
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;


    try{
       
      for(const {language,completeCode} of referenceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


       const testResult = await executeSubmissions(submissions, {stopOnError: true});


       console.log(testResult);

       for(const test of testResult){
        if(test.status_id!=3){
         return res.status(400).send("Error Occured");
        }
       }

      }


      // We can store it in our DB

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const updateProblem = async (req,res)=>{
  const {id} = req.params;
  try{
    if(!id) return res.status(400).json({ message: "Missing ID field" });

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem) return res.status(404).json({ message: "Problem not found" });

    const editableFields = ['title', 'description', 'difficulty', 'tags', 'constraints',
      'visibleTestCases', 'hiddenTestCases', 'startCode', 'referenceSolution'];
    const updates = Object.fromEntries(editableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
      .map((field) => [field, req.body[field]]));

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No editable fields were supplied' });
    }

    // Preserve omitted values and never allow an edit to replace the creator.
    const candidate = { ...DsaProblem.toObject(), ...updates };
    for(const {language,completeCode} of candidate.referenceSolution){
      const languageId = getLanguageById(language);
      const submissions = candidate.visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
      }));
      const testResult = await executeSubmissions(submissions, {stopOnError: true});
      for(const test of testResult){
        if(test.status_id != 3){
          return res.status(400).json({ message: 'Reference solution failed a visible test case' });
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(id, updates, {runValidators:true, new:true});
    return res.status(200).json(newProblem);
  }
  catch(err){
      console.error('Problem update failed:', err);
      return res.status(500).json({ message: 'Unable to update problem' });
  }
}

// Hidden cases are deliberately returned only through this admin route.
const getAdminProblemById = async (req,res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    return res.status(200).json(problem);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid problem ID' });
  }
};

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
   
    // video ka jo bhi url wagera le aao

   if(!getProblem)
    return res.status(404).send("Problem is Missing");

   const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
    const getProblem = await Problem.find({}).select('_id title difficulty tags');
    return res.status(200).json(getProblem || []);
  }
  catch(err){
    console.error("Error fetching all problems:", err);
    return res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      return res.status(200).json(user?.problemSolved || []);
    }
    catch(err){
      console.error("Error in solvedAllProblembyUser:", err);
      return res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({userId, problemId}).sort({ createdAt: -1 });

    return res.status(200).json(ans || []);
  }
  catch(err){
    console.error("Error in submittedProblem:", err);
    return res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAdminProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};

