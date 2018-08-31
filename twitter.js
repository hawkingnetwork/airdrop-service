const twitter = require('twitter');
const fs = require('fs');

const config = require('./config');
const Twitter = new twitter(config);

const OUTPUT_FILE = 'twitter_output.txt';
const outputStream = fs.createWriteStream(OUTPUT_FILE);

// Check whether target_user follows source_user
// https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-friendships-show
const checkFriendship = params => {
  Twitter.get('friendships/show', params, (err, data, response) => {
    if (!err) {
      console.log(
        `${params.target_screen_name} FOLLOWS ${params.source_screen_name}: ${
          data.relationship.target.following
        }`
      );
    } else {
      console.log(err);
    }
  });
};

// Get the list of users following the specified user
// https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-list
const getFollowers = (params, count) => {
  Twitter.get('followers/list', params, (err, data, response) => {
    if (!err) {
      //console.log(data);
      for (var i = 0; i < data.users.length - 1; i++) {
        outputStream.write(
          count +
            ' name: ' +
            data.users[i].name +
            ', screen_name: ' +
            data.users[i].screen_name +
            ', user_id: ' +
            data.users[i].id +
            ', followers: ' +
            data.users[i].followers_count +
            '\n'
        );
        count++;
      }
      if (data.next_cursor != 0) {
        params.cursor = data.next_cursor;
        getFollowers(params, count);
      }
    } else {
      console.log(err);
    }
  });
};

// Search all tweets/comments that contains params.q - query string
// Return userID, name, tweet/comment content
// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
const searchTweet = params => {
  Twitter.get('search/tweets', params, (err, data, response) => {
    if (!err) {
      //console.log(data);
      for (var i = 0; i < data.statuses.length - 1; i++) {
        console.log(data.statuses[i].user.name);
      }
    } else {
      console.log(err);
    }
  });
};

//params for checkFriendship
const params1 = {
  source_screen_name: 'HawkingNetwork',
  target_screen_name: 'tien46957035'
};

//params for getFollowers
const params2 = {
  screen_name: 'anitdas',
  count: '200'
};

//params for searchTweet
const params3 = {
  q: 'Hawking Network'
};

checkFriendship(params1);
getFollowers(params2, 1);
searchTweet(params3);
