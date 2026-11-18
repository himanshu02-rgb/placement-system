# PlacementHub: AI-Powered Job & Placement Management System

PlacementHub is a full-stack web app that connects students with job openings and helps them prepare. Recruiters post jobs and manage applicants through hiring stages. Students upload resumes, apply to jobs, get AI feedback on their resumes, check how well they match a job, and practise mock interviews.

The project is built with the MERN stack (MongoDB, Express, React, Node.js) and Google Gemini for the AI features.

> **Working name:** "PlacementHub" is the current name in the app and this README. It may change.

---

## Features

### For students
- Register and log in
- Browse jobs and view job details
- Upload several PDF resumes and choose which one to send with each application
- Track application status (Applied, Shortlisted, Interview, Selected, Rejected)
- **Resume feedback:** get AI analysis of each resume (skills, strengths, missing skills, suggestions). Results are saved, so viewing them again costs no AI request.
- **Job Matcher:** compare a chosen resume with a job, using a posted job, pasted text, or a job description PDF. Returns a match score, matching and missing skills, and recommendations.
- **Mock Interview:** enter a target role to receive 5 AI-generated questions. Type an answer to get a score out of 10 and feedback. Ask for a sample answer for any question.

### For recruiters
- Post jobs manually, or upload a job description as a PDF to fill in the description
- See only the jobs you posted, with applicant counts
- View applicants for each job and open their resumes
- Move candidates through the hiring stages, or select or reject them

### Shared
- Role-based navigation and route protection
- Responsive layout for desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT in an httpOnly cookie, bcryptjs for password hashing |
| File uploads | Multer (PDFs, 5 MB limit) |
| PDF text extraction | pdf-parse |
| AI | Google Gemini via `@google/genai` |

---

## Project Structure

```
placement-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── resumeController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── jdUploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── Resume.js
│   ├── routes/
│   ├── services/
│   │   └── aiService.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── uploads/            (created automatically, not tracked by Git)
│   ├── server.js
│   └── package.json
└── frontend/
    └── src/
        ├── components/
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        ├── services/
        │   └── api.js
        ├── App.jsx
        └── main.jsx
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Git
- A MongoDB Atlas account (free M0 cluster is enough)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/placement-system.git
cd placement-system
```

### 2. Set up MongoDB Atlas

1. Create a free M0 cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with a username and password.
3. Under Network Access, allow your IP address (or `0.0.0.0/0` for development only).
4. Copy the connection string. It looks like this, with `placement-db` as the database name:

```
mongodb+srv://<username>:<password>@<cluster-url>/placement-db?retryWrites=true&w=majority
```

### 3. Get a Gemini API key

Create a key at [Google AI Studio](https://aistudio.google.com/apikey). The free tier allows about 20 requests per day per model, so AI features may stop working for the day after heavy testing.

### 4. Backend setup

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/placement-db?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev
```

You should see the server running on port 5000 and a successful MongoDB connection.

### 5. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

The frontend calls the backend at `http://localhost:5000/api`, set in `frontend/src/services/api.js`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port. Defaults to 5000 in this project. |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. Use a long random value. |
| `GEMINI_API_KEY` | Yes | Google Gemini API key. Used only on the backend, never sent to the browser. |

**Never commit `.env`.** Make sure `backend/.gitignore` contains:

```
node_modules/
.env
uploads/
```

---

## Using the App

### Student flow
1. Register with the role **Student**.
2. Go to **Resume** and upload one or more PDF resumes.
3. Click **Analyze** on a resume to see AI feedback. Use **View feedback** later to reopen it.
4. Browse **Jobs**, open a job, pick a resume, and click **Apply**.
5. Track progress on **My Applications**.
6. Use **Job Matcher** to compare a resume with a job.
7. Use **Mock Interview** to practise. Enter a role, answer each question, and ask for a sample answer if you're stuck.

### Recruiter flow
1. Register with the role **Recruiter-Admin**.
2. Post a job under **Post a job**, or upload a job description PDF to fill in the description.
3. Open **My jobs** to see your jobs and applicant counts.
4. Click **View applicants** to see candidates, open their resumes, and move them through the stages.

### Application stages

```
Applied → Shortlisted → Interview → Selected
                                  ↘ Rejected
```

Recruiters can move a candidate to any stage from the stage dropdown.

---

## API Reference

All routes are prefixed with `/api`. Routes marked **Protected** need a logged-in user (the `jwt` cookie). Routes marked **Student** or **Recruiter** also check the user's role.

### Auth

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register with name, email, password, and role (`student` or `admin`) |
| POST | `/auth/login` | Public | Log in and set the `jwt` cookie |

The current-user and logout endpoints are also in `backend/routes/authRoutes.js`.

### Jobs

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/jobs` | Public | List all jobs |
| GET | `/jobs/:id` | Public | Get one job |
| POST | `/jobs` | Recruiter | Create a job |
| POST | `/jobs/parse-jd` | Recruiter (protected) | Upload a job description PDF (form field `jd`) and get its text back |
| GET | `/jobs/mine` | Recruiter | List your posted jobs, with `applicantCount` |
| GET | `/jobs/:id/applicants` | Recruiter (owner only) | List applicants for one of your jobs |
| POST | `/jobs/:id/apply` | Student | Apply with `{ "resumeId": "..." }` |

### Applications

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/applications` | Student | List your applications, with job and resume details |
| GET | `/applications/stats` | Protected | Dashboard counts, including interviews |
| PATCH | `/applications/:id/status` | Recruiter (owner of the job) | Change stage with `{ "status": "Shortlisted" }` |

### Resumes

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/resumes/upload` | Protected | Upload a PDF (form field `resume`, max 5 MB) |
| GET | `/resumes/` | Protected | Get the most recent resume |
| GET | `/resumes/mine` | Protected | List your resumes, newest first |
| GET | `/resumes/:id/file` | Owner, or recruiter of a job the student applied to with this resume | Download the PDF |

### AI

| Method | Route | Access | Body | Description |
|---|---|---|---|---|
| POST | `/ai/resume-analysis` | Protected | `{ "resumeId": "..." }` (optional) | Analyze a resume. Without `resumeId`, uses the newest one. |
| POST | `/ai/job-match` | Protected | `{ "resumeId", "jobId" }` or `{ "resumeId", "jobDescription" }` | Score a resume against a job |
| POST | `/ai/interview/generate` | Protected | `{ "role" }` | Generate 5 interview questions |
| POST | `/ai/interview/evaluate` | Protected | `{ "question", "answer" }` | Score an answer out of 10 with feedback |
| POST | `/ai/interview/sample` | Protected | `{ "question", "role" }` | Get a sample answer and key points |

---

## How the AI Features Work

- **Model fallback:** `backend/services/aiService.js` tries Gemini models in order. If a model is busy (503), it retries once after a short wait. If a model is not found (404) or over quota (429), it moves to the next model.
- **Timeout:** Each request times out after 25 seconds, and the user sees a clear message.
- **Limited input:** Resume and job text is cut to 4,000 characters before it is sent to the AI, which keeps responses fast and cheap.
- **Structured output:** The AI must return JSON. The backend checks the shape before returning it, and returns a 502 error if the format is wrong.
- **Saved results:** Resume text and analysis are saved on the resume record, so repeat views make no AI request.
- **Keys stay on the server:** The Gemini key is only read by the backend.

---

## Security Notes

- Passwords are hashed with bcryptjs.
- The JWT is stored in an httpOnly cookie, so JavaScript on the page cannot read it.
- Recruiters can only view and change jobs they posted.
- Students can only view and use their own resumes.
- Recruiters can only open a student's resume if that student applied to one of their jobs with that resume.
- Backend route checks decide access. The frontend only hides links; it does not enforce security.

---

## Known Limitations

- **Recruiter sign-up is open:** The Register page has a role dropdown, so anyone can register as a recruiter. This is a demo simplification. A real product would use invitations or admin approval.
- **No resume deletion yet:** Students cannot delete resumes. Planned work is listed below.
- **Local file storage:** Resume PDFs are saved in `backend/uploads`. This doesn't work across multiple servers. Cloud storage is planned.
- **Login lasts 30 days:** There is no refresh-token system.
- **Free AI quota:** The Gemini free tier is limited per day, and the model may be temporarily overloaded.
- **Older data:** Jobs created before recruiter ownership was added have no owner and don't appear under **My jobs**. Applications created before resume selection have no resume attached.
- **PDF only:** Only PDF resumes and job descriptions are accepted.
- **Interview answers are not saved:** Mock interview sessions exist only in the browser.
- **No automated tests yet:** Testing has been manual, with Postman for the API and the browser for the UI.

---

## Roadmap

- Delete resumes, blocked when the resume is attached to an application
- Cloud file storage for resumes
- Save mock interview history
- Proper recruiter sign-up or approval
- Automated tests for controllers and key pages
- Deployment with separate hosting for frontend and backend

---

## Author

**Himanshu Kr Gupta**
[LinkedIn](https://linkedin.com/in/himanshu-kr-gupta02)

## License
