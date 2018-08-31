const axios = require('axios');
const cheerio = require('cheerio');

const checkBitcointalk = async profileId => {
  const profile = await axios.get(
    `https://bitcointalk.org/index.php?action=profile;u=${profileId}`
  );

  const $ = cheerio.load(profile.data);

  const signature = $('.signature').html(); //get signature
  const name = $('.windowbg>table tr:nth-child(1) td:last-child').html(); //get name
  const rank = $('.windowbg>table tr:nth-child(2) td:last-child').html(); //get rank
  const posts = $('.windowbg>table tr:nth-child(5) td:last-child').html(); //get post

  console.log('name: ' + name);
  console.log('rank: ' + rank);
  console.log('posts: ' + posts);
  //console.log(signature);

  // Check if signature has a substring which is the company name
  const hasSignature = /bitblender/.test(signature);

  // Check if 2 signatures are the same
  //const sameSignature = signature.toString() === hawkingSignature.toString();

  console.log(profileId + ' has the same signature: ' + hasSignature);
};

checkBitcointalk(99165).catch(e => console.log(e));
