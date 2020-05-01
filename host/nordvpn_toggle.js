#!/home/zackmcginnis/.nvm/versions/node/v13.12.0/bin/node

// Might be good to use an explicit path to node on the shebang line
// in case it isn't in PATH when launched by Chrome

require('dotenv').config()
const { exec } = require("child_process");

const nativeMessage = require('./transform');
const input = new nativeMessage.Input();
const transform = new nativeMessage.Transform(messageHandler);
const output = new nativeMessage.Output();

const CONNECT_COMMAND = `nordvpn connect`
const DISCONNECT_COMMAND = `nordvpn disconnect`
const STATUS_COMMAND = `nordvpn status`
const LOGIN_PROMPT = `Please enter your login details`
const ENTER_CREDENTIALS = 'ENTER_CREDENTIALS'

process.stdin
    .pipe(input)
    .pipe(transform)
    .pipe(output)
    .pipe(process.stdout)
;

async function messageHandler(msg, push, done) {
    const receivedMessage = msg.message 
    let command;
    let responseMessage;

    switch (receivedMessage) {
        case 'connect':
            command = CONNECT_COMMAND
            responseMessage = 'connected'
            break;
        case 'disconnect':
            command = DISCONNECT_COMMAND
            responseMessage = 'disconnected'
            break;
        case 'status':
            command = STATUS_COMMAND
            responseMessage = 'status'
            break;
        default:
            break;
    }

    try {
        // execute command on user's machine
        const cmd = await issueCommand(command)

        if(command == CONNECT_COMMAND) {
            cmd.stdout.on('data', async (dataBuffer) => {
                const data = dataBuffer.toString();
                if(data.includes(LOGIN_PROMPT)) {
                    push({ message: ENTER_CREDENTIALS});
                }
            })
            cmd.stderr.on('data', (err) => {
                push({ message: err, err});
            });

            // cmd.on('close', (code) => {
            //     push({ message: code, code});
            // });
        }

        push({ message: responseMessage, output: cmd});
        done();
    } catch (err) {
        push({ message: err, extra: {}});
        done();
    }
}

async function issueCommand(command){
    return new Promise( async (resolve, reject) => {
        const nordvpn = await exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            if (stderr) {
                reject(stderr)
            }

            if(command == STATUS_COMMAND) {
                resolve(stdout)
            }
        })
        if(command == CONNECT_COMMAND) {
            resolve(nordvpn)
        } else if (command == DISCONNECT_COMMAND) {
            resolve(null)
        }
    })
}

async function loginWithCredentials(push) {
    const nordvpn = await exec(CONNECT_COMMAND, (error, stdout, stderr) => {
        if (error) {
            push({ message: 'error in login process', error});
            reject(error)
        }
        if (stderr) {
            push({ message: 'stderr in login process', stderr});
            reject(stderr)
        }

        if (stdout) {
            push({ message: stdout, stdout});
        }
    })
    push({ message: 'about to enter credentials'});
    nordvpn.stdin.write(`${process.env.NORDVPN_USERNAME}`)
    nordvpn.stdin.write(`${process.env.NORDVPN_PASSWORD}`)
    push({ message: 'entered credentials'});
}