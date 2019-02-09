'use strict';

const simpleParser = require('mailparser').simpleParser;

module.exports = async ({ message }) => {
  const parsed = await simpleParser(message);

  return {
    Subject: parsed.subject,
    From: {
      Name: parsed.from.value[0].name,
      Address: parsed.from.value[0].address,
    },
  };
};
