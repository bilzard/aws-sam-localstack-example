const { simpleParser } = require('mailparser');

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
