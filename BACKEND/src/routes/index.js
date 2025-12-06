const proposalRouter = require("./proposal.route");
const rfpRouter = require("./rfp.route");
const vendorRouter = require("./vendor.route");

const routes = [
  { path: "rfp", route: rfpRouter },
  { path: "vendor", route: vendorRouter },
  { path: "proposal", route: proposalRouter },
];

module.exports = (app) => {
  routes.forEach(({ path, route }) => app.use(`/api/${path}`, route));
};
