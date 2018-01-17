"use strict";
const AWS = require("aws-sdk");
const Sequelize = require("sequelize");

const RdsSigner = new AWS.RDS.Signer();
const token = RdsSigner.getAuthToken({
  region: "ap-northeast-1",
  username: process.env.DB_USER || "migrator",
  hostname:
    process.env.DB_HOST ||
    "msp-dev-database-rdscluster-mo9ij14anj9n.cluster-ca61ppcgmuds.ap-northeast-1.rds.amazonaws.com",
  port: 3306
});

console.log("TOKEN:", token);

const sequelize = new Sequelize(
  process.env.DB_NAME || "msp_dev",
  process.env.DB_USER || "migrator",
  token,
  {
    dialect: "mysql",
    dialectOptions: {
      host:
        process.env.DB_HOST ||
        "msp-dev-database-rdscluster-mo9ij14anj9n.cluster-ca61ppcgmuds.ap-northeast-1.rds.amazonaws.com",
      ssl: "Amazon RDS",
      authSwitchHandler: (data, cb) => {
        if (data.pluginName === "mysql_clear_password") {
          // https://dev.mysql.com/doc/internals/en/clear-text-authentication.html
          const buffer = Buffer.from(token + "\0");
          cb(null, buffer);
        }
      }
    }
  }
);

(async () => {
  return await sequelize.databaseVersion();
})()
  .then(res => {
    console.log(res);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
