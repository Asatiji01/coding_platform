const Problems = require('../models/problem')
const user = require('../models/user')
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemutility')
const problemvalidate = require('../utils/probvaildat')

const problemCreate = async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator
    } = req.body;

    try {
            problemvalidate(req.body)
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);

            const testResult = await submitToken(resultToken);
                //   console.log(" submitToken raw result:", JSON.stringify(testResult, null, 2));

            // 🔹 Handle nulls + both response formats
            for (const test of testResult) {
                if (!test) {
                    return res.status(400).send("Error: Empty test result received");
                }

                const statusId = test?.status?.id ?? test?.status_id;
                 
                if (statusId !== 3) {
                    return res.status(400).send("Error: Some test cases failed");
                }

            }

        }

        // Save problem to DB
        const userProblem = await Problems.create({
            ...req.body,
            problemCreator: req.result._id 
        });

        res.status(201).send("Problem Saved Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
};



const problemDelete = async (req, res) => {
    try {
        const deleted = await Problems.findByIdAndDelete(req.params.id);


        if (!deleted)
             return res.status(404).send("Problem not found");

          res.send("Problem deleted successfully");
    } catch (err) {
        res.status(500).send("Error deleting problem: " + err.message);
    }
}

 
const problemUpdate = async (req, res) => {
    
   
  const { id } = req.params;
   const {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator
    } = req.body;
      try {
          if(!id)
            throw new Error('missing id field')

        const dsaProblem = await Problems.findById(id);

        if (!dsaProblem) {
            return res.status(404).send('Problem not found')
        }
       


          for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);

            const testResult = await submitToken(resultToken);
                //   console.log(" submitToken raw result:", JSON.stringify(testResult, null, 2));

            // 🔹 Handle nulls + both response formats
            for (const test of testResult) {
                if (!test) {
                    return res.status(400).send("Error: Empty test result received");
                }

                const statusId = test?.status?.id ?? test?.status_id;
                 
                if (statusId !== 3) {
                    return res.status(400).send("Error: Some test cases failed");
                }

            }

        }

     await Problems.findByIdAndUpdate(id, {...req.body},{runValidators:true})
        res.status(200).send({
            message: 'Problem updated successfully',
            problem: dsaProblem
        });

    } catch (err) {
        res.status(500).send('Error updating problem: ' + err.message)
    }
}

const problemFetch = async (req,res)=>{
const id = req.params.id;
try{
    if(!id)
        res.status(404).send('missing id field ')
    const searchproblem = await Problems.findById(id).select('_id title description,difficulty tags visibleTestCases startCode');
    if(!searchproblem)
        res.status(404).send('not found')
    //  console.log(search)
    res.status(200).send(searchproblem)
}catch(err)
{
    res.status(400).send('err in problem fetching'+err)
}
}

const problemFetchAll = async (req, res) => {
  try {
    // Get page & limit from query params (default: page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch problems with pagination
    const problems = await Problems.find()
      .select('_id title difficulty tags')
      .skip(skip)
      .limit(limit);

    // Count total problems for pagination info
    const totalProblems = await Problems.countDocuments();

    // If no problems found (but not an error)
    if (problems.length === 0) {
      return res.status(200).json({
        totalProblems,
        currentPage: page,
        totalPages: Math.ceil(totalProblems / limit),
        problems: [],
      });
    }

    // Send response with pagination metadata
    res.status(200).json({
      totalProblems,
      currentPage: page,
      totalPages: Math.ceil(totalProblems / limit),
      problems,
    });
  } catch (err) {
    res
      .status(500)
      .send('Error fetching problems: ' + err.message);
  }
};


module.exports = { problemCreate, problemDelete, problemUpdate ,problemFetch,problemFetchAll}