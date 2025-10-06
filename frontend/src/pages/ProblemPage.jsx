// src/pages/ProblemPage.jsx

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';


const languageOptions = {
    'javascript': 'JavaScript',
    'java': 'Java',
    'c++': 'C++',
};

// Map for Monaco editor language prop
const monacoLanguageMap = {
    'javascript': 'javascript',
    'java': 'java',
    'c++': 'cpp',
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button
  const [isRuning, setIsRunning] = useState(false); // For run button
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  const { problemId } = useParams();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
       
        const response = await axiosClient.get(`/admin/problembyid/${problemId}`);
        setProblem(response.data);
        
        // Set initial code for the default language
        const initialCode = response.data.startCode.find(
          sc => sc.language.toLowerCase() === languageOptions[selectedLanguage].toLowerCase()
        )?.initialCode || '// Your code here';
        setCode(initialCode);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
        fetchProblem();
    }
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(
        sc => sc.language.toLowerCase() === languageOptions[selectedLanguage].toLowerCase()
      )?.initialCode || '// Select a language';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    setActiveRightTab('testcase');
    
    try {
    
      const response = await axiosClient.post(`/submit/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

     
      const results = response.data;
      const allPassed = results.every(res => res.status_id === 3);
      let totalRuntime = 0;
      let maxMemory = 0;

      results.forEach(res => {
          if(res.status_id === 3) {
             totalRuntime += parseFloat(res.time) || 0;
             maxMemory = Math.max(maxMemory, res.memory || 0);
          }
      });
      
      setRunResult({
        success: allPassed,
        runtime: totalRuntime.toFixed(3),
        memory: maxMemory,
        testCases: results 
      });

    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || 'An error occurred while running the code.'
      });
    } finally {
        setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setActiveRightTab('result');
    
    try {
       
        const response = await axiosClient.post(`/submit/submission/${problemId}`, {
            code: code,
            language: selectedLanguage
        });
       setSubmitResult(response.data);
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        status: 'error',
        errorMessage: error.response?.data?.message || 'Failed to submit.'
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
         <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeLeftTab === 'description' && 'tab-active'}`} onClick={() => setActiveLeftTab('description')}>Description</button>
          <button className={`tab ${activeLeftTab === 'editorial' && 'tab-active'}`} onClick={() => setActiveLeftTab('editorial')}>Editorial</button>
          <button className={`tab ${activeLeftTab === 'submissions' && 'tab-active'}`} onClick={() => setActiveLeftTab('submissions')}>Submissions</button>
          <button className={`tab ${activeLeftTab === 'chatAI' && 'tab-active'}`} onClick={() => setActiveLeftTab('chatAI')}>ChatAI</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
            {/* Left Panel Content */}
            {problem && activeLeftTab === 'description' && (
                 <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </div>
                  </div>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: problem.description }}></div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    {problem.visibleTestCases.map((example, index) => (
                      <div key={index} className="bg-base-200 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold">Example {index + 1}:</h4>
                        <div className="text-sm font-mono mt-2 space-y-1">
                          <div><strong>Input:</strong> {example.input}</div>
                          <div><strong>Output:</strong> {example.output}</div>
                          {example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )}
            {activeLeftTab === 'editorial' && <Editorial />}
            {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
            {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button className={`tab ${activeRightTab === 'code' && 'tab-active'}`} onClick={() => setActiveRightTab('code')}>Code</button>
          <button className={`tab ${activeRightTab === 'testcase' && 'tab-active'}`} onClick={() => setActiveRightTab('testcase')}>Testcase</button>
          <button className={`tab ${activeRightTab === 'result' && 'tab-active'}`} onClick={() => setActiveRightTab('result')}>Result</button>
        </div>

        <div className="flex-1 flex flex-col">
            {/* Code Editor View */}
            {activeRightTab === 'code' && (
                <div className="flex-1 flex flex-col">
                    <div className="p-2 border-b border-base-300">
                        <select
                            className="select select-sm select-bordered"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                        {Object.entries(languageOptions).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                        </select>
                    </div>
                    <div className="flex-1">
                       <Editor
                         height="100%"
                         language={monacoLanguageMap[selectedLanguage]}
                         value={code}
                         onChange={handleEditorChange}
                         onMount={handleEditorDidMount}
                         theme="vs-dark"
                         options={{ fontSize: 14, minimap: { enabled: false } }}
                        />
                    </div>
                    <div className="p-2 border-t border-base-300 flex justify-end gap-2">
                        <button className={`btn btn-outline btn-sm ${isRuning ? 'loading' : ''}`} onClick={handleRun} disabled={isSubmitting || isRuning}>Run</button>
                        <button className={`btn btn-primary btn-sm ${isSubmitting ? 'loading' : ''}`} onClick={handleSubmitCode} disabled={isSubmitting || isRuning}>Submit</button>
                    </div>
                </div>
            )}

            {/* Testcase/Run Result View */}
            {activeRightTab === 'testcase' && (
                <div className="p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Test Results</h3>
                    {isRuning ? <div className='text-center'><span className="loading loading-dots loading-md"></span></div> :
                     runResult ? (
                        <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'}`}>
                            <div>
                                <h4 className="font-bold">{runResult.success ? ' All Visible Tests Passed!' : ' Some Tests Failed'}</h4>
                                {runResult.error && <p>{runResult.error}</p>}
                                <div className="mt-4 space-y-2">
                                  {(runResult.testCases || []).map((tc, i) => (
                                    <div key={i} className="bg-base-100/50 p-3 rounded text-xs">
                                      <div className="font-mono">
                                        <p><strong>Input:</strong> {problem.visibleTestCases[i].input}</p>
                                        <p><strong>Expected:</strong> {problem.visibleTestCases[i].output}</p>
                                        <p><strong>Your Output:</strong> {tc.stdout || 'N/A'}</p>
                                        <p className={tc.status_id === 3 ? 'text-green-400' : 'text-red-400'}>
                                          <strong>Status:</strong> {tc.status_id === 3 ? '✓ Passed' : `✗ ${tc.status?.description || 'Failed'}`}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                            </div>
                        </div>
                    ) : <p className="text-gray-500">Run code to see test results.</p>}
                </div>
            )}

            {/* Submission Result View */}
            {activeRightTab === 'result' && (
                <div className="p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Submission Result</h3>
                    {isSubmitting ? <div className='text-center'><span className="loading loading-dots loading-md"></span></div> :
                     submitResult ? (
                       
                        <div className={`alert ${submitResult.status === 'accepted' ? 'alert-success' : 'alert-error'}`}>
                            <div>
                                {submitResult.status === 'accepted' ? (
                                    <>
                                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                                        <div className="mt-4 space-y-1">
                                            <p><strong>Test Cases:</strong> {submitResult.testCasesPassed}/{submitResult.testCasesTotal} Passed</p>
                                            <p><strong>Runtime:</strong> {submitResult.runtime.toFixed(3)} sec</p>
                                            <p><strong>Memory:</strong> {submitResult.memory} KB</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-bold text-lg">❌ {submitResult.status.charAt(0).toUpperCase() + submitResult.status.slice(1)}</h4>
                                        <div className="mt-4 space-y-1">
                                            <p><strong>Test Cases:</strong> {submitResult.testCasesPassed}/{submitResult.testCasesTotal} Passed</p>
                                            {submitResult.errorMessage && (
                                                <pre className="bg-base-300 p-2 mt-2 rounded font-mono text-xs">{submitResult.errorMessage}</pre>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : <p className="text-gray-500">Submit your code for evaluation.</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;