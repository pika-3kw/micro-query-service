const express = require("express");

const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let posts = [];

app.get(/^\/$/, (req, res) => {
  res.send("Query Service");
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

const handleEvent = (type, data) => {
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
    const { _id, postId, content, status } = data;
    const comment = { _id, postId, content, status };
    const postIdx = posts.findIndex((post) => post._id === postId);

    if (postIdx >= 0) {
      posts[postIdx].comments.push(comment);
    }
  }

  if (type === "CommentUpdated") {
    const { _id, postId, content, status } = data;
    const comment = { _id, postId, content, status };
    const postIdx = posts.findIndex((post) => post._id === postId);

    if (postIdx >= 0) {
      const commentIdx = posts[postIdx].comments.findIndex(
        (comment) => comment._id === _id
      );

      posts[postIdx].comments[commentIdx] = comment;
    }
  }
};

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.json({});
});

app.listen(4003, async () => {
  console.log("Query Service in running at 4003");

  const res = await axios.get("hhttp://event-bus-srv:4000/events");

  const events = res.data;

  for (let event of events) {
    const { type, data } = event;

    console.log("Processing event: ", type);

    handleEvent(type, data);
  }
});
