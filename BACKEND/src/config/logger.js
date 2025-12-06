const morgan = require("morgan");

const customMorganFormat = (tokens, req, res) => {
  const method = tokens.method(req, res);
  const statusStr = tokens.status(req, res) || "000";
  const statusCode = Number(statusStr);
  const url = tokens.url(req, res);
  const responseTime = tokens["response-time"](req, res) + " ms";

  const ip = req.ip || req.connection.remoteAddress || "-";

  const statusColor =
    statusCode >= 500
      ? "red"
      : statusCode >= 400
        ? "yellow"
        : statusCode >= 300
          ? "cyan"
          : "green";

  return [
    ip.gray,
    (method || "-").green,
    url,
    statusStr[statusColor],
    responseTime.yellow,
  ].join(" ");
};

module.exports = morgan(customMorganFormat);
