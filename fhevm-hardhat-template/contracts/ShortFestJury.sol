// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint16, externalEuint16, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ShortFest Jury - FHEVM Film Review System
/// @notice Encrypted short film review system with homomorphic score aggregation
/// @dev Uses FHEVM for privacy-preserving jury scoring
contract ShortFestJury is ZamaEthereumConfig {
    address public owner;
    
    // Film information
    struct Film {
        string title;
        string director;
        uint16 duration;
        bytes32 submissionHash;
        string metadata;
        bool exists;
    }
    
    // Encrypted score for each dimension
    struct Score {
        euint16 narrative;
        euint16 cinematography;
        euint16 sound;
        euint16 editing;
        bytes32 commentHash;
        uint256 timestamp;
    }
    
    // Aggregated scores
    struct AggregatedScore {
        euint16 sumNarrative;
        euint16 sumCinematography;
        euint16 sumSound;
        euint16 sumEditing;
        uint16 jurorCount;
        bool isAggregated;
    }
    
    // Public result
    struct PublicResult {
        uint256 filmId;
        uint16 avgNarrative;
        uint16 avgCinematography;
        uint16 avgSound;
        uint16 avgEditing;
        uint256 publishedAt;
    }
    
    // State variables
    mapping(address => bool) public jurors;
    address[] public jurorList;
    
    mapping(uint256 => Film) public films;
    uint256 public filmCount;
    
    mapping(uint256 => mapping(address => Score)) public filmScores;
    mapping(uint256 => mapping(address => bool)) public hasScored;
    mapping(uint256 => uint16) public scoreCount; // Track number of scores per film
    
    mapping(uint256 => AggregatedScore) public aggregatedScores;
    
    PublicResult[] public qualifiedFilms;
    mapping(uint256 => bool) public isQualified;
    
    euint16 public qualificationThreshold;
    bool public thresholdSet;
    
    // Events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event JurorAdded(address indexed juror);
    event JurorRemoved(address indexed juror);
    event FilmAdded(uint256 indexed filmId, string title, string director);
    event ScoreSubmitted(uint256 indexed filmId, address indexed juror);
    event ScoresAggregated(uint256 indexed filmId, uint16 jurorCount);
    event DecryptionAuthorized(uint256 indexed filmId, address indexed authorizedAddress);
    event ResultsPublished(uint256[] filmIds);
    event ThresholdSet(bytes encryptedThreshold);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyJuror() {
        require(jurors[msg.sender], "Only jurors can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    // ============ Ownership Management ============
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ============ Juror Management ============
    
    function addJuror(address juror) external onlyOwner {
        require(juror != address(0), "Invalid juror address");
        require(!jurors[juror], "Juror already exists");
        
        jurors[juror] = true;
        jurorList.push(juror);
        emit JurorAdded(juror);
    }
    
    function batchAddJurors(address[] memory _jurors) external onlyOwner {
        for (uint i = 0; i < _jurors.length; i++) {
            if (_jurors[i] != address(0) && !jurors[_jurors[i]]) {
                jurors[_jurors[i]] = true;
                jurorList.push(_jurors[i]);
                emit JurorAdded(_jurors[i]);
            }
        }
    }
    
    function removeJuror(address juror) external onlyOwner {
        require(jurors[juror], "Juror does not exist");
        jurors[juror] = false;
        
        // Remove from jurorList
        for (uint i = 0; i < jurorList.length; i++) {
            if (jurorList[i] == juror) {
                jurorList[i] = jurorList[jurorList.length - 1];
                jurorList.pop();
                break;
            }
        }
        
        emit JurorRemoved(juror);
    }
    
    function isJuror(address account) external view returns (bool) {
        return jurors[account];
    }
    
    function getJurorCount() external view returns (uint256) {
        return jurorList.length;
    }
    
    function getJurors() external view returns (address[] memory) {
        return jurorList;
    }
    
    // ============ Film Management ============
    
    function addFilm(
        string memory title,
        string memory director,
        uint16 duration,
        bytes32 submissionHash,
        string memory metadata
    ) external onlyOwner returns (uint256) {
        uint256 filmId = filmCount;
        
        films[filmId] = Film({
            title: title,
            director: director,
            duration: duration,
            submissionHash: submissionHash,
            metadata: metadata,
            exists: true
        });
        
        filmCount++;
        emit FilmAdded(filmId, title, director);
        
        return filmId;
    }
    
    function batchAddFilms(
        string[] memory titles,
        string[] memory directors,
        uint16[] memory durations,
        bytes32[] memory submissionHashes,
        string[] memory metadatas
    ) external onlyOwner returns (uint256[] memory) {
        require(
            titles.length == directors.length &&
            titles.length == durations.length &&
            titles.length == submissionHashes.length &&
            titles.length == metadatas.length,
            "Array lengths must match"
        );
        
        uint256[] memory filmIds = new uint256[](titles.length);
        
        for (uint i = 0; i < titles.length; i++) {
            uint256 filmId = filmCount;
            
            films[filmId] = Film({
                title: titles[i],
                director: directors[i],
                duration: durations[i],
                submissionHash: submissionHashes[i],
                metadata: metadatas[i],
                exists: true
            });
            
            filmIds[i] = filmId;
            filmCount++;
            emit FilmAdded(filmId, titles[i], directors[i]);
        }
        
        return filmIds;
    }
    
    function getFilm(uint256 filmId) external view returns (
        string memory title,
        string memory director,
        uint16 duration,
        bytes32 submissionHash,
        string memory metadata
    ) {
        require(films[filmId].exists, "Film does not exist");
        Film memory film = films[filmId];
        return (film.title, film.director, film.duration, film.submissionHash, film.metadata);
    }
    
    function getTotalFilms() external view returns (uint256) {
        return filmCount;
    }
    
    // ============ Score Submission ============
    
    function submitScore(
        uint256 filmId,
        externalEuint16 inputNarrative,
        externalEuint16 inputCinematography,
        externalEuint16 inputSound,
        externalEuint16 inputEditing,
        bytes calldata inputProof,
        bytes32 commentHash
    ) external onlyJuror {
        require(films[filmId].exists, "Film does not exist");
        require(!hasScored[filmId][msg.sender], "Already scored this film");
        
        // Convert encrypted inputs to euint16
        euint16 narrative = FHE.fromExternal(inputNarrative, inputProof);
        euint16 cinematography = FHE.fromExternal(inputCinematography, inputProof);
        euint16 sound = FHE.fromExternal(inputSound, inputProof);
        euint16 editing = FHE.fromExternal(inputEditing, inputProof);
        
        // Allow contract to access these values for future aggregation
        FHE.allowThis(narrative);
        FHE.allowThis(cinematography);
        FHE.allowThis(sound);
        FHE.allowThis(editing);
        
        // Store encrypted scores
        filmScores[filmId][msg.sender] = Score({
            narrative: narrative,
            cinematography: cinematography,
            sound: sound,
            editing: editing,
            commentHash: commentHash,
            timestamp: block.timestamp
        });
        
        hasScored[filmId][msg.sender] = true;
        scoreCount[filmId]++;
        
        emit ScoreSubmitted(filmId, msg.sender);
    }
    
    function getScoreCount(uint256 filmId) external view returns (uint16) {
        return scoreCount[filmId];
    }
    
    // ============ Score Aggregation ============
    
    function aggregateFilmScores(uint256 filmId) external onlyOwner {
        require(films[filmId].exists, "Film does not exist");
        require(scoreCount[filmId] > 0, "No scores submitted for this film");
        
        euint16 sumNarrative;
        euint16 sumCinematography;
        euint16 sumSound;
        euint16 sumEditing;
        
        uint16 count = 0;
        bool initialized = false;
        
        // Sum all scores using FHE.add
        for (uint i = 0; i < jurorList.length; i++) {
            address juror = jurorList[i];
            if (hasScored[filmId][juror]) {
                Score storage score = filmScores[filmId][juror];
                
                if (!initialized) {
                    // First score: initialize sums
                    sumNarrative = score.narrative;
                    sumCinematography = score.cinematography;
                    sumSound = score.sound;
                    sumEditing = score.editing;
                    initialized = true;
                } else {
                    // Subsequent scores: add to sums
                    sumNarrative = FHE.add(sumNarrative, score.narrative);
                    sumCinematography = FHE.add(sumCinematography, score.cinematography);
                    sumSound = FHE.add(sumSound, score.sound);
                    sumEditing = FHE.add(sumEditing, score.editing);
                }
                count++;
            }
        }
        
        require(initialized, "No valid scores found");
        
        // Allow this contract to access the sums (required before allowing others)
        FHE.allowThis(sumNarrative);
        FHE.allowThis(sumCinematography);
        FHE.allowThis(sumSound);
        FHE.allowThis(sumEditing);
        
        // Store encrypted sums (NOT averages)
        // Average calculation will be done client-side after decryption:
        // average = decrypted_sum / jurorCount
        aggregatedScores[filmId] = AggregatedScore({
            sumNarrative: sumNarrative,
            sumCinematography: sumCinematography,
            sumSound: sumSound,
            sumEditing: sumEditing,
            jurorCount: count,
            isAggregated: true
        });
        
        emit ScoresAggregated(filmId, count);
    }
    
    function batchAggregate(uint256[] memory filmIds) external onlyOwner {
        for (uint i = 0; i < filmIds.length; i++) {
            if (films[filmIds[i]].exists && scoreCount[filmIds[i]] > 0) {
                this.aggregateFilmScores(filmIds[i]);
            }
        }
    }
    
    // ============ Authorization & Decryption ============
    
    function allowOrganizerDecrypt(uint256 filmId) external onlyOwner {
        require(aggregatedScores[filmId].isAggregated, "Scores not aggregated yet");
        
        AggregatedScore storage agg = aggregatedScores[filmId];
        
        FHE.allow(agg.sumNarrative, owner);
        FHE.allow(agg.sumCinematography, owner);
        FHE.allow(agg.sumSound, owner);
        FHE.allow(agg.sumEditing, owner);
        
        emit DecryptionAuthorized(filmId, owner);
    }
    
    function batchAllowDecrypt(uint256[] memory filmIds) external onlyOwner {
        for (uint i = 0; i < filmIds.length; i++) {
            if (aggregatedScores[filmIds[i]].isAggregated) {
                AggregatedScore storage agg = aggregatedScores[filmIds[i]];
                FHE.allow(agg.sumNarrative, owner);
                FHE.allow(agg.sumCinematography, owner);
                FHE.allow(agg.sumSound, owner);
                FHE.allow(agg.sumEditing, owner);
                emit DecryptionAuthorized(filmIds[i], owner);
            }
        }
    }
    
    // ============ Qualification Threshold ============
    
    function setQualificationThreshold(externalEuint16 inputThreshold, bytes calldata inputProof) external onlyOwner {
        qualificationThreshold = FHE.fromExternal(inputThreshold, inputProof);
        thresholdSet = true;
        emit ThresholdSet(abi.encodePacked(inputThreshold));
    }
    
    function checkQualification(uint256 filmId) external returns (
        ebool narrativeQualified,
        ebool cinematographyQualified,
        ebool soundQualified,
        ebool editingQualified
    ) {
        require(aggregatedScores[filmId].isAggregated, "Scores not aggregated");
        require(thresholdSet, "Threshold not set");
        
        AggregatedScore storage agg = aggregatedScores[filmId];
        
        // Since we store sums instead of averages, we need to compare:
        // sum / jurorCount >= threshold
        // Which is equivalent to: sum >= threshold * jurorCount
        // Since we can't multiply encrypted value by plain uint, we need to
        // add the threshold jurorCount times
        euint16 thresholdSum = qualificationThreshold;
        for (uint16 i = 1; i < agg.jurorCount; i++) {
            thresholdSum = FHE.add(thresholdSum, qualificationThreshold);
        }
        
        narrativeQualified = FHE.ge(agg.sumNarrative, thresholdSum);
        cinematographyQualified = FHE.ge(agg.sumCinematography, thresholdSum);
        soundQualified = FHE.ge(agg.sumSound, thresholdSum);
        editingQualified = FHE.ge(agg.sumEditing, thresholdSum);
    }
    
    // ============ Public Results ============
    
    function publishQualifiedFilms(
        uint256[] memory filmIds,
        uint16[] memory avgNarratives,
        uint16[] memory avgCinematographies,
        uint16[] memory avgSounds,
        uint16[] memory avgEditings
    ) external onlyOwner {
        require(
            filmIds.length == avgNarratives.length &&
            filmIds.length == avgCinematographies.length &&
            filmIds.length == avgSounds.length &&
            filmIds.length == avgEditings.length,
            "Array lengths must match"
        );
        
        for (uint i = 0; i < filmIds.length; i++) {
            uint256 filmId = filmIds[i];
            require(films[filmId].exists, "Film does not exist");
            require(!isQualified[filmId], "Film already published");
            
            qualifiedFilms.push(PublicResult({
                filmId: filmId,
                avgNarrative: avgNarratives[i],
                avgCinematography: avgCinematographies[i],
                avgSound: avgSounds[i],
                avgEditing: avgEditings[i],
                publishedAt: block.timestamp
            }));
            
            isQualified[filmId] = true;
        }
        
        emit ResultsPublished(filmIds);
    }
    
    function getQualifiedFilmsCount() external view returns (uint256) {
        return qualifiedFilms.length;
    }
    
    function getQualifiedFilm(uint256 index) external view returns (
        uint256 filmId,
        string memory title,
        string memory director,
        uint16 avgNarrative,
        uint16 avgCinematography,
        uint16 avgSound,
        uint16 avgEditing,
        uint256 publishedAt
    ) {
        require(index < qualifiedFilms.length, "Index out of bounds");
        
        PublicResult memory result = qualifiedFilms[index];
        Film memory film = films[result.filmId];
        
        return (
            result.filmId,
            film.title,
            film.director,
            result.avgNarrative,
            result.avgCinematography,
            result.avgSound,
            result.avgEditing,
            result.publishedAt
        );
    }
    
    function getAllQualifiedFilms() external view returns (PublicResult[] memory) {
        return qualifiedFilms;
    }
}

