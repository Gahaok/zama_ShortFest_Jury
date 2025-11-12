'use client';

import { useState, useCallback, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useWallet } from './useWallet';
import { useFhevm } from '../fhevm/useFhevm';
import { ShortFestJuryABI } from '../abi/ShortFestJuryABI';
import { getContractAddress } from '../abi/ShortFestJuryAddresses';

export function useShortFestJury() {
  const { provider, account, chainId } = useWallet();
  const { instance: fhevmInstance } = useFhevm();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize contract
  useEffect(() => {
    if (!provider || !chainId) {
      setContract(null);
      return;
    }

    const address = getContractAddress(chainId);
    if (!address) {
      console.error(`No contract address for chain ID ${chainId}`);
      setContract(null);
      return;
    }

    const browserProvider = new BrowserProvider(provider);
    const signer = browserProvider.getSigner();
    
    signer.then((s) => {
      const contractInstance = new Contract(address, ShortFestJuryABI, s);
      setContract(contractInstance);
    }).catch((err) => {
      console.error('Failed to get signer:', err);
      setContract(null);
    });
  }, [provider, chainId]);

  /**
   * Submit encrypted score for a film
   * All scores are encrypted using FHEVM before submission
   */
  const submitScore = useCallback(async (
    filmId: number,
    narrative: number,
    cinematography: number,
    sound: number,
    editing: number,
    commentHash: string
  ) => {
    if (!contract || !fhevmInstance || !account) {
      throw new Error('Contract or FHEVM instance not initialized');
    }

    setIsLoading(true);
    try {
      const contractAddress = await contract.getAddress();
      
      // Create encrypted input (following reference pattern)
      const input = fhevmInstance.createEncryptedInput(contractAddress, account);
      input.add16(narrative);
      input.add16(cinematography);
      input.add16(sound);
      input.add16(editing);
      
      // Encrypt and get handles + proof
      const encrypted = await input.encrypt();

      // Submit to contract
      const tx = await contract.submitScore(
        filmId,
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.handles[3],
        encrypted.inputProof,
        commentHash
      );

      const receipt = await tx.wait();
      return receipt;
    } finally {
      setIsLoading(false);
    }
  }, [contract, fhevmInstance, account]);

  // Add juror (owner only)
  const addJuror = useCallback(async (jurorAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    try {
      const tx = await contract.addJuror(jurorAddress);
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Add film (owner only)
  const addFilm = useCallback(async (
    title: string,
    director: string,
    duration: number,
    submissionHash: string,
    metadata: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    try {
      const tx = await contract.addFilm(title, director, duration, submissionHash, metadata);
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Aggregate scores (owner only)
  const aggregateFilmScores = useCallback(async (filmId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    try {
      const tx = await contract.aggregateFilmScores(filmId);
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Authorize decryption (owner only)
  const allowOrganizerDecrypt = useCallback(async (filmId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    try {
      const tx = await contract.allowOrganizerDecrypt(filmId);
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Publish qualified films (owner only)
  const publishQualifiedFilms = useCallback(async (
    filmIds: number[],
    avgNarratives: number[],
    avgCinematographies: number[],
    avgSounds: number[],
    avgEditings: number[]
  ) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    try {
      const tx = await contract.publishQualifiedFilms(
        filmIds,
        avgNarratives,
        avgCinematographies,
        avgSounds,
        avgEditings
      );
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Read functions
  const isJuror = useCallback(async (address: string): Promise<boolean> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.isJuror(address);
  }, [contract]);

  const owner = useCallback(async (): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.owner();
  }, [contract]);

  const getTotalFilms = useCallback(async (): Promise<number> => {
    if (!contract) throw new Error('Contract not initialized');
    const count = await contract.getTotalFilms();
    return Number(count);
  }, [contract]);

  const getFilm = useCallback(async (filmId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getFilm(filmId);
  }, [contract]);

  const hasScored = useCallback(async (filmId: number, jurorAddress: string): Promise<boolean> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.hasScored(filmId, jurorAddress);
  }, [contract]);

  const getAggregatedScore = useCallback(async (filmId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.aggregatedScores(filmId);
  }, [contract]);

  const getQualifiedFilmsCount = useCallback(async (): Promise<number> => {
    if (!contract) throw new Error('Contract not initialized');
    const count = await contract.getQualifiedFilmsCount();
    return Number(count);
  }, [contract]);

  const getQualifiedFilm = useCallback(async (index: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getQualifiedFilm(index);
  }, [contract]);

  const getAllQualifiedFilms = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getAllQualifiedFilms();
  }, [contract]);

  return {
    contract,
    isLoading,
    // Write functions
    submitScore,
    addJuror,
    addFilm,
    aggregateFilmScores,
    allowOrganizerDecrypt,
    publishQualifiedFilms,
    // Read functions
    isJuror,
    owner,
    getTotalFilms,
    getFilm,
    hasScored,
    getAggregatedScore,
    getQualifiedFilmsCount,
    getQualifiedFilm,
    getAllQualifiedFilms,
  };
}


