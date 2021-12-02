import { normalize } from 'eth-ens-namehash'
const sha3 = require('js-sha3').keccak_256
  
function decodeLabelhash(hash) {
    if (!(hash.startsWith('[') && hash.endsWith(']'))) {
      throw Error(
        'Expected encoded labelhash to start and end with square brackets'
      )
    }
  }
export function namehash(inputName) {
    let node = ''
    for (let i = 0; i < 32; i++) {
      node += '00'
    }
  
    if (inputName) {
      const labels = inputName.split('.')
  
      for (let i = labels.length - 1; i >= 0; i--) {
        let labelSha
        if (isEncodedLabelhash(labels[i])) {
          labelSha = decodeLabelhash(labels[i])
        } else {
          let normalisedLabel = normalize(labels[i])
          labelSha = sha3(normalisedLabel)
        }
        node = sha3(new Buffer(node + labelSha, 'hex'))
      }
    }
  
    return '0x' + node
  }

function isEncodedLabelhash(hash) {
    return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
  }
  

export function labelhash(unnormalisedLabelOrLabelhash) {
    return isEncodedLabelhash(unnormalisedLabelOrLabelhash)
      ? '0x' + decodeLabelhash(unnormalisedLabelOrLabelhash)
      : '0x' + sha3(normalize(unnormalisedLabelOrLabelhash))
  }