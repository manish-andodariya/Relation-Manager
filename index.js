const express = require("express");
var cors = require("cors");
const { json } = require("express");
var app = express();

var port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*******
 * App Logic
 */

let users = ["Manish"].slice();
let relationType = ["Brother", "Sister", "Friend", "Mother", "Father"].slice();
let relations = [];
let relationDetails = [];

/***********
 *Main Function
 */

function checkRelation(u1, u2) {
  let res;
  try {
    //the graph
    const adjcentList = new Map();

    //Add-node
    function addNode(users) {
      adjcentList.set(users, []);
    }

    //Add edge
    function addEdge(p1, p2) {
      adjcentList.get(p1).push(p2);
      adjcentList.get(p2).push(p1);
    }

    //create graph
    users.forEach(addNode);
    relations.forEach((route) => addEdge(...route));

    // console.log(adjcentList);

    // BFS implimentation
    function bfs(start, end) {
      const visited = new Set();

      const queue = [start];
      let found = false;

      try {
        while (!found) {
          const user = queue.shift(); // mutates the queue

          const destinations = adjcentList.get(user);
          visited.add(user);

          for (const destination of destinations) {
            if (destination === end) {
              // console.log(`Relation Found on ` + user);
              visited.add(destination);
              found = true;
            }

            if (!visited.has(destination)) {
              visited.add(destination);
              queue.push(destination);
            }
          }
        }
        // console.log(visited);
        let visitedArray = [...visited];
        return { visitedArray, found };
      } catch (error) {
        // console.log("no Found");
        return { found };
      }
    }
    res = bfs(u1, u2);
  } catch (error) {
    res = { found: false };
  }
  return res;
}
let out = checkRelation("Manish", "Janvi");
// console.log(out);

/*********end logic */

/************
 * get request for list of available users
 */
app.get("/users", (req, res) => {
  // console.log({ users, relationType });
  res.send({ users, relationType });
});

/**************
 * Post request for New User Add
 */
app.post("/adduser", (req, res) => {
  let newuser = req.body.text;
  // console.log(newuser);
  let isUser = users.includes(newuser);
  if (!isUser) {
    users.push(newuser);
    res.send({ msg: "Added Successfully", user: users });
  } else {
    res.send({ msg: "Already Exists" });
  }
});

/**************
 * Post request for New Relation Add
 */
app.post("/addrelation", (req, res) => {
  let newRelation = req.body;
  let person1 = req.body.p1;
  let person2 = req.body.p2;
  let relat = req.body.r;
  let relat2 = [person1, person2];
  let relateMsg = `${person1} is ${relat} of ${person2}`;
  let isAlready = relationDetails.includes(relateMsg);
  if (!isAlready) {
    relationDetails.push(relateMsg);
    relations.push(relat2);
    // console.log(relations, relationDetails);
    res.send({ msg: "Added Successfully", relation: relateMsg });
  } else {
    res.send({ msg: "Already Exists" });
  }
});

/****************
 * Post request for relation tracker
 */
app.post("/trackrelation", async (req, res) => {
  let trackpath = await req.body;
  let person1 = await req.body.p1;
  let person2 = await req.body.p2;
  // console.log(person1, person2);
  let link = checkRelation(person1, person2);
  // console.log(link);
  res.send(link);
});

app.listen(port, () => console.log(`App Running On Port No ${port}`));
