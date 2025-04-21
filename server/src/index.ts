import express, { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import "./firebase/firebase";
import authRoutes from "./routes/auth";
import socialRoutes from "./routes/social";
import popularGamesRoute from "./routes/game";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/popular-games", popularGamesRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/api/docs`);
});
