module.exports = {
  command: 'echo',
  description: 'Returns the specified arguments.',
  usage: '{c} [ ...arguments ]',
  old: false,
  args: [ { name: 'text',
    description: 'The text to echo.',
    type: 3 } ],
  // eslint please just shut up idk how to do this better
  // eslint-disable-next-line no-unused-vars
  executor: (args, context) => ({
    send: false,
    result: args[0].value
  })
};
