const { API } = require('powercord/entities');
const { getModule, messages: { receiveMessage } } = require('powercord/webpack');
const { createBotMessage } = getModule([ 'createBotMessage' ], false);
const { messages: { sendMessage } } = require('powercord/webpack');
const { BOT_AVATARS } = getModule([ 'BOT_AVATARS' ], false);
BOT_AVATARS.powercord = 'https://cdn.discordapp.com/attachments/552938674837258242/742181722254475424/powercord.png';


function _sendMessage (context, res) {
  if (res.send) {
    return sendMessage(context.channel.id, { content: res.result }, null, {});
  }

  const msg = createBotMessage({ channelId: context.channel.id,
    content: '' });
  msg.author.username = res.username || 'Powercord';
  msg.author.avatar = 'powercord';

  if (res.avatar_url) {
    BOT_AVATARS[res.username] = res.avatar_url;
    msg.author.avatar = res.username;
  }

  if (typeof res.result === 'string') {
    msg.content = res.result;
  } else {
    msg.embeds.push(res.result);
  }
  receiveMessage(context.channel.id, msg);
  delete BOT_AVATARS[res.avatar_url];
}

function _createCommand (name, description, options, callback, old = false, applicationId = '-1') {
  getModule([ 'getBuiltInCommands' ], false).BUILT_IN_COMMANDS.push({
    applicationId,
    description,
    displayDescription: description,
    displayName: name,
    execute: (args, context) => {
      // eslint i invoke your silence
      /* eslint-disable callback-return */
      const res = !old
        ? callback(args, context)
        : callback(args[0].split(' '));
      // ok you can return now
      /* eslint-enable callback-return */
      if (res) {
        return _sendMessage(context, res);
      }
    },
    id: `-${Math.floor(Math.random() * 10000000000000000)}`,
    inputType: 0,
    name,
    options: old
      ? [ {
        name: 'args',
        displayName: 'args',
        type: 3,
        description: '',
        displayDescription: ''
      } ]
      : options ?? [],
    type: 1
  });
}

function _removeCommand (name) {
  const cmds = getModule([ 'getBuiltInCommands' ], false).BUILT_IN_COMMANDS;
  cmds.pop(cmds.indexOf(cmds.find(i => i.name.toLowerCase() === name.toLowerCase())));
}

/**
 * @typedef PowercordChatCommand
 * @property {String} command Command name
 * @property {Object[]} args Command arguments
 * @property {String} description Command description
 * @property {String} usage Command usage
 * @property {Function} executor Command executor
 * @property {Boolean} old Should be set to false, provides a single argument as an array of strings
 */

/**
 * Powercord chat commands API
 * @property {Object.<String, PowercordChatCommand>} commands Registered commands
 * @property {Boolean} active If the API is active
 */
class CommandsAPI extends API {
  constructor () {
    super();
    this._active = false;

    this.commands = {};
  }

  get active () {
    return this._active;
  }

  set active (value) {
    this._active = value;
    if (!value) {
      for (const name of Object.keys(this.commands)) {
        _removeCommand(name);
      }
    } else {
      for (const name of Object.keys(this.commands)) {
        _createCommand(name, this.commands[name].description, this.commands[name].args, this.commands[name].executor);
      }
    }
  }

  get prefix () {
    return powercord.settings.get('prefix', '.');
  }

  get find () {
    const arr = Object.values(this.commands);
    return arr.find.bind(arr);
  }

  get filter () {
    const arr = Object.values(this.commands);
    return arr.filter.bind(arr);
  }

  get map () {
    const arr = Object.values(this.commands);
    return arr.map.bind(arr);
  }

  get sort () {
    const arr = Object.values(this.commands);
    return arr.sort.bind(arr);
  }

  /**
   * Registers a command
   * @param {PowercordChatCommand} command Command to register
   */
  registerCommand (command) {
    // @todo: remove this once there's a proper implemention (if any) for fetching the command origin.
    // const stackTrace = (new Error()).stack;
    // const [ , origin ] = stackTrace.match(new RegExp(`${global._.escapeRegExp(powercord.pluginManager.pluginDir)}.([-\\w]+)`));
    // im not sure what the use of the above code is, and im getting errors from it when registering command in console
    // so i'm just gonna comment it out for now.

    if (typeof command === 'string') {
      console.error('no');
      return;
    }
    if (this.commands[command.command]) {
      throw new Error(`Command ${command.command} is already registered!`);
    }

    this.commands[command.command] = {
      ...command,
      origin
    };

    if (!this.active) {
      return;
    }
    _createCommand(
      command.command,
      command.description,
      command.args ?? [],
      command.executor,
      command.old ?? true);
  }

  /**
   * Unregisters a command
   * @param {String} command Command name to unregister
   */
  unregisterCommand (command) {
    if (this.commands[command]) {
      _removeCommand(command);
      if (!this.active) {
        return;
      }
      delete this.commands[command];
    }
  }
}

module.exports = CommandsAPI;
