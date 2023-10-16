import assert from "node:assert";
import test from "node:test";
import Imap from "node-imap";

import maddy, { maddyCmd, createUser } from "maddy-dist"

const getInbox = () => new Promise((res, rej) => {
  var imap = new Imap({
    user: 'postmaster@localhost',
    password: 'test',
    host: 'localhost',
    port: 1993,
    tls: false
  });
  imap.once('ready', function () {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) rej(err)
      imap.end()
      res(box)
    })
  })

  imap.once('error', function (err) {
    rej(err)
  })

  imap.once('end', function () {
    console.log('Connection ended')
  })

  imap.connect()
})

test("Server startup", async () => {
  const server = await maddy()
  await createUser('postmaster@localhost', 'test')
  maddyCmd('imap-acct', 'create', 'postmaster@localhost')
  const box = await getInbox()
  assert(box.name === 'INBOX')
  // Wait for imap to have ended its session to avoid a conn reset
  await new Promise(res => setTimeout(() => res(), 10))
  server.stop();
})
