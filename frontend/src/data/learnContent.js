// Generic, standalone study content -- teaches the concepts themselves,
// not the internals of any specific app.

export const flashcardDecks = {
  frontend: [
    { q: "What is frontend development?", a: "Building everything a user sees and interacts with directly in the browser: layout, styling, and behavior." },
    { q: "What is the DOM?", a: "The Document Object Model -- a live tree of objects the browser builds from HTML, which JavaScript can read and change to update what's on screen." },
    { q: "Why use a framework like React?", a: "It lets you describe the UI as a function of state ('when this data changes, show this'), and re-renders efficiently instead of manually updating the DOM by hand." },
    { q: "What is a component?", a: "A small, reusable piece of UI that takes inputs (props) and returns what should be rendered." },
    { q: "What is state?", a: "Data that changes over time and drives what's rendered -- like a list of items or whether a menu is open." },
    { q: "What is a utility-first CSS framework?", a: "A style of CSS (e.g. Tailwind) where you compose small, single-purpose classes like 'flex' or 'rounded-lg' directly in markup instead of writing custom stylesheets." },
    { q: "What does 'responsive design' mean?", a: "Building layouts that adapt cleanly to different screen sizes, from a phone to a wide desktop monitor." },
    { q: "What is an API call from the frontend?", a: "A request (often with fetch or axios) sent from the browser to a backend server to get or send data." },
    { q: "What's the virtual DOM?", a: "A lightweight in-memory representation of the UI that frameworks like React use to figure out the minimal real changes needed, instead of re-rendering everything." },
    { q: "What is client-side routing?", a: "Navigating between 'pages' in a single-page app without a full browser reload, by swapping which component renders based on the URL." },
  ],
  backend: [
    { q: "What is backend development?", a: "Building the server-side logic: handling requests, running business logic, talking to a database, and returning responses." },
    { q: "What is an API?", a: "A defined set of endpoints (URLs) a server exposes so other programs (like a frontend) can request or send data." },
    { q: "What is REST?", a: "A common style for designing APIs using standard HTTP methods (GET, POST, PUT, DELETE) mapped to actions on resources." },
    { q: "What is middleware?", a: "A function that runs between a request arriving and the final route handler -- commonly used for authentication checks, logging, or rate limiting." },
    { q: "Why hash passwords instead of storing them directly?", a: "Hashing is one-way. Even if a database leaks, attackers only see scrambled hashes, not real passwords." },
    { q: "What is a JWT?", a: "A JSON Web Token -- a signed, tamper-proof token issued after login that proves who a user is on future requests, without the server needing to store sessions in memory." },
    { q: "What is a database?", a: "Organized, persistent storage for data. SQL databases (like SQLite or Postgres) use tables and rows; NoSQL databases (like MongoDB) use flexible documents." },
    { q: "What's the difference between hashing and encryption?", a: "Hashing is one-way (fine when you never need the original value back). Encryption is reversible with a key (needed when you must retrieve the original value later)." },
    { q: "What is rate limiting?", a: "Restricting how many requests a client can make in a given time window, to slow down abuse like brute-force login attempts." },
    { q: "What is SQL injection?", a: "An attack where untrusted input is inserted directly into a database query, letting an attacker manipulate it. Parameterized queries prevent this." },
  ],
  fullstack: [
    { q: "What is full-stack development?", a: "Being comfortable working across both frontend (what users see) and backend (servers, databases, APIs) -- plus how they connect." },
    { q: "How does a typical login request flow?", a: "Browser sends credentials -> server checks them against a stored hash -> server issues a signed token -> frontend stores it and attaches it to future requests." },
    { q: "What's a sensible learning path?", a: "HTML/CSS -> JavaScript fundamentals -> a frontend framework -> a backend runtime (like Node.js) -> databases -> authentication & security basics -> deployment." },
    { q: "What is version control / Git?", a: "A system for tracking changes to code over time, so you can collaborate, undo mistakes, and deploy confidently." },
    { q: "What does 'deploying' an app mean?", a: "Publishing your code to servers the public can reach -- typically a backend host (like Render or Railway) and a static frontend host (like Vercel or Netlify)." },
    { q: "What is an environment variable?", a: "A configuration value (like an API key) kept outside your code, usually in a .env file, so secrets are never committed to a repository." },
    { q: "Why separate frontend and backend into two services?", a: "It keeps concerns isolated, lets each be deployed and scaled independently, and mirrors how most production apps are structured." },
    { q: "What is zero-knowledge encryption?", a: "A design where a service encrypts data using a key derived only from something the user knows (like a password), so the service itself can never read the data -- even if compromised." },
    { q: "What's CORS?", a: "A browser security rule that blocks a webpage from making requests to a different domain unless that server explicitly allows it -- relevant whenever frontend and backend live on separate URLs." },
    { q: "What makes a project portfolio-ready?", a: "Clean structure, a README explaining setup, real security practices (not just a nice UI), and a working local run so anyone can try it." },
  ],
};

export const roadmapSections = [
  {
    title: "Frontend Development",
    summary: "Everything the user sees and clicks.",
    points: [
      "HTML & CSS: structure and style the page.",
      "JavaScript: make the page interactive.",
      "A framework (React, Vue, Svelte): manage UI as reusable components driven by state.",
      "Styling systems (Tailwind, CSS-in-JS): keep styling consistent and fast to write.",
      "State & data fetching: talk to a backend API and reflect results in the UI.",
    ],
  },
  {
    title: "Backend Development",
    summary: "The server logic users never see, but always rely on.",
    points: [
      "A runtime + framework (e.g. Node.js/Express): handle HTTP requests.",
      "Databases (SQL like SQLite/Postgres, or NoSQL like MongoDB): persist data.",
      "Authentication & authorization: verify who a user is, and what they're allowed to do.",
      "Security practices: hashing, encryption, rate limiting, input validation.",
      "APIs: expose clean, predictable endpoints for a frontend to consume.",
    ],
  },
  {
    title: "Becoming Full-Stack",
    summary: "Connecting both sides into one working product.",
    points: [
      "Build small full projects end-to-end (auth + a database-backed feature).",
      "Learn to read error messages across the stack, not just one layer.",
      "Get comfortable with Git/GitHub for version control and collaboration.",
      "Learn basic deployment: hosting a backend API and a static frontend build.",
      "Practice security thinking early: it's much harder to bolt on later.",
    ],
  },
];
