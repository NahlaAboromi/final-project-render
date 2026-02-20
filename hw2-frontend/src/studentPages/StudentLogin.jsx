import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Footer from "../layout/Footer";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";

const LoginPage = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form state and clear error on input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call backend login endpoint
      const response = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        // On success, save user info and redirect
        const data = await response.json();
        login(data.student); 
        navigate('/StudentHome');
      } else {
        // Show backend error message if any
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (error) {
      // Handle fetch/network errors
      console.error("❌ Login error:", error);
      setError("Login error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col ${
      isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'
    }`}>
      {/* Shared header for students and educators */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      {/* Centered login form container */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">   
        <div className={`max-w-md w-full space-y-8 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        } p-10 rounded-xl shadow-lg`}>
          {/* Login title and register link */}
          <div className="flex flex-col items-center space-y-2">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" 
              alt="Student" 
              className="h-16 w-16"
            />
            <h2 className="text-3xl font-extrabold text-center">Student Login</h2>
            <p className="text-xs text-center">
              Don't have an account?{' '}
              <Link to="/register?role=student" className="font-medium text-blue-500 hover:text-blue-600">
                Register now
              </Link>
            </p>
          </div>

          {/* Error alert */}
          {error && <Alert type="error" message={error} />}

          {/* Login form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <FormInput
                id="id"
                name="id"
                label="ID"
                placeholder="Enter your ID"
                value={form.id}
                onChange={handleChange}
                required
              />
              <FormInput
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Forgot password link */}
            <div className="text-sm">
              <Link to="/forgot-password?role=student" className="font-medium text-blue-500 hover:text-blue-600">
                Forgot your password?
              </Link>
            </div>

            {/* Submit button with loading state */}
            <Button 
              type="submit" 
              isLoading={isLoading} 
              fullWidth
              variant="primary"
            >
              Sign in
            </Button>
          </form>
        </div>
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

const StudentLoginPage = () => {
  // Wrap LoginPage with ThemeProvider to enable dark/light theming
  return (
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );
};

export default StudentLoginPage;
