import "bootstrap/dist/css/bootstrap.min.css";
import "./About.css";

export default function About() {
  return (
    <div className="about-page"> 
      <div className="container py-5">
        <div className="text-center mb-4">
          <h1 className="display-4">
            About Our Project
          </h1>
          <p className="text-muted fs-5">
            Built with React, Vite, and Bootstrap 5
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h2 className="title">
                  Who We Are
                </h2>
                <p className="text">
                  Welcome to GatorKeys, where will be 
                  creating a UF-verified subleasing marketplace 
                  that will allow students to list and search 
                  for short-term housing agreements off campus. Core features
                  include:
                </p>
                <ul className="bullet-points">
                  <li> Listings with photos, rent, dates, amenities, pet policy, parking, distance, furnished </li>
                  <li> UF email verification to build trust</li>
                  <li> Search and filter (price, dates, distance to campus, pet)</li>
                  <li> Profile creation, Roommate Reviews</li>
                  <li> Messaging feature</li>   
                </ul>
                <h2 className="project-vision">
                  Our Project Vision
                </h2>
                <ul className="project-vision-text">
                  <li> <strong> For </strong> UF students looking for short-term housing near campus</li>
                  <li> <strong> Who </strong> struggle to find trusted sublease options </li>
                  <li> <strong> Our </strong> GatorKeys marketplace</li>
                  <li> <strong> Is </strong> a verified student-only platform for discovering, evaluating, and securing subleases</li>
                  <li> <strong> That </strong> uses searching features and communication</li>
                  <li> <strong> Unlike </strong> generic Instagram posts and Snapchat stories</li>
                  <li> <strong> Our product </strong> enforces UF email verification, adds structured listings and filters, and builds trust through reviews and admin moderation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5 justfy-content-center">
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="joseph">
                  Joseph Guzman
                </h2>
                <p className="card-text text-muted">
                  Database Administrator + Full Stack Developer
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="josh">
                  Joshua Rivera
                </h2>
                <p className="card-text text-muted">
                  Full Stack Developer
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="brando">
                  Brando Santana
                </h2>
                <p className="card-text text-muted">
                  Frontend Developer
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="rocco">
                  Rocco Tammone
                </h2>
                <p className="card-text text-muted">
                  Backend Developer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}
