import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";

export default function SignUp() {
  return (
    <div className="signUp-page">
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <form className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-2x1 font-bold mb-6 text-center">Sign Up</h1>

          <label htmlFor="FirstName" className="form-label fw-semibold">
            First Name
          </label>
          <input
            name="FirstName"
            placeholder="John"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <label htmlFor="LastName" className="form-label fw-semibold">
            Last Name
          </label>
          <input
            name="LastName"
            placeholder="Doe"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <label htmlFor="DOB" className="form-label fw-semibold">
            Date of Birth
          </label>
          <div className="mb-4 flex space-x-2">
            <select
              name="month"
              value={FormData.month}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, i) => (
                <option key={i} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              name="day"
              value={FormData.day}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              name="year"
              value={FormData.year}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Should we ask for gender? */}

          <label htmlFor="Email" className="form-label fw-semibold">
            UF Email
          </label>
          <input
            name="Email"
            placeholder="yourname@ufl.edu"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <label htmlFor="Password" className="form-label fw-semibold">
            Password
          </label>
          <input
            name="Password"
            placeholder="Enter your password"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <label htmlFor="RePassword" className="form-label fw-semibold">
            Re-enter Password
          </label>
          <input
            name="RePassword"
            placeholder="Repeat your password"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full h-10 bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
