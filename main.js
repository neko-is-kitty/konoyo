const crypto = require('crypto');
const defaults = require('dat-swarm-defaults');
const readline = require('readline');
const Swarm = require('discovery-swarm');

let rl

// Sending messages
const askUser = async () => {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  
    rl.question('Send message: ', message => {
      // Broadcast to peers
      for (let id in peers) {
        peers[id].con.write(message)
      }
      rl.close()
      rl = undefined
      askUser()
    });
  }
  

// ID
const ID = `AM${crypto.randomBytes(32).toString('hex')}`

// Connect to peer
const sw = Swarm(defaults({id: ID}));

async () => {
    sw.listen()

    sw.join('general')

    sw.on('connection', function(con, info) {
        console.log('Connected!')

        con.on('data', data => {
            console.log(`${info.peerId} — ${data.toString()}`)
        })
    })
}