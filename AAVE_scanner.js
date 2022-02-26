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
    repays(first: 1000, where: { timestamp_gt: ${lastTimeStamp} }) {
      user {
        id
      }
      timestamp
    }
  }
`;

  let borrows = gql`
  {
    borrows(first: 1000, where: {timestamp_gt: ${lastTimeStamp}}) {
      user {
        id
      }
      timestamp
    }
  }
`;

  let deposits = gql`
  {
    deposits(first: 1000, where: {timestamp_gt: ${lastTimeStamp}}) {
      user {
        id
      }
      timestamp
    }
  }
`;

  let userReserve = gql`
    {
      userReserves(
        where: { user: "0x94ee9c600870c4199a1af8496eeb3087f2d1c32f" }
      ) {
        scaledATokenBalance
        reserve {
          id
          underlyingAsset
          name
          symbol
          decimals
          liquidityRate
          reserveLiquidationBonus
          lastUpdateTimestamp
          aToken {
            id
          }
        }
        usageAsCollateralEnabledOnUser
        stableBorrowRate
        stableBorrowLastUpdateTimestamp
        principalStableDebt
        scaledVariableDebt
        variableBorrowIndex
        lastUpdateTimestamp
      }
    }
  `;

  let reserveData = gql`
    {
      reserves(first: 1000) {
        id
        underlyingAsset
        name
        symbol
        decimals
        isActive
        isFrozen
        usageAsCollateralEnabled
        borrowingEnabled
        stableBorrowRateEnabled
        baseLTVasCollateral
        optimalUtilisationRate
        averageStableRate
        stableRateSlope1
        stableRateSlope2
        baseVariableBorrowRate
        variableRateSlope1
        variableRateSlope2
        variableBorrowIndex
        variableBorrowRate
        totalScaledVariableDebt
        liquidityIndex
        reserveLiquidationThreshold
        aToken {
          id
        }
        vToken {
          id
        }
        sToken {
          id
        }
        availableLiquidity
        stableBorrowRate
        liquidityRate
        totalPrincipalStableDebt
        totalLiquidity
        utilizationRate
        reserveLiquidationBonus
        price {
          priceInEth
        }
        lastUpdateTimestamp
        stableDebtLastUpdateTimestamp
        reserveFactor
      }
    }
  `;

  let getUsdPriceEth = gql`
    {
      priceOracle(id: "1") {
        usdPriceEth
      }
    }
  `;

  const insert =
    "INSERT INTO AAVE_Accounts (AccountHash, TimeStamp) VALUES ? ON DUPLICATE KEY UPDATE TimeStamp = VALUES(TimeStamp)";

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

  request(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    getUsdPriceEth
  ).then((data) => {
    console.log((1 / data["priceOracle"]["usdPriceEth"]) * 10 ** 18);
  });

  console.log("Waiting for next Check...");
  await new Promise((r) => setTimeout(r, 60000));
}
