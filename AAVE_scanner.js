import { request, gql } from "graphql-request";

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
    repays(first: 5) {
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

request(
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
  borrows
).then((data) => console.log(data));

request(
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
  deposits
).then((data) => console.log(data));

request(
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
  repays
).then((data) => console.log(data));
