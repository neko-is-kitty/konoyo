const crypto = require('crypto')
const hyperswarm = require('hyperswarm')
const readline = require('readline')

// Init swarm
const swarm = hyperswarm()

console.log('Hello.')

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '->'
})

// Username variable
var username = () => {
  rl.setPrompt('@')
  rl.question('What shall your username be?', (answer) => {
    return answer
  })

  rl.clearLine()
}

const topic = () => {
  var buffer = crypto.createHash('sha256')
    .update('main')
    .digest()

  username()
  console.log('Waiting for peers.')
  return buffer
}

// Join and connect
swarm.join(topic(), {
  lookup: true,
  announce: true,
  queue: { forget: 300000 }
}, () => { console.log('Joined successfully! Waiting for connection.') })

const sd = () => {
  swarm.on('peer', (candidate) => {
    // Info on peer
    console.log(`Found a peer: (${candidate.host}, N° ${candidate.port}. Want to connect?)`)
    rl.resume()
    rl.on('line', (input) => {
      const answer = Array.from(input)

      switch (answer) {
        case answer.includes('Y' || 'Yes' || 'yes'):
          swarm.connect(candidate, (err, sock, meta) => {
            console.log('Connected.')
            if (err) { Error(err) }
          })
          break
        case answer.includes('N' || 'No' || 'no'):
          swarm.connect(candidate, (err, sock, meta) => {
            meta.backoff()
            console.log('Peer rejected.')
            if (err) { Error(err) }
          })
          break
      }
    })
  })

  swarm.on('connection', (sock, meta) => {
    sock.on('data', (data) => {
      rl.pause()
      console.log(data)
      rl.resume()
    })

    rl.on('line', (line) => {
      rl.pause()
      sock.write(line)
      rl.resume()
    })
  })
}

sd()
