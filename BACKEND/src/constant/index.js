const REGEX = {
  email: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
  mobile: /^(?:\+91[-\s]?)?[6-9]\d{9}$/,
};

const RFP_STATUS = {
  created: "created",
  sent: "sent",
  responseReceived: "response_received",
};

const ENUM = {
  status: [RFP_STATUS.created, RFP_STATUS.sent, RFP_STATUS.responseReceived],
};

module.exports = { REGEX, RFP_STATUS, ENUM };
