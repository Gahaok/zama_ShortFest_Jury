import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("shortfest:add-juror", "Add a juror to the ShortFestJury contract")
  .addParam("contract", "The ShortFestJury contract address")
  .addParam("juror", "The juror address to add")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const [signer] = await ethers.getSigners();

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);

    console.log(`Adding juror ${taskArgs.juror} to contract ${taskArgs.contract}...`);

    const tx = await contract.addJuror(taskArgs.juror);
    const receipt = await tx.wait();

    console.log(`Juror added successfully!`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("shortfest:add-film", "Add a film to the ShortFestJury contract")
  .addParam("contract", "The ShortFestJury contract address")
  .addParam("title", "Film title")
  .addParam("director", "Film director")
  .addParam("duration", "Film duration in seconds")
  .addOptionalParam("hash", "Submission hash (defaults to keccak256 of title)")
  .addOptionalParam("metadata", "Metadata JSON string", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const submissionHash = taskArgs.hash || ethers.id(taskArgs.title);

    console.log(`Adding film "${taskArgs.title}" by ${taskArgs.director}...`);

    const tx = await contract.addFilm(
      taskArgs.title,
      taskArgs.director,
      parseInt(taskArgs.duration),
      submissionHash,
      taskArgs.metadata
    );
    const receipt = await tx.wait();

    const filmCount = await contract.getTotalFilms();
    console.log(`Film added successfully! Total films: ${filmCount}`);
    console.log(`Film ID: ${filmCount - 1n}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("shortfest:list-films", "List all films in the ShortFestJury contract")
  .addParam("contract", "The ShortFestJury contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const filmCount = await contract.getTotalFilms();

    console.log(`Total films: ${filmCount}`);
    console.log("---");

    for (let i = 0; i < filmCount; i++) {
      const film = await contract.getFilm(i);
      const scoreCount = await contract.getScoreCount(i);

      console.log(`Film ID: ${i}`);
      console.log(`  Title: ${film.title}`);
      console.log(`  Director: ${film.director}`);
      console.log(`  Duration: ${film.duration}s`);
      console.log(`  Scores submitted: ${scoreCount}`);
      console.log("---");
    }
  });

task("shortfest:list-jurors", "List all jurors in the ShortFestJury contract")
  .addParam("contract", "The ShortFestJury contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const jurors = await contract.getJurors();

    console.log(`Total jurors: ${jurors.length}`);
    console.log("---");

    for (let i = 0; i < jurors.length; i++) {
      console.log(`${i + 1}. ${jurors[i]}`);
    }
  });

task("shortfest:aggregate", "Aggregate scores for a film")
  .addParam("contract", "The ShortFestJury contract address")
  .addParam("filmid", "The film ID to aggregate")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const filmId = parseInt(taskArgs.filmid);

    console.log(`Aggregating scores for film ID ${filmId}...`);

    const tx = await contract.aggregateFilmScores(filmId);
    const receipt = await tx.wait();

    const agg = await contract.aggregatedScores(filmId);
    console.log(`Scores aggregated successfully!`);
    console.log(`Juror count: ${agg.jurorCount}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("shortfest:authorize", "Authorize organizer to decrypt aggregated scores")
  .addParam("contract", "The ShortFestJury contract address")
  .addParam("filmid", "The film ID to authorize")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const filmId = parseInt(taskArgs.filmid);

    console.log(`Authorizing decryption for film ID ${filmId}...`);

    const tx = await contract.allowOrganizerDecrypt(filmId);
    const receipt = await tx.wait();

    console.log(`Authorization successful!`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("shortfest:publish", "Publish qualified films")
  .addParam("contract", "The ShortFestJury contract address")
  .addParam("filmids", "Comma-separated film IDs")
  .addParam("narrative", "Comma-separated narrative scores")
  .addParam("cinematography", "Comma-separated cinematography scores")
  .addParam("sound", "Comma-separated sound scores")
  .addParam("editing", "Comma-separated editing scores")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);

    const filmIds = taskArgs.filmids.split(",").map((id: string) => parseInt(id.trim()));
    const narrative = taskArgs.narrative.split(",").map((s: string) => parseInt(s.trim()));
    const cinematography = taskArgs.cinematography.split(",").map((s: string) => parseInt(s.trim()));
    const sound = taskArgs.sound.split(",").map((s: string) => parseInt(s.trim()));
    const editing = taskArgs.editing.split(",").map((s: string) => parseInt(s.trim()));

    console.log(`Publishing ${filmIds.length} qualified films...`);

    const tx = await contract.publishQualifiedFilms(filmIds, narrative, cinematography, sound, editing);
    const receipt = await tx.wait();

    console.log(`Films published successfully!`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("shortfest:results", "List all qualified films and their scores")
  .addParam("contract", "The ShortFestJury contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);
    const count = await contract.getQualifiedFilmsCount();

    console.log(`Qualified films: ${count}`);
    console.log("=".repeat(80));

    for (let i = 0; i < count; i++) {
      const result = await contract.getQualifiedFilm(i);
      const totalScore = (
        Number(result.avgNarrative) +
        Number(result.avgCinematography) +
        Number(result.avgSound) +
        Number(result.avgEditing)
      ) / 4;

      console.log(`\nFilm ID: ${result.filmId}`);
      console.log(`Title: ${result.title}`);
      console.log(`Director: ${result.director}`);
      console.log(`Scores:`);
      console.log(`  Narrative: ${result.avgNarrative}/100`);
      console.log(`  Cinematography: ${result.avgCinematography}/100`);
      console.log(`  Sound: ${result.avgSound}/100`);
      console.log(`  Editing: ${result.avgEditing}/100`);
      console.log(`  Overall: ${totalScore.toFixed(1)}/100`);
      console.log(`Published: ${new Date(Number(result.publishedAt) * 1000).toISOString()}`);
      console.log("-".repeat(80));
    }
  });

task("shortfest:info", "Display contract information")
  .addParam("contract", "The ShortFestJury contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const contract = await ethers.getContractAt("ShortFestJury", taskArgs.contract);

    const owner = await contract.owner();
    const filmCount = await contract.getTotalFilms();
    const jurorCount = await contract.getJurorCount();
    const qualifiedCount = await contract.getQualifiedFilmsCount();

    console.log("ShortFestJury Contract Information");
    console.log("=".repeat(50));
    console.log(`Contract Address: ${taskArgs.contract}`);
    console.log(`Owner: ${owner}`);
    console.log(`Total Films: ${filmCount}`);
    console.log(`Total Jurors: ${jurorCount}`);
    console.log(`Qualified Films: ${qualifiedCount}`);
    console.log("=".repeat(50));
  });


