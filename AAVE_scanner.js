import { request, gql } from "graphql-request";

const recursiveLog = (object) => {
  for (key in object) {
    let value = object[key];
    if (typeof value === "object") {
      console.log("{");
      recursiveLog(value);
      console.log("}");
    } else {
      console.log(value);
    }
  }
};

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

const repays = gql`
  {
    repays(first: 100) {
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

// request(
// "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
// borrows
// ).then((data) => recursiveLog(data));

// request(
// "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
// deposits
// ).then((data) => recursiveLog(data));

request(
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
  repays
).then((data) => {
  let repays = data["repays"];
  for (const transactions in repays) {
    console.log(repays[transactions].user.id);
    console.log(repays[transactions].timestamp);
    console.log(repays[transactions].reserve.symbol);
  }
});
