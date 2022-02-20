import { request, gql } from "graphql-request";
import mysql from "mysql";
import dotenv from "dotenv";
import util from "util";
dotenv.config();

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

const select = "SELECT MIN(TimeStamp) FROM AAVE_Accounts";

const result = await db.query(select).catch((err) => {
  console.log(err);
});

let lastTimeStamp = result[0]["MIN(TimeStamp)"];

let repays = gql`
  {
    repays(first: 25, where: { timestamp_lt: ${lastTimeStamp} }) {
      user {
        id
      }
      timestamp
      amount
      reserve {
        name
        symbol
        decimals
        liquidityRate
        price {
          priceInEth
        }
      }
    }
  }
`;

const borrows = gql`
  {
    borrows(first: 5) {
      user {
        id
      }
      timestamp
      amount
      reserve {
        name
        symbol
        decimals
        liquidityRate
        price {
          priceInEth
        }
      }
    }
  }
`;

const deposits = gql`
  {
    deposits(first: 5) {
      user {
        id
      }
      timestamp
      amount
      reserve {
        name
        symbol
        decimals
        liquidityRate
        price {
          priceInEth
        }
      }
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
