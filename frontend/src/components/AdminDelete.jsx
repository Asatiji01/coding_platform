// src/components/AdminDelete.jsx (Corrected)

import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
     
      const { data } = await axiosClient.get('/admin/getAllproblem'); 
      
      setProblems(data.problems || []); 
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
     
      await axiosClient.delete(`/admin/delete/${id}`); 
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    }
  };

  if (loading) { /* ... loading spinner JSX ... */ }
  if (error) { /* ... error display JSX ... */ }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Delete Problems</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>
                <td>{problem.title}</td>
                <td>
                  {/*  FIX 4: Used lowercase for comparison to match backend data */}
                  <span className={`badge ${
                    problem.difficulty === 'easy' ? 'badge-success' 
                    : problem.difficulty === 'medium' ? 'badge-warning' 
                    : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <span className="badge badge-outline">{problem.tags}</span>
                </td>
                <td>
                  <button onClick={() => handleDelete(problem._id)} className="btn btn-sm btn-error">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDelete;