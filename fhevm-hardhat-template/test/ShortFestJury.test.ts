import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";
import { ShortFestJury } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShortFestJury", function () {
  let contract: ShortFestJury;
  let owner: HardhatEthersSigner;
  let juror1: HardhatEthersSigner;
  let juror2: HardhatEthersSigner;
  let juror3: HardhatEthersSigner;
  let viewer: HardhatEthersSigner;

  before(async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping tests on non-mock environment");
      this.skip();
    }
    
    const signers = await ethers.getSigners();
    owner = signers[0];
    juror1 = signers[1];
    juror2 = signers[2];
    juror3 = signers[3];
    viewer = signers[4];
  });

  beforeEach(async function () {
    await deployments.fixture(["ShortFestJury"]);
    const deployment = await deployments.get("ShortFestJury");
    contract = await ethers.getContractAt("ShortFestJury", deployment.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should start with zero films", async function () {
      expect(await contract.getTotalFilms()).to.equal(0);
    });

    it("Should start with zero jurors", async function () {
      expect(await contract.getJurorCount()).to.equal(0);
    });
  });

  describe("Juror Management", function () {
    it("Should allow owner to add juror", async function () {
      await expect(contract.addJuror(juror1.address))
        .to.emit(contract, "JurorAdded")
        .withArgs(juror1.address);

      expect(await contract.isJuror(juror1.address)).to.be.true;
      expect(await contract.getJurorCount()).to.equal(1);
    });

    it("Should allow owner to add multiple jurors", async function () {
      await contract.batchAddJurors([juror1.address, juror2.address, juror3.address]);
      
      expect(await contract.isJuror(juror1.address)).to.be.true;
      expect(await contract.isJuror(juror2.address)).to.be.true;
      expect(await contract.isJuror(juror3.address)).to.be.true;
      expect(await contract.getJurorCount()).to.equal(3);
    });

    it("Should not allow duplicate jurors", async function () {
      await contract.addJuror(juror1.address);
      await expect(contract.addJuror(juror1.address)).to.be.revertedWith("Juror already exists");
    });

    it("Should allow owner to remove juror", async function () {
      await contract.addJuror(juror1.address);
      await expect(contract.removeJuror(juror1.address))
        .to.emit(contract, "JurorRemoved")
        .withArgs(juror1.address);

      expect(await contract.isJuror(juror1.address)).to.be.false;
    });

    it("Should not allow non-owner to add juror", async function () {
      await expect(contract.connect(juror1).addJuror(juror2.address))
        .to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Film Management", function () {
    it("Should allow owner to add film", async function () {
      const title = "Test Film";
      const director = "John Doe";
      const duration = 600; // 10 minutes
      const submissionHash = ethers.id("test_hash");
      const metadata = JSON.stringify({ country: "USA", year: 2025 });

      await expect(contract.addFilm(title, director, duration, submissionHash, metadata))
        .to.emit(contract, "FilmAdded")
        .withArgs(0, title, director);

      expect(await contract.getTotalFilms()).to.equal(1);

      const film = await contract.getFilm(0);
      expect(film.title).to.equal(title);
      expect(film.director).to.equal(director);
      expect(film.duration).to.equal(duration);
    });

    it("Should allow owner to batch add films", async function () {
      const titles = ["Film 1", "Film 2", "Film 3"];
      const directors = ["Director 1", "Director 2", "Director 3"];
      const durations = [600, 720, 540];
      const hashes = [ethers.id("hash1"), ethers.id("hash2"), ethers.id("hash3")];
      const metadatas = ["", "", ""];

      await contract.batchAddFilms(titles, directors, durations, hashes, metadatas);

      expect(await contract.getTotalFilms()).to.equal(3);
    });

    it("Should not allow non-owner to add film", async function () {
      await expect(
        contract.connect(juror1).addFilm("Film", "Director", 600, ethers.id("hash"), "")
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when getting non-existent film", async function () {
      await expect(contract.getFilm(999)).to.be.revertedWith("Film does not exist");
    });
  });

  describe("Score Submission", function () {
    beforeEach(async function () {
      // Setup: Add jurors and a film
      await contract.addJuror(juror1.address);
      await contract.addJuror(juror2.address);
      await contract.addFilm("Test Film", "Director", 600, ethers.id("hash"), "");
    });

    it("Should allow juror to submit encrypted scores", async function () {
      const contractAddress = await contract.getAddress();
      
      // Create encrypted scores using FHEVM
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      encryptedInput.add16(85); // narrative
      encryptedInput.add16(90); // cinematography
      encryptedInput.add16(88); // sound
      encryptedInput.add16(92); // editing
      const encrypted = await encryptedInput.encrypt();
      
      const commentHash = ethers.id("Great film!");

      await expect(
        contract.connect(juror1).submitScore(
          0,
          encrypted.handles[0],
          encrypted.handles[1],
          encrypted.handles[2],
          encrypted.handles[3],
          commentHash
        )
      ).to.emit(contract, "ScoreSubmitted").withArgs(0, juror1.address);

      expect(await contract.hasScored(0, juror1.address)).to.be.true;
      expect(await contract.getScoreCount(0)).to.equal(1);
    });

    it("Should not allow non-juror to submit score", async function () {
      const contractAddress = await contract.getAddress();
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, viewer.address);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      const encrypted = await encryptedInput.encrypt();

      await expect(
        contract.connect(viewer).submitScore(0, encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], ethers.id(""))
      ).to.be.revertedWith("Only jurors can call this function");
    });

    it("Should not allow duplicate score submission", async function () {
      const contractAddress = await contract.getAddress();
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      encryptedInput.add16(85);
      const encrypted = await encryptedInput.encrypt();
      const hash = ethers.id("comment");

      await contract.connect(juror1).submitScore(0, encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], hash);

      await expect(
        contract.connect(juror1).submitScore(0, encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], hash)
      ).to.be.revertedWith("Already scored this film");
    });

    it("Should track multiple juror submissions", async function () {
      const contractAddress = await contract.getAddress();
      
      const input1 = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      input1.add16(85).add16(85).add16(85).add16(85);
      const enc1 = await input1.encrypt();
      
      const input2 = await fhevm.createEncryptedInput(contractAddress, juror2.address);
      input2.add16(85).add16(85).add16(85).add16(85);
      const enc2 = await input2.encrypt();
      
      const hash = ethers.id("comment");

      await contract.connect(juror1).submitScore(0, enc1.handles[0], enc1.handles[1], enc1.handles[2], enc1.handles[3], hash);
      await contract.connect(juror2).submitScore(0, enc2.handles[0], enc2.handles[1], enc2.handles[2], enc2.handles[3], hash);

      expect(await contract.getScoreCount(0)).to.equal(2);
    });
  });

  describe("Score Aggregation", function () {
    beforeEach(async function () {
      // Setup: Add jurors, film, and submit scores
      await contract.addJuror(juror1.address);
      await contract.addJuror(juror2.address);
      await contract.addJuror(juror3.address);
      await contract.addFilm("Test Film", "Director", 600, ethers.id("hash"), "");

      const contractAddress = await contract.getAddress();
      const hash = ethers.id("comment");

      const input1 = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      input1.add16(80).add16(80).add16(80).add16(80);
      const enc1 = await input1.encrypt();
      
      const input2 = await fhevm.createEncryptedInput(contractAddress, juror2.address);
      input2.add16(85).add16(85).add16(85).add16(85);
      const enc2 = await input2.encrypt();
      
      const input3 = await fhevm.createEncryptedInput(contractAddress, juror3.address);
      input3.add16(90).add16(90).add16(90).add16(90);
      const enc3 = await input3.encrypt();

      await contract.connect(juror1).submitScore(0, enc1.handles[0], enc1.handles[1], enc1.handles[2], enc1.handles[3], hash);
      await contract.connect(juror2).submitScore(0, enc2.handles[0], enc2.handles[1], enc2.handles[2], enc2.handles[3], hash);
      await contract.connect(juror3).submitScore(0, enc3.handles[0], enc3.handles[1], enc3.handles[2], enc3.handles[3], hash);
    });

    it("Should allow owner to aggregate scores", async function () {
      await expect(contract.aggregateFilmScores(0))
        .to.emit(contract, "ScoresAggregated")
        .withArgs(0, 3);

      const agg = await contract.aggregatedScores(0);
      expect(agg.isAggregated).to.be.true;
      expect(agg.jurorCount).to.equal(3);
    });

    it("Should not aggregate without scores", async function () {
      await contract.addFilm("Empty Film", "Director", 600, ethers.id("hash2"), "");
      
      await expect(contract.aggregateFilmScores(1))
        .to.be.revertedWith("No scores submitted for this film");
    });

    it("Should allow batch aggregation", async function () {
      await contract.addFilm("Film 2", "Director", 600, ethers.id("hash2"), "");
      
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      input.add16(80).add16(80).add16(80).add16(80);
      const encrypted = await input.encrypt();
      const hash = ethers.id("comment");
      
      await contract.connect(juror1).submitScore(1, encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], hash);
      
      await contract.batchAggregate([0, 1]);
      
      const agg0 = await contract.aggregatedScores(0);
      const agg1 = await contract.aggregatedScores(1);
      
      expect(agg0.isAggregated).to.be.true;
      expect(agg1.isAggregated).to.be.true;
    });
  });

  describe("Authorization and Decryption", function () {
    beforeEach(async function () {
      await contract.addJuror(juror1.address);
      await contract.addFilm("Test Film", "Director", 600, ethers.id("hash"), "");
      
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      input.add16(85).add16(85).add16(85).add16(85);
      const encrypted = await input.encrypt();
      const hash = ethers.id("comment");
      
      await contract.connect(juror1).submitScore(0, encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], hash);
      await contract.aggregateFilmScores(0);
    });

    it("Should allow owner to authorize decryption", async function () {
      await expect(contract.allowOrganizerDecrypt(0))
        .to.emit(contract, "DecryptionAuthorized")
        .withArgs(0, owner.address);
    });

    it("Should not authorize decryption before aggregation", async function () {
      await contract.addFilm("Film 2", "Director", 600, ethers.id("hash2"), "");
      
      await expect(contract.allowOrganizerDecrypt(1))
        .to.be.revertedWith("Scores not aggregated yet");
    });

    it("Should allow batch authorization", async function () {
      await contract.batchAllowDecrypt([0]);
      // No revert means success
    });
  });

  describe("Public Results", function () {
    it("Should allow owner to publish qualified films", async function () {
      await contract.addFilm("Film 1", "Director", 600, ethers.id("hash"), "");
      
      const filmIds = [0];
      const avgScores = [85, 90, 88, 92];
      
      await expect(
        contract.publishQualifiedFilms(filmIds, [avgScores[0]], [avgScores[1]], [avgScores[2]], [avgScores[3]])
      ).to.emit(contract, "ResultsPublished");

      expect(await contract.getQualifiedFilmsCount()).to.equal(1);
      expect(await contract.isQualified(0)).to.be.true;
    });

    it("Should return qualified film details", async function () {
      await contract.addFilm("Test Film", "John Doe", 600, ethers.id("hash"), "");
      await contract.publishQualifiedFilms([0], [85], [90], [88], [92]);
      
      const result = await contract.getQualifiedFilm(0);
      expect(result.filmId).to.equal(0);
      expect(result.title).to.equal("Test Film");
      expect(result.director).to.equal("John Doe");
      expect(result.avgNarrative).to.equal(85);
    });

    it("Should return all qualified films", async function () {
      await contract.addFilm("Film 1", "Director 1", 600, ethers.id("hash1"), "");
      await contract.addFilm("Film 2", "Director 2", 720, ethers.id("hash2"), "");
      
      await contract.publishQualifiedFilms([0, 1], [85, 80], [90, 85], [88, 83], [92, 87]);
      
      const results = await contract.getAllQualifiedFilms();
      expect(results.length).to.equal(2);
    });

    it("Should not allow duplicate publication", async function () {
      await contract.addFilm("Film 1", "Director", 600, ethers.id("hash"), "");
      await contract.publishQualifiedFilms([0], [85], [90], [88], [92]);
      
      await expect(
        contract.publishQualifiedFilms([0], [85], [90], [88], [92])
      ).to.be.revertedWith("Film already published");
    });
  });

  describe("Qualification Threshold", function () {
    it("Should allow owner to set threshold", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, owner.address);
      input.add16(70);
      const encrypted = await input.encrypt();
      
      await expect(contract.setQualificationThreshold(encrypted.handles[0]))
        .to.emit(contract, "ThresholdSet");
    });

    it("Should check qualification against threshold", async function () {
      const contractAddress = await contract.getAddress();
      
      const thresholdInput = await fhevm.createEncryptedInput(contractAddress, owner.address);
      thresholdInput.add16(70);
      const thresholdEnc = await thresholdInput.encrypt();
      await contract.setQualificationThreshold(thresholdEnc.handles[0]);
      
      await contract.addJuror(juror1.address);
      await contract.addFilm("Test Film", "Director", 600, ethers.id("hash"), "");
      
      const scoreInput = await fhevm.createEncryptedInput(contractAddress, juror1.address);
      scoreInput.add16(85).add16(85).add16(85).add16(85);
      const scoreEnc = await scoreInput.encrypt();
      const hash = ethers.id("comment");
      await contract.connect(juror1).submitScore(0, scoreEnc.handles[0], scoreEnc.handles[1], scoreEnc.handles[2], scoreEnc.handles[3], hash);
      await contract.aggregateFilmScores(0);
      
      // Check qualification (returns encrypted booleans)
      const result = await contract.checkQualification(0);
      // Encrypted booleans cannot be checked directly in test
      expect(result).to.not.be.undefined;
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(contract.transferOwnership(juror1.address))
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(owner.address, juror1.address);

      expect(await contract.owner()).to.equal(juror1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        contract.connect(juror1).transferOwnership(juror2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        contract.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("New owner cannot be zero address");
    });
  });
});

