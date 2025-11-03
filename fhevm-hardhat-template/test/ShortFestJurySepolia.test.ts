import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { ShortFestJury } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShortFestJury - Sepolia Integration Tests", function () {
  let contract: ShortFestJury;
  let owner: HardhatEthersSigner;
  let contractAddress: string;

  before(async function () {
    // Skip if not on Sepolia or not in mock mode
    if (fhevm.isMock) {
      console.warn("Sepolia tests should run on actual Sepolia testnet, skipping in mock mode");
      this.skip();
    }

    const signers = await ethers.getSigners();
    owner = signers[0];

    // Deploy contract
    const Factory = await ethers.getContractFactory("ShortFestJury");
    contract = await Factory.deploy() as ShortFestJury;
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();

    console.log(`ShortFestJury deployed to: ${contractAddress}`);
  });

  it("Should deploy successfully on Sepolia", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    console.log(`Owner: ${owner.address}`);
  });

  it("Should add a juror on Sepolia", async function () {
    const signers = await ethers.getSigners();
    const jurorAddress = signers[1].address;

    const tx = await contract.addJuror(jurorAddress);
    await tx.wait();

    expect(await contract.isJuror(jurorAddress)).to.be.true;
    console.log(`Juror added: ${jurorAddress}`);
  });

  it("Should add a film on Sepolia", async function () {
    const title = "Sepolia Test Film";
    const director = "Test Director";
    const duration = 600;
    const submissionHash = ethers.id("sepolia_test");
    const metadata = JSON.stringify({ network: "Sepolia", testRun: true });

    const tx = await contract.addFilm(title, director, duration, submissionHash, metadata);
    const receipt = await tx.wait();

    expect(await contract.getTotalFilms()).to.equal(1);
    
    const film = await contract.getFilm(0);
    expect(film.title).to.equal(title);
    
    console.log(`Film added on Sepolia: ${title}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

  it("Should submit encrypted score on Sepolia", async function () {
    this.timeout(60000); // 1 minute timeout for Sepolia

    const signers = await ethers.getSigners();
    const juror = signers[1];

    // Ensure juror is added
    if (!(await contract.isJuror(juror.address))) {
      await (await contract.addJuror(juror.address)).wait();
    }

    // Ensure film exists
    if ((await contract.getTotalFilms()) === 0) {
      await (await contract.addFilm("Test Film", "Director", 600, ethers.id("hash"), "")).wait();
    }

    // Create encrypted inputs for Sepolia
    const input = await fhevm.createEncryptedInput(contractAddress, juror.address);
    input.add16(85); // narrative
    input.add16(90); // cinematography
    input.add16(88); // sound
    input.add16(92); // editing
    
    const encryptedInput = await input.encrypt();
    const commentHash = ethers.id("Excellent film!");

    const tx = await contract.connect(juror).submitScore(
      0,
      encryptedInput.handles[0],
      encryptedInput.handles[1],
      encryptedInput.handles[2],
      encryptedInput.handles[3],
      commentHash
    );
    const receipt = await tx.wait();

    expect(await contract.hasScored(0, juror.address)).to.be.true;
    console.log(`Score submitted on Sepolia by ${juror.address}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

  it("Should aggregate scores on Sepolia", async function () {
    this.timeout(60000);

    // Ensure at least one score exists
    const scoreCount = await contract.getScoreCount(0);
    if (scoreCount === 0) {
      console.log("Skipping aggregation test: no scores submitted");
      this.skip();
    }

    const tx = await contract.aggregateFilmScores(0);
    const receipt = await tx.wait();

    const agg = await contract.aggregatedScores(0);
    expect(agg.isAggregated).to.be.true;
    
    console.log(`Scores aggregated for film 0`);
    console.log(`Juror count: ${agg.jurorCount}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

  it("Should authorize organizer decryption on Sepolia", async function () {
    this.timeout(60000);

    const agg = await contract.aggregatedScores(0);
    if (!agg.isAggregated) {
      console.log("Skipping authorization test: scores not aggregated");
      this.skip();
    }

    const tx = await contract.allowOrganizerDecrypt(0);
    const receipt = await tx.wait();

    console.log(`Decryption authorized for film 0`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

  it("Should publish qualified films on Sepolia", async function () {
    this.timeout(60000);

    // This test assumes organizer has decrypted the scores off-chain
    // and now publishes the results
    const filmIds = [0];
    const avgScores = {
      narrative: [85],
      cinematography: [90],
      sound: [88],
      editing: [92]
    };

    const tx = await contract.publishQualifiedFilms(
      filmIds,
      avgScores.narrative,
      avgScores.cinematography,
      avgScores.sound,
      avgScores.editing
    );
    const receipt = await tx.wait();

    expect(await contract.getQualifiedFilmsCount()).to.be.greaterThan(0);
    expect(await contract.isQualified(0)).to.be.true;

    console.log(`Qualified films published on Sepolia`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

  it("Should retrieve qualified film details on Sepolia", async function () {
    const count = await contract.getQualifiedFilmsCount();
    if (count === 0) {
      console.log("No qualified films to retrieve");
      this.skip();
    }

    const result = await contract.getQualifiedFilm(0);
    console.log(`Qualified Film Details:`);
    console.log(`  Film ID: ${result.filmId}`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Director: ${result.director}`);
    console.log(`  Avg Narrative: ${result.avgNarrative}`);
    console.log(`  Avg Cinematography: ${result.avgCinematography}`);
    console.log(`  Avg Sound: ${result.avgSound}`);
    console.log(`  Avg Editing: ${result.avgEditing}`);
  });
});


