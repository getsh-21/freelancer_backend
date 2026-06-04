const allowedOrigins = [
  'http://localhost:5173',
  'https://freelancer-frontend-nxvpep9j1-getsh-21s-projects.vercel.app'  // ← your vercel URL
];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: allowedOrigins }));