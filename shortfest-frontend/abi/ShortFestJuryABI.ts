// Auto-generated file - do not edit manually
export const ShortFestJuryABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ZamaProtocolUnsupported",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "authorizedAddress",
        "type": "address"
      }
    ],
    "name": "DecryptionAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "director",
        "type": "string"
      }
    ],
    "name": "FilmAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "JurorAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "JurorRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "filmIds",
        "type": "uint256[]"
      }
    ],
    "name": "ResultsPublished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "jurorCount",
        "type": "uint16"
      }
    ],
    "name": "ScoresAggregated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "encryptedThreshold",
        "type": "bytes"
      }
    ],
    "name": "ThresholdSet",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "director",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "duration",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "submissionHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      }
    ],
    "name": "addFilm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "addJuror",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      }
    ],
    "name": "aggregateFilmScores",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "aggregatedScores",
    "outputs": [
      {
        "internalType": "euint16",
        "name": "sumNarrative",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "sumCinematography",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "sumSound",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "sumEditing",
        "type": "bytes32"
      },
      {
        "internalType": "uint16",
        "name": "jurorCount",
        "type": "uint16"
      },
      {
        "internalType": "bool",
        "name": "isAggregated",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      }
    ],
    "name": "allowOrganizerDecrypt",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "titles",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "directors",
        "type": "string[]"
      },
      {
        "internalType": "uint16[]",
        "name": "durations",
        "type": "uint16[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "submissionHashes",
        "type": "bytes32[]"
      },
      {
        "internalType": "string[]",
        "name": "metadatas",
        "type": "string[]"
      }
    ],
    "name": "batchAddFilms",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "_jurors",
        "type": "address[]"
      }
    ],
    "name": "batchAddJurors",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "filmIds",
        "type": "uint256[]"
      }
    ],
    "name": "batchAggregate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "filmIds",
        "type": "uint256[]"
      }
    ],
    "name": "batchAllowDecrypt",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      }
    ],
    "name": "checkQualification",
    "outputs": [
      {
        "internalType": "ebool",
        "name": "narrativeQualified",
        "type": "bytes32"
      },
      {
        "internalType": "ebool",
        "name": "cinematographyQualified",
        "type": "bytes32"
      },
      {
        "internalType": "ebool",
        "name": "soundQualified",
        "type": "bytes32"
      },
      {
        "internalType": "ebool",
        "name": "editingQualified",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confidentialProtocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "filmCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "filmScores",
    "outputs": [
      {
        "internalType": "euint16",
        "name": "narrative",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "cinematography",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "sound",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "editing",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "commentHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "films",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "director",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "duration",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "submissionHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllQualifiedFilms",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "filmId",
            "type": "uint256"
          },
          {
            "internalType": "uint16",
            "name": "avgNarrative",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "avgCinematography",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "avgSound",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "avgEditing",
            "type": "uint16"
          },
          {
            "internalType": "uint256",
            "name": "publishedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct ShortFestJury.PublicResult[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      }
    ],
    "name": "getFilm",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "director",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "duration",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "submissionHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJurorCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJurors",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getQualifiedFilm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "director",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "avgNarrative",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgCinematography",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgSound",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgEditing",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "publishedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getQualifiedFilmsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      }
    ],
    "name": "getScoreCount",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalFilms",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasScored",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isJuror",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "isQualified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "jurorList",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "jurors",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "filmIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint16[]",
        "name": "avgNarratives",
        "type": "uint16[]"
      },
      {
        "internalType": "uint16[]",
        "name": "avgCinematographies",
        "type": "uint16[]"
      },
      {
        "internalType": "uint16[]",
        "name": "avgSounds",
        "type": "uint16[]"
      },
      {
        "internalType": "uint16[]",
        "name": "avgEditings",
        "type": "uint16[]"
      }
    ],
    "name": "publishQualifiedFilms",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "qualificationThreshold",
    "outputs": [
      {
        "internalType": "euint16",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "qualifiedFilms",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "avgNarrative",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgCinematography",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgSound",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "avgEditing",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "publishedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "removeJuror",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "scoreCount",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint16",
        "name": "inputThreshold",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "setQualificationThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "filmId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint16",
        "name": "inputNarrative",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint16",
        "name": "inputCinematography",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint16",
        "name": "inputSound",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint16",
        "name": "inputEditing",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "commentHash",
        "type": "bytes32"
      }
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "thresholdSet",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
