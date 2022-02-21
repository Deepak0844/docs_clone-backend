import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Document from "./models/Document.js";

dotenv.config();
//DB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected to db"))
  .catch((err) => console.log(err));

//socket io
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://docs-clone-9b983.web.app",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT;
io.listen(PORT);

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data }); //save the document in db
    });
  });
  console.log("socket-connected");
});

//creating id and get document by id
async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id });
}
