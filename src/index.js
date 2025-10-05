import express from 'express';
import "dotenv/config";
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { connectDB } from './lib/db.js';



const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: ["http://localhost:8081", "http://localhost:3000"], // frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use('/api/auth',authRoutes)
app.use('/api/books',bookRoutes)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});