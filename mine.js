const { createHash } = require('crypto');
const incstr = require('incstr');

function makeHash(string) {
  return createHash('sha256').update(string).digest('hex');
}

let postfix = "";
let hash = "";
do {
  postfix = incstr(postfix);
  hash = makeHash("zero2hero+"+postfix);

  console.log('zero2hero+'+postfix+" = "+hash);
}
while(!hash.startsWith("00000"));

console.log("\nFound! Hash: "+hash);
