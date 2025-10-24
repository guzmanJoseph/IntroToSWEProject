import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"

export default function Login() {
  return (
      <div className="login-page d-flex align-items-center justify-content-center">
        <div className="card shadow-lg p-4 border-0">
          <h2 className="text-center mb-4 text-primary fw-bold">
            Log In
          </h2>

          <form>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                UF Email
              </label>
              <input type="email" className="form-control" id="email" placeholder="yourname@ufl.edu" required></input>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input type="password" className="form-control" id="password" placeholder="Enter your password" required></input>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2">
              Log In
            </button>

            <p className="text-center mt-3 mb-0">
              Don't have an account?
              <a href="/signup" className="text-decoration-none text-primary">
              Sign up Here
              </a>
            </p>
          </form>
        </div>
      </div>
  );
}
