const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let posts = [];

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  if (type === "PostCreated") {
    const { _id, title, content } = data;

    const post = {
      _id,
      title,
      content,
      comments: [],
    };

    posts.push(post);
  }

  if (type === "CommentCreated") {
    const { _id, postId, content } = data;
    const comment = { _id, postId, content };
    const postIdx = posts.findIndex((post) => post._id === postId);

    if (postIdx >= 0) {
      posts[postIdx].comments.push(comment);
    }
  }

  res.json({});
});

app.listen(4003, () => {
  console.log("Query Service in running at 4003");
});
