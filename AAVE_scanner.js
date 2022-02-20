import { request, gql } from "graphql-request";
import mysql from "mysql";
import dotenv from "dotenv";
import util from "util";
dotenv.config();

// timeout = () => {
//   return new Promise(resolve => setTimeout(resolve, 60))
// }

const db = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DBUSER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.query = util.promisify(db.query).bind(db);

db.connect(async (err) => {
  if (err) throw err;
  console.log("Connected!");
});

const select = "SELECT MAX(TimeStamp) FROM AAVE_Accounts";

while (true) {
  let result = await db.query(select).catch((err) => {
    console.log(err);
  });

  let lastTimeStamp = result[0]["MAX(TimeStamp)"];
  if (lastTimeStamp == null) {
    lastTimeStamp = ~~(new Date().getTime() / 1000);
  }
  console.log(lastTimeStamp);

  let repays = gql`
  {
    repays(first: 100, where: { timestamp_gt: ${lastTimeStamp} }) {
      user {
        id
      }
      timestamp
    }
  }
`;

  let borrows = gql`
  {
    borrows(first: 100, where: {timestamp_gt: ${lastTimeStamp}}) {
      user {
        id
      }
      timestamp
    }
  }
`;

  let deposits = gql`
  {
    deposits(first: 100, where: {timestamp_gt: ${lastTimeStamp}}) {
      user {
        id
      }
      timestamp
    }
  }
`;

  const insert = "INSERT INTO AAVE_Accounts (AccountHash, TimeStamp) VALUES ?";

  request(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    repays
  ).then((data) => {
    let repays = data["repays"];
    for (const transactions in repays) {
      let values = [
        [repays[transactions].user.id, repays[transactions].timestamp],
      ];

      db.query(insert, [values], (err, result) => {
        try {
          if (err) throw err;
          console.log(values[0][0] + " inserted");
        } catch (err) {
          console.log("Skipping duplicate record...");
        }
      });
    }
  });

  request(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    borrows
  ).then((data) => {
    let repays = data["repays"];
    for (const transactions in repays) {
      let values = [
        [repays[transactions].user.id, repays[transactions].timestamp],
      ];

      db.query(insert, [values], (err, result) => {
        try {
          if (err) throw err;
          console.log(values[0][0] + " inserted");
        } catch (err) {
          console.log("Skipping duplicate record...");
        }
      });
    }
  });

  request(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    deposits
  ).then((data) => {
    let repays = data["repays"];
    for (const transactions in repays) {
      let values = [
        [repays[transactions].user.id, repays[transactions].timestamp],
      ];

      db.query(insert, [values], (err, result) => {
        try {
          if (err) throw err;
          console.log(values[0][0] + " inserted");
        } catch (err) {
          console.log("Skipping duplicate record...");
        }
      });
    }
  });

  console.log("Waiting for next Check...");
  await new Promise((r) => setTimeout(r, 60000));
}
