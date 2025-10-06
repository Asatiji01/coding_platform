// src/pages/Homepage.jsx

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth); 

  const [problems, setProblems] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set()); 
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  // Fetch problems & solved problems
  useEffect(() => {
    const fetchAllProblems = async () => {
      try {
        const { data } = await axiosClient.get('/admin/getAllproblem');
       
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      
      if (isAuthenticated) {
        try {
          
          const { data } = await axiosClient.get('/admin/solved');
        
          const solvedIds = new Set((data.problemsolved || []).map(p => p._id));
          setSolvedProblemIds(solvedIds);
        } catch (error) {
          console.error('Error fetching solved problems:', error);
        }
      }
    };

    setLoading(true);
    fetchAllProblems();
    fetchSolvedProblems();
  }, [isAuthenticated]); 
  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblemIds(new Set()); // Clear solved problems on logout
  };

  // Apply filters
  const filteredProblems = problems.filter(problem => {
    const difficultyMatch =
      filters.difficulty === 'all' || problem.difficulty === filters.difficulty;

    const tagMatch =
      filters.tag === 'all' || problem.tags === filters.tag;

    const statusMatch = () => {
      if (filters.status === 'all') return true;
      if (filters.status === 'solved') return solvedProblemIds.has(problem._id);
      if (filters.status === 'unsolved') return !solvedProblemIds.has(problem._id);
      return true;
    };

    return difficultyMatch && tagMatch && statusMatch();
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">CodeArena</NavLink>
        </div>

        <div className="flex-none gap-4">
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                {user?.firstname}
              </div>
              <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-10">
                <li><button onClick={handleLogout}>Logout</button></li>
                {user?.role === 'admin' && (
                  <li><NavLink to="/admin">Admin Panel</NavLink></li>
                )}
              </ul>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary">Login</NavLink>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-base-100 rounded-lg shadow">
          {/* Status Filter */}
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            disabled={!isAuthenticated} // Disable if not logged in
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          {/* Difficulty Filter */}
          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Tag Filter */}
          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>

        {/* Problems List */}
        {loading ? (
            <div className="text-center py-8"><span className="loading loading-lg"></span></div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No problems match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra bg-base-100 shadow-lg rounded-lg">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Title</th>
                        <th>Difficulty</th>
                        <th>Tag</th>
                    </tr>
                </thead>
                <tbody>
                 {filteredProblems.map(problem => (
                    <tr key={problem._id} className="hover">
                        <td>
                            {isAuthenticated && solvedProblemIds.has(problem._id) && (
                                <span className="text-success">✔ Solved</span>
                            )}
                        </td>
                        <td>
                            <NavLink
                                to={`/problem/${problem._id}`}
                                className="hover:text-primary font-semibold"
                            >
                                {problem.title}
                            </NavLink>
                        </td>
                        <td>
                             <span className={`font-medium ${getDifficultyTextColor(problem.difficulty)}`}>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </span>
                        </td>
                        <td>
                            <div className="badge badge-info badge-outline">{problem.tags}</div>
                        </td>
                    </tr>
                 ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyTextColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-success';
    case 'medium': return 'text-warning';
    case 'hard': return 'text-error';
    default: return 'text-neutral';
  }
};

export default Homepage;