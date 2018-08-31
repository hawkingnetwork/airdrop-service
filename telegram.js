const { MTProto } = require('telegram-mtproto');
const { Storage } = require('mtproto-storage-fs');
const readline = require('readline');
const fs = require('fs');

// The api_id and api_hash values can be obtained here: https://my.telegram.org/
const config = {
  phone_number: '+',
  api_id: 33,
  api_hash: ''
};

const OUTPUT_FILE = 'telegram_output.txt';
const outputStream = fs.createWriteStream(OUTPUT_FILE);

// CHANNEL_ID and ACCESS_HASH can be obtained in the channel
// Each user has the unique ACCESS_HASH!!!
const CHANNEL_ID = 131;
const ACCESS_HASH = '131';

const app = {
  storage: new Storage('./storage.json')
};

const phone = {
  num: config.phone_number
};

const api = {
  layer: 57,
  initConnection: 0x69796de9,
  api_id: config.api_id
};

const server = {
  dev: false
};

const inputChannel = {
  _: 'inputChannel',
  channel_id: CHANNEL_ID,
  access_hash: ACCESS_HASH
};

const client = MTProto({ server, api, app });

// This function will stop execution of the program until you enter the code
// that is sent via SMS or Telegram.
const askForCode = () => {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Please enter passcode for ' + phone.num + ': ', num => {
      rl.close();
      resolve(num);
    });
  });
};

// First you will receive a code via SMS or Telegram, which you have to enter
// directly in the command line. If you entered the correct code, you will be
// logged in and the credentials are saved.
const login = async (client, phone) => {
  const { phone_code_hash } = await client('auth.sendCode', {
    phone_number: phone.num,
    current_number: true,
    api_id: config.api_id,
    api_hash: config.api_hash
  });

  const phone_code = await askForCode();
  console.log(`Your code: ${phone_code}`);

  const { user } = await client('auth.signIn', {
    phone_number: phone.num,
    phone_code_hash: phone_code_hash,
    phone_code: phone_code
  });

  console.log('signed as ', user);
};

const getDialogs = async () => {
  const dialogs = await client('messages.getDialogs', {
    limit: 100
  });
  console.log('dialogs', dialogs);
};

// Get the list of all users in the channel
const getUsers = async () => {
  let cycles;
  let counter = 0;
  let totalUsers = [];

  do {
    const { users, count } = await client('channels.getParticipants', {
      channel: inputChannel,
      filter: { _: 'channelParticipantsRecent' },
      offset: counter * 200,
      limit: 200
    });

    counter++;

    if (cycles == null) {
      console.log(`${count} users.`);
      cycles = Math.ceil(count / 200);
    }

    console.log(`Completed ${((counter / cycles) * 100).toFixed(2)}%`);

    totalUsers = totalUsers.concat(users);
    users.forEach(user => {
      outputStream.write(
        user.first_name + ', ' + user.last_name + ', ' + user.username + '\n'
      );
    });
  } while (counter < cycles);
  console.log(totalUsers);
  return totalUsers;
};

// First check if we are already signed in (if credentials are stored). If we
// are logged in, execution continues, otherwise the login process begins.
(async () => {
  if (!(await app.storage.get('signedin'))) {
    console.log('not signed in');

    await login(client, phone).catch(console.error);

    console.log('signed in successfully');
    app.storage.set('signedin', true);
  } else {
    console.log('already signed in');
  }

  //getDialogs();
  await getUsers();

  outputStream.on('finish', () => process.exit());
  outputStream.end();
})();
